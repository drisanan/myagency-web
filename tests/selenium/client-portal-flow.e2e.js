const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { allowlistedConsoleErrors, sleep, findAndType } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const API = process.env.API_BASE_URL || 'https://api.myrecruiteragency.com';
const LOGIN_EMAIL = process.env.TEST_EMAIL || 'drisanjames@gmail.com';
const LOGIN_PHONE = process.env.TEST_PHONE || '2084407940';
const LOGIN_CODE = process.env.TEST_ACCESS || '123456';

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  const clientEmail = `selenium+${Date.now()}@example.com`;
  const clientPhone = `555${Math.floor(100000 + Math.random() * 900000)}`;
  const accessCode = String(100000 + Math.floor(Math.random() * 900000));
  const listName = `Interests ${Date.now()}`;
  let clientId = '';

  try {
    // Agent login
    await driver.get(`${BASE}/auth/login`);
    await findAndType(driver, 'Email', LOGIN_EMAIL);
    await findAndType(driver, 'Phone', LOGIN_PHONE);
    await findAndType(driver, 'Access Code', LOGIN_CODE);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);

    // Create client via API (uses session cookie)
    await driver.executeAsyncScript(
      `
      const cb = arguments[arguments.length - 1];
      fetch('${API}/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: '${clientEmail}',
          firstName: 'Selenium',
          lastName: 'Client',
          sport: 'Football',
          phone: '${clientPhone}',
          accessCode: '${accessCode}'
        })
      }).then(r => r.json()).then(data => cb(data?.client?.id || null)).catch(e => cb(null));
      `
    ).then((id) => { clientId = id; });
    if (!clientId) throw new Error('Client creation failed');

    // Client login
    await driver.get(`${BASE}/auth/client-login`);
    await findAndType(driver, 'Email', clientEmail);
    await findAndType(driver, 'Phone', clientPhone);
    await findAndType(driver, 'Access Code', accessCode);
    await driver.findElement(By.xpath(`//button[contains(., "Login")]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//h3[contains(., "Create Interest List")]`)), 20000);

    // Create interest list
    await driver.findElement(By.xpath(`//label[contains(., "List Name")]/input`)).sendKeys(listName);
    await driver.findElement(By.xpath(`//label[contains(., "Sport")]/input`)).clear();
    await driver.findElement(By.xpath(`//label[contains(., "Sport")]/input`)).sendKeys('Football');
    await driver.findElement(By.xpath(`//label[contains(., "Division")]/input`)).clear();
    await driver.findElement(By.xpath(`//label[contains(., "Division")]/input`)).sendKeys('D1');
    await driver.findElement(By.xpath(`//label[contains(., "State")]/input`)).clear();
    await driver.findElement(By.xpath(`//label[contains(., "State")]/input`)).sendKeys('California');
    await driver.findElement(By.xpath(`//button[contains(., "Load Universities")]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//input[@type='checkbox']`)), 20000);
    await driver.findElement(By.xpath(`(//input[@type='checkbox'])[1]`)).click();
    await driver.findElement(By.xpath(`//button[contains(., "Save List")]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"${listName}")]`)), 20000);

    // Agent verifies Interests tab
    await driver.get(`${BASE}/auth/login`);
    await findAndType(driver, 'Email', LOGIN_EMAIL);
    await findAndType(driver, 'Phone', LOGIN_PHONE);
    await findAndType(driver, 'Access Code', LOGIN_CODE);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);

    await driver.get(`${BASE}/clients/${clientId}`);
    await driver.wait(until.elementLocated(By.xpath(`//button[contains(., "Interests")]`)), 20000);
    await driver.findElement(By.xpath(`//button[contains(., "Interests")]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"${listName}")]`)), 20000);

    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E client portal flow passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

