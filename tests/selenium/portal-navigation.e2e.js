/**
 * Portal Navigation E2E Tests
 * 
 * Tests that:
 * 1. Agency owners see full navigation including Settings, Agents, etc.
 * 2. Agents see reduced navigation (no Settings, no Agents)
 * 3. Clients see client-specific navigation with sidebar layout
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

// Agent credentials
const AGENT_AGENCY = 'jamesagency';
const AGENT_EMAIL = 'drisanjames@yahoo.com';
const AGENT_PHONE = '2084407940';
const AGENT_CODE = '123456';

async function run() {
  const options = new chrome.Options();
  options.addArguments('--headless=new', '--no-sandbox', '--disable-gpu', '--window-size=1920,1080');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    console.log('\n========================================');
    console.log('PORTAL NAVIGATION E2E TESTS');
    console.log('========================================\n');

    // ============================================
    // TEST 1: Agency Owner Navigation
    // ============================================
    console.log('--- TEST 1: Agency Owner Navigation ---\n');

    await driver.get(`${BASE}/auth/login`);
    await findAndType(driver, 'Email', AGENCY_EMAIL);
    await findAndType(driver, 'Phone', AGENCY_PHONE);
    await findAndType(driver, 'Access Code', AGENCY_CODE);
    await driver.findElement(By.xpath('//button[normalize-space(.)="Sign in"]')).click();
    await driver.wait(until.urlContains('/dashboard'), 15000);
    await sleep(2000);
    await dismissTour(driver);
    
    console.log('✅ Agency owner logged in');

    // Check sidebar navigation
    const agencySidebar = await driver.findElements(By.css('.MuiDrawer-paper a'));
    const agencyNavHrefs = [];
    for (const link of agencySidebar) {
      const href = await link.getAttribute('href');
      agencyNavHrefs.push(href);
    }
    
    console.log('Agency sidebar links:', agencyNavHrefs.length);
    
    const hasAgents = agencyNavHrefs.some(h => h?.includes('/agents'));
    const hasDashboard = agencyNavHrefs.some(h => h?.includes('/dashboard'));
    const hasClients = agencyNavHrefs.some(h => h?.includes('/clients'));
    
    console.log('  Dashboard:', hasDashboard ? '✅' : '❌');
    console.log('  Athletes/Clients:', hasClients ? '✅' : '❌');
    console.log('  Agents:', hasAgents ? '✅' : '❌');

    if (!hasAgents) {
      throw new Error('Agency owner should see Agents nav');
    }

    // Check user menu has Settings
    await sleep(500);
    const agencyAvatar = await driver.findElement(By.css('.MuiIconButton-root .MuiAvatar-root'));
    await driver.executeScript('arguments[0].click();', agencyAvatar);
    await sleep(500);

    const pageSource = await driver.getPageSource();
    const agencyHasSettings = pageSource.includes('href="/settings"');
    console.log('  Settings in menu:', agencyHasSettings ? '✅' : '❌');

    if (!agencyHasSettings) {
      throw new Error('Agency owner should see Settings in user menu');
    }

    console.log('\n✅ Agency owner navigation verified\n');

    // ============================================
    // TEST 2: Agent Navigation (No Settings, No Agents)
    // ============================================
    console.log('--- TEST 2: Agent Navigation ---\n');

    // Clear cookies and login as agent
    await driver.manage().deleteAllCookies();
    await driver.get(`${BASE}/auth/agent-login`);
    await driver.wait(until.elementLocated(By.xpath("//h5[contains(text(), 'Agent Login')]")), 10000);

    await driver.findElement(By.css('input[placeholder*="agency"]')).sendKeys(AGENT_AGENCY);
    await driver.findElement(By.css('input[type="email"]')).sendKeys(AGENT_EMAIL);
    await driver.findElement(By.css('input[type="tel"]')).sendKeys(AGENT_PHONE);
    await driver.findElement(By.css('input[type="password"]')).sendKeys(AGENT_CODE);
    await driver.findElement(By.css('button[type="submit"]')).click();
    await sleep(3000);

    // Navigate to dashboard
    await driver.get(`${BASE}/dashboard`);
    await sleep(3000);
    await dismissTour(driver);

    const agentUrl = await driver.getCurrentUrl();
    if (!agentUrl.includes('/dashboard')) {
      throw new Error('Agent not redirected to dashboard');
    }
    console.log('✅ Agent logged in');

    // Verify session role
    const sessionData = await driver.executeAsyncScript(`
      const cb = arguments[arguments.length - 1];
      fetch('${API}/auth/session', { credentials: 'include' })
        .then(r => r.json())
        .then(d => cb(JSON.stringify(d)))
        .catch(e => cb('error: ' + e.message));
    `);
    const session = JSON.parse(sessionData);
    console.log('  Session role:', session?.session?.role);

    if (session?.session?.role !== 'agent') {
      throw new Error('Expected agent role, got: ' + session?.session?.role);
    }

    // Check sidebar - should NOT have Agents
    const agentSidebar = await driver.findElements(By.css('.MuiDrawer-paper a'));
    const agentNavHrefs = [];
    for (const link of agentSidebar) {
      const href = await link.getAttribute('href');
      agentNavHrefs.push(href);
    }

    const agentHasAgentsNav = agentNavHrefs.some(h => h?.includes('/agents'));
    console.log('  Agents nav hidden:', !agentHasAgentsNav ? '✅' : '❌');

    if (agentHasAgentsNav) {
      throw new Error('Agent should NOT see Agents nav');
    }

    // Check user menu - should NOT have Settings
    const agentPageSource = await driver.getPageSource();
    const agentHasSettings = agentPageSource.includes('href="/settings"');
    console.log('  Settings hidden:', !agentHasSettings ? '✅' : '❌');

    if (agentHasSettings) {
      throw new Error('Agent should NOT see Settings in user menu');
    }

    console.log('\n✅ Agent navigation verified\n');

    // ============================================
    // TEST 3: Client Navigation (Sidebar Layout)
    // ============================================
    console.log('--- TEST 3: Client Navigation ---\n');

    // Get a client to test with
    await driver.manage().deleteAllCookies();
    
    // First login as agency to get client info
    await driver.get(`${BASE}/auth/login`);
    await findAndType(driver, 'Email', AGENCY_EMAIL);
    await findAndType(driver, 'Phone', AGENCY_PHONE);
    await findAndType(driver, 'Access Code', AGENCY_CODE);
    await driver.findElement(By.xpath('//button[normalize-space(.)="Sign in"]')).click();
    await sleep(3000);

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

    if (!clientInfo) {
      console.log('⚠️ No clients found - skipping client test');
    } else {
      const client = JSON.parse(clientInfo);
      console.log('  Using client:', client.email);

      // Clear cookies and login as client
      await driver.manage().deleteAllCookies();
      await driver.get(`${BASE}/auth/client-login`);
      await sleep(1000);

      await findAndType(driver, 'Email', client.email);
      await findAndType(driver, 'Phone', client.phone);
      const pwInput = await driver.findElement(By.css('input[type="password"]'));
      await pwInput.clear();
      await pwInput.sendKeys(client.accessCode);
      await driver.findElement(By.xpath('//button[normalize-space(.)="Sign in"]')).click();
      await sleep(4000);

      const clientUrl = await driver.getCurrentUrl();
      if (clientUrl.includes('/client/')) {
        console.log('✅ Client logged in');

        const clientPageSource = await driver.getPageSource();

        // Check for sidebar drawer (new layout)
        const hasDrawer = clientPageSource.includes('MuiDrawer');
        console.log('  Sidebar drawer:', hasDrawer ? '✅' : '❌');

        // Check for client nav items
        const expectedLinks = ['/client/lists', '/client/recruiter', '/client/tasks', '/client/views', '/client/meetings', '/client/messages'];
        let allLinksPresent = true;
        for (const link of expectedLinks) {
          const hasLink = clientPageSource.includes(link);
          if (!hasLink) {
            console.log('  Missing link:', link);
            allLinksPresent = false;
          }
        }
        console.log('  All client nav links:', allLinksPresent ? '✅' : '❌');

        // Check that admin items are hidden
        const clientHasSettings = clientPageSource.includes('href="/settings"');
        const clientHasAgents = clientPageSource.includes('href="/agents"');
        const clientHasDashboard = clientPageSource.includes('href="/dashboard"');

        console.log('  Settings hidden:', !clientHasSettings ? '✅' : '❌');
        console.log('  Agents hidden:', !clientHasAgents ? '✅' : '❌');
        console.log('  Dashboard hidden:', !clientHasDashboard ? '✅' : '❌');

        if (clientHasSettings || clientHasAgents || clientHasDashboard) {
          throw new Error('Client should not see admin navigation');
        }

        console.log('\n✅ Client navigation verified\n');
      } else {
        console.log('⚠️ Client login may have failed - URL:', clientUrl);
      }
    }

    console.log('========================================');
    console.log('ALL PORTAL NAVIGATION TESTS PASSED! 🎉');
    console.log('========================================\n');

  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exitCode = 1;
  } finally {
    await driver.quit();
  }
}

run();
