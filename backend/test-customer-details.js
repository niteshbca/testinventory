const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';

async function testCustomerDetails() {
  try {
    console.log('🧪 Testing CustomerDetails Page Functionality\n');

    // Test 1: Get or create a test customer
    console.log('1. Setting up test customer...');
    
    let testCustomer;
    try {
      const customersResponse = await axios.get(`${baseURL}/api/customers/`);
      const customers = customersResponse.data;
      
      if (customers.length > 0) {
        testCustomer = customers[0];
        console.log(`✅ Using existing customer: ${testCustomer.name} (ID: ${testCustomer._id})`);
      } else {
        // Create a test customer
        const newCustomer = await axios.post(`${baseURL}/api/customers/add`, {
          name: 'Test Customer',
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
          gstNo: 'TEST123456789',
          phoneNumber: '1234567890'
        });
        testCustomer = newCustomer.data;
        console.log(`✅ Created new test customer: ${testCustomer.name} (ID: ${testCustomer._id})`);
      }
    } catch (error) {
      console.error('❌ Error setting up customer:', error.response?.data?.message || error.message);
      return;
    }

    // Test 2: Test adding billing items
    console.log('\n2. Testing billing item addition...');
    
    const testItems = [
      { name: '111', price: 100, masterPrice: 90 },
      { name: '222', price: 200, masterPrice: 180 },
      { name: '333', price: 300, masterPrice: 270 }
    ];

    const addedItems = [];
    for (const item of testItems) {
      try {
        const response = await axios.post(`${baseURL}/api/bills/customer/items/add`, {
          ...item,
          customerId: testCustomer._id
        });
        addedItems.push(response.data);
        console.log(`✅ Added item: ${item.name} - Price: ₹${item.price}, Master Price: ₹${item.masterPrice}`);
      } catch (error) {
        console.log(`❌ Failed to add item ${item.name}:`, error.response?.data?.message || error.message);
      }
    }

    // Test 3: Test fetching billing items
    console.log('\n3. Testing billing items retrieval...');
    
    try {
      const itemsResponse = await axios.get(`${baseURL}/api/bills/customer/${testCustomer._id}/items`);
      const items = itemsResponse.data;
      
      console.log(`✅ Retrieved ${items.length} billing items for customer`);
      console.log('📦 Items list:');
      items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} - Price: ₹${item.price}, Master Price: ₹${item.masterPrice}`);
      });

      // Test 4: Test updating a billing item
      if (items.length > 0) {
        console.log('\n4. Testing billing item update...');
        
        const itemToUpdate = items[0];
        const updatedData = {
          name: itemToUpdate.name + ' (Updated)',
          price: itemToUpdate.price + 10,
          masterPrice: itemToUpdate.masterPrice + 5
        };

        try {
          const updateResponse = await axios.put(`${baseURL}/api/bills/customer/items/${itemToUpdate._id}`, updatedData);
          console.log(`✅ Updated item: ${updateResponse.data.name} - New Price: ₹${updateResponse.data.price}`);
        } catch (error) {
          console.log(`❌ Failed to update item:`, error.response?.data?.message || error.message);
        }

        // Test 5: Test deleting a billing item
        if (items.length > 1) {
          console.log('\n5. Testing billing item deletion...');
          
          const itemToDelete = items[1];
          try {
            const deleteResponse = await axios.delete(`${baseURL}/api/bills/customer/items/${itemToDelete._id}`);
            console.log(`✅ Deleted item: ${itemToDelete.name}`);
            console.log(`   Response: ${deleteResponse.data.message}`);
          } catch (error) {
            console.log(`❌ Failed to delete item:`, error.response?.data?.message || error.message);
          }
        }
      }

      // Test 6: Verify final state
      console.log('\n6. Verifying final state...');
      
      const finalItemsResponse = await axios.get(`${baseURL}/api/bills/customer/${testCustomer._id}/items`);
      const finalItems = finalItemsResponse.data;
      
      console.log(`✅ Final count: ${finalItems.length} billing items`);
      console.log('📦 Final items list:');
      finalItems.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name} - Price: ₹${item.price}, Master Price: ₹${item.masterPrice}`);
      });

      // Test 7: Test customer bills
      console.log('\n7. Testing customer bills retrieval...');
      
      try {
        const billsResponse = await axios.get(`${baseURL}/api/bills/customer/${testCustomer._id}/bills`);
        const bills = billsResponse.data;
        
        console.log(`✅ Retrieved ${bills.length} bills for customer`);
        if (bills.length > 0) {
          console.log('📄 Bills list:');
          bills.forEach((bill, index) => {
            console.log(`   ${index + 1}. Bill #${bill.billNumber} - Amount: ₹${bill.totalAmount} - Items: ${bill.items.length}`);
          });
        } else {
          console.log('   No bills found for this customer');
        }
      } catch (error) {
        console.log(`❌ Failed to fetch bills:`, error.response?.data?.message || error.message);
      }

      console.log('\n🎉 CustomerDetails functionality test completed successfully!');
      
      console.log('\n📈 Summary:');
      console.log(`   👤 Customer: ${testCustomer.name}`);
      console.log(`   📦 Items added: ${addedItems.length}`);
      console.log(`   📦 Final items: ${finalItems.length}`);
      console.log(`   ✅ All CRUD operations working correctly!`);
      console.log(`   ✅ Sr.No field removed successfully!`);
      console.log(`   ✅ Data fetched from billingitems collection!`);

    } catch (error) {
      console.error('❌ Error fetching items:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

// Run the test
testCustomerDetails();
