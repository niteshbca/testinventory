import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';

const ItemCountSummary = () => {
  const [data, setData] = useState([]);

  // Backend URL from environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Fetch data from backend (MongoDB)
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/selects`);
      setData(response.data);
    } catch (error) {
      console.log("Error fetching data: ", error);
    }
  };

  // Group by first 3 digits (or less) of inputValue and count their occurrences
  const groupData = () => {
    const grouped = {};

    // Loop through data and group by first 3 digits (or available digits if less than 3)
    data.forEach(item => {
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
            option: prefix,
            count: 1,
            inputValues: [item.inputValue]
          };
        }
      }
    });

    return Object.values(grouped); // Return an array of grouped data
  };

  const styles = {
    container: {
      background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
      backgroundSize: '400% 400%',
      animation: 'gradientAnimation 12s ease infinite',
      minHeight: "100vh",
      padding: "20px",
      fontFamily: "'Roboto', sans-serif",
      color: "#333",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    title: {
      fontSize: "3.9rem",
      color: "white",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)",
      marginBottom: "20px",
      textAlign: "center",
    },
    table: {
      width: '80%',
      margin: '0 auto',
      borderCollapse: 'collapse',
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
      borderRadius: '15px',
      overflow: 'hidden',
    },
    th: {
      border: '1px solid #ccc',
      padding: '15px',
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
      color: '#fff',
      fontSize: '18px',
      textAlign: 'center',
    },
    td: {
      border: '1px solid #ccc',
      padding: '15px',
      textAlign: 'center',
      fontSize: '16px',
      color: 'white',
    },
    tr: {
      transition: 'background 0.3s',

    },
    trHover: {
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
    }
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
      <h2 style={styles.title}>Item Inventory</h2>
             <button
               style={{
                 backgroundColor: 'rgba(218, 216, 224, 0.8)',
                 color: 'white',
                 border: 'none',
                 padding: '15px 32px',
                 textAlign: 'center',
                 textDecoration: 'none',
                 display: 'inline-block',
                 fontSize: '25px',
                 margin: '10px',
                 borderRadius: '28px',
                 cursor: 'pointer',
                 boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                 transition: 'background-color 0.3s ease, transform 0.3s ease',
                 fontFamily: "'Poppins', sans-serif",
               }}
               onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
               onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
             >
               <Link
                 to="/BarcodeTable"
                 style={{
                   color: 'white',
                   textDecoration: 'none',
                 }}
               >
                 Barcode History
               </Link>
             </button>
     

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Serial No.</th>
            <th style={styles.th}>Item</th>
            <th style={styles.th}>Count</th>
            <th style={styles.th}>Total Barcode</th>
          </tr>
        </thead>
        <tbody>
          {groupData().map((group, index) => (
            <tr 
              key={index} 
              style={styles.tr} 
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.trHover.backgroundColor} 
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <td style={styles.td}>{index + 1}</td> 
              <td style={styles.td}>{group.option}</td>
              <td style={styles.td}>{group.count}</td>
              <td style={{...styles.td, maxWidth: '300px', wordWrap: 'break-word', textAlign: 'left', padding: '10px'}}>
                {group.inputValues.join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{globalStyles}</style>
    </div>
  );
};

export default ItemCountSummary;
