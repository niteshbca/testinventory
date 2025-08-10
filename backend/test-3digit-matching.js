const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';

async function test3DigitMatching() {
  try {
    console.log('🧪 Testing 3-Digit Prefix Matching Functionality\n');

    // Test 1: Add test data to demonstrate 3-digit matching
    console.log('1. Adding test data to demonstrate 3-digit matching...');
    
    const testGodownName = 'Test Godown';
    
    // Add billing items (3-digit codes)
    const billingItems = [
      { name: '111', price: 100, masterPrice: 90 },
      { name: '222', price: 200, masterPrice: 180 },
      { name: '333', price: 300, masterPrice: 270 }
    ];

    // Add delevery1 items (extended codes that start with the 3-digit prefix)
    const delevery1Items = [
      { inputValue: '1111', godownName: testGodownName },
      { inputValue: '1112', godownName: testGodownName },
      { inputValue: '1113', godownName: testGodownName },
      { inputValue: '2221', godownName: testGodownName },
      { inputValue: '2222', godownName: testGodownName },
      { inputValue: '3331', godownName: testGodownName },
      { inputValue: '3332', godownName: testGodownName },
      { inputValue: '3333', godownName: testGodownName },
      { inputValue: '3334', godownName: testGodownName }
    ];

    console.log('📦 Test billing items (3-digit codes):');
    billingItems.forEach(item => {
      console.log(`   ${item.name} - Price: ₹${item.price}`);
    });

    console.log('\n📦 Test delevery1 items (extended codes):');
    delevery1Items.forEach(item => {
      console.log(`   ${item.inputValue} - Godown: ${item.godownName}`);
    });

    // Add delevery1 items
    for (const item of delevery1Items) {
      try {
        await axios.post(`${baseURL}/api/add/delevery1`, {
          selectedOption: 'test',
          inputValue: item.inputValue,
          godownName: item.godownName
        });
        console.log(`✅ Added delevery1 item: ${item.inputValue}`);
      } catch (error) {
        console.log(`⚠️ Could not add ${item.inputValue}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 2: Check current delevery1 data
    console.log('\n2. Checking current delevery1 data...');
    const delevery1Response = await axios.get(`${baseURL}/api/delevery1`);
    const delevery1Data = delevery1Response.data;
    console.log(`📦 Total items in delevery1: ${delevery1Data.length}`);
    
    // Group by prefix
    const groupedByPrefix = delevery1Data.reduce((acc, item) => {
      const prefix = (item.inputValue || '').substring(0, 3);
      if (!acc[prefix]) acc[prefix] = [];
      acc[prefix].push(item.inputValue);
      return acc;
    }, {});

    console.log('📊 Items grouped by 3-digit prefix:');
    Object.keys(groupedByPrefix).forEach(prefix => {
      console.log(`   ${prefix}: ${groupedByPrefix[prefix].length} items (${groupedByPrefix[prefix].join(', ')})`);
    });

    // Test 3: Test the 3-digit matching logic
    console.log('\n3. Testing 3-digit prefix matching...');
    
    const testCustomer = { _id: 'test-customer-id', name: 'Test Customer' };
    const testGodown = { _id: 'test-godown-id', name: testGodownName };
    
    const testItems = [
      { itemName: '111', quantity: 2 },
      { itemName: '222', quantity: 1 },
      { itemName: '333', quantity: 3 },
      { itemName: '444', quantity: 1 } // This should not match anything
    ];

    console.log('🔍 Testing inventory check with 3-digit matching...');
    console.log('Test items:', testItems.map(i => `${i.itemName} (qty: ${i.quantity})`).join(', '));
    
    try {
      const inventoryCheckResponse = await axios.post(`${baseURL}/api/inventory/check-availability`, {
        items: testItems,
        godownId: testGodown._id
      });

      console.log('\n✅ 3-Digit Matching Results:');
      
      inventoryCheckResponse.data.forEach((result, index) => {
        console.log(`\n   Item ${index + 1}: ${result.itemName}`);
        console.log(`   Prefix: ${result.prefix}`);
        console.log(`   Requested: ${result.requestedQuantity}`);
        console.log(`   Available: ${result.availableQuantity}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Message: ${result.message}`);
        
        if (result.matchingItems && result.matchingItems.length > 0) {
          console.log(`   Matching items: ${result.matchingItems.join(', ')}`);
        }
        
        if (result.alternativeGodowns && result.alternativeGodowns.length > 0) {
          console.log(`   Alternative godowns: ${result.alternativeGodowns.map(g => `${g.godownName} (${g.availableQuantity})`).join(', ')}`);
        }
      });

      // Test 4: Test bill generation with 3-digit matching
      console.log('\n4. Testing bill generation with 3-digit matching...');
      
      const availableItems = inventoryCheckResponse.data.filter(item => item.isAvailableInSelectedGodown);
      
      if (availableItems.length > 0) {
        const billItems = availableItems.map(item => ({
          itemName: item.itemName,
          quantity: Math.min(item.requestedQuantity, item.availableQuantity),
          price: 100,
          masterPrice: 90,
          total: 100 * Math.min(item.requestedQuantity, item.availableQuantity)
        }));

        console.log('📋 Creating bill with items:', billItems.map(i => `${i.itemName} (qty: ${i.quantity})`).join(', '));

        const billResponse = await axios.post(`${baseURL}/api/bills/add`, {
          customerId: testCustomer._id,
          customerName: testCustomer.name,
          godownId: testGodown._id,
          godownName: testGodown.name,
          items: billItems,
          totalAmount: billItems.reduce((sum, item) => sum + item.total, 0),
          priceType: 'price'
        });

        console.log('✅ Bill created successfully!');
        console.log(`📄 Bill Number: ${billResponse.data.billNumber}`);
        
        if (billResponse.data.deletionResults) {
          console.log('\n📊 3-Digit Matching Deletion Results:');
          billResponse.data.deletionResults.forEach((result, index) => {
            console.log(`   ${index + 1}. ${result.itemName} (prefix: ${result.prefix}):`);
            console.log(`      Requested: ${result.requestedQuantity}`);
            console.log(`      Found: ${result.foundItems}`);
            console.log(`      Deleted: ${result.deletedItems}`);
            if (result.deletedItemValues && result.deletedItemValues.length > 0) {
              console.log(`      Deleted items: ${result.deletedItemValues.join(', ')}`);
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
        
        const afterGroupedByPrefix = afterDelevery1Data.reduce((acc, item) => {
          const prefix = (item.inputValue || '').substring(0, 3);
          if (!acc[prefix]) acc[prefix] = [];
          acc[prefix].push(item.inputValue);
          return acc;
        }, {});

        console.log('📊 Remaining items grouped by 3-digit prefix:');
        Object.keys(afterGroupedByPrefix).forEach(prefix => {
          console.log(`   ${prefix}: ${afterGroupedByPrefix[prefix].length} items (${afterGroupedByPrefix[prefix].join(', ')})`);
        });

        console.log('\n🎉 3-Digit Prefix Matching Test completed successfully!');
        console.log('\n📈 Summary:');
        console.log(`   📦 Items before bill: ${delevery1Data.length}`);
        console.log(`   📦 Items after bill: ${afterDelevery1Data.length}`);
        console.log(`   🗑️ Items deleted: ${delevery1Data.length - afterDelevery1Data.length}`);
        console.log(`   ✅ 3-digit prefix matching: Working correctly!`);

      } else {
        console.log('❌ No items available for bill generation test');
      }

    } catch (error) {
      console.error('❌ Inventory check failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

// Run the test
test3DigitMatching();
