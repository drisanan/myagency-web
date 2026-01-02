const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { findAndType, getSessionCookie } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
const LOGIN_EMAIL = process.env.TEST_EMAIL || 'drisanjames@gmail.com';
const LOGIN_PHONE = process.env.TEST_PHONE || '2084407940';
const LOGIN_CODE = process.env.TEST_ACCESS || '123456';

async function issueLink(sessionCookie) {
  if (process.env.FORMS_URL) return process.env.FORMS_URL;
  const res = await fetch(`${API}/forms/issue`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      Origin: BASE,
      Cookie: `an_session=${sessionCookie}`,
    },
  });
  const data = await res.json();
  if (!res.ok || !data?.ok || !data?.url) throw new Error('Failed to issue link: ' + JSON.stringify(data));
  return data.url;
}

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  
  let sessionCookie = null;
  
  try {
    // Login first to get session cookie
    console.log('Logging in as agency...');
    await driver.get(`${BASE}/auth/login`);
    await findAndType(driver, 'Email', LOGIN_EMAIL);
    await findAndType(driver, 'Phone', LOGIN_PHONE);
    await findAndType(driver, 'Access Code', LOGIN_CODE);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);
    sessionCookie = await getSessionCookie(driver);
    if (!sessionCookie) throw new Error('Failed to obtain session cookie');
    console.log('Session obtained');

    // Issue form link
    const url = await issueLink(sessionCookie);
    console.log('Form link issued:', url);

    await driver.get(url);
    await driver.executeScript(`const p=document.querySelector('nextjs-portal'); if(p) p.remove();`);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Please fill all required fields.")]`)), 8000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Email is required")]`)), 8000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"First name is required")]`)), 8000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Last name is required")]`)), 8000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Sport is required")]`)), 8000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Phone number is required")]`)), 8000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Access code is required")]`)), 8000);
    console.log('Intake negative validation passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

