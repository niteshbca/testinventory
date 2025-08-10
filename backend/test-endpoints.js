const axios = require('axios');
require('dotenv').config();

async function testEndpoints() {
  const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';
  
  try {
    console.log('Testing backend endpoints...');
    
    // Test 1: Get godowns
    console.log('\n1. Testing GET /api/godowns');
    const godownsResponse = await axios.get(`${baseURL}/api/godowns`);
    console.log(`✅ Success: Found ${godownsResponse.data.length} godowns`);
    
    if (godownsResponse.data.length > 0) {
      const testGodownId = godownsResponse.data[0]._id;
      console.log(`Using test godown ID: ${testGodownId}`);
      
      // Test 2: Initialize inventory
      console.log('\n2. Testing POST /api/godowns/:godownId/initialize-inventory');
      try {
        const initResponse = await axios.post(`${baseURL}/api/godowns/${testGodownId}/initialize-inventory`);
        console.log(`✅ Success: ${initResponse.data.message}`);
        console.log(`   Items added: ${initResponse.data.itemsAdded}`);
      } catch (error) {
        console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
      }
      
      // Test 3: Debug inventory
      console.log('\n3. Testing GET /api/godowns/:godownId/inventory-debug');
      try {
        const debugResponse = await axios.get(`${baseURL}/api/godowns/${testGodownId}/inventory-debug`);
        console.log(`✅ Success: ${debugResponse.data.message}`);
        console.log(`   Godown inventory count: ${debugResponse.data.godownInventoryCount}`);
        console.log(`   Main inventory count: ${debugResponse.data.mainInventoryCount}`);
      } catch (error) {
        console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
      }
      
      // Test 4: Add item to godown
      console.log('\n4. Testing PUT /api/godowns/:godownId/inventory/:itemName');
      try {
        const addItemResponse = await axios.put(`${baseURL}/api/godowns/${testGodownId}/inventory/Test Item`, {
          quantity: 5
        });
        console.log(`✅ Success: ${addItemResponse.data.message}`);
      } catch (error) {
        console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
      }
      
      // Test 5: Check inventory availability
      console.log('\n5. Testing POST /api/inventory/check-availability');
      try {
        const checkResponse = await axios.post(`${baseURL}/api/inventory/check-availability`, {
          items: [{ itemName: 'Test Item', quantity: 2 }],
          godownId: testGodownId
        });
        console.log(`✅ Success: Inventory check completed`);
        console.log(`   Results: ${JSON.stringify(checkResponse.data, null, 2)}`);
      } catch (error) {
        console.log(`❌ Error: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('❌ No godowns found to test with');
    }
    
  } catch (error) {
    console.error('❌ Failed to connect to server:', error.message);
  }
}

testEndpoints();
