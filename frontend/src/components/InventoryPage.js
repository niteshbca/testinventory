import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const InventoryPage = () => {
  const location = useLocation();
  const godown = location.state?.godown; // Retrieve the godown data

  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Backend URL from environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Fetch data from backend (MongoDB) and filter by godown name
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${backendUrl}/api/delevery1`)
      .then((response) => {
        console.log("API Response: ", response.data);
        
        // Filter the data to match godown name
        const filteredData = response.data.filter(
          (item) => item.godownName === godown?.name
        );
        setData(filteredData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setMessage("Error fetching data.");
        setLoading(false);
      });
  }, [godown]);

  // Simple grouping function for basic table
  const groupData = () => {
    const grouped = {};

    data.forEach((item) => {
      const itemName = item.itemName || item.inputValue || item.name || '';
      const prefix = itemName.length >= 3 ? itemName.substring(0, 3) : itemName;

      if (grouped[prefix]) {
        grouped[prefix].count += 1;
        if (!grouped[prefix].allValues.includes(itemName)) {
          grouped[prefix].allValues.push(itemName);
        }
      } else {
        grouped[prefix] = {
          option: prefix,
          allValues: [itemName],
          count: 1,
        };
      }
    });

    return Object.values(grouped).map((group, index) => ({
      ...group,
      serialNo: index + 1,
    }));
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
  @keyframes cardBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  `;

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{globalStyles}</style>
        <div style={styles.godownDetails}>
          <h2 style={{ color: 'white' }}>Loading Inventory...</h2>
        </div>
      </div>
    );
  }

  if (!godown) {
    return (
      <div style={styles.container}>
        <style>{globalStyles}</style>
        <div style={styles.godownDetails}>
          <h2 style={{ color: 'white' }}>No Godown Selected</h2>
          <p style={{ color: 'white' }}>Please select a godown to view inventory.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{globalStyles}</style>
      <div style={styles.godownDetails}>
        <h2 style={{ marginBottom: '10px', fontSize: '28px', color: 'white' }}>{godown?.name}</h2>
        <p style={{ marginBottom: '20px', fontSize: '18px', color: 'white' }}>{godown?.address}</p>

        {message && <div style={styles.message}>{message}</div>}

        {data.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '10px',
            margin: '20px 0'
          }}>
            <h3 style={{ color: '#666', marginBottom: '10px' }}>No Inventory Data Found</h3>
            <p style={{ color: '#888' }}>No items found for this godown.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(218, 216, 224, 0.6)', textAlign: 'left' }}>
                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Serial No.</th>
                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Item</th>
                <th style={{ border: '1px solid #ddd', padding: '10px' }}>All Items</th>
                <th style={{ border: '1px solid #ddd', padding: '10px' }}>Total Count</th>
              </tr>
            </thead>
            <tbody>
              {groupData().map((item, index) => (
                <tr key={index} style={{
                  textAlign: 'center',
                  backgroundColor: index % 2 === 0 ? 'rgba(218, 216, 224, 0.6)' : 'rgba(218, 216, 224, 0.4)',
                }}>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.serialNo}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>{item.option}</td>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                    <select style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}>
                      {item.allValues.map((value, subIndex) => (
                        <option key={subIndex} value={value}>{value}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                    <span style={{ fontWeight: 'bold' }}>{item.count}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
