/**
 * E2E Test: Impersonation Email Sending
 * Tests the flow of sending an email while impersonating a client
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const TEST_EMAIL = process.env.TEST_EMAIL || 'Brian@coachhorschel.com';
const TEST_PHONE = process.env.TEST_PHONE || '9072441155';
const TEST_ACCESS = process.env.TEST_ACCESS || '574907';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg) {
  console.log(`[${new Date().toISOString().split('T')[1].split('.')[0]}] ${msg}`);
}

async function runTest() {
  log('═══════════════════════════════════════════════════════════════');
  log('  IMPERSONATION EMAIL SENDING TEST');
  log('═══════════════════════════════════════════════════════════════');

  const options = new chrome.Options();
  options.addArguments('--window-size=1400,900');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    // 1. Login as agency
    log('\n📋 STEP 1: Login as agency');
    await driver.get(`${BASE_URL}/auth/login`);
    await sleep(2000);

    const emailInput = await driver.findElement(By.css('input[type="email"]'));
    await emailInput.sendKeys(TEST_EMAIL);
    const phoneInput = await driver.findElement(By.css('input[type="tel"]'));
    await phoneInput.sendKeys(TEST_PHONE);
    const accessInput = await driver.findElement(By.css('input[inputmode="numeric"]'));
    await accessInput.sendKeys(TEST_ACCESS);
    
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.urlContains('/dashboard'), 10000);
    log('   ✓ Logged in successfully');

    // 2. Navigate to Clients page
    log('\n📋 STEP 2: Navigate to Clients page');
    await driver.get(`${BASE_URL}/clients`);
    await sleep(2000);
    log('   ✓ On clients page');

    // 3. Dismiss any tour that might be running
    log('\n📋 STEP 3: Dismiss tour if present');
    try {
      const tourOverlay = await driver.findElements(By.css('.driver-overlay, .driver-popover'));
      if (tourOverlay.length > 0) {
        log('   Tour detected, dismissing...');
        await driver.actions().sendKeys(Key.ESCAPE).perform();
        await sleep(1000);
      }
    } catch {}

    // 4. Find an Impersonate button
    log('\n📋 STEP 4: Look for Impersonate button');
    const impersonateButtons = await driver.findElements(By.xpath("//button[contains(text(), 'Impersonate')]"));
    log(`   Found ${impersonateButtons.length} Impersonate buttons`);

    if (impersonateButtons.length === 0) {
      log('   ⚠️ No clients to impersonate. Test requires at least one client.');
      log('   Listing available buttons on page:');
      const allButtons = await driver.findElements(By.css('button'));
      for (const btn of allButtons.slice(0, 10)) {
        try {
          const text = await btn.getText();
          if (text) log(`      - "${text}"`);
        } catch {}
      }
      return;
    }

    // 5. Click Impersonate (using JavaScript to avoid overlay issues)
    log('\n📋 STEP 5: Impersonate first client');
    await driver.executeScript('arguments[0].click();', impersonateButtons[0]);
    await sleep(2000);

    const currentUrl = await driver.getCurrentUrl();
    log(`   Current URL: ${currentUrl}`);

    if (!currentUrl.includes('/client/')) {
      log('   ❌ Did not redirect to client portal');
      return;
    }
    log('   ✓ Redirected to client portal');

    // 6. Check for impersonation banner
    log('\n📋 STEP 6: Verify impersonation banner');
    
    // Debug: Check localStorage for impersonation data
    const localStorageDebug = await driver.executeScript(`
      return {
        impersonationActive: window.localStorage.getItem('session_impersonation_active'),
        impersonationBase: window.localStorage.getItem('session_impersonation_base'),
      };
    `);
    log(`   localStorage.impersonation_active: ${localStorageDebug.impersonationActive ? 'EXISTS' : 'NULL'}`);
    log(`   localStorage.impersonation_base: ${localStorageDebug.impersonationBase ? 'EXISTS' : 'NULL'}`);
    
    if (localStorageDebug.impersonationActive) {
      try {
        const parsed = JSON.parse(localStorageDebug.impersonationActive);
        log(`   Active session role: ${parsed.role}`);
        log(`   Active session impersonatedBy: ${JSON.stringify(parsed.impersonatedBy)}`);
        log(`   Active session agencyId: ${parsed.agencyId}`);
        log(`   Active session clientId: ${parsed.clientId}`);
      } catch (e) {
        log(`   Could not parse active session: ${e.message}`);
      }
    }
    
    try {
      const banner = await driver.wait(
        until.elementLocated(By.xpath("//*[contains(text(), 'End Impersonation') or contains(text(), 'Impersonating:') or contains(text(), 'Stop Impersonating')]")),
        5000
      );
      const bannerText = await banner.getText();
      log(`   ✓ Impersonation banner: "${bannerText.substring(0, 50)}..."`);
    } catch (e) {
      log('   ⚠️ Impersonation banner not found');
    }

    // 7. Check cookies before navigating
    log('\n📋 STEP 7: Check cookies');
    const cookies = await driver.manage().getCookies();
    log(`   Total cookies: ${cookies.length}`);
    for (const cookie of cookies) {
      if (cookie.name.includes('session') || cookie.name === 'an_session') {
        log(`   Cookie: ${cookie.name} = ${cookie.value.substring(0, 30)}...`);
        log(`      Domain: ${cookie.domain}, Secure: ${cookie.secure}, HttpOnly: ${cookie.httpOnly}`);
      }
    }

    // 8. Navigate to Recruiter page (client version)
    log('\n📋 STEP 8: Navigate to Client Recruiter page');
    await driver.get(`${BASE_URL}/client/recruiter`);
    await sleep(3000);

    const recruiterUrl = await driver.getCurrentUrl();
    log(`   Current URL: ${recruiterUrl}`);

    // Check for page content
    const hasRecruiter = await driver.findElements(By.xpath("//*[contains(text(), 'Select List') or contains(text(), 'Recruiter') or contains(text(), 'List')]"));
    log(`   Found ${hasRecruiter.length} recruiter-related elements`);

    // Check for any errors on page
    const alerts = await driver.findElements(By.css('.MuiAlert-root'));
    for (const alert of alerts) {
      try {
        const alertText = await alert.getText();
        const alertClass = await alert.getAttribute('class');
        const isError = alertClass.includes('error');
        log(`   ${isError ? '❌ ERROR' : 'ℹ️  INFO'}: "${alertText}"`);
      } catch {}
    }

    // Check for "Profile incomplete" or similar errors
    const pageText = await driver.findElement(By.css('body')).getText();
    if (pageText.includes('incomplete') || pageText.includes('missing')) {
      log('   ⚠️ Profile incomplete warning detected');
    }

    // 9. Check if there are lists available
    log('\n📋 STEP 9: Check for available lists');
    const listItems = await driver.findElements(By.xpath("//input[@type='radio'] | //*[contains(@class, 'MuiRadio')]"));
    log(`   Found ${listItems.length} selectable list items`);

    if (listItems.length === 0) {
      log('   ⚠️ No lists assigned to this client');
      log('   The client needs lists assigned before they can send emails');
    } else {
      // Select first list
      log('\n📋 STEP 10: Select first list');
      try {
        await listItems[0].click();
        await sleep(1000);
        log('   ✓ Selected list');

        // Click Next
        const nextBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Next')]"));
        await nextBtn.click();
        await sleep(2000);
        log('   ✓ Clicked Next');

        // Check for coach selection
        const coaches = await driver.findElements(By.xpath("//input[@type='radio']"));
        log(`   Found ${coaches.length} coaches to select`);

        if (coaches.length > 0) {
          await coaches[0].click();
          await sleep(500);
          
          const nextBtn2 = await driver.findElement(By.xpath("//button[contains(text(), 'Next')]"));
          await nextBtn2.click();
          await sleep(2000);
          log('   ✓ Selected coach and moved to compose');

          // Check for compose/send step
          const sendBtn = await driver.findElements(By.xpath("//button[contains(text(), 'Send') or contains(text(), 'Create Draft')]"));
          log(`   Found ${sendBtn.length} send/draft buttons`);

          // Check for Gmail connection status
          const gmailSection = await driver.findElements(By.xpath("//*[contains(text(), 'Gmail') or contains(text(), 'Connect')]"));
          for (const section of gmailSection) {
            try {
              const text = await section.getText();
              log(`   Gmail status: "${text.substring(0, 60)}"`);
            } catch {}
          }
        }
      } catch (e) {
        log(`   ⚠️ Error in wizard flow: ${e.message}`);
      }
    }

    // 11. Check browser console for errors
    log('\n📋 STEP 11: Check browser console for API errors');
    const logs = await driver.manage().logs().get('browser');
    const apiErrors = logs.filter(log => 
      log.level.name === 'SEVERE' && 
      (log.message.includes('api') || 
       log.message.includes('gmail') || 
       log.message.includes('401') ||
       log.message.includes('403') ||
       log.message.includes('500'))
    );
    
    if (apiErrors.length > 0) {
      log('   API Errors found:');
      apiErrors.forEach(err => {
        log(`   ❌ ${err.message.substring(0, 200)}`);
      });
    } else {
      log('   ✓ No API errors in console');
    }

    // 12. Stop impersonating
    log('\n📋 STEP 12: Stop impersonating');
    try {
      const stopBtn = await driver.findElement(By.xpath("//button[contains(text(), 'End Impersonation') or contains(text(), 'Stop Impersonating')]"));
      await driver.executeScript('arguments[0].click();', stopBtn);
      await sleep(2000);
      
      const finalUrl = await driver.getCurrentUrl();
      log(`   Final URL: ${finalUrl}`);
      if (finalUrl.includes('/clients')) {
        log('   ✓ Returned to agency view');
      }
    } catch (e) {
      log(`   ⚠️ Could not stop impersonating: ${e.message}`);
    }

    log('\n═══════════════════════════════════════════════════════════════');
    log('  TEST COMPLETE');
    log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    log(`\n❌ TEST ERROR: ${error.message}`);
    
    // Screenshot on error
    try {
      const screenshot = await driver.takeScreenshot();
      require('fs').writeFileSync('/tmp/impersonation-email-test-error.png', screenshot, 'base64');
      log('   Screenshot saved to /tmp/impersonation-email-test-error.png');
    } catch {}

    // Browser console
    try {
      const logs = await driver.manage().logs().get('browser');
      const errors = logs.filter(l => l.level.name === 'SEVERE').slice(-5);
      if (errors.length) {
        log('\n   Recent console errors:');
        errors.forEach(e => log(`   - ${e.message.substring(0, 150)}`));
      }
    } catch {}
  } finally {
    await driver.quit();
  }
}

runTest();
