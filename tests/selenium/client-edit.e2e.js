const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { setSession, findAndType, selectOption, allowlistedConsoleErrors, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const AGENCY_EMAIL = 'agency1@an.test';
const UNIQUE = Date.now();
const TEST_EMAIL = `ui-edit-${UNIQUE}@example.com`;

async function advanceNext(driver, times = 6) {
  for (let i = 0; i < times; i++) {
    const btns = await driver.findElements(By.xpath(`//button[normalize-space(.)="Next"]`));
    if (!btns.length) return;
    await btns[0].click();
    await sleep(150);
  }
}

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    console.log('Setting session and creating client...');
    // Seed session
    await setSession(driver, BASE, { role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' });

    // Create a client to edit (happy path create)
    await driver.get(`${BASE}/`);
    await driver.executeScript(`window.localStorage.setItem('session', '${JSON.stringify({ role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' })}');`);
    await driver.get(`${BASE}/clients/new`);
    const emailInput = await driver.wait(until.elementLocated(By.css('[data-testid="athlete-email"]')), 15000);
    await emailInput.sendKeys(TEST_EMAIL);
    await findAndType(driver, 'Password', 'pw12345');
    await findAndType(driver, 'First name', 'Edit');
    await findAndType(driver, 'Last name', 'Target');
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Set via URL"]`)).click();
    await findAndType(driver, 'Profile Image URL', 'http://example.com/original.png');
    const sportSelect = await driver.findElement(By.xpath(`//label[contains(., "Sport")]/following::div[contains(@class,"MuiSelect")]`));
    await sportSelect.click();
    const footballOpt = await driver.wait(until.elementLocated(By.xpath(`//li[@data-value="Football"]`)), 5000);
    await driver.executeScript('arguments[0].click();', footballOpt);
    const tryNavigateToEvents = async () => {
      for (let i = 0; i < 5; i++) {
        const addBtn = await driver.findElements(By.css('[data-testid="add-event"]'));
        if (addBtn.length) return addBtn[0];
        const nextBtns = await driver.findElements(By.xpath(`//button[normalize-space(.)="Next"]`));
        if (!nextBtns.length) break;
        await nextBtns[0].click();
        await sleep(200);
      }
      throw new Error('add-event button not found after navigation');
    };

    const addEventBtn = await tryNavigateToEvents();
    await addEventBtn.click();
    await findAndType(driver, 'Event Name', 'Camp');
    await findAndType(driver, 'Start Time', '2025-02-01T10:00');
    const addMetricBtn = await driver.wait(until.elementLocated(By.css('[data-testid="add-metric"]')), 5000);
    await addMetricBtn.click();
    await findAndType(driver, 'Metric Title', '40yd');
    await findAndType(driver, 'Metric Value', '4.50');
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`)).click(); // to motivation/references
    const addRefBtn = await driver.wait(until.elementLocated(By.css('[data-testid="add-reference"]')), 5000);
    await addRefBtn.click();
    await findAndType(driver, 'Name', 'Coach K');
    await findAndType(driver, 'Email', 'coach@example.com');
    await findAndType(driver, 'Phone', '123-456');
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`)).click(); // review
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Create Client"]`)).click();
    await sleep(1000);

    // Resolve client id from localStorage to ensure we edit the right record
    const createdRecord = await driver.executeScript(() => {
      const raw = window.localStorage.getItem('clients_data');
      if (!raw) return null;
      try {
        const list = JSON.parse(raw);
        return list.find((c) => c.email === arguments[0]) || null;
      } catch {
        return null;
      }
    }, TEST_EMAIL);
    if (!createdRecord || !createdRecord.id) {
      throw new Error('Client not persisted after creation');
    }
    console.log('Created client', createdRecord);
    const clientId = createdRecord.id;

    // Ensure localStorage has the latest record (defensive)
    await driver.executeScript((record) => {
      try {
        const raw = window.localStorage.getItem('clients_data');
        const list = raw ? JSON.parse(raw) : [];
        const idx = list.findIndex((c) => c.id === record.id);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...record };
        } else {
          list.push(record);
        }
        window.localStorage.setItem('clients_data', JSON.stringify(list));
      } catch (e) {
        console.error('failed to sync clients_data', e);
      }
    }, createdRecord);

    await driver.get(`${BASE}/clients`);
    await driver.wait(until.elementLocated(By.xpath(`//div[contains(@class,"MuiDataGrid")]`)), 15000);
    await driver.wait(until.elementLocated(By.xpath(`//div[contains(text(),"${TEST_EMAIL}")]`)), 15000);
    await driver.get(`${BASE}/clients/${clientId}/edit`);
    const path = await driver.executeScript(() => window.location.pathname);
    console.log('edit path', path);
    const storageOnEdit = await driver.executeScript(() => window.localStorage.getItem('clients_data'));
    console.log('clients_data on edit page', storageOnEdit);
    const sessionOnEdit = await driver.executeScript(() => window.localStorage.getItem('session'));
    console.log('session on edit page', sessionOnEdit);
    await driver.wait(until.elementLocated(By.xpath(`//h4[contains(., "Edit Athlete")]`)), 15000);

    // Ensure fields pre-populated, then edit
    await driver.wait(until.elementLocated(By.xpath(`//h4[contains(., "Edit Athlete")]`)), 15000);
    const firstNameInput = await driver.findElement(By.xpath(`//label[contains(.,"First name")]/following::input[1]`));
    const initialFirst = await firstNameInput.getAttribute('value');
    console.log('Initial first name in edit form', initialFirst);
    await firstNameInput.click();
    await driver.executeScript(
      "arguments[0].value=''; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
      firstNameInput
    );
    await firstNameInput.sendKeys('Updated');
    await findAndType(driver, 'Athlete Email', TEST_EMAIL);
    await findAndType(driver, 'Last name', 'Target');
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Set via URL"]`)).click();
    const urlInput = await driver.findElement(By.xpath(`//label[contains(.,"Profile Image URL")]/following::input[1]`));
    await urlInput.sendKeys(Key.chord(Key.COMMAND, 'a'));
    await urlInput.sendKeys(Key.BACK_SPACE);
    await urlInput.sendKeys('http://example.com/updated.png');
    const sportSelectEdit = await driver.findElement(By.xpath(`//label[contains(., "Sport")]/following::div[contains(@class,"MuiSelect")]`));
    await sportSelectEdit.click();
    const sportOpt = await driver.wait(until.elementLocated(By.xpath(`//li[@data-value="Football"]`)), 5000);
    await driver.executeScript('arguments[0].click();', sportOpt);
    const afterFirstName = await firstNameInput.getAttribute('value');
    if (afterFirstName !== 'Updated') {
      throw new Error(`First name input not updated, saw ${afterFirstName}`);
    }
    // Go to radar step and change Preferred Position
    await advanceNext(driver, 1); // personal
    await findAndType(driver, 'Preferred Position', 'Guard');
    await advanceNext(driver, 1); // social
    await advanceNext(driver, 1); // content
    await advanceNext(driver, 1); // events & metrics
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`)).click(); // to motivation
    await driver.wait(until.elementLocated(By.css('[data-testid="add-reference"]')), 5000).click();
    await findAndType(driver, 'Name', 'Ref Two');
    await findAndType(driver, 'Email', 'ref2@example.com');
    await findAndType(driver, 'Phone', '999');
    await advanceNext(driver, 1); // review
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Save Changes"]`)).click();
    await sleep(1000);

    const browserLogs = await driver.manage().logs().get('browser');
    console.log('browser logs after save', browserLogs);

    // Verify updated by reopening edit and checking populated value
    // Verify persisted data in storage
    const storedFirst = await driver.executeScript(() => {
      const raw = window.localStorage.getItem('clients_data');
      if (!raw) return null;
      try {
        const list = JSON.parse(raw);
        const found = list.find((c) => c.id === arguments[0]);
        return found ? found.firstName : null;
      } catch {
        return null;
      }
    }, clientId);
    if (storedFirst !== 'Updated') {
      throw new Error(`First name not updated, got ${storedFirst}`);
    }
    const storedPhoto = await driver.executeScript(() => {
      const raw = window.localStorage.getItem('clients_data');
      if (!raw) return null;
      try {
        const list = JSON.parse(raw);
        const found = list.find((c) => c.id === arguments[0]);
        return found ? (found.photoUrl || found.profileImageUrl || null) : null;
      } catch {
        return null;
      }
    }, clientId);
    if (storedPhoto !== 'http://example.com/updated.png') {
      throw new Error(`Photo not updated, got ${storedPhoto}`);
    }
    console.log('Update persisted with first name', storedFirst);

    await driver.get(`${BASE}/clients/${clientId}/edit`);
    await driver.wait(until.elementLocated(By.xpath(`//h4[contains(., "Edit Athlete")]`)), 15000);

    // Negative path: clear a required field (first name) and ensure error
    const fnInput = await driver.findElement(By.xpath(`//label[contains(.,"First name")]/following::input[1]`));
    await fnInput.sendKeys(Key.chord(Key.COMMAND, 'a'));
    await fnInput.sendKeys(Key.BACK_SPACE);
    const clearedVal = await fnInput.getAttribute('value');
    console.log('First name after clear for negative path', clearedVal);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"required")]`)), 15000);

    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E client edit passed', TEST_EMAIL);
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


