const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { setSession, findAndType, selectOption, allowlistedConsoleErrors, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const API = process.env.API_BASE_URL || BASE;
const AGENCY_EMAIL = 'agency1@an.test';
const TEST_EMAIL = `ui-test-${Date.now()}@example.com`;
const TEST_PHONE = '2081234567';

async function issueLink() {
  const res = await fetch(`${API}/forms/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ agencyEmail: AGENCY_EMAIL }),
  });
  const data = await res.json();
  if (!res.ok || !data?.ok || !data?.url) throw new Error('Failed to issue link');
  return data.url;
}

async function run() {
  const url = await issueLink();

  const options = new chrome.Options();
  // Run headed; remove headless for visual debugging
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);
    await driver.executeScript(`const p=document.querySelector('nextjs-portal'); if(p) p.remove();`);
    await findAndType(driver, 'Email', TEST_EMAIL);
    await findAndType(driver, 'Phone', TEST_PHONE);
    await findAndType(driver, 'Password', 'pw12345');
    await findAndType(driver, 'First name', 'UI');
    await findAndType(driver, 'Last name', 'Test');

    await selectOption(driver, 'Sport', 'Football');
    await selectOption(driver, 'Preferred Position', 'QB');
    await selectOption(driver, 'Sport', 'Swimming'); // switch to freeform
    await findAndType(driver, 'Preferred Position', 'Freestyle');

    await selectOption(driver, 'Division', 'D1');
    await selectOption(driver, 'Graduation Year', '2026');

    // Upload profile image (using repo asset)
    const fileInput = await driver.findElement(By.xpath(`//input[@type="file"]`));
    const path = require('path');
    const imgPath = path.resolve(__dirname, '../../public/marketing/an-logo.png');
    await fileInput.sendKeys(imgPath);

    const submitBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Submit" or contains(.,"Submitting…")]`));
    await submitBtn.click();

    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Submitted!")]`)), 20000);

    // Confirm submission exists via API
    async function waitForSubmission(timeoutMs = 15000, interval = 1000) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const subs = await fetch(`${API}/forms/submissions?agencyEmail=${encodeURIComponent(AGENCY_EMAIL)}`).then(r => r.json());
        if (!subs?.ok) throw new Error('Failed to fetch submissions');
        const found = Array.isArray(subs.items) && subs.items.some((s) => (s.data?.email || '') === TEST_EMAIL);
        if (found) return true;
        await sleep(interval);
      }
      return false;
    }
    const found = await waitForSubmission();
    if (!found) throw new Error('Submission not found in API list');

    // Skip UI grid verification; trust API check above
    // Optionally, add a lightweight dashboard check if needed

    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E intake passed with email', TEST_EMAIL);
  } finally {
    await driver.quit();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

