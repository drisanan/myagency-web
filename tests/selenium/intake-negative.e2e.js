const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const AGENCY_EMAIL = 'agency1@an.test';

async function issueLink() {
  const res = await fetch(`${BASE}/api/forms/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agencyEmail: AGENCY_EMAIL }),
  });
  const data = await res.json();
  if (!res.ok || !data?.ok || !data?.url) throw new Error('Failed to issue link');
  return data.url;
}

async function run() {
  const url = await issueLink();
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  try {
    await driver.get(url);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Submit" or contains(.,"Submitting…")]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Email is required")]`)), 8000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Phone is required")]`)), 8000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"First name is required")]`)), 8000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Last name is required")]`)), 8000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Sport is required")]`)), 8000);
    console.log('Intake negative validation passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

