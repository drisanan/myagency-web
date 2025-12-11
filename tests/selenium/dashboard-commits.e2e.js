const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { setSession, allowlistedConsoleErrors } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const AGENCY_EMAIL = 'agency1@an.test';

async function assertTopTableHasUniversitiesAndLogos(driver, tableId, sportLabel) {
  await driver.wait(async () => {
    const rows = await driver.findElements(By.xpath(`//table[@data-testid="${tableId}"]//tr[position()>1]`));
    return rows.length >= 10; // wait for a reasonable set of rows to render
  }, 25000);
  const rows = await driver.findElements(By.xpath(`//table[@data-testid="${tableId}"]//tr[position()>1]`));
  if (rows.length < 10) {
    throw new Error(`${sportLabel} top table has insufficient data rows (found ${rows.length})`);
  }
  for (let i = 0; i < rows.length; i++) {
    // rank | name | position | university | logo | source
    const uniCell = await rows[i].findElement(By.xpath('./td[4]'));
    const uniText = (await uniCell.getText()).trim();
    if (!uniText || uniText === '-') {
      throw new Error(`${sportLabel} row ${i + 1} missing university`);
    }
    const logos = await rows[i].findElements(By.xpath('./td[5]//img'));
    if (logos.length) {
      const src = await logos[0].getAttribute('src');
      if (!src || src === '-' || src.toLowerCase().includes('placeholder')) {
        throw new Error(`${sportLabel} row ${i + 1} has invalid logo src`);
      }
    } else {
      const logoText = (await rows[i].findElement(By.xpath('./td[5]')).getText()).trim();
      if (!logoText || logoText === '-') {
        throw new Error(`${sportLabel} row ${i + 1} missing logo img`);
      }
    }
  }
}

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await setSession(driver, BASE, { role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' });
    await driver.get(`${BASE}/dashboard`);

    const tables = [
      'commits-football-recent-table',
      'commits-football-top-table',
      'commits-basketball-recent-table',
      'commits-basketball-top-table',
    ];

    for (const tid of tables) {
      await driver.wait(until.elementLocated(By.css(`[data-testid="${tid}"]`)), 20000);
      const rows = await driver.findElements(By.xpath(`//table[@data-testid="${tid}"]//tr`));
      if (rows.length < 2) { // header + at least 1 row
        throw new Error(`Table ${tid} has no data rows`);
      }
    }

    // Validate universities and logos for all Top 50 rows (football, basketball)
    await assertTopTableHasUniversitiesAndLogos(driver, 'commits-football-top-table', 'Football Top');
    await assertTopTableHasUniversitiesAndLogos(driver, 'commits-basketball-top-table', 'Basketball Top');

    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }
    console.log('E2E dashboard commits passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


