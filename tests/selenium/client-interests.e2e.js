const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { allowlistedConsoleErrors, findAndType, sleep } = require('./utils');

// Config (prod)
const BASE = process.env.BASE_URL || 'https://www.myrecruiteragency.com';
const LOGIN_EMAIL = process.env.TEST_EMAIL || 'smurfturf@gmail.com';
const LOGIN_PHONE = process.env.TEST_PHONE || '2084407940';
const LOGIN_CODE = process.env.TEST_ACCESS || '123456';

async function run() {
  const options = new chrome.Options();
  options.addArguments('--disable-gpu', '--no-sandbox');
  // options.addArguments('--headless=new');
  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  try {
    // Login as client (Athlete mode)
    await driver.get(`${BASE}/auth/login`);
    // Toggle to Athlete mode if the toggle exists
    const athleteBtn = await driver.findElements(By.xpath(`//button[contains(., "Athlete")]`));
    if (athleteBtn.length) {
      await athleteBtn[0].click();
      await sleep(500);
    }
    await findAndType(driver, 'Email', LOGIN_EMAIL);
    await findAndType(driver, 'Phone', LOGIN_PHONE);
    await findAndType(driver, 'Access Code', LOGIN_CODE);
    const signInBtn = await driver.findElement(By.xpath(`//button[normalize-space(.)="Sign in"]`));
    await signInBtn.click();

    // Wait for client lists page; if still on login, navigate and wait again
    await driver.wait(
      async () => {
        const url = await driver.getCurrentUrl();
        return url.includes('/client/lists');
      },
      10000
    ).catch(() => {});
    if (!(await driver.getCurrentUrl()).includes('/client/lists')) {
      await driver.get(`${BASE}/client/lists`);
    }
    // Give the page time to render content even if heading is missing
    await sleep(3000);

    // Validate at least one list exists and shows universities text
    const listCards = await driver.findElements(By.xpath(`//h3[contains(., "Your Interest Lists")]/following::div[contains(@class,"MuiCardContent-root")]//div[contains(@class,"MuiBox-root")]`));
    if (!listCards.length) {
      throw new Error('No lists found under Your Interest Lists');
    }
    const firstCard = listCards[0];
    // Ensure universities text is present (more than just the count)
    const uniTextEls = await firstCard.findElements(By.xpath(`.//p[contains(@class,"MuiTypography-body2")]`));
    if (!uniTextEls.length) {
      throw new Error('No university text elements found in first list');
    }
    const uniText = await uniTextEls[uniTextEls.length - 1].getText(); // last body2 should have universities
    if (!uniText || uniText.trim().length === 0) {
      throw new Error('Universities text is empty for first list');
    }

    console.log('Client interests test passed:', { listCount: listCards.length, uniText });

    // Check console errors
    const logs = await driver.manage().logs().get('browser');
    const errors = allowlistedConsoleErrors(logs);
    if (errors.length) {
      console.error('Browser console errors:', errors);
      throw new Error('Console errors detected');
    }
  } finally {
    await driver.quit();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

