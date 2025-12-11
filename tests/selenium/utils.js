const { By, until } = require('selenium-webdriver');

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function setSession(driver, baseUrl, sessionObj) {
  await driver.get(`${baseUrl}/clients`);
  await driver.executeScript(`window.localStorage.setItem('session', '${JSON.stringify(sessionObj)}');`);
  await driver.navigate().refresh();
}

async function findAndType(driver, labelText, value) {
  const locator = By.xpath(`//label[contains(., "${labelText}")]/following::input[1] | //label[contains(., "${labelText}")]/following::textarea[1]`);
  let lastErr;
  for (let i = 0; i < 3; i++) {
    try {
      const input = await driver.wait(until.elementLocated(locator), 10000);
      await driver.wait(until.elementIsVisible(input), 5000);
      await input.clear().catch(() => {});
      await input.sendKeys(value);
      return;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function selectOption(driver, labelText, optionText) {
  const select = await driver.findElement(
    By.xpath(`//label[contains(., "${labelText}")]/following::div[contains(@class,"MuiSelect")]`)
  );
  await select.click();
  const opt = await driver.wait(until.elementLocated(By.xpath(`//li[normalize-space(.)="${optionText}"]`)), 5000);
  await opt.click();
}

async function allowlistedConsoleErrors(logs) {
  const allowed = ['favicon.ico', 'Hydration failed'];
  return logs
    .filter((l) => l.level && l.level.name === 'SEVERE')
    .filter((l) => !allowed.some((sub) => (l.message || '').includes(sub)));
}

module.exports = {
  sleep,
  setSession,
  findAndType,
  selectOption,
  allowlistedConsoleErrors,
};

