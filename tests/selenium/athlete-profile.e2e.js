const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { setSession, allowlistedConsoleErrors, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const AGENCY_EMAIL = 'agency1@an.test';
const CLIENT_ID = 'ag1-c1'; // seeded client

async function run() {
  const options = new chrome.Options();
  // options.addArguments('--headless=new');
  options.addArguments('--disable-gpu', '--no-sandbox');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    await setSession(driver, BASE, { role: 'agency', email: AGENCY_EMAIL, agencyId: 'agency-001' });
    // seed mail log
    await driver.executeScript(`
      window.localStorage.setItem('mail_log_v1', JSON.stringify([{
        id: 'mail-ui-1',
        clientId: '${CLIENT_ID}',
        email: 'coach@example.com',
        recipientFirstName: 'Coach',
        recipientLastName: 'Lee',
        university: 'Cal Tech',
        position: 'Head Coach',
        subject: 'Welcome',
        body: 'Hi Coach, looking forward to connecting.',
        sentAt: Date.now()
      }]));
    `);

    await driver.get(`${BASE}/clients/${CLIENT_ID}`);
    await driver.wait(until.elementLocated(By.xpath(`//h6[contains(normalize-space(.),"Ava Smith")]`)), 10000);
    await driver.findElement(By.xpath(`//button[contains(., "Actions")]`));
    await driver.findElement(By.xpath(`//button[contains(., "Emails")]`));
    await driver.findElement(By.xpath(`//span[contains(., "Sent")]`));

    const subject = await driver.findElement(By.xpath(`//p[contains(normalize-space(.),"Welcome")]`));
    if (!subject) throw new Error('Subject not found');

    const viewBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="View"]`));
    await viewBtn.click();
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),"Hi Coach, looking forward to connecting.")]`)), 5000);

    const logs = await driver.manage().logs().get('browser');
    const errs = await allowlistedConsoleErrors(logs);
    const errors = errs.filter(
      (e) => !String(e.message || '').includes('/clients - Failed to load resource')
    );
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }

    console.log('E2E athlete profile passed for client', CLIENT_ID);
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

