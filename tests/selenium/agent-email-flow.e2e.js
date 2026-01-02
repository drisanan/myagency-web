/**
 * E2E Test: Agent Email Flow
 * Tests the ability for agents to send emails directly from the recruiter wizard.
 * This is a separate flow from the client email flow.
 */
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { allowlistedConsoleErrors, findAndType, sleep, getSessionCookie, deleteListByName, dismissTour } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API_BASE = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
const LOGIN_EMAIL = process.env.TEST_EMAIL || 'drisanjames@gmail.com';
const LOGIN_PHONE = process.env.TEST_PHONE || '2084407940';
const LOGIN_CODE = process.env.TEST_ACCESS || '123456';
const TEST_LIST_NAME = `Agent List ${Date.now()}`;

// Track session for cleanup
let sessionCookie = null;

async function createTestAgent(apiBase, session) {
  const agentData = {
    firstName: 'Test',
    lastName: 'Agent',
    email: `test-agent-${Date.now()}@example.com`,
    role: 'Recruiting Coordinator',
  };
  
  try {
    const res = await fetch(`${apiBase}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${session}`,
      },
      body: JSON.stringify(agentData),
    });
    const data = await res.json();
    console.log('Created test agent:', data?.agent?.id);
    return data?.agent;
  } catch (e) {
    console.error('Failed to create test agent:', e);
    return null;
  }
}

async function deleteAgent(apiBase, session, agentId) {
  if (!agentId) return;
  try {
    await fetch(`${apiBase}/agents/${agentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `session=${session}`,
      },
    });
    console.log('Deleted test agent:', agentId);
  } catch (e) {
    console.error('Failed to delete agent:', e);
  }
}

async function run() {
  if (process.env.SKIP_AGENT === '1') {
    console.log('Agent email flow test skipped (SKIP_AGENT=1)');
    return;
  }

  const options = new chrome.Options();
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  let testAgent = null;

  try {
    // ==================== LOGIN ====================
    console.log('Logging in...');
    await driver.get(`${BASE}/auth/login`);
    await findAndType(driver, 'Email', LOGIN_EMAIL);
    await findAndType(driver, 'Phone', LOGIN_PHONE);
    await findAndType(driver, 'Access Code', LOGIN_CODE);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);
    
    // Capture session cookie
    sessionCookie = await getSessionCookie(driver);
    console.log('Session obtained');

    // Dismiss any tour overlays
    await dismissTour(driver);

    // ==================== CREATE TEST AGENT ====================
    console.log('Creating test agent via API...');
    testAgent = await createTestAgent(API_BASE, sessionCookie);
    if (!testAgent) {
      throw new Error('Failed to create test agent');
    }

    // ==================== CREATE TEST LIST ====================
    console.log('Creating test list...');
    await driver.get(`${BASE}/lists`);
    await dismissTour(driver);
    await sleep(300);

    const selectFirstList = async (labelText) => {
      const sel = await driver.wait(
        until.elementLocated(By.xpath(`//label[contains(., "${labelText}")]/following::div[contains(@class,"MuiSelect-select")][1]`)),
        20000
      );
      await driver.wait(async () => {
        const disabled = await sel.getAttribute('aria-disabled');
        return disabled !== 'true';
      }, 20000);
      await sel.click();
      const opt = await driver.wait(until.elementLocated(By.xpath(`(//ul//li)[1]`)), 15000);
      await opt.click();
      await sleep(300);
    };

    await selectFirstList('Sport');
    await selectFirstList('Division');
    await selectFirstList('State');

    await driver.wait(until.elementLocated(By.xpath(`//div[contains(@class,"MuiCardContent-root")]`)), 15000);
    const firstSchool = await driver.findElement(By.xpath(`(//div[contains(@class,"MuiCardContent-root")])[1]`));
    await firstSchool.click();
    await driver.wait(until.elementLocated(By.xpath(`(//input[@type='checkbox'])[1]`)), 15000);
    const firstCoachChk = await driver.findElement(By.xpath(`(//input[@type='checkbox'])[1]`));
    await firstCoachChk.click();

    const nameInput = await driver.findElement(By.xpath(`//label[contains(.,"List name")]/following::input[1]`));
    await nameInput.clear();
    await nameInput.sendKeys(TEST_LIST_NAME);

    const saveBtn = await driver.findElement(By.xpath(`//button[contains(., "Save List") or normalize-space(.)="Save List"]`));
    await driver.wait(async () => await saveBtn.isEnabled(), 5000);
    await saveBtn.click();
    await sleep(500);
    console.log('Test list created:', TEST_LIST_NAME);

    // ==================== RECRUITER WIZARD - AGENT MODE ====================
    console.log('Navigating to recruiter wizard...');
    await driver.get(`${BASE}/recruiter`);
    await dismissTour(driver);
    await sleep(500);

    await driver.wait(until.elementLocated(By.xpath(`//h4[contains(., "Recruiter")]`)), 15000);
    console.log('Recruiter wizard loaded');

    // Click "Agent" button to switch to agent mode
    console.log('Switching to Agent mode...');
    const agentModeBtn = await driver.wait(
      until.elementLocated(By.xpath(`//button[@data-testid="agent-mode-btn" or contains(., "Agent")]`)),
      10000
    );
    await agentModeBtn.click();
    await sleep(300);

    // Verify Agent dropdown appears
    console.log('Verifying Agent dropdown...');
    await driver.wait(
      until.elementLocated(By.xpath(`//label[contains(., "Agent")]/following::div[contains(@class,"MuiSelect-select")][1]`)),
      10000
    );
    console.log('Agent dropdown visible');

    // Select the test agent
    console.log('Selecting test agent...');
    const agentSelect = await driver.findElement(
      By.xpath(`//label[contains(., "Agent")]/following::div[contains(@class,"MuiSelect-select")][1]`)
    );
    await agentSelect.click();
    await sleep(300);

    // Find the agent option (should contain test agent email)
    const agentOptions = await driver.findElements(By.xpath(`//ul[@role="listbox"]//li`));
    if (agentOptions.length === 0) {
      console.warn('No agents found in dropdown - agent may not have been created successfully');
    } else {
      // Select first agent
      await agentOptions[0].click();
      await sleep(300);
      console.log('Agent selected');
    }

    // Click Next to go to Universities step
    console.log('Proceeding to Universities step...');
    const nextBtn1 = await driver.findElement(By.xpath(`//button[normalize-space(.)="NEXT" or normalize-space(.)="Next"]`));
    await driver.wait(async () => !(await nextBtn1.getAttribute('disabled')), 10000);
    await nextBtn1.click();
    await sleep(500);

    // Select the test list (this advances to step 2 automatically)
    console.log('Selecting test list...');
    const listSelect = await driver.wait(
      until.elementLocated(By.xpath(`//label[contains(., "List")]/following::div[contains(@class,"MuiSelect-select")][1]`)),
      10000
    );
    await listSelect.click();
    await sleep(300);

    const listOptions = await driver.findElements(By.xpath(`//ul[@role="listbox"]//li`));
    for (const opt of listOptions) {
      const text = await opt.getText();
      if (text.includes(TEST_LIST_NAME)) {
        await opt.click();
        console.log('Test list selected');
        break;
      }
    }
    await sleep(500);

    // Click Next to go to Draft step
    console.log('Proceeding to Draft step...');
    const nextBtn2 = await driver.findElement(By.xpath(`//button[normalize-space(.)="NEXT" or normalize-space(.)="Next"]`));
    await driver.wait(async () => !(await nextBtn2.getAttribute('disabled')), 10000);
    await nextBtn2.click();
    await sleep(500);

    // ==================== VERIFY AGENT DRAFT UI ====================
    console.log('Verifying Agent Draft UI...');
    
    // Should see "Sending as Agent" indicator
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(), "Sending as Agent")]`)),
      10000
    );
    console.log('Agent sender indicator visible');

    // Should see "Compose Email" header
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(), "Compose Email")]`)),
      10000
    );
    console.log('Compose Email section visible');

    // Should see the Quill editor for freeform email
    await driver.wait(
      until.elementLocated(By.xpath(`//div[contains(@class, "ql-editor")]`)),
      10000
    );
    console.log('Freeform editor visible');

    // Type some content in the editor
    console.log('Typing in freeform editor...');
    const editor = await driver.findElement(By.xpath(`//div[contains(@class, "ql-editor")]`));
    await editor.click();
    await editor.sendKeys('Hello Coach,\n\nThis is a test email from the agent flow.\n\nBest regards,\nTest Agent');
    await sleep(300);

    // Verify "Prepare Email" button exists
    const prepareBtn = await driver.wait(
      until.elementLocated(By.xpath(`//button[contains(., "Prepare Email")]`)),
      10000
    );
    console.log('Prepare Email button visible');

    // Click Prepare Email
    await driver.wait(async () => !(await prepareBtn.getAttribute('disabled')), 5000);
    await prepareBtn.click();
    await sleep(500);

    // Verify success message
    await driver.wait(
      until.elementLocated(By.xpath(`//*[@data-testid="send-confirmation"]`)),
      10000
    );
    console.log('Success confirmation displayed');

    // ==================== CHECK CONSOLE ERRORS ====================
    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('✅ Agent email flow E2E test passed!');

  } finally {
    // ==================== CLEANUP ====================
    console.log('\n🧹 Cleaning up...');
    if (sessionCookie) {
      if (testAgent?.id) {
        await deleteAgent(API_BASE, sessionCookie, testAgent.id);
      }
      await deleteListByName(API_BASE, sessionCookie, TEST_LIST_NAME);
      console.log(`Cleaned up list: ${TEST_LIST_NAME}`);
    }
    await driver.quit();
  }
}

run().catch((err) => {
  console.error('❌ Agent email flow test failed:', err);
  process.exit(1);
});

