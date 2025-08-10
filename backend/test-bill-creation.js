const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';

async function testBillCreationAndDeletion() {
  try {
    console.log('🧪 Testing Bill Creation and Item Deletion Functionality\n');

    // Test 1: Add some test data to delevery1 collection
    console.log('1. Adding test data to delevery1 collection...');
    
    const testItems = [
      { inputValue: 'Test Item 1', godownName: 'Test Godown' },
      { inputValue: 'Test Item 1', godownName: 'Test Godown' }, // Duplicate for quantity test
      { inputValue: 'Test Item 2', godownName: 'Test Godown' },
      { inputValue: 'Test Item 3', godownName: 'Other Godown' } // Different godown
    ];

    for (const item of testItems) {
      try {
        await axios.post(`${baseURL}/api/add/delevery1`, {
          selectedOption: 'test',
          inputValue: item.inputValue,
          godownName: item.godownName
        });
        console.log(`✅ Added: ${item.inputValue} to ${item.godownName}`);
      } catch (error) {
        console.log(`⚠️ Could not add ${item.inputValue}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 2: Check current delevery1 data
    console.log('\n2. Checking current delevery1 data...');
    const delevery1Response = await axios.get(`${baseURL}/api/delevery1`);
    const delevery1Data = delevery1Response.data;
    console.log(`📦 Total items in delevery1: ${delevery1Data.length}`);
    
    // Group by godown
    const groupedByGodown = delevery1Data.reduce((acc, item) => {
      if (!acc[item.godownName]) acc[item.godownName] = [];
      acc[item.godownName].push(item.inputValue || item.itemName);
      return acc;
    }, {});

    Object.keys(groupedByGodown).forEach(godownName => {
      console.log(`   ${godownName}: ${groupedByGodown[godownName].length} items`);
      console.log(`     Items: ${groupedByGodown[godownName].join(', ')}`);
    });

    // Test 3: Get test customer and godown
    console.log('\n3. Getting test customer and godown...');
    
    const customersResponse = await axios.get(`${baseURL}/api/customers/`);
    const customers = customersResponse.data;
    
    if (customers.length === 0) {
      console.log('❌ No customers found. Creating a test customer...');
      const testCustomer = await axios.post(`${baseURL}/api/customers/add`, {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        gstNo: 'TEST123456789'
      });
      console.log('✅ Test customer created');
    }

    const godownsResponse = await axios.get(`${baseURL}/api/godowns/`);
    const godowns = godownsResponse.data;
    
    if (godowns.length === 0) {
      console.log('❌ No godowns found. Please add a godown first.');
      return;
    }

    const testCustomer = customers[0];
    const testGodown = godowns.find(g => g.name === 'Test Godown') || godowns[0];
    
    console.log(`👤 Using customer: ${testCustomer.name}`);
    console.log(`🏢 Using godown: ${testGodown.name}`);

    // Test 4: Create a test bill
    console.log('\n4. Creating test bill...');
    
    const billItems = [
      { itemName: 'Test Item 1', quantity: 2, price: 100, masterPrice: 90, total: 200 },
      { itemName: 'Test Item 2', quantity: 1, price: 50, masterPrice: 45, total: 50 }
    ];

    console.log('📋 Bill items:', billItems.map(i => `${i.itemName} (qty: ${i.quantity})`).join(', '));

    const billResponse = await axios.post(`${baseURL}/api/bills/add`, {
      customerId: testCustomer._id,
      customerName: testCustomer.name,
      godownId: testGodown._id,
      godownName: testGodown.name,
      items: billItems,
      totalAmount: 250,
      priceType: 'price'
    });

    console.log('✅ Bill created successfully!');
    console.log(`📄 Bill Number: ${billResponse.data.billNumber}`);
    
    if (billResponse.data.deletionResults) {
      console.log('\n📊 Deletion Results:');
      billResponse.data.deletionResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.itemName}:`);
        console.log(`      Requested: ${result.requestedQuantity}`);
        console.log(`      Found: ${result.foundItems}`);
        console.log(`      Deleted: ${result.deletedItems}`);
        if (result.deletedIds.length > 0) {
          console.log(`      Deleted IDs: ${result.deletedIds.join(', ')}`);
        }
      });

      const totalDeleted = billResponse.data.deletionResults.reduce((sum, result) => sum + result.deletedItems, 0);
      console.log(`\n🗑️ Total items deleted from delevery1: ${totalDeleted}`);
    }

    // Test 5: Check delevery1 data after deletion
    console.log('\n5. Checking delevery1 data after bill creation...');
    const afterDelevery1Response = await axios.get(`${baseURL}/api/delevery1`);
    const afterDelevery1Data = afterDelevery1Response.data;
    console.log(`📦 Items remaining in delevery1: ${afterDelevery1Data.length}`);
    
    const afterGroupedByGodown = afterDelevery1Data.reduce((acc, item) => {
      if (!acc[item.godownName]) acc[item.godownName] = [];
      acc[item.godownName].push(item.inputValue || item.itemName);
      return acc;
    }, {});

    Object.keys(afterGroupedByGodown).forEach(godownName => {
      console.log(`   ${godownName}: ${afterGroupedByGodown[godownName].length} items`);
      console.log(`     Items: ${afterGroupedByGodown[godownName].join(', ')}`);
    });

    console.log('\n🎉 Test completed successfully!');
    console.log('\n📈 Summary:');
    console.log(`   📦 Items before bill: ${delevery1Data.length}`);
    console.log(`   📦 Items after bill: ${afterDelevery1Data.length}`);
    console.log(`   🗑️ Items deleted: ${delevery1Data.length - afterDelevery1Data.length}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

// Run the test
testBillCreationAndDeletion();
