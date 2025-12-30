const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { findAndType, allowlistedConsoleErrors, sleep, deleteTaskViaApi, deleteClientViaApi, dismissTour } = require('./utils');

const BASE_URL = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
const AGENT_EMAIL = process.env.TEST_EMAIL || 'drisanjames@gmail.com';
const AGENT_PHONE = process.env.TEST_PHONE || '2084407940';
const AGENT_ACCESS = process.env.TEST_ACCESS || '123456';
const TASK_TITLE = `Client Task ${Date.now()}`;

// Test client credentials (created during test)
const TEST_CLIENT_EMAIL = `task-client-${Date.now()}@example.com`;
const TEST_CLIENT_PHONE = '5551234567';
const TEST_CLIENT_ACCESS = '654321';

let createdTaskId = null;
let createdClientId = null;
let agentCookie = null;

async function loginAgent(driver) {
  await driver.get(`${BASE_URL}/auth/login`);
  await findAndType(driver, 'Email', AGENT_EMAIL);
  await findAndType(driver, 'Phone', AGENT_PHONE);
  await findAndType(driver, 'Access Code', AGENT_ACCESS);
  await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
  await driver.wait(until.urlContains('/dashboard'), 20000);
}

async function createClientViaApi(sessionCookie) {
  const res = await fetch(`${API_BASE_URL}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `an_session=${sessionCookie}`,
    },
    body: JSON.stringify({
      email: TEST_CLIENT_EMAIL,
      phone: TEST_CLIENT_PHONE,
      accessCode: TEST_CLIENT_ACCESS,
      firstName: 'Task',
      lastName: 'TestClient',
      sport: 'Football',
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Client creation failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  createdClientId = data?.client?.id || data?.data?.id || null;
  console.log(`Created test client: ${createdClientId}`);
  return createdClientId;
}

async function createTaskViaApi(sessionCookie, clientId) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `an_session=${sessionCookie}`,
    },
    body: JSON.stringify({
      title: TASK_TITLE,
      assigneeClientId: clientId,
      status: 'todo',
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Task creation failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  // Store task ID for cleanup
  createdTaskId = data?.task?.id || data?.data?.id || null;
  return data;
}

async function loginClient(driver, clientEmail, clientPhone, clientAccess) {
  await driver.get(`${BASE_URL}/auth/client-login`);
  await sleep(500);
  
  // Client login page uses native <label> containing <input> elements
  const emailInput = await driver.wait(until.elementLocated(By.xpath(`//label[contains(., "Email")]//input | //label[contains(., "Email")]/following::input[1]`)), 10000);
  await emailInput.clear();
  await emailInput.sendKeys(clientEmail);
  
  const phoneInput = await driver.wait(until.elementLocated(By.xpath(`//label[contains(., "Phone")]//input | //label[contains(., "Phone")]/following::input[1]`)), 10000);
  await phoneInput.clear();
  await phoneInput.sendKeys(clientPhone);
  
  const accessInput = await driver.wait(until.elementLocated(By.xpath(`//label[contains(., "Access Code")]//input | //label[contains(., "Access Code")]/following::input[1]`)), 10000);
  await accessInput.clear();
  await accessInput.sendKeys(clientAccess);
  
  await driver.findElement(By.xpath(`//button[contains(., "Sign in") or contains(., "Login")]`)).click();
  
  // Wait for redirect to any client page
  await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    return url.includes('/client/');
  }, 20000, 'Client login redirect timeout');
}

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new'); // enable in CI if desired
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // 1. Agent login
    console.log('1. Logging in as agent...');
    await loginAgent(driver);
    await dismissTour(driver);
    agentCookie = (await driver.manage().getCookie('an_session'))?.value;
    if (!agentCookie) throw new Error('Agent session cookie not found');

    // 2. Create test client via API
    console.log('2. Creating test client via API...');
    const clientId = await createClientViaApi(agentCookie);
    if (!clientId) throw new Error('Failed to create test client');

    // 3. Create task assigned to the test client
    console.log('3. Creating task assigned to test client...');
    await createTaskViaApi(agentCookie, clientId);

    // 4. Client login and view tasks
    console.log('4. Logging in as client...');
    await loginClient(driver, TEST_CLIENT_EMAIL, TEST_CLIENT_PHONE, TEST_CLIENT_ACCESS);
    await dismissTour(driver);
    
    console.log('5. Navigating to tasks page...');
    await driver.get(`${BASE_URL}/client/tasks`);
    await dismissTour(driver);
    await sleep(1000);
    
    // Debug: print current URL and body text
    const currentUrl = await driver.getCurrentUrl();
    console.log(`Current URL: ${currentUrl}`);
    const bodyText = await driver.executeScript('return document.body?.innerText?.slice(0, 500) || "empty"');
    console.log(`Body preview: ${bodyText}`);
    
    // Check for client-side errors
    const browserLogs = await driver.manage().logs().get('browser');
    const jsErrors = browserLogs.filter(l => l.level.name === 'SEVERE');
    if (jsErrors.length > 0) {
      console.log('Browser errors:', jsErrors.map(e => e.message).join('\n'));
      // Check for known deployment issue
      const tourError = jsErrors.some(e => e.message.includes('useTour must be used within a TourProvider'));
      if (tourError) {
        throw new Error('TourProvider missing in client layout - deployment required. Run "npm run build" and deploy.');
      }
    }
    
    // Wait for page to fully load (spinner to disappear or Tasks heading to appear)
    await driver.wait(async () => {
      const spinners = await driver.findElements(By.xpath(`//div[contains(@class,"MuiCircularProgress")]`));
      const heading = await driver.findElements(By.xpath(`//h5[contains(., "Tasks")] | //*[contains(text(),"Tasks")]`));
      return spinners.length === 0 || heading.length > 0;
    }, 20000, 'Tasks page did not load');
    
    await driver.wait(until.elementLocated(By.xpath(`//h5[contains(., "Tasks")] | //*[text()="Tasks"]`)), 15000);
    console.log('6. Checking for assigned task...');
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"${TASK_TITLE}")]`)), 20000);

    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('Client tasks e2e passed.');
  } finally {
    // Cleanup: delete created test task and client
    if (agentCookie) {
      if (createdTaskId) {
        await deleteTaskViaApi(API_BASE_URL, agentCookie, createdTaskId);
        console.log(`Cleaned up task: ${createdTaskId}`);
      }
      if (createdClientId) {
        await deleteClientViaApi(API_BASE_URL, agentCookie, createdClientId);
        console.log(`Cleaned up client: ${createdClientId}`);
      }
    }
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

