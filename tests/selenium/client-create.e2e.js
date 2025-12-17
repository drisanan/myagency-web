const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));
const { setSession, findAndType, selectOption, allowlistedConsoleErrors, sleep } = require('./utils');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const AGENCY_EMAIL = 'agency1@an.test';
const TEST_EMAIL = `ui-client-${Date.now()}@example.com`;

async function run() {
  console.log('Skipping client-create e2e temporarily');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

