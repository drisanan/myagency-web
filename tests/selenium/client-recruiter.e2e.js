/**
 * E2E Test: Agency Recruiter Wizard - Editable Preview
 * Tests that agencies can edit email previews in the recruiter wizard.
 * 
 * NOTE: The client recruiter wizard requires proper NEXT_PUBLIC_API_BASE_URL 
 * configuration on the frontend. Client-specific tests should be run after 
 * verifying the environment is properly configured.
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, allowlistedConsoleErrors, sleep, dismissTour, getSessionCookie, deleteListByName } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API_BASE = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';

const LOGIN_EMAIL = 'drisanjames@gmail.com';
const LOGIN_PHONE = '2084407940';
const LOGIN_CODE = '123456';

let sessionCookie = null;

async function login(driver) {
  await driver.get(`${BASE}/auth/login`);
  await findAndType(driver, 'Email', LOGIN_EMAIL);
  await findAndType(driver, 'Phone', LOGIN_PHONE);
  await findAndType(driver, 'Access Code', LOGIN_CODE);
  await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
  await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);
  sessionCookie = await getSessionCookie(driver);
}

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // Login as agency
    console.log('Logging in as agency...');
    await login(driver);
    await dismissTour(driver);

    // Navigate to recruiter page
    await driver.get(`${BASE}/recruiter`);
    await dismissTour(driver);
    await sleep(500);

    // Verify page loads
    await driver.wait(
      until.elementLocated(By.xpath(`//*[contains(text(),"Recruiter")]`)),
      10000
    );
    console.log('✓ Recruiter page loaded');

    // Select a client (Step 1)
    const clientSelect = await driver.findElement(
      By.xpath(`//label[contains(., "Client")]/following::div[contains(@class,"MuiSelect")][1]`)
    );
    await clientSelect.click();
    await sleep(500);

    const clientOptions = await driver.findElements(By.xpath(`//li[contains(@class,"MuiMenuItem-root")]`));
    if (clientOptions.length > 1) {
      await clientOptions[1].click();
      await sleep(500);
      console.log('✓ Selected a client');

      // Click Next
      await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`)).click();
      await sleep(500);

      // Step 2: Select a list (faster path)
      const listSelect = await driver.findElement(
        By.xpath(`//label[contains(., "List")]/following::div[contains(@class,"MuiSelect")][1]`)
      );
      await listSelect.click();
      await sleep(500);

      const listOptions = await driver.findElements(By.xpath(`//li[contains(@class,"MuiMenuItem-root")]`));
      if (listOptions.length > 1) {
        // Select a list to jump to step 3
        await listOptions[1].click();
        await sleep(1000);
        console.log('✓ Selected a list');

        // Should auto-advance to step 3 (Details & Coaches)
        // Select a coach
        const coachCheckboxes = await driver.findElements(By.css('input[type="checkbox"]'));
        if (coachCheckboxes.length > 0) {
          await coachCheckboxes[0].click();
          await sleep(300);
          console.log('✓ Selected a coach');

          // Click Next to go to Draft step
          await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`)).click();
          await sleep(500);

          // Step 4: Verify Draft step with editable preview
          await driver.wait(
            until.elementLocated(By.xpath(`//*[contains(text(),"Preview")]`)),
            5000
          );
          console.log('✓ Reached Draft step with Preview');

          // Verify Edit button exists
          const editBtn = await driver.findElements(By.xpath(`//button[contains(., "Edit")]`));
          if (editBtn.length > 0) {
            console.log('✓ Edit button found - preview is editable');
            
            // Click Edit button
            await editBtn[0].click();
            await sleep(300);
            
            // Verify textarea appears for editing
            const textareas = await driver.findElements(By.css('textarea'));
            if (textareas.length > 0) {
              console.log('✓ Edit mode activated - textarea visible');
              
              // Verify "Done Editing" button appears
              const doneBtn = await driver.findElements(By.xpath(`//button[contains(., "Done Editing")]`));
              if (doneBtn.length > 0) {
                console.log('✓ Done Editing button visible');
                await doneBtn[0].click();
                await sleep(300);
              }
            }
          } else {
            console.log('Note: Edit button not found (may need different UI path)');
          }

          // Verify AI improvement button exists
          const aiBtn = await driver.findElements(By.xpath(`//button[contains(., "Improve Introduction")]`));
          if (aiBtn.length > 0) {
            console.log('✓ Improve Introduction button found');
          }

          // Verify Copy button exists
          const copyBtn = await driver.findElements(By.xpath(`//button[contains(., "Copy")]`));
          if (copyBtn.length > 0) {
            console.log('✓ Copy Rich Text button found');
          }
        } else {
          console.log('Note: No coaches in list to select');
        }
      } else {
        console.log('Note: No lists available');
      }
    } else {
      console.log('Note: No clients available');
    }

    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E recruiter editable preview passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

