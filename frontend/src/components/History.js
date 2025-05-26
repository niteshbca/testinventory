import React, { useEffect, useState } from 'react';
import axios from 'axios';

const History = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/data');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

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
      color: '#333',
    },
    tr: {
      transition: 'background 0.3s',
    },
    trHover: {
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
    },
    loadingText: {
      fontSize: "1.2rem",
      color: "#fff",
      animation: "fadeIn 2s infinite",
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
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
  `;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>History</h1>

      {data.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Selected Option</th>
              <th style={styles.th}>Input Value</th>
              <th style={styles.th}>Godown Name</th>
              <th style={styles.th}>Username</th>
              <th style={styles.th}>Mobile Number</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr 
                key={index} 
                style={styles.tr} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = styles.trHover.backgroundColor} 
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={styles.td}>{item.selectedOption}</td>
                <td style={styles.td}>{item.inputValue}</td>
                <td style={styles.td}>{item.godownName}</td>
                <td style={styles.td}>{item.username}</td>
                <td style={styles.td}>{item.mobileNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ color: 'red' }}>No Data Available</p>
      )}

      <style>{globalStyles}</style>
    </div>
  );
};

export default History;
