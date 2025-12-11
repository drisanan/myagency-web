const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { setSession, selectOption, allowlistedConsoleErrors, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const AGENCY_EMAIL = 'agency1@an.test';
const CLIENT_ID = `c-seed-${Date.now()}`;

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // Seed session and clients before navigation (set on login page to avoid guard redirect)
    await driver.get(`${BASE}/auth/login`);
    await driver.executeScript(`
      window.localStorage.setItem('session', '${JSON.stringify({ role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' })}');
      const clients = [{ id: '${CLIENT_ID}', email: 'seed-${Date.now()}@example.com', firstName: 'Seed', lastName: 'Client', sport: 'Football', agencyEmail: '${AGENCY_EMAIL}' }];
      window.localStorage.setItem('clients_data', JSON.stringify(clients));
    `);
    await driver.get(`${BASE}/recruiter`);
    const currentUrl = await driver.getCurrentUrl();
    console.log('Current URL', currentUrl);
    await driver.wait(async () => {
      const has = await driver.executeScript('return document.body && document.body.innerText && document.body.innerText.includes("Recruiter");');
      return Boolean(has);
    }, 40000, 'Recruiter text not rendered');
    const bodyPreview = await driver.executeScript('return document.body.innerText.slice(0,400);');
    console.log('Body preview text:', bodyPreview);
    const preloadLogs = await driver.manage().logs().get('browser');
    const preloadErrors = allowlistedConsoleErrors(preloadLogs);
    if (preloadErrors.length) {
      console.error('Preload browser errors:', preloadErrors);
    }
    try {
      await driver.wait(until.elementLocated(By.xpath(`//h4[contains(., "Recruiter")]`)), 10000);
    } catch (e) {
      const src = await driver.getPageSource();
      console.error('Page source snippet:', src.slice(0, 500));
      throw e;
    }

    // Step 1: select first client (wait for form to render). Retry after refresh if needed.
    async function selectClient() {
      const clientSel = await driver.wait(
        until.elementLocated(By.xpath(`//label[contains(., "Client")]/following::div[@role="combobox"][1]`)),
        20000
      );
      await clientSel.click();
      const clientOpt = await driver.wait(until.elementLocated(By.xpath(`//li[1]`)), 5000);
      await clientOpt.click();
    }

    try {
      await selectClient();
    } catch {
      // re-seed and refresh once
      await driver.executeScript(`
        window.localStorage.setItem('session', '${JSON.stringify({ role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' })}');
        const clients = [{ id: '${CLIENT_ID}', email: 'seed-${Date.now()}@example.com', firstName: 'Seed', lastName: 'Client', sport: 'Football', agencyEmail: '${AGENCY_EMAIL}' }];
        window.localStorage.setItem('clients_data', JSON.stringify(clients));
      `);
      await driver.navigate().refresh();
      await selectClient();
    }
    // go to next step
    const nextBtn = await driver.wait(until.elementLocated(By.xpath(`//button[normalize-space(.)="Next"]`)), 10000);
    await nextBtn.click();

    // Step 2: select division/state (best-effort)
    const divisionSel = await driver.wait(
      until.elementLocated(By.xpath(`//label[contains(., "Division")]/following::div[@role="combobox"][1]`)),
      15000
    );
    await divisionSel.click();
    const divisionOpt = await driver.wait(until.elementLocated(By.xpath(`//li[normalize-space(.)="D1"]`)), 5000);
    await divisionOpt.click();

    const stateSel = await driver.wait(
      until.elementLocated(By.xpath(`//label[contains(., "State")]/following::div[@role="combobox"][1]`)),
      15000
    );
    await stateSel.click();
    const stateOpt = await driver.wait(until.elementLocated(By.xpath(`//li[normalize-space(.)="California"]`)), 5000);
    await stateOpt.click();

    // Wait for universities to load, pick first
    await driver.wait(until.elementLocated(By.xpath(`//div[contains(@class,"MuiCardContent-root")]`)), 15000);
    const firstSchool = await driver.findElement(By.xpath(`(//div[contains(@class,"MuiCardContent-root")])[1]`));
    await firstSchool.click();
    const nextBtn2 = await driver.wait(until.elementLocated(By.xpath(`//button[normalize-space(.)="Next"]`)), 10000);
    await nextBtn2.click();

    // Step 3: wait for details, pick first coach
    const firstCoachChk = await driver.wait(until.elementLocated(By.xpath(`(//input[@type='checkbox'])[1]`)), 20000);
    await firstCoachChk.click();

    // Step 4: ensure draft page reachable
    const draftNextBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Next" or contains(., "Generate")]`));
    await draftNextBtn.click().catch(() => {}); // in case already on draft

    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Selected Targets") or contains(text(),"Draft")]`)), 15000);

    // Check console errors
    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E recruiter wizard smoke passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

