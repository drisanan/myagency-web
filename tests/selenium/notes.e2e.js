const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { setSession, findAndType, allowlistedConsoleErrors, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const AGENCY_EMAIL = 'agency1@an.test';

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await setSession(driver, BASE, { role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' });
    await driver.get(`${BASE}/clients`);
    await driver.wait(until.elementLocated(By.xpath(`//div[contains(@class,"MuiDataGrid")]`)), 15000);

    // Open first client's profile via View action
    const viewButtons = await driver.findElements(By.xpath(`//a[contains(@href,"/clients/")][contains(.,"View")]`));
    if (!viewButtons.length) throw new Error('No view action found');
    await driver.executeScript('arguments[0].click();', viewButtons[0]);

    // Wait for notes tab
    await driver.wait(until.elementLocated(By.css('[data-testid="notes-tab"]')), 10000);
    await driver.findElement(By.css('[data-testid="notes-tab"]')).click();

    // Add note
    await driver.findElement(By.css('[data-testid="note-add"]')).click();
    await driver.wait(until.elementLocated(By.css('[data-testid="note-body"]')), 5000);
    await findAndType(driver, 'Body', 'Called coach about upcoming event');
    await driver.findElement(By.css('[data-testid="note-type"]')).click();
    await driver.findElement(By.xpath(`//li[normalize-space(.)="call"]`)).click();
    await driver.findElement(By.css('[data-testid="note-save"]')).click();

    // Wait for note to appear
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Called coach about upcoming event")]`)), 10000);

    // Edit note
    await driver.findElement(By.css('[data-testid="note-edit"]')).click();
    await driver.wait(until.elementLocated(By.css('[data-testid="note-body"]')), 5000);
    const editBody = await driver.findElement(By.xpath(`//label[contains(., "Body")]/following::textarea[1] | //label[contains(., "Body")]/following::input[1]`));
    await editBody.sendKeys('\uE009' + 'a');
    await editBody.sendKeys('\uE003');
    await editBody.sendKeys('Updated note body for coach call');
    await driver.findElement(By.css('[data-testid="note-save"]')).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Updated note body for coach call")]`)), 10000);

    // Delete note
    const deleteButtons = await driver.findElements(By.css('[data-testid="note-delete"]'));
    if (deleteButtons.length) {
      await deleteButtons[0].click();
      await sleep(500);
    }
    const deleted = await driver.findElements(By.xpath(`//*[contains(text(),"Updated note body for coach call")]`));
    if (deleted.length) throw new Error('Note was not deleted');

    // Negative: empty body validation
    await driver.findElement(By.css('[data-testid="note-add"]')).click();
    await driver.findElement(By.css('[data-testid="note-save"]')).click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Body is required")]`)), 5000);

    const logs = await driver.manage().logs().get('browser');
    const errors = await allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E notes passed');
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


