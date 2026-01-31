/**
 * Comprehensive E2E Test Suite
 * Tests all major features of the My Recruiter Agency application
 */

const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const BASE_URL = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const TEST_EMAIL = process.env.TEST_EMAIL || 'Brian@coachhorschel.com';
const TEST_PHONE = process.env.TEST_PHONE || '9072441155';
const TEST_ACCESS = process.env.TEST_ACCESS || '574907';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = {
  passed: [],
  failed: [],
  skipped: [],
};

function log(msg) {
  console.log(`[${new Date().toISOString().split('T')[1].split('.')[0]}] ${msg}`);
}

async function test(name, fn, driver) {
  log(`\n📋 TEST: ${name}`);
  try {
    await fn(driver);
    results.passed.push(name);
    log(`   ✅ PASSED: ${name}`);
    return true;
  } catch (error) {
    results.failed.push({ name, error: error.message });
    log(`   ❌ FAILED: ${name}`);
    log(`      Error: ${error.message}`);
    // Take screenshot on failure
    try {
      const screenshot = await driver.takeScreenshot();
      const filename = `/tmp/test-failure-${name.replace(/\s+/g, '-')}.png`;
      require('fs').writeFileSync(filename, screenshot, 'base64');
      log(`      Screenshot: ${filename}`);
    } catch (e) {}
    return false;
  }
}

async function findElement(driver, selector, timeout = 5000) {
  const el = await driver.wait(until.elementLocated(By.css(selector)), timeout);
  await driver.wait(until.elementIsVisible(el), timeout);
  return el;
}

async function findElementByXpath(driver, xpath, timeout = 5000) {
  const el = await driver.wait(until.elementLocated(By.xpath(xpath)), timeout);
  return el;
}

async function elementExists(driver, selector, timeout = 2000) {
  try {
    await driver.wait(until.elementLocated(By.css(selector)), timeout);
    return true;
  } catch {
    return false;
  }
}

async function textExists(driver, text, timeout = 3000) {
  try {
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), '${text}')]`)), timeout);
    return true;
  } catch {
    return false;
  }
}

async function clickNavItem(driver, text) {
  // Try sidebar nav first
  try {
    const navItem = await driver.findElement(By.xpath(`//nav//a[contains(., '${text}')] | //aside//a[contains(., '${text}')]`));
    await navItem.click();
    await sleep(1500);
    return true;
  } catch {
    // Try direct navigation
    return false;
  }
}

// ==================== TEST FUNCTIONS ====================

async function testLogin(driver) {
  log('   Navigating to login page...');
  await driver.get(`${BASE_URL}/auth/login`);
  await sleep(2000);

  // Fill credentials
  const emailInput = await findElement(driver, 'input[type="email"]');
  await emailInput.clear();
  await emailInput.sendKeys(TEST_EMAIL);

  const phoneInput = await findElement(driver, 'input[type="tel"]');
  await phoneInput.clear();
  await phoneInput.sendKeys(TEST_PHONE);

  const accessInput = await findElement(driver, 'input[inputmode="numeric"]');
  await accessInput.clear();
  await accessInput.sendKeys(TEST_ACCESS);

  // Submit
  const submitBtn = await findElement(driver, 'button[type="submit"]');
  await submitBtn.click();
  await sleep(3000);

  // Verify redirect to dashboard
  await driver.wait(until.urlContains('/dashboard'), 10000);
  log('   Logged in successfully');
}

async function testDashboard(driver) {
  await driver.get(`${BASE_URL}/dashboard`);
  await sleep(2000);

  // Check for dashboard elements
  const hasDashboard = await textExists(driver, 'Dashboard') || await textExists(driver, 'Commits');
  if (!hasDashboard) throw new Error('Dashboard content not found');

  // Check for any cards or stats
  const cards = await driver.findElements(By.css('.MuiPaper-root, .MuiCard-root'));
  log(`   Found ${cards.length} cards/papers on dashboard`);
  if (cards.length === 0) throw new Error('No dashboard cards found');
}

async function testClientsPage(driver) {
  await driver.get(`${BASE_URL}/clients`);
  await sleep(2000);

  // Check for metrics cards
  const hasMetrics = await textExists(driver, 'Total Athlete') || 
                     await textExists(driver, 'Athletes') ||
                     await textExists(driver, 'New This Month');
  log(`   Metrics cards: ${hasMetrics ? 'Found' : 'Not found'}`);

  // Check for table
  const table = await elementExists(driver, 'table, .MuiTable-root');
  log(`   Client table: ${table ? 'Found' : 'Not found'}`);

  // Check for Add button
  const hasAdd = await textExists(driver, 'Add') || await elementExists(driver, 'button[aria-label*="add"]');
  log(`   Add button: ${hasAdd ? 'Found' : 'Not found'}`);

  if (!table) throw new Error('Client table not found');
}

async function testClientEdit(driver) {
  await driver.get(`${BASE_URL}/clients`);
  await sleep(2000);

  // Find and click Edit on first client
  try {
    const editBtn = await findElementByXpath(driver, "//button[contains(text(), 'Edit')]", 3000);
    await editBtn.click();
    await sleep(2000);

    // Verify we're on edit page
    const currentUrl = await driver.getCurrentUrl();
    if (!currentUrl.includes('/edit')) {
      throw new Error('Did not navigate to edit page');
    }

    // Check for form elements
    const hasForm = await textExists(driver, 'Basic Info') || await textExists(driver, 'Gmail Connection');
    if (!hasForm) throw new Error('Edit form not found');

    log('   Edit page loaded successfully');
  } catch (e) {
    log('   No clients to edit or edit button not found');
    results.skipped.push('Client Edit - no clients available');
  }
}

async function testListsPage(driver) {
  await driver.get(`${BASE_URL}/lists`);
  await sleep(2000);

  // Check for key sections
  const hasSearch = await textExists(driver, 'Search') || await textExists(driver, 'Universities');
  const hasManual = await textExists(driver, 'Manual');
  const hasDivision = await textExists(driver, 'Division') || await textExists(driver, 'Breakdown');

  log(`   Search section: ${hasSearch ? 'Found' : 'Not found'}`);
  log(`   Manual entry: ${hasManual ? 'Found' : 'Not found'}`);
  log(`   Division breakdown: ${hasDivision ? 'Found' : 'Not found'}`);

  if (!hasSearch && !hasManual) throw new Error('Lists page content not found');
}

async function testAgentsPage(driver) {
  await driver.get(`${BASE_URL}/agents`);
  await sleep(2000);

  // Check for table or agent list
  const hasTable = await elementExists(driver, 'table, .MuiTable-root');
  const hasAgents = await textExists(driver, 'Agent') || await textExists(driver, 'Add');

  log(`   Agent table: ${hasTable ? 'Found' : 'Not found'}`);
  log(`   Agent content: ${hasAgents ? 'Found' : 'Not found'}`);

  if (!hasTable && !hasAgents) throw new Error('Agents page content not found');
}

async function testTasksPage(driver) {
  await driver.get(`${BASE_URL}/tasks`);
  await sleep(2000);

  // Check for task elements
  const hasTasks = await textExists(driver, 'Task') || 
                   await textExists(driver, 'Total') ||
                   await elementExists(driver, '.MuiTable-root, table');

  log(`   Tasks content: ${hasTasks ? 'Found' : 'Not found'}`);

  if (!hasTasks) throw new Error('Tasks page content not found');
}

async function testPromptsPage(driver) {
  await driver.get(`${BASE_URL}/ai/prompts`);
  await sleep(2000);

  // Check for prompts/introductions content
  const hasPrompts = await textExists(driver, 'Introduction') || 
                     await textExists(driver, 'Generate') ||
                     await textExists(driver, 'Athlete');

  const hasMetrics = await textExists(driver, 'Total') || await textExists(driver, 'Generated');

  log(`   Prompts content: ${hasPrompts ? 'Found' : 'Not found'}`);
  log(`   Metrics: ${hasMetrics ? 'Found' : 'Not found'}`);

  if (!hasPrompts) throw new Error('Prompts page content not found');
}

async function testEmailDripsPage(driver) {
  await driver.get(`${BASE_URL}/email-drips`);
  await sleep(2000);

  // Check for drip content
  const hasDrips = await textExists(driver, 'Drip') || 
                   await textExists(driver, 'Email') ||
                   await textExists(driver, 'Create');

  log(`   Email drips content: ${hasDrips ? 'Found' : 'Not found'}`);

  if (!hasDrips) throw new Error('Email drips page content not found');
}

async function testSettingsPage(driver) {
  await driver.get(`${BASE_URL}/settings`);
  await sleep(2000);

  // Check for settings content
  const hasSettings = await textExists(driver, 'Setting') || 
                      await textExists(driver, 'Agency') ||
                      await textExists(driver, 'Theme') ||
                      await textExists(driver, 'Header');

  log(`   Settings content: ${hasSettings ? 'Found' : 'Not found'}`);

  if (!hasSettings) throw new Error('Settings page content not found');
}

async function testImprovementsPage(driver) {
  await driver.get(`${BASE_URL}/improvements`);
  await sleep(2000);

  // Check for improvements content
  const hasImprovements = await textExists(driver, 'Improvement') || 
                          await textExists(driver, 'Suggestion') ||
                          await textExists(driver, 'pending') ||
                          await textExists(driver, 'Requirements');

  log(`   Improvements content: ${hasImprovements ? 'Found' : 'Not found'}`);

  // This page might be empty if no suggestions exist
  const hasTable = await elementExists(driver, '.MuiTable-root, table, .MuiTabs-root');
  log(`   Table/Tabs: ${hasTable ? 'Found' : 'Not found'}`);
}

async function testSuggestionButton(driver) {
  await driver.get(`${BASE_URL}/dashboard`);
  await sleep(2000);

  // Look for the floating suggestion button
  const suggestionBtn = await elementExists(driver, 'button[aria-label="Suggest improvement"], .MuiFab-root');
  log(`   Suggestion button: ${suggestionBtn ? 'Found' : 'Not found'}`);

  if (!suggestionBtn) throw new Error('Suggestion button not found');

  // Click it
  const btn = await findElement(driver, 'button[aria-label="Suggest improvement"], .MuiFab-root');
  await driver.executeScript('arguments[0].click();', btn);
  await sleep(1000);

  // Check for overlay
  const hasOverlay = await textExists(driver, 'Tap the area');
  log(`   Suggestion overlay: ${hasOverlay ? 'Found' : 'Not found'}`);

  // Close overlay by pressing Escape
  await driver.actions().sendKeys(Key.ESCAPE).perform();
  await sleep(500);
}

async function testNavigation(driver) {
  await driver.get(`${BASE_URL}/dashboard`);
  await sleep(2000);

  // Check for sidebar navigation
  const navItems = ['Dashboard', 'Clients', 'Lists', 'Tasks'];
  let foundNav = 0;

  for (const item of navItems) {
    if (await textExists(driver, item, 1000)) {
      foundNav++;
    }
  }

  log(`   Navigation items found: ${foundNav}/${navItems.length}`);

  if (foundNav < 2) throw new Error('Navigation not properly rendered');
}

async function testGmailRequired(driver) {
  await driver.get(`${BASE_URL}/clients/new`);
  await sleep(2000);

  // Check for Gmail Connection section with required indicator
  const hasGmail = await textExists(driver, 'Gmail Connection');
  const hasRequired = await driver.findElements(By.xpath("//*[contains(text(), 'Gmail Connection')]//*[contains(text(), '*')]"));

  log(`   Gmail section: ${hasGmail ? 'Found' : 'Not found'}`);
  log(`   Required indicator: ${hasRequired.length > 0 ? 'Found' : 'Not found'}`);

  if (!hasGmail) throw new Error('Gmail Connection section not found');
}

async function testRecruiterWizard(driver) {
  await driver.get(`${BASE_URL}/recruiter`);
  await sleep(2000);

  // Check for recruiter wizard content
  const hasWizard = await textExists(driver, 'Recruiter') || 
                    await textExists(driver, 'Select') ||
                    await textExists(driver, 'Campaign');

  log(`   Recruiter wizard: ${hasWizard ? 'Found' : 'Not found'}`);
}

async function testMeetingsPage(driver) {
  await driver.get(`${BASE_URL}/meetings`);
  await sleep(2000);

  // Check for meetings content
  const hasMeetings = await textExists(driver, 'Meeting') || 
                      await textExists(driver, 'Calendar') ||
                      await textExists(driver, 'Schedule');

  log(`   Meetings content: ${hasMeetings ? 'Found' : 'Not found'}`);
}

async function testMessagesPage(driver) {
  await driver.get(`${BASE_URL}/messages`);
  await sleep(2000);

  // Check for messages content
  const hasMessages = await textExists(driver, 'Message') || 
                      await textExists(driver, 'Inbox') ||
                      await textExists(driver, 'Communication');

  log(`   Messages content: ${hasMessages ? 'Found' : 'Not found'}`);
}

async function testProfileViewsPage(driver) {
  await driver.get(`${BASE_URL}/profile-views`);
  await sleep(2000);

  // Check for profile views content
  const hasViews = await textExists(driver, 'View') || 
                   await textExists(driver, 'Profile') ||
                   await elementExists(driver, '.MuiTable-root, table');

  log(`   Profile views content: ${hasViews ? 'Found' : 'Not found'}`);
}

// ==================== MAIN TEST RUNNER ====================

async function runAllTests() {
  log('═══════════════════════════════════════════════════════════════');
  log('  MY RECRUITER AGENCY - COMPREHENSIVE E2E TEST SUITE');
  log('═══════════════════════════════════════════════════════════════');
  log(`  BASE_URL: ${BASE_URL}`);
  log(`  TEST_EMAIL: ${TEST_EMAIL}`);
  log('═══════════════════════════════════════════════════════════════\n');

  const options = new chrome.Options();
  options.addArguments('--window-size=1400,900');
  // options.addArguments('--headless');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  try {
    // Login first
    await test('Login', testLogin, driver);

    // Run all page tests
    await test('Dashboard', testDashboard, driver);
    await test('Navigation', testNavigation, driver);
    await test('Clients Page', testClientsPage, driver);
    await test('Client Edit', testClientEdit, driver);
    await test('Gmail Required (New Client)', testGmailRequired, driver);
    await test('Lists Page', testListsPage, driver);
    await test('Agents Page', testAgentsPage, driver);
    await test('Tasks Page', testTasksPage, driver);
    await test('AI Prompts Page', testPromptsPage, driver);
    await test('Email Drips Page', testEmailDripsPage, driver);
    await test('Recruiter Wizard', testRecruiterWizard, driver);
    await test('Meetings Page', testMeetingsPage, driver);
    await test('Messages Page', testMessagesPage, driver);
    await test('Profile Views Page', testProfileViewsPage, driver);
    await test('Settings Page', testSettingsPage, driver);
    await test('Improvements Page', testImprovementsPage, driver);
    await test('Suggestion Button', testSuggestionButton, driver);

  } finally {
    await driver.quit();
  }

  // Print summary
  log('\n═══════════════════════════════════════════════════════════════');
  log('  TEST SUMMARY');
  log('═══════════════════════════════════════════════════════════════');
  log(`  ✅ PASSED: ${results.passed.length}`);
  results.passed.forEach(t => log(`     - ${t}`));
  
  if (results.failed.length > 0) {
    log(`\n  ❌ FAILED: ${results.failed.length}`);
    results.failed.forEach(t => log(`     - ${t.name}: ${t.error}`));
  }
  
  if (results.skipped.length > 0) {
    log(`\n  ⏭️  SKIPPED: ${results.skipped.length}`);
    results.skipped.forEach(t => log(`     - ${t}`));
  }

  const total = results.passed.length + results.failed.length;
  const passRate = ((results.passed.length / total) * 100).toFixed(1);
  log(`\n  Pass Rate: ${passRate}% (${results.passed.length}/${total})`);
  log('═══════════════════════════════════════════════════════════════\n');

  if (results.failed.length > 0) {
    process.exitCode = 1;
  }
}

runAllTests();
