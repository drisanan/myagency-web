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

  let clientEmail = '';
  let clientPhone = `555${Math.floor(100000 + Math.random() * 900000)}`;
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
    try {
      await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")] | //h1[contains(.,"Dashboard")]`)), 20000);
    } catch (e) {
      const url = await driver.getCurrentUrl();
      const txt = await driver.executeScript('return document.body ? document.body.innerText.slice(0, 500) : ""');
      throw new Error(`Agent dashboard not visible. URL=${url}. Snippet=${txt}`);
    }

    // Try to create a new client; if it fails, fall back to patching first existing client
    const clientInfo = await driver.executeAsyncScript(
      `
      const cb = arguments[arguments.length - 1];
      const tryCreate = async () => {
        const resp = await fetch('${API}/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: 'selenium+' + Date.now() + '@example.com',
            firstName: 'Selenium',
            lastName: 'Client',
            sport: 'Football',
            phone: '${clientPhone}',
            accessCode: '${accessCode}'
          })
        });
        const txt = await resp.text();
        let parsed; try { parsed = JSON.parse(txt); } catch (_){}
        if (!resp.ok) return { error: 'create_failed', status: resp.status, text: txt };
        return { id: parsed?.client?.id, email: parsed?.client?.email, phone: parsed?.client?.phone };
      };

      const tryPatchFirst = async () => {
        const r = await fetch('${API}/clients', { credentials: 'include' });
        const txt = await r.text();
        let parsed; try { parsed = JSON.parse(txt); } catch (_){}
        if (!r.ok) return { error: 'list_failed', status: r.status, text: txt };
        const first = (parsed?.clients || [])[0];
        if (!first) return { error: 'no_clients' };
        const patch = await fetch('${API}/clients/' + first.id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ accessCode: '${accessCode}', phone: '${clientPhone}' })
        });
        const ptxt = await patch.text();
        let pparsed; try { pparsed = JSON.parse(ptxt); } catch (_){}
        if (!patch.ok) return { error: 'patch_failed', status: patch.status, text: ptxt };
        return { id: first.id, email: first.email, phone: '${clientPhone}' };
      };

      (async () => {
        const created = await tryCreate();
        if (!created.error && created.id) return cb(created);
        const patched = await tryPatchFirst();
        cb(patched);
      })().catch(e => cb({ error: e?.message || 'fetch error' }));
      `
    );
    if (!clientInfo || clientInfo.error || clientInfo.status) {
      throw new Error(`Client prep failed: ${JSON.stringify(clientInfo)}`);
    }
    clientId = clientInfo.id;
    clientEmail = clientInfo.email;
    if (clientInfo.phone) clientPhone = clientInfo.phone;
    if (!clientId || !clientEmail) throw new Error('Client prep missing id/email');

    // Client login
    // Start fresh for client login to avoid agent session redirect
    await driver.manage().deleteAllCookies();
    await driver.get(`${BASE}/auth/client-login`);
    await findAndType(driver, 'Email', clientEmail);
    await findAndType(driver, 'Phone', clientPhone);
    let pwInput;
    try {
      pwInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 30000);
    } catch (e) {
      const url = await driver.getCurrentUrl();
      const txt = await driver.executeScript('return document.body ? document.body.innerText.slice(0, 500) : ""');
      throw new Error(`Access Code field not found. URL=${url}. Page snippet=${txt}`);
    }
    await pwInput.clear();
    await pwInput.sendKeys(accessCode);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
    const listsHeading = By.xpath(`//h3[contains(., "Create Interest List")]`);
    const errorDiv = By.xpath(`//*[contains(text(),"Login failed") or contains(text(),"Invalid credentials") or contains(text(),"Failed")]`);
    const ok = await driver.wait(async () => {
      const headingFound = (await driver.findElements(listsHeading)).length > 0;
      const errFound = (await driver.findElements(errorDiv)).length > 0;
      return headingFound || errFound;
    }, 20000).catch(() => false);
    if (!ok) {
      const url = await driver.getCurrentUrl();
      const txt = await driver.executeScript('return document.body ? document.body.innerText.slice(0, 500) : ""');
      const logs = await driver.manage().logs().get('browser').catch(() => []);
      throw new Error(`Client lists page not visible. URL=${url}. Page snippet=${txt}. Console=${JSON.stringify(logs)}`);
    }
    const headingFound = (await driver.findElements(listsHeading)).length > 0;
    if (!headingFound) {
      const errTxt = await driver.executeScript('return document.body ? document.body.innerText.slice(0, 500) : ""');
      throw new Error(`Client login failed. Error snippet=${errTxt}`);
    }

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

