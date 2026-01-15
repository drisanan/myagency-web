/**
 * Test Notes functionality across multiple clients
 * This verifies the agencyEmail fix works for all clients, not just the first one
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, sleep, dismissTour, getSessionCookie } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001';
const LOGIN_EMAIL = 'drisanjames@gmail.com';
const LOGIN_PHONE = '2084407940';
const LOGIN_CODE = '123456';

let sessionCookie = null;

async function login(driver) {
  console.log('🔐 Logging in...');
  await driver.get(`${BASE}/auth/login`);
  await findAndType(driver, 'Email', LOGIN_EMAIL);
  await findAndType(driver, 'Phone', LOGIN_PHONE);
  await findAndType(driver, 'Access Code', LOGIN_CODE);
  await driver.findElement(By.xpath('//button[normalize-space(.)="Sign in"]')).click();
  await driver.wait(until.elementLocated(By.xpath('//*[contains(text(),"Dashboard")]')), 20000);
  sessionCookie = await getSessionCookie(driver);
  await dismissTour(driver);
  console.log('✅ Login successful\n');
}

async function getClientIds(driver) {
  await driver.get(`${BASE}/clients`);
  await sleep(2000);
  await dismissTour(driver);
  
  const viewLinks = await driver.findElements(By.xpath('//a[contains(@href, "/clients/client-")]'));
  const ids = [];
  for (const link of viewLinks) {
    const href = await link.getAttribute('href');
    const match = href.match(/\/clients\/(client-[a-f0-9-]+)/);
    if (match && !ids.includes(match[1])) ids.push(match[1]);
  }
  return ids;
}

async function testNotesForClient(driver, clientId, clientIndex) {
  console.log(`📝 Testing notes for client ${clientIndex + 1}: ${clientId}`);
  
  // Navigate to client
  await driver.get(`${BASE}/clients/${clientId}`);
  await sleep(1500);
  await dismissTour(driver);
  
  // Click Notes tab
  const tabs = await driver.findElements(By.xpath('//button[@role="tab"]'));
  for (const tab of tabs) {
    const text = await tab.getText();
    if (text.toLowerCase().includes('note') && !text.toLowerCase().includes('coach')) {
      await driver.executeScript('arguments[0].click()', tab);
      break;
    }
  }
  await sleep(500);
  
  // Get count before
  const notesBefore = await driver.findElements(By.css('[data-testid="note-item"]'));
  console.log(`   Notes before: ${notesBefore.length}`);
  
  // Click Add note button
  const addBtn = await driver.wait(until.elementLocated(By.css('[data-testid="note-add"]')), 5000);
  await driver.executeScript('arguments[0].click()', addBtn);
  await sleep(500);
  
  // Verify dialog opened
  await driver.wait(until.elementLocated(By.xpath('//div[@role="dialog"]')), 5000);
  console.log('   Dialog opened');
  
  // Fill form using the same approach as crm-features
  const titleXpath = '//label[contains(., "Subject")]/following::input[1] | //label[contains(., "Subject")]/following::textarea[1]';
  const subjectInput = await driver.wait(until.elementLocated(By.xpath(titleXpath)), 5000);
  await subjectInput.clear();
  await subjectInput.sendKeys(`Test Note Client ${clientIndex + 1} - ${Date.now()}`);
  
  const bodyXpath = '//label[contains(., "Note")]/following::input[1] | //label[contains(., "Note")]/following::textarea[1]';
  const bodyInput = await driver.wait(until.elementLocated(By.xpath(bodyXpath)), 5000);
  await bodyInput.clear();
  await bodyInput.sendKeys(`This is a test note body for client ${clientIndex + 1}. Testing the agencyEmail fix works across all clients.`);
  
  // Click save
  const saveBtn = await driver.findElement(By.css('[data-testid="note-save"]'));
  await driver.executeScript('arguments[0].click()', saveBtn);
  await sleep(2000);
  
  // Check if dialog closed (success) or still open (error)
  const dialogsAfter = await driver.findElements(By.xpath('//div[@role="dialog"]'));
  if (dialogsAfter.length > 0) {
    // Check for error message
    const errors = await driver.findElements(By.xpath('//p[contains(@class, "Mui-error")]'));
    for (const err of errors) {
      const text = await err.getText();
      if (text) {
        console.log(`   ❌ FORM ERROR: ${text}`);
        // Close dialog
        try {
          await driver.findElement(By.xpath('//button[contains(text(), "Cancel")]')).click();
        } catch {}
        return false;
      }
    }
    // Dialog still open but no visible error - might be API error
    console.log('   ⚠️ Dialog still open after save attempt');
    try {
      await driver.findElement(By.xpath('//button[contains(text(), "Cancel")]')).click();
    } catch {}
    await sleep(500);
  }
  
  // Get count after
  const notesAfter = await driver.findElements(By.css('[data-testid="note-item"]'));
  console.log(`   Notes after: ${notesAfter.length}`);
  
  if (notesAfter.length > notesBefore.length) {
    console.log(`   ✅ Note created successfully!\n`);
    return true;
  } else {
    console.log(`   ❌ Note NOT created\n`);
    return false;
  }
}

async function run() {
  const opts = new chrome.Options().addArguments('--headless', '--no-sandbox', '--disable-gpu');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(opts).build();
  
  try {
    await login(driver);
    
    const clientIds = await getClientIds(driver);
    console.log(`📊 Found ${clientIds.length} clients to test\n`);
    
    if (clientIds.length === 0) {
      console.log('❌ No clients found to test');
      process.exit(1);
    }
    
    const results = [];
    const testClients = clientIds.slice(0, Math.min(3, clientIds.length)); // Test first 3 clients
    
    for (let i = 0; i < testClients.length; i++) {
      const success = await testNotesForClient(driver, testClients[i], i);
      results.push({ clientId: testClients[i], success });
    }
    
    console.log('========================================');
    console.log('    NOTES MULTI-CLIENT TEST RESULTS    ');
    console.log('========================================');
    for (const r of results) {
      console.log(`${r.success ? '✅' : '❌'} ${r.clientId}`);
    }
    const allPassed = results.every(r => r.success);
    console.log('========================================');
    console.log(allPassed ? '🎉 ALL CLIENTS PASSED!' : '⚠️ SOME CLIENTS FAILED');
    console.log('========================================');
    
    process.exit(allPassed ? 0 : 1);
    
  } catch (e) {
    console.error('Test failed:', e.message);
    console.error(e.stack);
    process.exit(1);
  } finally {
    await driver.quit();
  }
}

run();
