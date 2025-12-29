const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { allowlistedConsoleErrors, findAndType, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const LOGIN_EMAIL = process.env.TEST_EMAIL || 'drisanjames@gmail.com';
const LOGIN_PHONE = process.env.TEST_PHONE || '2084407940';
const LOGIN_CODE = process.env.TEST_ACCESS || '123456';
const TEST_CLIENT_EMAIL = `rw-client-${Date.now()}@example.com`;
const TEST_LIST_NAME = `RW List ${Date.now()}`;

async function run() {
  if (process.env.SKIP_RECRUITER === '1') {
    console.log('Recruiter wizard test skipped (SKIP_RECRUITER=1)');
    return;
  }
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // Real login
    await driver.get(`${BASE}/auth/login`);
    await findAndType(driver, 'Email', LOGIN_EMAIL);
    await findAndType(driver, 'Phone', LOGIN_PHONE);
    await findAndType(driver, 'Access Code', LOGIN_CODE);
    await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`)).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Dashboard")]`)), 20000);

    // Pre-step: create client via UI
    await driver.get(`${BASE}/clients/new`);
    await findAndType(driver, 'Email', TEST_CLIENT_EMAIL);
    await findAndType(driver, 'Password', 'pw12345');
    await findAndType(driver, 'First name', 'RW');
    await findAndType(driver, 'Last name', 'Client');
    await driver.findElement(By.xpath(`//label[contains(., "Sport")]/following::div[contains(@class,"MuiSelect-select")][1]`)).click();
    const sportOpt = await driver.wait(until.elementLocated(By.xpath(`(//ul//li)[1]`)), 10000);
    await sportOpt.click();
    // Walk through steps
    for (let i = 0; i < 6; i++) {
      const nextBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Next"]`));
      await nextBtn.click();
      await sleep(200);
    }
    const createBtn =
      (await driver.findElements(By.xpath(`//button[contains(., "Create Client")]`)))[0] ||
      (await driver.findElements(By.xpath(`//button[contains(., "Save Changes")]`)))[0];
    if (createBtn) await createBtn.click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Client")]`)), 20000);

    // Pre-step: create list via UI
    await driver.get(`${BASE}/lists`);
    const selectFirstList = async (labelText) => {
      const sel = await driver.wait(
        until.elementLocated(By.xpath(`//label[contains(., "${labelText}")]/following::div[contains(@class,"MuiSelect-select")][1]`)),
        20000
      );
      await driver.wait(async () => {
        const disabled = await sel.getAttribute('aria-disabled');
        return disabled !== 'true';
      }, 20000);
      await sel.click();
      const opt = await driver.wait(until.elementLocated(By.xpath(`(//ul//li)[1]`)), 15000);
      await opt.click();
      await sleep(300);
    };
    await selectFirstList('Sport');
    await selectFirstList('Division');
    await selectFirstList('State');

    await driver.wait(until.elementLocated(By.xpath(`//div[contains(@class,"MuiCardContent-root")]`)), 15000);
    const firstSchool = await driver.findElement(By.xpath(`(//div[contains(@class,"MuiCardContent-root")])[1]`));
    await firstSchool.click();
    await driver.wait(until.elementLocated(By.xpath(`(//input[@type='checkbox'])[1]`)), 15000);
    const firstCoachChk = await driver.findElement(By.xpath(`(//input[@type='checkbox'])[1]`));
    await firstCoachChk.click();
    const manualNameInput = await driver.findElement(By.xpath(`//label[contains(.,"Full name")]/following::input[1]`));
    await manualNameInput.clear(); await manualNameInput.sendKeys('Manual Coach');
    const manualEmailInput = await driver.findElement(By.xpath(`//label[contains(.,"Email")]/following::input[1]`));
    await manualEmailInput.clear(); await manualEmailInput.sendKeys(`manual-${Date.now()}@example.com`);
    const addBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Add"]`));
    await addBtn.click();
    await sleep(300);
    const nameInput = await driver.findElement(By.xpath(`//label[contains(.,"List name")]/following::input[1]`));
    await nameInput.clear(); await nameInput.sendKeys(TEST_LIST_NAME);
    const saveBtn = await driver.findElement(By.xpath(`//button[contains(., "Save List") or normalize-space(.)="Save List"]`));
    await driver.wait(async () => await saveBtn.isEnabled(), 5000);
    await saveBtn.click();
    await sleep(500);

    // Navigate to recruiter after data prep
    await driver.get(`${BASE}/recruiter`);
    await driver.wait(async () => {
      const has = await driver.executeScript('return document.body && document.body.innerText && document.body.innerText.includes("Recruiter");');
      return Boolean(has);
    }, 40000, 'Recruiter text not rendered');
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

    async function selectFirst(label) {
      const sel = await driver.wait(
        until.elementLocated(By.xpath(`//label[contains(., "${label}")]/following::div[contains(@class,"MuiSelect-select")][1]`)),
        20000
      );
      await driver.wait(async () => {
        const disabled = await sel.getAttribute('aria-disabled');
        return disabled !== 'true';
      }, 20000);
      await sel.click();
      let opt;
      try {
        opt = await driver.wait(until.elementLocated(By.xpath(`(//ul//li)[1]`)), 15000);
      } catch {
        await sel.click();
        opt = await driver.wait(until.elementLocated(By.xpath(`(//ul//li)[1]`)), 15000);
      }
      await opt.click();
      await sleep(300);
    }

    // Retry block: if list combo not found, refresh once and retry selections
    const runSelections = async () => {
      await selectFirst('Client');
      await selectFirst('List');
      await selectFirst('Division');
      await selectFirst('State');
    };
    try {
      await runSelections();
    } catch (e) {
      console.warn('Retrying recruiter selections after refresh...', e?.message || e);
      await driver.navigate().refresh();
      await driver.wait(async () => {
        const has = await driver.executeScript('return document.body && document.body.innerText && document.body.innerText.includes("Recruiter");');
        return Boolean(has);
      }, 20000, 'Recruiter text not rendered after refresh');
      await runSelections();
    }

    const nextBtn = await driver.wait(until.elementLocated(By.xpath(`//button[normalize-space(.)="Next"]`)), 15000);
    await driver.wait(async () => !(await nextBtn.getAttribute('disabled')), 8000);
    await nextBtn.click();

    // Step 3 (Draft): basic presence check
    await driver.wait(until.elementLocated(By.xpath(`//h6[contains(., "Draft") or contains(., "Recipients")]`)), 15000);

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

