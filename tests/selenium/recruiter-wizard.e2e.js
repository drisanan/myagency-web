const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { allowlistedConsoleErrors } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const AGENCY_EMAIL = 'agency1@an.test';

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(`${BASE}/auth/login`);
    await driver.executeAsyncScript(
      `
      const cb = arguments[arguments.length - 1];
      const api = '${process.env.API_BASE_URL}';
      fetch(api + '/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ agencyId: 'agency-001', email: '${AGENCY_EMAIL}', role: 'agency', userId: 'selenium-user' })
      }).then(() => cb()).catch((e) => cb(e?.message || 'session error'));
      `
    );
    await driver.get(`${BASE}/recruiter`);
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

    // Step 1: select client
      const clientSel = await driver.wait(
        until.elementLocated(By.xpath(`//label[contains(., "Client")]/following::div[@role="combobox"][1]`)),
        20000
      );
      await clientSel.click();
    const clientOpt = await driver.wait(until.elementLocated(By.xpath(`//li[contains(., "seed@example.com")]`)), 5000);
      await clientOpt.click();
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`)).click();

    // Step 2: select list
    const listSel = await driver.wait(
      until.elementLocated(By.xpath(`//label[contains(., "List")]/following::div[@role="combobox"][1]`)),
      15000
    );
    await listSel.click();
    const listOpt = await driver.wait(until.elementLocated(By.xpath(`//li[contains(., "Selenium List")]`)), 5000);
    await listOpt.click();
    // list selection jumps to step 2 (details); proceed to draft
    const nextBtn = await driver.wait(until.elementLocated(By.xpath(`//button[normalize-space(.)="Next"]`)), 10000);
    await nextBtn.click();

    // Step 3 (Draft): verify recipients, preview, and actions
    await driver.wait(until.elementLocated(By.xpath(`//h6[normalize-space(.)="Recipients"]`)), 15000);
    await driver.wait(until.elementLocated(By.xpath(`//div[contains(@class,"MuiCardContent-root")]`)), 10000);
    await driver.wait(until.elementLocated(By.xpath(`//button[normalize-space(.)="Copy Rich Text"]`)), 10000);
    await driver.wait(until.elementLocated(By.xpath(`//button[normalize-space(.)="Improve Introduction"]`)), 10000);
    await driver.wait(until.elementLocated(By.xpath(`//button[contains(., "Connect Gmail")]`)), 10000);
    await driver.wait(until.elementLocated(By.xpath(`//button[normalize-space(.)="Send Emails"]`)), 10000);

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

