const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
const AGENCY_EMAIL = process.env.AGENCY_EMAIL || 'drisanjames@gmail.com';

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
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  try {
    await driver.get(url);
    await driver.executeScript(`const p=document.querySelector('nextjs-portal'); if(p) p.remove();`);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Please fill all required fields.")]`)), 8000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Email is required")]`)), 8000);
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

