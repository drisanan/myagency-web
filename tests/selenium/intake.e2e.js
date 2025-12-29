const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { setSession, findAndType, selectOption, allowlistedConsoleErrors, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
const AGENCY_EMAIL = process.env.AGENCY_EMAIL || 'drisanjames@gmail.com';
const TEST_EMAIL = `ui-test-${Date.now()}@example.com`;
const TEST_PHONE = '2081234567';

async function issueLink() {
  if (process.env.FORMS_URL) return process.env.FORMS_URL;
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
  const skipSubmit = Boolean(process.env.FORMS_URL); // using pre-issued link may not accept submissions in prod

  const options = new chrome.Options();
  // Run headed; remove headless for visual debugging
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await driver.get(url);
    await driver.executeScript(`const p=document.querySelector('nextjs-portal'); if(p) p.remove();`);

    // Step 1: basic required fields
    await findAndType(driver, 'Email', TEST_EMAIL);
    await findAndType(driver, 'First name', 'UI');
    await findAndType(driver, 'Last name', 'Test');
    await selectOption(driver, 'Sport', 'Football');

    // Progress through steps to Review
    for (let i = 0; i < 6; i++) {
      const nextBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`));
      await nextBtn.click();
      await sleep(300);
    }

    // Submit on Review
    if (!skipSubmit) {
      const submitBtn = await driver.findElement(By.xpath(`//button[contains(., "Create Client") or contains(., "Saving")]`));
      await submitBtn.click();
      await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Submitted!")]`)), 20000);
    } else {
      // Just verify we reached review
      await driver.findElement(By.xpath(`//*[contains(text(),"Review")]`));
    }

    if (!skipSubmit) {
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
    }

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

