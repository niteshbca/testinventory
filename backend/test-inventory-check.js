const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';

async function testInventoryCheck() {
  try {
    console.log('🧪 Testing Enhanced Inventory Check Functionality\n');

    // Test 1: Get all godowns
    console.log('1. Fetching godowns...');
    const godownsResponse = await axios.get(`${baseURL}/api/godowns/`);
    const godowns = godownsResponse.data;
    console.log(`✅ Found ${godowns.length} godowns`);
    
    if (godowns.length === 0) {
      console.log('❌ No godowns found. Please add some godowns first.');
      return;
    }

    const testGodown = godowns[0];
    console.log(`📍 Using test godown: ${testGodown.name}\n`);

    // Test 2: Get delevery1 data
    console.log('2. Fetching delevery1 data...');
    const delevery1Response = await axios.get(`${baseURL}/api/delevery1`);
    const delevery1Data = delevery1Response.data;
    console.log(`✅ Found ${delevery1Data.length} items in delevery1 collection`);
    
    // Show sample data
    if (delevery1Data.length > 0) {
      console.log('📦 Sample delevery1 items:');
      delevery1Data.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.inputValue || item.itemName || 'Unknown'} - Godown: ${item.godownName}`);
      });
    }
    console.log('');

    // Test 3: Get billing items
    console.log('3. Fetching customers and billing items...');
    const customersResponse = await axios.get(`${baseURL}/api/customers/`);
    const customers = customersResponse.data;
    console.log(`✅ Found ${customers.length} customers`);
    
    if (customers.length === 0) {
      console.log('❌ No customers found. Please add some customers first.');
      return;
    }

    const testCustomer = customers[0];
    console.log(`👤 Using test customer: ${testCustomer.name}\n`);

    // Get billing items for the customer
    const billingItemsResponse = await axios.get(`${baseURL}/api/bills/customer/${testCustomer._id}/items`);
    const billingItems = billingItemsResponse.data;
    console.log(`✅ Found ${billingItems.length} billing items for customer`);
    
    if (billingItems.length > 0) {
      console.log('🛒 Sample billing items:');
      billingItems.slice(0, 3).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} - Price: ₹${item.price}`);
      });
    }
    console.log('');

    // Test 4: Test inventory check
    if (billingItems.length > 0) {
      console.log('4. Testing inventory check...');
      
      const testItems = billingItems.slice(0, 2).map(item => ({
        itemName: item.name,
        quantity: 1
      }));

      console.log('🔍 Checking availability for items:', testItems.map(i => i.itemName).join(', '));
      
      const inventoryCheckResponse = await axios.post(`${baseURL}/api/inventory/check-availability`, {
        items: testItems,
        godownId: testGodown._id
      });

      console.log('✅ Inventory check completed!');
      console.log('📊 Results:');
      
      inventoryCheckResponse.data.forEach((result, index) => {
        console.log(`\n   Item ${index + 1}: ${result.itemName}`);
        console.log(`   Requested: ${result.requestedQuantity}`);
        console.log(`   Available in ${result.selectedGodownName}: ${result.availableQuantity}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Message: ${result.message}`);
        
        if (result.alternativeGodowns && result.alternativeGodowns.length > 0) {
          console.log(`   Alternative godowns: ${result.alternativeGodowns.map(g => `${g.godownName} (${g.availableQuantity})`).join(', ')}`);
        }
      });

      console.log('\n🎉 Test completed successfully!');
      
      // Summary
      const availableItems = inventoryCheckResponse.data.filter(item => item.isAvailableInSelectedGodown);
      const unavailableItems = inventoryCheckResponse.data.filter(item => !item.isAvailableInSelectedGodown);
      
      console.log('\n📈 Summary:');
      console.log(`   ✅ Available items: ${availableItems.length}`);
      console.log(`   ❌ Unavailable items: ${unavailableItems.length}`);
      
    } else {
      console.log('❌ No billing items found to test with.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

// Run the test
testInventoryCheck();
