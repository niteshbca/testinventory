import React, { useEffect, useState } from 'react';
import axios from 'axios';

const History = () => {
  const [data, setData] = useState([]);
  const [selectedValues, setSelectedValues] = useState({});

  // Backend URL from environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/data`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Group data by first 3 digits of inputValue
  const groupData = () => {
    const grouped = {};
    
    data.forEach((item) => {
      const prefix = item.inputValue.substring(0, 3); // First 3 digits
      if (grouped[prefix]) {
        grouped[prefix].count += 1;
        // Add the value to the list if it's not already there
        if (!grouped[prefix].allValues.includes(item.inputValue)) {
          grouped[prefix].allValues.push(item.inputValue);
        }
        // Add username, mobile number, and godown name to the group
        if (!grouped[prefix].usernames.includes(item.username)) {
          grouped[prefix].usernames.push(item.username);
        }
        if (!grouped[prefix].mobileNumbers.includes(item.mobileNumber)) {
          grouped[prefix].mobileNumbers.push(item.mobileNumber);
        }
        if (!grouped[prefix].godownNames.includes(item.godownName)) {
          grouped[prefix].godownNames.push(item.godownName);
        }
        // Store the mapping of inputValue to its corresponding data
        grouped[prefix].valueMapping = grouped[prefix].valueMapping || {};
        grouped[prefix].valueMapping[item.inputValue] = {
          username: item.username,
          mobileNumber: item.mobileNumber,
          godownName: item.godownName
        };
      } else {
        grouped[prefix] = {
          option: prefix, // First 3 digits for Item
          allValues: [item.inputValue], // Array of all values with same prefix
          count: 1,
          usernames: [item.username],
          mobileNumbers: [item.mobileNumber],
          godownNames: [item.godownName],
          valueMapping: {
            [item.inputValue]: {
              username: item.username,
              mobileNumber: item.mobileNumber,
              godownName: item.godownName
            }
          }
        };
      }
    });
    return Object.values(grouped);
  };

  // Handle value selection from All Value dropdown
  const handleValueChange = (prefix, selectedValue) => {
    const group = groupData().find(g => g.option === prefix);
    if (group && group.valueMapping && group.valueMapping[selectedValue]) {
      const mapping = group.valueMapping[selectedValue];
      setSelectedValues(prev => ({
        ...prev,
        [prefix]: {
          selectedValue,
          username: mapping.username,
          mobileNumber: mapping.mobileNumber,
          godownName: mapping.godownName
        }
      }));
    }
  };

  const styles = {
    container: {
      margin: 0,
      padding: '50px 20px',
      fontFamily: "'Poppins', sans-serif",
      textAlign: 'center',
      background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
      backgroundSize: '400% 400%',
      animation: 'gradientAnimation 12s ease infinite',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    godownDetails: {
      padding: '30px',
      border: '1px solid #ddd',
      borderRadius: '15px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
      animation: 'cardBounce 2s infinite ease-in-out',
      width: '100%',
      maxWidth: '1200px',
    },
    title: {
      fontSize: '2.6rem',
      color: 'white',
      fontWeight: 'bold',
      marginBottom: '15px',
    },
    message: {
      color: 'black',
      fontWeight: 'bold',
      margin: '10px 0',
      fontSize: '1.1rem',
    },
  };

  const globalStyles = `
  @keyframes gradientAnimation {
    0% { background-position: 0% 50%; }
    25% { background-position: 50% 100%; }
    50% { background-position: 100% 50%; }
    75% { background-position: 50% 0%; }
    100% { background-position: 0% 50%; }
  }
  `;

  return (
    <div style={styles.container}>
      <style>{globalStyles}</style>
      <div style={styles.godownDetails}>
        <h2 style={{ marginBottom: '10px', fontSize: '28px', color: 'white' }}>History</h2>
        
        {data.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(218, 216, 224, 0.6)', textAlign: 'left' }}>
                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Serial No.</th>
                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Item</th>
                <th style={{ border: '1px solid #ddd', padding: '10px' }}>All Value</th>
                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Count</th>
                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Username</th>
                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Mobile Number</th>
                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Godown Name</th>
              </tr>
            </thead>
            <tbody>
              {groupData().map((group, index) => {
                const selectedData = selectedValues[group.option] || {};
                return (
                  <tr key={index} style={{ textAlign: 'center', backgroundColor: index % 2 === 0 ? 'rgba(218, 216, 224, 0.6)' : 'rgba(218, 216, 224, 0.6)' }}>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{group.option}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                      <select 
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                        onChange={(e) => handleValueChange(group.option, e.target.value)}
                        value={selectedData.selectedValue || ''}
                      >
                        <option value="">Select a value</option>
                        {group.allValues.map((value, subIndex) => (
                          <option key={subIndex} value={value}>{value}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>{group.count}</td>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                      <select 
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                        value={selectedData.username || ''}
                        disabled
                      >
                        <option value="">{selectedData.username || 'Select value first'}</option>
                      </select>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                      <select 
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                        value={selectedData.mobileNumber || ''}
                        disabled
                      >
                        <option value="">{selectedData.mobileNumber || 'Select value first'}</option>
                      </select>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                      <select 
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}
                        value={selectedData.godownName || ''}
                        disabled
                      >
                        <option value="">{selectedData.godownName || 'Select value first'}</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ color: 'red', fontSize: '1.2rem', fontWeight: 'bold' }}>No Data Available</p>
        )}
      </div>
    </div>
  );
};

export default History;
