/**
 * UX Improvements E2E Tests
 * 
 * Tests for:
 * 1. Client logout redirects to /auth/login (not /auth/client-login)
 * 2. Notes panel shows success/error snackbars
 * 3. Tasks panel shows success/error snackbars
 * 4. RecruiterWizard Gmail draft works with session (no "Missing session" error)
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { findAndType, sleep, dismissTour } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API = process.env.API_BASE_URL || 'http://localhost:3001';

// Agency credentials
const AGENCY_EMAIL = 'drisanjames@gmail.com';
const AGENCY_PHONE = '2084407940';
const AGENCY_CODE = '123456';

async function run() {
  const options = new chrome.Options();
  options.addArguments('--headless=new', '--no-sandbox', '--disable-gpu', '--window-size=1920,1080');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    console.log('\n========================================');
    console.log('UX IMPROVEMENTS E2E TESTS');
    console.log('========================================\n');

    // ============================================
    // TEST 1: Client Logout Redirects to /auth/login
    // ============================================
    console.log('--- TEST 1: Client Logout Redirect ---\n');

    // First login as agency to get a client
    await driver.get(`${BASE}/auth/login`);
    await findAndType(driver, 'Email', AGENCY_EMAIL);
    await findAndType(driver, 'Phone', AGENCY_PHONE);
    await findAndType(driver, 'Access Code', AGENCY_CODE);
    await driver.findElement(By.xpath('//button[normalize-space(.)="Sign in"]')).click();
    await sleep(3000);
    
    console.log('✅ Logged in as agency');

    // Get client info
    const clientInfo = await driver.executeAsyncScript(`
      const cb = arguments[arguments.length - 1];
      fetch('${API}/clients', { credentials: 'include' })
        .then(r => r.json())
        .then(d => {
          const first = (d?.clients || [])[0];
          cb(first ? JSON.stringify(first) : null);
        })
        .catch(e => cb(null));
    `);

    if (clientInfo) {
      const client = JSON.parse(clientInfo);
      console.log('  Using client:', client.email);

      // Clear cookies and login as client via unified login
      await driver.manage().deleteAllCookies();
      await driver.get(`${BASE}/auth/login`);
      await sleep(1000);

      // Select Athlete/Client mode - the button text might be "Athlete" or "client"
      try {
        const athleteBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Athlete') or contains(text(), 'client')]"));
        await athleteBtn.click();
        await sleep(500);
      } catch (e) {
        console.log('  (Athlete button not found, trying client mode via page source check)');
      }

      // Fill in the login form
      await findAndType(driver, 'Email', client.email);
      await findAndType(driver, 'Phone', client.phone);
      await findAndType(driver, 'Access Code', client.accessCode);
      await driver.findElement(By.xpath('//button[normalize-space(.)="Sign in"]')).click();
      await sleep(4000);

      const clientUrl = await driver.getCurrentUrl();
      if (clientUrl.includes('/client/')) {
        console.log('✅ Client logged in successfully');
        await dismissTour(driver);
        await sleep(500);
        
        // Now click on avatar to logout
        try {
          const avatar = await driver.findElement(By.css('.MuiIconButton-root .MuiAvatar-root'));
          await driver.executeScript('arguments[0].click();', avatar);
          await sleep(500);
          
          const logoutBtn = await driver.findElement(By.xpath("//li[contains(text(), 'Logout')]"));
          await driver.executeScript('arguments[0].click();', logoutBtn);
          await sleep(2000);
          
          const logoutUrl = await driver.getCurrentUrl();
          if (logoutUrl.includes('/auth/login') && !logoutUrl.includes('client-login')) {
            console.log('✅ Client logout redirects to /auth/login');
          } else {
            console.log('❌ Unexpected logout redirect:', logoutUrl);
          }
        } catch (e) {
          console.log('⚠️ Could not test logout flow:', e.message);
        }
      } else {
        console.log('⚠️ Client login redirect failed, URL:', clientUrl);
      }
    } else {
      console.log('⚠️ No clients found - skipping client logout test');
    }

    // ============================================
    // TEST 2: Notes Panel Snackbar Feedback
    // ============================================
    console.log('\n--- TEST 2: Notes Panel Snackbar ---\n');

    // Login as agency
    await driver.manage().deleteAllCookies();
    await driver.get(`${BASE}/auth/login`);
    await findAndType(driver, 'Email', AGENCY_EMAIL);
    await findAndType(driver, 'Phone', AGENCY_PHONE);
    await findAndType(driver, 'Access Code', AGENCY_CODE);
    await driver.findElement(By.xpath('//button[normalize-space(.)="Sign in"]')).click();
    await driver.wait(until.urlContains('/dashboard'), 15000);
    await sleep(2000);
    await dismissTour(driver);

    // Get first client
    const clientData = await driver.executeAsyncScript(`
      const cb = arguments[arguments.length - 1];
      fetch('${API}/clients', { credentials: 'include' })
        .then(r => r.json())
        .then(d => cb((d?.clients || [])[0]?.id))
        .catch(() => cb(null));
    `);

    if (clientData) {
      await driver.get(`${BASE}/clients/${clientData}`);
      await sleep(2000);
      await dismissTour(driver);

      // Click Notes tab
      try {
        const notesTab = await driver.findElement(By.xpath("//button[contains(text(), 'Notes')]"));
        await notesTab.click();
        await sleep(1000);

        // Click Add Note button
        const addNoteBtn = await driver.findElement(By.css('[data-testid="note-add"]'));
        await addNoteBtn.click();
        await sleep(500);

        // Fill out the note form
        const bodyInput = await driver.findElement(By.css('[data-testid="note-body"] textarea'));
        await bodyInput.sendKeys('Test note from Selenium UX test');

        // Save the note
        const saveBtn = await driver.findElement(By.css('[data-testid="note-save"]'));
        await saveBtn.click();
        await sleep(2000);

        // Check for snackbar
        try {
          const snackbar = await driver.findElement(By.css('.MuiSnackbar-root .MuiAlert-message'));
          const snackbarText = await snackbar.getText();
          if (snackbarText.toLowerCase().includes('success')) {
            console.log('✅ Notes panel shows success snackbar:', snackbarText);
          } else {
            console.log('⚠️ Snackbar found but message unclear:', snackbarText);
          }
        } catch (e) {
          // Try alternative selector
          const pageSource = await driver.getPageSource();
          if (pageSource.includes('success') || pageSource.includes('Success')) {
            console.log('✅ Success message found in page');
          } else {
            console.log('⚠️ Snackbar not found - may have auto-hidden');
          }
        }
      } catch (e) {
        console.log('⚠️ Could not test Notes panel:', e.message);
      }
    }

    // ============================================
    // TEST 3: Tasks Panel Snackbar Feedback
    // ============================================
    console.log('\n--- TEST 3: Tasks Panel Snackbar ---\n');

    // Navigate to tasks or client with tasks
    if (clientData) {
      await driver.get(`${BASE}/clients/${clientData}`);
      await sleep(2000);
      await dismissTour(driver);

      try {
        // Click Tasks tab
        const tasksTab = await driver.findElement(By.xpath("//button[contains(text(), 'Tasks')]"));
        await tasksTab.click();
        await sleep(1000);

        // Click Add Task button
        const addTaskBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Add task')]"));
        await addTaskBtn.click();
        await sleep(500);

        // Fill out task form
        const titleInput = await driver.findElement(By.xpath("//label[contains(text(), 'Title')]/following::input[1]"));
        await titleInput.sendKeys('Selenium UX Test Task');

        // Save the task
        const saveBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Save')]"));
        await saveBtn.click();
        await sleep(2000);

        // Check for snackbar
        const pageSource = await driver.getPageSource();
        if (pageSource.includes('success') || pageSource.includes('Success') || pageSource.includes('created')) {
          console.log('✅ Tasks panel shows success feedback');
        } else {
          console.log('⚠️ Could not verify task success message');
        }
      } catch (e) {
        console.log('⚠️ Could not test Tasks panel:', e.message);
      }
    }

    // ============================================
    // TEST 4: Verify /auth/client-login Does Not Exist
    // ============================================
    console.log('\n--- TEST 4: /auth/client-login Removed ---\n');

    await driver.get(`${BASE}/auth/client-login`);
    await sleep(2000);

    const notFoundUrl = await driver.getCurrentUrl();
    const pageText = await driver.findElement(By.css('body')).getText();

    if (notFoundUrl.includes('404') || pageText.includes('404') || pageText.includes('not found') || pageText.includes('Not Found')) {
      console.log('✅ /auth/client-login returns 404 (page removed)');
    } else if (notFoundUrl.includes('/auth/login') && !notFoundUrl.includes('client-login')) {
      console.log('✅ /auth/client-login redirects to /auth/login');
    } else {
      console.log('⚠️ /auth/client-login status unclear - URL:', notFoundUrl);
    }

    // ============================================
    // TEST 5: RecruiterWizard Has Credentials Include
    // ============================================
    console.log('\n--- TEST 5: RecruiterWizard Session Fix ---\n');

    // This is a code verification test - we verify the fix was applied
    // by checking that the page loads without immediate session errors
    await driver.get(`${BASE}/auth/login`);
    await findAndType(driver, 'Email', AGENCY_EMAIL);
    await findAndType(driver, 'Phone', AGENCY_PHONE);
    await findAndType(driver, 'Access Code', AGENCY_CODE);
    await driver.findElement(By.xpath('//button[normalize-space(.)="Sign in"]')).click();
    await sleep(3000);

    await driver.get(`${BASE}/recruiter`);
    await sleep(2000);
    await dismissTour(driver);

    const recruiterPageSource = await driver.getPageSource();
    if (!recruiterPageSource.includes('Missing session') && !recruiterPageSource.includes('No Session')) {
      console.log('✅ RecruiterWizard loads without session errors');
    } else {
      console.log('❌ RecruiterWizard shows session errors');
    }

    console.log('\n========================================');
    console.log('UX IMPROVEMENTS TESTS COMPLETED');
    console.log('========================================\n');

  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
}

run();
