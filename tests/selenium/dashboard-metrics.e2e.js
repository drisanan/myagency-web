const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { setSession, allowlistedConsoleErrors } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const AGENCY_EMAIL = 'agency1@an.test';

async function seedMetrics(driver) {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const prevIso = new Date(today.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  await driver.executeAsyncScript(
    async (base, agency, currentDay, previousDay, done) => {
      try {
        await fetch(`${base}/api/metrics/seed`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agencyEmail: agency,
            days: [
              { date: previousDay, sends: 5, opens: 1, clicks: 0 },
              { date: currentDay, sends: 10, opens: 8, clicks: 2 },
            ],
          }),
        });
        done();
      } catch (e) {
        done(e?.message || 'seed failed');
      }
    },
    BASE,
    AGENCY_EMAIL,
    todayIso,
    prevIso,
  );
}

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await setSession(driver, BASE, { role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' });
    await seedMetrics(driver);

    await driver.get(`${BASE}/dashboard`);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Emails Sent")]`)), 10000);

    // Emails sent should reflect seeded current window (10) with +100% delta vs previous window (5)
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "10")]`)), 10000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "+100%")]`)), 10000);

    // Open rate from seeds: 8 opens / 10 sends = 80%
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "80%")]`)), 10000);

    // Added this month uses seed data (2 for agency1)
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "+2")]`)), 10000);

    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }
    console.log('E2E dashboard metrics passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


