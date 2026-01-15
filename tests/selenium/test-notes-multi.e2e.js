const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, sleep, dismissTour } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const LOGIN_EMAIL = 'test+e2e-automation@myrecruiteragency.com';
const LOGIN_PHONE = '555-000-1234';
const LOGIN_CODE = '123456';

async function run() {
  const opts = new chrome.Options().addArguments('--headless', '--no-sandbox', '--disable-gpu');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(opts).build();
  
  try {
    // Login
    console.log('Logging in...');
    await driver.get(`${BASE}/login`);
    await findAndType(driver, 'email', LOGIN_EMAIL);
    await findAndType(driver, 'phone', LOGIN_PHONE);
    await findAndType(driver, 'accessCode', LOGIN_CODE);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);
    await dismissTour(driver);
    console.log('Login successful');
    
    // Navigate to clients page
    await driver.get(`${BASE}/clients`);
    await sleep(2000);
    
    // Get all client VIEW links
    const viewLinks = await driver.findElements(By.xpath('//*[text()="VIEW" or text()="View"]'));
    console.log(`Found ${viewLinks.length} clients`);
    
    if (viewLinks.length < 2) {
      console.log('Not enough clients to test, need at least 2');
      return;
    }
    
    // Test notes for the SECOND client (first is often the test client)
    const secondViewHref = await viewLinks[1].getAttribute('href');
    console.log(`Testing notes for client: ${secondViewHref}`);
    
    await driver.get(secondViewHref);
    await sleep(1000);
    await dismissTour(driver);
    
    // Click Notes tab
    const notesTab = await driver.wait(until.elementLocated(By.xpath('//button[@role="tab" and contains(text(), "Note")]')), 5000);
    await notesTab.click();
    await sleep(500);
    
    // Click Add note button
    const addBtn = await driver.wait(until.elementLocated(By.xpath('//button[contains(text(), "Add note") or @data-testid="note-add"]')), 5000);
    await addBtn.click();
    await sleep(500);
    
    // Fill in the form
    const subjectInput = await driver.findElement(By.xpath('//label[contains(., "Subject")]/following::input[1]'));
    await subjectInput.sendKeys('Test Note for Different Client');
    
    const bodyInput = await driver.findElement(By.xpath('//label[contains(., "Note")]/following::textarea[1]'));
    await bodyInput.sendKeys('This is a test note body to verify notes work for all clients.');
    
    // Click save
    const saveBtn = await driver.findElement(By.xpath('//button[@data-testid="note-save"]'));
    await saveBtn.click();
    await sleep(2000);
    
    // Check if note was created - dialog should close
    const dialogStillOpen = await driver.findElements(By.xpath('//div[@role="dialog"]'));
    if (dialogStillOpen.length === 0) {
      console.log('✅ Dialog closed - note likely created successfully');
    } else {
      // Check for error message in dialog
      const helperText = await driver.findElements(By.xpath('//p[contains(@class, "MuiFormHelperText")]'));
      for (const h of helperText) {
        const text = await h.getText();
        if (text) console.log(`Form error: ${text}`);
      }
    }
    
    // Verify note appears in list
    const noteItems = await driver.findElements(By.xpath('//*[@data-testid="note-item"]'));
    console.log(`Found ${noteItems.length} notes in list`);
    
    if (noteItems.length > 0) {
      const noteText = await noteItems[0].getText();
      console.log('First note content:', noteText.substring(0, 100));
      console.log('✅ Notes test PASSED for different client!');
    } else {
      console.log('❌ No notes found in list');
    }
    
  } catch (e) {
    console.log('Test failed:', e.message);
    console.log(e.stack);
  } finally {
    await driver.quit();
  }
}

run();
