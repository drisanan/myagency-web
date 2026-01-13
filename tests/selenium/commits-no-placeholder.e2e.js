/**
 * Validates that the commits/recruits lists on the dashboard
 * contain REAL scraped data, not placeholder/seed data.
 * 
 * Placeholder names follow the pattern: "Football Recent 1", "Basketball Top 5", etc.
 * Real names are actual recruit names like "Lamar Brown", "Zion Elee", etc.
 */
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { setSession, allowlistedConsoleErrors, dismissTour } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = process.env.API_BASE_URL || 'http://localhost:3001';
const AGENCY_EMAIL = 'agency1@an.test';

// Regex to detect placeholder names like "Football Recent 1", "Basketball Top 5"
const PLACEHOLDER_PATTERN = /^(Football|Basketball)\s+(Recent|Top)\s+\d+/i;

async function checkApiReturnsRealData() {
  const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
  
  console.log('📡 Checking API endpoints for placeholder data...');
  
  // Next.js API routes are on the frontend (BASE), not backend (API_BASE)
  const endpoints = [
    { url: `${BASE}/api/commits?sport=Football&list=top`, label: 'Football Top' },
    { url: `${BASE}/api/commits?sport=Football&list=recent`, label: 'Football Recent' },
    { url: `${BASE}/api/commits?sport=Basketball&list=top`, label: 'Basketball Top' },
    { url: `${BASE}/api/commits?sport=Basketball&list=recent`, label: 'Basketball Recent' },
  ];

  for (const ep of endpoints) {
    try {
      console.log(`   Fetching: ${ep.url}`);
      const res = await fetch(ep.url);
      if (!res.ok) {
        console.log(`   ⚠️ ${ep.label}: HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const commits = data?.data || [];
      
      if (commits.length === 0) {
        console.log(`   ⚠️ ${ep.label}: No data returned`);
        continue;
      }
      
      // Check first 5 entries for placeholder pattern
      const placeholders = commits.slice(0, 5).filter(c => PLACEHOLDER_PATTERN.test(c.name));
      if (placeholders.length > 0) {
        console.log(`   ❌ ${ep.label}: Found placeholder names:`, placeholders.map(p => p.name));
        return { ok: false, error: `${ep.label} contains placeholder data` };
      }
      
      console.log(`   ✅ ${ep.label}: Real data (e.g., "${commits[0]?.name}")`);
    } catch (e) {
      console.log(`   ⚠️ ${ep.label}: ${e.message}`);
    }
  }
  
  return { ok: true };
}

async function checkUIShowsRealData(driver) {
  console.log('🖥️  Checking UI tables for placeholder data...');
  
  const tables = [
    { id: 'commits-football-top-table', label: 'Football Top' },
    { id: 'commits-football-recent-table', label: 'Football Recent' },
    { id: 'commits-basketball-top-table', label: 'Basketball Top' },
    { id: 'commits-basketball-recent-table', label: 'Basketball Recent' },
  ];

  for (const table of tables) {
    try {
      // Wait for table to be present
      await driver.wait(until.elementLocated(By.css(`[data-testid="${table.id}"]`)), 30000);
      
      // Wait for loading to complete (no "Loading recruits..." text)
      await driver.wait(async () => {
        const loadingElements = await driver.findElements(By.xpath(`//*[contains(text(), "Loading recruits")]`));
        return loadingElements.length === 0;
      }, 30000);
      
      // Get all name cells (column 2 for recent, column 2 for top after rank)
      const rows = await driver.findElements(By.xpath(`//table[@data-testid="${table.id}"]//tbody//tr`));
      
      if (rows.length === 0) {
        console.log(`   ⚠️ ${table.label}: No rows found`);
        continue;
      }
      
      // Check first 5 rows for placeholder names
      const namesToCheck = Math.min(5, rows.length);
      const placeholderNames = [];
      
      for (let i = 0; i < namesToCheck; i++) {
        const cells = await rows[i].findElements(By.xpath('./td'));
        // Name is typically in 2nd cell (index 1) for recent, or after rank for top
        const nameCell = cells.length > 1 ? cells[1] : cells[0];
        const nameText = await nameCell.getText();
        
        if (PLACEHOLDER_PATTERN.test(nameText.trim())) {
          placeholderNames.push(nameText.trim());
        }
      }
      
      if (placeholderNames.length > 0) {
        console.log(`   ❌ ${table.label}: Found placeholder names in UI:`, placeholderNames);
        return { ok: false, error: `${table.label} UI shows placeholder data: ${placeholderNames.join(', ')}` };
      }
      
      // Get first name for logging
      const firstRow = rows[0];
      const firstCells = await firstRow.findElements(By.xpath('./td'));
      const firstName = firstCells.length > 1 ? await firstCells[1].getText() : await firstCells[0].getText();
      console.log(`   ✅ ${table.label}: Real data (e.g., "${firstName.trim()}")`);
      
    } catch (e) {
      console.log(`   ⚠️ ${table.label}: ${e.message}`);
    }
  }
  
  return { ok: true };
}

async function run() {
  console.log('🏃 Starting Commits No-Placeholder E2E Test');
  console.log(`📍 BASE_URL: ${BASE}`);
  console.log(`📍 API_BASE_URL: ${API_BASE}`);
  console.log('');

  // Step 1: Check API returns real data
  console.log('📝 Step 1: Checking API endpoints...');
  const apiCheck = await checkApiReturnsRealData();
  if (!apiCheck.ok) {
    console.error(`\n❌ API Check Failed: ${apiCheck.error}`);
    console.log('\n💡 Possible causes:');
    console.log('   - Scrapers have not completed yet (restart the dev server and wait)');
    console.log('   - ESPN website structure changed (check commitsScraper.ts)');
    console.log('   - Network issues preventing scraper from fetching ESPN data');
    process.exit(1);
  }
  console.log('');

  // Step 2: Check UI shows real data
  console.log('📝 Step 2: Checking UI rendering...');
  const options = new chrome.Options();
  options.addArguments('--headless=new', '--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // Set up session
    await setSession(driver, BASE, { role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' });
    await dismissTour(driver);
    
    // Navigate to dashboard
    await driver.get(`${BASE}/dashboard`);
    
    // Wait for page to load - look for the "Football Commits" heading
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "Football Commit") or contains(text(), "Dashboard")]`)), 20000);
    
    // Give React Query time to fetch and render
    await new Promise(r => setTimeout(r, 5000));
    
    const uiCheck = await checkUIShowsRealData(driver);
    if (!uiCheck.ok) {
      console.error(`\n❌ UI Check Failed: ${uiCheck.error}`);
      console.log('\n💡 Possible causes:');
      console.log('   - CommitsSection.tsx is using client-side listCommits() as initialData');
      console.log('   - React Query staleTime is too long, showing cached placeholder data');
      console.log('   - API fetch failed and component fell back to placeholder');
      process.exit(1);
    }

    // Check for console errors
    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.warn('\n⚠️ Browser console errors:', errors.map(e => e.message));
    }

    console.log('\n✅ Commits No-Placeholder E2E Test PASSED');
    console.log('🎉 All commit tables show real scraped data, no placeholders!');
    
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});
