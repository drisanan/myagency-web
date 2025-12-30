const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = require('node-fetch');
const { findAndType, allowlistedConsoleErrors, sleep } = require('./utils');

const BASE_URL = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
const AGENT_EMAIL = process.env.TEST_EMAIL || 'drisanjames@gmail.com';
const AGENT_PHONE = process.env.TEST_PHONE || '2084407940';
const AGENT_ACCESS = process.env.TEST_ACCESS || '123456';
const CLIENT_ID = process.env.CLIENT_ID || '';
const TASK_TITLE = `Client Task ${Date.now()}`;

async function loginAgent(driver) {
  await driver.get(`${BASE_URL}/auth/login`);
  await findAndType(driver, 'Email', AGENT_EMAIL);
  await findAndType(driver, 'Phone', AGENT_PHONE);
  await findAndType(driver, 'Access Code', AGENT_ACCESS);
  await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
  await driver.wait(until.urlContains('/dashboard'), 20000);
}

async function createTaskViaApi(sessionCookie, clientId) {
  const res = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `an_session=${sessionCookie}`,
    },
    body: JSON.stringify({
      title: TASK_TITLE,
      assigneeClientId: clientId,
      status: 'todo',
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Task creation failed: ${res.status} ${text}`);
  }
  return res.json();
}

async function loginClient(driver, clientEmail, clientPhone, clientAccess) {
  await driver.get(`${BASE_URL}/auth/login`);
  await driver.wait(until.elementLocated(By.xpath(`//button[normalize-space(.)="Athlete"]`)), 15000).click();
  await findAndType(driver, 'Email', clientEmail);
  await findAndType(driver, 'Phone', clientPhone);
  await findAndType(driver, 'Access Code', clientAccess);
  await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
  await driver.wait(until.urlContains('/client/lists').or(until.urlContains('/client/tasks')), 20000);
}

async function run() {
  if (!CLIENT_ID) {
    console.log('CLIENT_ID not provided; skipping client-tasks e2e.');
    return;
  }
  const CLIENT_EMAIL = process.env.CLIENT_EMAIL || 'smurfturf@gmail.com';
  const CLIENT_PHONE = process.env.CLIENT_PHONE || '2084407940';
  const CLIENT_ACCESS = process.env.CLIENT_ACCESS || '123456';

  const options = new chrome.Options();
  // options.addArguments('--headless=new'); // enable in CI if desired
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // 1. Agent login and create task via API
    await loginAgent(driver);
    const agentCookie = (await driver.manage().getCookie('an_session'))?.value;
    if (!agentCookie) throw new Error('Agent session cookie not found');
    await createTaskViaApi(agentCookie, CLIENT_ID);

    // 2. Client login and view tasks
    await loginClient(driver, CLIENT_EMAIL, CLIENT_PHONE, CLIENT_ACCESS);
    await driver.get(`${BASE_URL}/client/tasks`);
    await driver.wait(until.elementLocated(By.xpath(`//h5[contains(., "Tasks")]`)), 15000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"${TASK_TITLE}")]`)), 20000);

    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('Client tasks e2e passed.');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

