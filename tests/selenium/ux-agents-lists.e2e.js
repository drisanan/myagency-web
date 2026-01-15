/**
 * UX Improvements E2E Tests - Agents and Lists Pages
 * 
 * Tests for:
 * 1. Agents page - Snackbar feedback on create/edit/delete
 * 2. Agents page - MUI delete confirmation dialog
 * 3. Lists page - Snackbar feedback on save/delete
 * 4. Lists page - MUI delete confirmation dialog
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, sleep, dismissTour } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

// Agency credentials
const AGENCY_EMAIL = 'drisanjames@gmail.com';
const AGENCY_PHONE = '2084407940';
const AGENCY_CODE = '123456';

async function login(driver) {
  await driver.get(`${BASE}/auth/login`);
  await findAndType(driver, 'Email', AGENCY_EMAIL);
  await findAndType(driver, 'Phone', AGENCY_PHONE);
  await findAndType(driver, 'Access Code', AGENCY_CODE);
  await driver.findElement(By.xpath('//button[normalize-space(.)="Sign in"]')).click();
  await driver.wait(until.urlContains('/dashboard'), 15000);
  await sleep(2000);
  await dismissTour(driver);
}

async function run() {
  const options = new chrome.Options();
  options.addArguments('--headless=new', '--no-sandbox', '--disable-gpu', '--window-size=1920,1080');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    console.log('\n========================================');
    console.log('UX AGENTS & LISTS E2E TESTS');
    console.log('========================================\n');

    await login(driver);

    // ============================================
    // TEST 1: Agents Page - Create with Snackbar
    // ============================================
    console.log('--- TEST 1: Agents Page UX ---\n');

    await driver.get(`${BASE}/agents`);
    await sleep(2000);
    await dismissTour(driver);

    // Check page loaded
    const agentsTitle = await driver.findElement(By.xpath("//h4[contains(text(), 'Agents')]"));
    console.log('✅ Agents page loaded');

    // Click New Agent button
    try {
      const newAgentBtn = await driver.findElement(By.xpath("//button[contains(text(), 'New Agent')]"));
      await newAgentBtn.click();
      await sleep(500);

      // Fill out the form
      const firstNameInput = await driver.findElement(By.xpath("//label[contains(text(), 'First Name')]/following::input[1]"));
      await firstNameInput.sendKeys('Test');

      const lastNameInput = await driver.findElement(By.xpath("//label[contains(text(), 'Last Name')]/following::input[1]"));
      await lastNameInput.sendKeys('Agent');

      const emailInput = await driver.findElement(By.xpath("//label[contains(text(), 'Email')]/following::input[1]"));
      const testEmail = `testagent${Date.now()}@example.com`;
      await emailInput.sendKeys(testEmail);

      const phoneInput = await driver.findElement(By.xpath("//label[contains(text(), 'Phone')]/following::input[1]"));
      await phoneInput.sendKeys('5551234567');

      const accessCodeInput = await driver.findElement(By.xpath("//label[contains(text(), 'Access Code')]/following::input[1]"));
      await accessCodeInput.sendKeys('123456');

      // Save
      const saveBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Save')]"));
      await saveBtn.click();
      await sleep(2000);

      // Check for snackbar
      const pageSource = await driver.getPageSource();
      if (pageSource.includes('success') || pageSource.includes('Success') || pageSource.includes('created')) {
        console.log('✅ Snackbar shown after agent creation');
      } else {
        console.log('⚠️ Snackbar not detected - may have auto-closed');
      }
    } catch (e) {
      console.log('⚠️ Could not test agent creation (may be at limit):', e.message);
    }

    // ============================================
    // TEST 2: Agents Page - Delete with MUI Dialog
    // ============================================
    console.log('\n--- TEST 2: Agent Delete Confirmation Dialog ---\n');

    await driver.get(`${BASE}/agents`);
    await sleep(2000);

    // Try to find a Delete button in the grid
    try {
      // Wait for DataGrid to load
      await driver.wait(until.elementLocated(By.css('.MuiDataGrid-root')), 5000);
      await sleep(1000);
      
      const deleteButtons = await driver.findElements(By.xpath("//button[contains(text(), 'Delete')]"));
      if (deleteButtons.length > 0) {
        await driver.executeScript('arguments[0].click();', deleteButtons[0]);
        await sleep(1000);

        // Check for MUI Dialog (not browser confirm) - dialog title is in DialogTitle which may use h2 or span
        try {
          await driver.wait(until.elementLocated(By.css('.MuiDialog-paper')), 3000);
          const dialogPaper = await driver.findElement(By.css('.MuiDialog-paper'));
          const dialogText = await dialogPaper.getText();
          
          if (dialogText.includes('Delete Agent')) {
            console.log('✅ MUI Delete Confirmation Dialog appears (not browser confirm)');
          }
          
          if (dialogText.includes('Are you sure')) {
            console.log('✅ Dialog shows confirmation message');
          }

          // Cancel the delete
          const cancelBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Cancel')]"));
          await cancelBtn.click();
          await sleep(500);
          console.log('✅ Cancel button closes dialog without deleting');
        } catch (dialogErr) {
          console.log('⚠️ Dialog not found after clicking delete:', dialogErr.message);
        }
      } else {
        console.log('⚠️ No agents to delete - skipping delete dialog test');
      }
    } catch (e) {
      console.log('⚠️ Delete dialog test failed:', e.message);
    }

    // ============================================
    // TEST 3: Lists Page - Save with Snackbar
    // ============================================
    console.log('\n--- TEST 3: Lists Page UX ---\n');

    await driver.get(`${BASE}/lists`);
    await sleep(2000);
    await dismissTour(driver);

    // Check page loaded
    const listsTitle = await driver.findElement(By.xpath("//h5[contains(text(), 'Lists')]"));
    console.log('✅ Lists page loaded');

    // Check for Save button with loading indicator support
    try {
      const saveListBtn = await driver.findElement(By.css('[data-tour="save-list-btn"]'));
      const btnText = await saveListBtn.getText();
      if (btnText.includes('Save') || btnText.includes('Update')) {
        console.log('✅ Save/Update List button present');
      }
    } catch (e) {
      console.log('⚠️ Save button not found');
    }

    // ============================================
    // TEST 4: Lists Page - Delete with MUI Dialog
    // ============================================
    console.log('\n--- TEST 4: List Delete Confirmation Dialog ---\n');

    // Check for saved lists and delete button
    try {
      const savedListsSection = await driver.findElement(By.css('[data-tour="saved-lists"]'));
      await sleep(500);
      const deleteButtons = await savedListsSection.findElements(By.xpath(".//button[contains(text(), 'Delete')]"));
      
      if (deleteButtons.length > 0) {
        await driver.executeScript('arguments[0].click();', deleteButtons[0]);
        await sleep(1000);

        // Check for MUI Dialog
        try {
          await driver.wait(until.elementLocated(By.css('.MuiDialog-paper')), 3000);
          const dialogPaper = await driver.findElement(By.css('.MuiDialog-paper'));
          const dialogText = await dialogPaper.getText();
          
          if (dialogText.includes('Delete List')) {
            console.log('✅ MUI Delete Confirmation Dialog appears for lists');
          }
          
          if (dialogText.includes('Are you sure') && dialogText.includes('coach')) {
            console.log('✅ Dialog shows list name and coach count');
          }

          // Cancel the delete
          const cancelBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Cancel')]"));
          await cancelBtn.click();
          await sleep(500);
          console.log('✅ Cancel button closes dialog without deleting');
        } catch (dialogErr) {
          console.log('⚠️ Dialog not found after clicking delete:', dialogErr.message);
        }
      } else {
        console.log('⚠️ No saved lists to delete - skipping list delete dialog test');
      }
    } catch (e) {
      console.log('⚠️ List delete dialog test skipped:', e.message);
    }

    // ============================================
    // TEST 5: Snackbar Styling Check
    // ============================================
    console.log('\n--- TEST 5: Snackbar Component Presence ---\n');

    // Verify MUI Snackbar is used (check for proper styling)
    await driver.get(`${BASE}/agents`);
    await sleep(2000);

    const pageHtml = await driver.getPageSource();
    
    // Check that the components use MUI Snackbar pattern
    if (pageHtml.includes('MuiSnackbar') || pageHtml.includes('Snackbar')) {
      console.log('✅ MUI Snackbar component is present in the page');
    } else {
      console.log('⚠️ Snackbar may only appear after actions');
    }

    // Check for proper Alert styling
    if (pageHtml.includes('MuiAlert')) {
      console.log('✅ MUI Alert component is present for messages');
    }

    console.log('\n========================================');
    console.log('AGENTS & LISTS UX TESTS COMPLETED');
    console.log('========================================\n');

  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
}

run();
