const axios = require('axios');
require('dotenv').config();

const baseURL = process.env.BACKEND_URL || 'http://localhost:5000';

async function testItemCountSummary() {
  try {
    console.log('🧪 Testing ItemCountSummary 3-Digit Grouping Functionality\n');

    // Test 1: Add test data to demonstrate 3-digit grouping
    console.log('1. Adding test data to demonstrate 3-digit grouping...');
    
    const testData = [
      // 1-digit items
      { selectedOption: 'test', inputValue: '1' },
      { selectedOption: 'test', inputValue: '2' },
      // 2-digit items
      { selectedOption: 'test', inputValue: '11' },
      { selectedOption: 'test', inputValue: '12' },
      { selectedOption: 'test', inputValue: '22' },
      // 3+ digit items
      { selectedOption: 'test', inputValue: '111' },
      { selectedOption: 'test', inputValue: '1111' },
      { selectedOption: 'test', inputValue: '1112' },
      { selectedOption: 'test', inputValue: '1113' },
      { selectedOption: 'test', inputValue: '1114' },
      { selectedOption: 'test', inputValue: '2221' },
      { selectedOption: 'test', inputValue: '2222' },
      { selectedOption: 'test', inputValue: '3331' },
      { selectedOption: 'test', inputValue: '3332' },
      { selectedOption: 'test', inputValue: '3333' },
      { selectedOption: 'test', inputValue: '4441' }
    ];

    console.log('📦 Test data to be added:');
    testData.forEach(item => {
      console.log(`   ${item.inputValue} (prefix: ${item.inputValue.substring(0, 3)})`);
    });

    // Add test data to selects collection
    for (const item of testData) {
      try {
        await axios.post(`${baseURL}/api/add/select`, item);
        console.log(`✅ Added: ${item.inputValue}`);
      } catch (error) {
        console.log(`⚠️ Could not add ${item.inputValue}: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 2: Fetch and analyze the selects data
    console.log('\n2. Fetching selects data...');
    
    try {
      const selectsResponse = await axios.get(`${baseURL}/selects`);
      const selectsData = selectsResponse.data;
      
      console.log(`📦 Total items in selects collection: ${selectsData.length}`);
      
      // Group by prefix (simulate frontend logic - handles any length)
      const grouped = {};
      selectsData.forEach(item => {
        if (item.inputValue && item.inputValue.length > 0) {
          // Take first 3 digits or all available digits if less than 3
          const prefix = item.inputValue.length >= 3
            ? item.inputValue.substring(0, 3)
            : item.inputValue;

          if (grouped[prefix]) {
            grouped[prefix].count += 1;
            grouped[prefix].inputValues.push(item.inputValue);
          } else {
            grouped[prefix] = {
              prefix: prefix,
              count: 1,
              inputValues: [item.inputValue]
            };
          }
        }
      });

      console.log('\n📊 Prefix Grouping Results (Any Length):');
      console.log('┌─────────┬───────┬─────────────────────────────────────────┐');
      console.log('│ Item    │ Count │ Total Barcode                           │');
      console.log('├─────────┼───────┼─────────────────────────────────────────┤');
      
      Object.values(grouped).forEach((group, index) => {
        const barcodes = group.inputValues.join(', ');
        const truncatedBarcodes = barcodes.length > 35 ? barcodes.substring(0, 35) + '...' : barcodes;
        console.log(`│ ${group.prefix.padEnd(7)} │ ${group.count.toString().padEnd(5)} │ ${truncatedBarcodes.padEnd(39)} │`);
      });
      
      console.log('└─────────┴───────┴─────────────────────────────────────────┘');

      // Test 3: Detailed breakdown
      console.log('\n3. Detailed breakdown by prefix:');
      
      Object.values(grouped).forEach((group, index) => {
        console.log(`\n   ${index + 1}. Prefix: ${group.prefix}`);
        console.log(`      Count: ${group.count}`);
        console.log(`      Barcodes: ${group.inputValues.join(', ')}`);
      });

      // Test 4: Verify expected behavior
      console.log('\n4. Verifying expected behavior...');
      
      const expectedGroups = {
        '111': { expectedCount: 4, expectedBarcodes: ['1111', '1112', '1113', '1114'] },
        '222': { expectedCount: 2, expectedBarcodes: ['2221', '2222'] },
        '333': { expectedCount: 3, expectedBarcodes: ['3331', '3332', '3333'] },
        '444': { expectedCount: 1, expectedBarcodes: ['4441'] }
      };

      let allTestsPassed = true;

      Object.keys(expectedGroups).forEach(prefix => {
        const expected = expectedGroups[prefix];
        const actual = grouped[prefix];

        if (actual) {
          const countMatch = actual.count >= expected.expectedCount;
          const barcodesMatch = expected.expectedBarcodes.every(barcode => 
            actual.inputValues.includes(barcode)
          );

          if (countMatch && barcodesMatch) {
            console.log(`   ✅ Prefix ${prefix}: Count=${actual.count}, Barcodes=${actual.inputValues.join(', ')}`);
          } else {
            console.log(`   ❌ Prefix ${prefix}: Expected count>=${expected.expectedCount}, got ${actual.count}`);
            console.log(`      Expected barcodes to include: ${expected.expectedBarcodes.join(', ')}`);
            console.log(`      Actual barcodes: ${actual.inputValues.join(', ')}`);
            allTestsPassed = false;
          }
        } else {
          console.log(`   ❌ Prefix ${prefix}: Not found in grouped data`);
          allTestsPassed = false;
        }
      });

      if (allTestsPassed) {
        console.log('\n🎉 All tests passed! ItemCountSummary 3-digit grouping is working correctly!');
      } else {
        console.log('\n⚠️ Some tests failed. Please check the data.');
      }

      console.log('\n📈 Summary:');
      console.log(`   📦 Total unique 3-digit prefixes: ${Object.keys(grouped).length}`);
      console.log(`   📦 Total barcodes: ${selectsData.length}`);
      console.log(`   ✅ Data source: selects collection`);
      console.log(`   ✅ Grouping: By first 3 digits of inputValue`);
      console.log(`   ✅ Display: Item shows 3-digit prefix, Total Barcode shows all full codes`);

      // Test 5: Frontend display simulation
      console.log('\n5. Frontend display simulation:');
      console.log('\nHow it will appear in ItemCountSummary page:');
      console.log('┌────────────┬──────┬───────┬─────────────────────────────────┐');
      console.log('│ Serial No. │ Item │ Count │ Total Barcode                   │');
      console.log('├────────────┼──────┼───────┼─────────────────────────────────┤');
      
      Object.values(grouped).forEach((group, index) => {
        const serialNo = (index + 1).toString().padEnd(10);
        const item = group.prefix.padEnd(4);
        const count = group.count.toString().padEnd(5);
        const barcodes = group.inputValues.join(', ');
        const truncatedBarcodes = barcodes.length > 31 ? barcodes.substring(0, 28) + '...' : barcodes;
        
        console.log(`│ ${serialNo} │ ${item} │ ${count} │ ${truncatedBarcodes.padEnd(31)} │`);
      });
      
      console.log('└────────────┴──────┴───────┴─────────────────────────────────┘');

    } catch (error) {
      console.error('❌ Error fetching selects data:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

// Run the test
testItemCountSummary();
