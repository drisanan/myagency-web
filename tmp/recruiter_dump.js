const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const baseUrl = process.env.WEB_APP_ORIGIN || process.env.NEXT_PUBLIC_APP_URL;
if (!baseUrl) {
  throw new Error('WEB_APP_ORIGIN or NEXT_PUBLIC_APP_URL must be set');
}

(async () => {
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(new chrome.Options().addArguments('--disable-gpu','--no-sandbox')).build();
  try {
    await driver.get(`${baseUrl.replace(/\/$/, '')}/recruiter`);
    await driver.executeScript(`window.localStorage.setItem('session', JSON.stringify({ role: 'agency', email: 'agency1@an.test', agencyId: 'agency-001' }));
      window.localStorage.setItem('clients_data', JSON.stringify([{id:'tmp',email:'tmp@x.com',firstName:'T',lastName:'C',sport:'Football',agencyEmail:'agency1@an.test'}]));`);
    await driver.navigate().refresh();
    await driver.sleep(5000);
    const body = await driver.executeScript('return document.body.innerHTML;');
    console.log(body.slice(0, 2000));
  } finally {
    await driver.quit();
  }
})();
