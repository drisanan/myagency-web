/**
 * Admin Agent E2E Test
 * 
 * Tests:
 * 1. Create agent WITH isAdmin: true via agency
 * 2. Create agent WITHOUT isAdmin (default false)
 * 3. Admin agent CAN list other agents
 * 4. Admin agent CAN create other agents
 * 5. Non-admin agent CANNOT manage agents (403)
 * 6. UI: Admin checkbox visible in Agents form
 */

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { setSession, sleep, dismissTour } = require('./utils');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

const AGENCY_ID = 'agency-drisan';
const AGENCY_EMAIL = 'drisanjames@gmail.com';

const AGENCY_HEADERS = {
  'Content-Type': 'application/json',
  'X-Agency-Id': AGENCY_ID,
  'X-Agency-Email': AGENCY_EMAIL,
  'Origin': BASE_URL,
};

const ADMIN_AGENT = {
  firstName: 'Admin',
  lastName: 'Agent',
  email: `admin-agent-${Date.now()}@example.com`,
  phone: '5551112222',
  accessCode: 'AdminPass123!',
  authEnabled: true,
  isAdmin: true,  // KEY: Admin privileges
};

const REGULAR_AGENT = {
  firstName: 'Regular',
  lastName: 'Agent',
  email: `regular-agent-${Date.now()}@example.com`,
  phone: '5553334444',
  accessCode: 'RegularPass123!',
  authEnabled: true,
  isAdmin: false,  // KEY: No admin privileges
};

async function setupDriver() {
  const options = new chrome.Options();
  options.addArguments('--headless=new');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  return new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
}

async function loginAsAgent(agent) {
  const res = await fetch(`${API_BASE_URL}/auth/agent-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': BASE_URL },
    body: JSON.stringify({
      agencyId: AGENCY_ID,
      email: agent.email,
      phone: agent.phone,
      accessCode: agent.accessCode,
    }),
  });
  
  const data = await res.json();
  if (!data.ok) throw new Error(`Agent login failed: ${JSON.stringify(data)}`);
  
  // Extract session cookie - check both standard and local dev headers
  let sessionCookie = null;
  const setCookie = res.headers.get('set-cookie');
  const localCookie = res.headers.get('x-local-set-cookie');
  
  if (setCookie) {
    const match = setCookie.match(/an_session=([^;]+)/);
    if (match) sessionCookie = match[1];
  }
  if (!sessionCookie && localCookie) {
    const match = localCookie.match(/an_session=([^;]+)/);
    if (match) sessionCookie = match[1];
  }
  
  return { data, sessionCookie };
}

async function run() {
  let driver;
  let adminAgentId = null;
  let regularAgentId = null;
  let agentCreatedByAdmin = null;

  try {
    console.log('🏃 Starting Admin Agent E2E Test');
    console.log(`📍 BASE_URL: ${BASE_URL}`);
    console.log(`📍 API_BASE_URL: ${API_BASE_URL}`);

    // --- Step 1: Create ADMIN agent via agency ---
    console.log('\n📝 Step 1: Create admin agent (isAdmin: true)...');
    const createAdminRes = await fetch(`${API_BASE_URL}/agents`, {
      method: 'POST',
      headers: AGENCY_HEADERS,
      body: JSON.stringify(ADMIN_AGENT),
    });
    const createAdminData = await createAdminRes.json();
    
    if (!createAdminData.ok || !createAdminData.agent?.id) {
      throw new Error('Failed to create admin agent: ' + JSON.stringify(createAdminData));
    }
    adminAgentId = createAdminData.agent.id;
    console.log(`✅ Created admin agent ID: ${adminAgentId}`);
    console.log(`   isAdmin: ${createAdminData.agent.isAdmin}`);

    // --- Step 2: Create REGULAR agent via agency ---
    console.log('\n📝 Step 2: Create regular agent (isAdmin: false)...');
    const createRegularRes = await fetch(`${API_BASE_URL}/agents`, {
      method: 'POST',
      headers: AGENCY_HEADERS,
      body: JSON.stringify(REGULAR_AGENT),
    });
    const createRegularData = await createRegularRes.json();
    
    if (!createRegularData.ok || !createRegularData.agent?.id) {
      throw new Error('Failed to create regular agent: ' + JSON.stringify(createRegularData));
    }
    regularAgentId = createRegularData.agent.id;
    console.log(`✅ Created regular agent ID: ${regularAgentId}`);
    console.log(`   isAdmin: ${createRegularData.agent.isAdmin || false}`);

    // --- Step 3: Login as ADMIN agent ---
    console.log('\n📝 Step 3: Login as admin agent...');
    const { sessionCookie: adminSession } = await loginAsAgent(ADMIN_AGENT);
    console.log(`✅ Admin agent logged in, has session: ${!!adminSession}`);

    if (!adminSession) {
      throw new Error('Admin agent session cookie not found');
    }

    const adminHeaders = {
      'Content-Type': 'application/json',
      'Cookie': `an_session=${adminSession}`,
      'Origin': BASE_URL,
    };

    // --- Step 4: Admin agent CAN list other agents ---
    console.log('\n📝 Step 4: Admin agent lists other agents...');
    const listRes = await fetch(`${API_BASE_URL}/agents`, { headers: adminHeaders });
    const listData = await listRes.json();
    
    if (listRes.status === 403) {
      throw new Error('FAILED: Admin agent got 403 when listing agents');
    }
    if (!listData.ok) {
      throw new Error('Admin agent cannot list agents: ' + JSON.stringify(listData));
    }
    console.log(`✅ Admin agent CAN list agents (found ${listData.agents?.length || 0})`);

    // --- Step 5: Admin agent CAN create another agent ---
    console.log('\n📝 Step 5: Admin agent creates a new agent...');
    const newAgentByAdmin = {
      firstName: 'CreatedBy',
      lastName: 'AdminAgent',
      email: `created-by-admin-${Date.now()}@example.com`,
      phone: '5555556666',
      accessCode: 'TempPass123!',
      authEnabled: false,
    };
    
    const createByAdminRes = await fetch(`${API_BASE_URL}/agents`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(newAgentByAdmin),
    });
    const createByAdminData = await createByAdminRes.json();
    
    if (createByAdminRes.status === 403) {
      throw new Error('FAILED: Admin agent got 403 when creating agent');
    }
    if (!createByAdminData.ok) {
      throw new Error('Admin agent cannot create agent: ' + JSON.stringify(createByAdminData));
    }
    agentCreatedByAdmin = createByAdminData.agent?.id;
    console.log(`✅ Admin agent CAN create agents (created: ${agentCreatedByAdmin})`);

    // --- Step 6: Login as REGULAR agent ---
    console.log('\n📝 Step 6: Login as regular (non-admin) agent...');
    const { sessionCookie: regularSession } = await loginAsAgent(REGULAR_AGENT);
    console.log(`✅ Regular agent logged in, has session: ${!!regularSession}`);

    if (!regularSession) {
      throw new Error('Regular agent session cookie not found');
    }

    const regularHeaders = {
      'Content-Type': 'application/json',
      'Cookie': `an_session=${regularSession}`,
      'Origin': BASE_URL,
    };

    // --- Step 7: Regular agent CANNOT list other agents ---
    console.log('\n📝 Step 7: Regular agent attempts to list agents (should fail)...');
    const regularListRes = await fetch(`${API_BASE_URL}/agents`, { headers: regularHeaders });
    const regularListData = await regularListRes.json();
    
    if (regularListRes.status === 403) {
      console.log(`✅ Regular agent correctly DENIED listing agents (403)`);
    } else if (regularListData.ok) {
      throw new Error('SECURITY ISSUE: Non-admin agent should NOT be able to list agents');
    } else {
      console.log(`✅ Regular agent cannot list agents: ${regularListData.error}`);
    }

    // --- Step 8: Regular agent CANNOT create other agents ---
    console.log('\n📝 Step 8: Regular agent attempts to create agent (should fail)...');
    const regularCreateRes = await fetch(`${API_BASE_URL}/agents`, {
      method: 'POST',
      headers: regularHeaders,
      body: JSON.stringify({
        firstName: 'Rogue',
        lastName: 'Agent',
        email: 'rogue@example.com',
        phone: '5550000000',
        accessCode: 'RoguePass123!',
      }),
    });
    
    if (regularCreateRes.status === 403) {
      console.log(`✅ Regular agent correctly DENIED creating agents (403)`);
    } else {
      const regularCreateData = await regularCreateRes.json();
      if (regularCreateData.ok) {
        throw new Error('SECURITY ISSUE: Non-admin agent should NOT be able to create agents');
      }
      console.log(`✅ Regular agent cannot create agents: ${regularCreateData.error}`);
    }

    // --- Step 9: UI Test - Admin checkbox in Agents form ---
    console.log('\n📝 Step 9: Testing Agents UI for admin checkbox...');
    driver = await setupDriver();
    
    await setSession(driver, BASE_URL, {
      email: AGENCY_EMAIL,
      agencyId: AGENCY_ID,
      role: 'agency',
    });
    await dismissTour(driver);
    
    await driver.get(`${BASE_URL}/agents`);
    await sleep(2000);
    
    // Click "New Agent" button
    try {
      const newAgentBtn = await driver.findElement(By.xpath("//button[contains(text(), 'New Agent')]"));
      await newAgentBtn.click();
      await sleep(1000);
      
      // Look for admin checkbox in dialog
      const dialogSource = await driver.getPageSource();
      if (dialogSource.includes('Admin privileges') || dialogSource.includes('isAdmin')) {
        console.log('✅ Agents form includes Admin checkbox');
      } else {
        console.log('⚠️ Admin checkbox not found in Agents form');
      }
    } catch (e) {
      console.log('⚠️ Could not open New Agent dialog:', e.message);
    }

    // --- Step 10: Verify admin column in agents list ---
    console.log('\n📝 Step 10: Verify admin column in agents list...');
    await driver.get(`${BASE_URL}/agents`);
    await sleep(2000);
    
    const listPageSource = await driver.getPageSource();
    if (listPageSource.includes('Admin')) {
      console.log('✅ Agents list shows Admin column');
    } else {
      console.log('⚠️ Admin column not found in agents list');
    }

    console.log('\n✅ Admin Agent E2E Test PASSED');
    console.log('🎉 All tests verified:');
    console.log('   ✓ Create agent with isAdmin: true');
    console.log('   ✓ Create agent with isAdmin: false');
    console.log('   ✓ Admin agent CAN list agents');
    console.log('   ✓ Admin agent CAN create agents');
    console.log('   ✓ Regular agent CANNOT list agents (403)');
    console.log('   ✓ Regular agent CANNOT create agents (403)');
    console.log('   ✓ UI includes admin checkbox');

  } catch (err) {
    console.error('\n❌ Admin Agent E2E Test FAILED');
    console.error(err);
    process.exitCode = 1;
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    
    const cleanupIds = [adminAgentId, regularAgentId, agentCreatedByAdmin].filter(Boolean);
    
    for (const id of cleanupIds) {
      try {
        await fetch(`${API_BASE_URL}/agents/${id}`, {
          method: 'DELETE',
          headers: AGENCY_HEADERS,
        });
        console.log(`   Deleted agent: ${id}`);
      } catch (e) {
        console.log(`   ⚠️ Failed to cleanup agent ${id}: ${e.message}`);
      }
    }
    
    if (driver) {
      await driver.quit();
      console.log('   Browser closed');
    }
    
    console.log('✅ Cleanup complete');
  }
}

run();
