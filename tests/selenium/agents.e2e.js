/**
 * Agents E2E Test
 * 
 * Tests all CRUD operations for Agents via API:
 * 1. List agents (GET)
 * 2. Create agent (POST)
 * 3. Get single agent (GET /:id)
 * 4. Update agent (PUT)
 * 5. Delete agent (DELETE)
 */

const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

const TEST_AGENT = {
  firstName: 'Selenium',
  lastName: 'TestAgent',
  email: `selenium-agent-${Date.now()}@example.com`,
  role: 'Test Coordinator',
};

const HEADERS = {
  'Content-Type': 'application/json',
  'X-Agency-Id': 'agency-09673360-9a0c-4f01-9be6-bfdf7c1cb848',
  'X-Agency-Email': 'drisanjames@gmail.com',
  'Origin': 'http://localhost:3000',
};

async function run() {
  let createdAgentId = null;

  try {
    console.log('🏃 Starting Agents CRUD E2E Test');
    console.log(`📍 API_BASE_URL: ${API_BASE_URL}`);

    // --- Step 1: List agents (should be empty or have existing) ---
    console.log('\n📝 Step 1: GET /agents - List agents...');
    const listRes = await fetch(`${API_BASE_URL}/agents`, { headers: HEADERS });
    const listData = await listRes.json();
    
    if (!listData.ok) throw new Error('GET /agents failed: ' + JSON.stringify(listData));
    console.log(`✅ GET /agents - Found ${listData.agents?.length || 0} agents`);

    // --- Step 2: Create agent ---
    console.log('\n📝 Step 2: POST /agents - Create agent...');
    const createRes = await fetch(`${API_BASE_URL}/agents`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(TEST_AGENT),
    });
    const createData = await createRes.json();
    
    if (!createData.ok || !createData.agent?.id) {
      throw new Error('POST /agents failed: ' + JSON.stringify(createData));
    }
    createdAgentId = createData.agent.id;
    console.log(`✅ POST /agents - Created agent ID: ${createdAgentId}`);

    // --- Step 3: Get single agent ---
    console.log('\n📝 Step 3: GET /agents/:id - Get single agent...');
    const getRes = await fetch(`${API_BASE_URL}/agents/${createdAgentId}`, { headers: HEADERS });
    const getData = await getRes.json();
    
    if (!getData.ok || getData.agent?.id !== createdAgentId) {
      throw new Error('GET /agents/:id failed: ' + JSON.stringify(getData));
    }
    console.log(`✅ GET /agents/:id - Agent found: ${getData.agent.firstName} ${getData.agent.lastName}`);

    // --- Step 4: Update agent ---
    console.log('\n📝 Step 4: PUT /agents/:id - Update agent...');
    const updateRes = await fetch(`${API_BASE_URL}/agents/${createdAgentId}`, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify({ ...TEST_AGENT, role: 'Updated Role' }),
    });
    const updateData = await updateRes.json();
    
    if (!updateData.ok || updateData.agent?.role !== 'Updated Role') {
      throw new Error('PUT /agents/:id failed: ' + JSON.stringify(updateData));
    }
    console.log(`✅ PUT /agents/:id - Agent role updated to: ${updateData.agent.role}`);

    // --- Step 5: Delete agent ---
    console.log('\n📝 Step 5: DELETE /agents/:id - Delete agent...');
    const deleteRes = await fetch(`${API_BASE_URL}/agents/${createdAgentId}`, {
      method: 'DELETE',
      headers: HEADERS,
    });
    const deleteData = await deleteRes.json();
    
    if (!deleteData.ok) {
      throw new Error('DELETE /agents/:id failed: ' + JSON.stringify(deleteData));
    }
    console.log('✅ DELETE /agents/:id - Agent deleted');

    // --- Step 6: Verify deletion ---
    console.log('\n📝 Step 6: Verify agent removed from list...');
    const verifyRes = await fetch(`${API_BASE_URL}/agents`, { headers: HEADERS });
    const verifyData = await verifyRes.json();
    const deletedAgent = verifyData.agents?.find(a => a.id === createdAgentId);
    
    if (deletedAgent) {
      throw new Error('Agent still in list after delete');
    }
    console.log('✅ Agent no longer in list');
    createdAgentId = null; // Already cleaned up

    console.log('\n✅ Agents CRUD E2E Test PASSED');
    console.log('🎉 All CRUD operations verified:');
    console.log('   ✓ GET /agents (list)');
    console.log('   ✓ POST /agents (create)');
    console.log('   ✓ GET /agents/:id (read)');
    console.log('   ✓ PUT /agents/:id (update)');
    console.log('   ✓ DELETE /agents/:id (delete)');

  } catch (err) {
    console.error('\n❌ Agents CRUD E2E Test FAILED');
    console.error(err);
    process.exitCode = 1;
  } finally {
    // Cleanup: Delete test agent via API if it exists
    if (createdAgentId) {
      try {
        await fetch(`${API_BASE_URL}/agents/${createdAgentId}`, {
          method: 'DELETE',
          headers: HEADERS,
        });
        console.log(`🧹 Cleaned up test agent: ${TEST_AGENT.email}`);
      } catch (e) {
        console.log('⚠️ Cleanup failed:', e.message);
      }
    }
  }
}

run();
