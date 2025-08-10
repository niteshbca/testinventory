import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation } from 'react-router-dom';

function Dgodowndetails() {
  const location = useLocation();
  const { godown } = location.state; // Access godown data from the state
  const [inputValue, setInputValue] = useState(""); // Input field value
  const [isSaving, setIsSaving] = useState(false); // Flag to track if data is being saved
  const [isStarted, setIsStarted] = useState(false); // Auto-save mode
  const [message, setMessage] = useState("");
  const [data, setData] = useState([]);
  const inputRef = useRef(null); // Ref for the input field

  // Backend URL from environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Fetch data from backend (MongoDB) and filter by godown name
  useEffect(() => {
    axios
      .get(`${backendUrl}/api/despatch`)
      .then((response) => {
        const filteredData = response.data.filter(
          (item) => item.godownName === godown?.name
        );
        setData(filteredData);
      })
      .catch(() => {
        setMessage("Error fetching data.");
      });
  }, [godown]);

  // Group selected options and count their occurrences (unchanged)
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
      } else {
        grouped[prefix] = {
          option: prefix, // First 3 digits for Item
          allValues: [item.inputValue], // Array of all values with same prefix
          count: 1,
        };
      }
    });
    return Object.values(grouped);
  };

  // Auto-check and save on input change (only when started)
  useEffect(() => {
    if (!isStarted || inputValue.trim() === "") return;
    const timer = setTimeout(async () => {
      setIsSaving(true);
      setMessage("");
      try {
        // Check if inputValue exists in selects
        const selectsRes = await axios.get(`${backendUrl}/api/products1`);
        const match = selectsRes.data.find(item => item.inputValue === inputValue.trim());
        if (match) {
          // Move to despatch and remove from selects
          await axios.post(`${backendUrl}/api/save/select`, {
            inputValue: inputValue.trim(),
            godownName: godown.name
          });
          setMessage("Value matched and saved to despatch!");
          setInputValue("");
          // Focus the input field after clearing
          if (inputRef.current) inputRef.current.focus();
        } else {
          setMessage("Value not found in selects collection.");
        }
      } catch (err) {
        setMessage("Error during save operation.");
      }
      setIsSaving(false);
    }, 700);
    return () => clearTimeout(timer);
  }, [inputValue, isStarted, godown.name]);

  // Always focus input after clearing (for fast repeated entry)
  useEffect(() => {
    if (isStarted && inputValue === "" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputValue, isStarted]);

  // Start auto-save
  const handleStart = () => {
    setIsStarted(true);
    setMessage("Auto-saving is active. Type values and they will be saved automatically after 0.7 second.");
    // Focus the input field when auto-save starts
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
  };

  // Stop auto-save
  const handleStop = () => {
    setIsStarted(false);
    setMessage("Auto-saving stopped");
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
      maxWidth: '600px',
    },
    title: {
      fontSize: '2.6rem',
      color: 'white',
      fontWeight: 'bold',
      marginBottom: '15px',
    },
    subtitle: {
      fontSize: '1.8rem',
      color: 'white',
      marginBottom: '25px',
    },
    input: {
      padding: '12px',
      width: '90%',
      margin: '10px 0',
      border: '1px solid #ddd',
      borderRadius: '20px',
      fontSize: '1rem',
    },
    button: {
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
      color: 'white',
      padding: '10px 20px',
      margin: '10px',
      border: 'none',
      borderRadius: '25px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
    buttonDisabled: {
      backgroundColor: 'rgba(180, 180, 190, 0.95)',
      color: 'white',
      padding: '10px 20px',
      margin: '10px',
      border: 'none',
      borderRadius: '25px',
      fontSize: '18px',
      fontWeight: 'bold',
      cursor: 'not-allowed',
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
        <h2 style={{ marginBottom: '10px', fontSize: '28px', color: 'white' }}>{godown.name}</h2>
        <p style={{ marginBottom: '20px', fontSize: '28px', color: 'white' }}>{godown.address}</p>
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter value"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          style={styles.input}
          disabled={isSaving || !isStarted}
        />
        <button
          style={isStarted ? styles.buttonDisabled : styles.button}
          onClick={handleStart}
          disabled={isStarted}
        >
          {isStarted ? "Auto-saving Active" : "Start Auto-save"}
        </button>
        <button
          style={!isStarted ? styles.buttonDisabled : styles.button}
          onClick={handleStop}
          disabled={!isStarted}
        >
          Stop
        </button>
        {message && <div style={styles.message}>{message}</div>}
        <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(218, 216, 224, 0.6)', textAlign: 'left' }}>
              <th style={{ border: '1px solid #ddd', padding: '10px' }}>Serial No.</th>
              <th style={{ border: '1px solid #ddd', padding: '10px' }}>Item</th>
              <th style={{ border: '1px solid #ddd', padding: '10px' }}>All Value</th>
              <th style={{ border: '1px solid #ddd', padding: '10px' }}>Count</th>
            </tr>
          </thead>
          <tbody>
            {groupData().map((group, index) => (
              <tr key={index} style={{ textAlign: 'center', backgroundColor: index % 2 === 0 ? 'rgba(218, 216, 224, 0.6)' : 'rgba(218, 216, 224, 0.6)' }}>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{index + 1}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{group.option}</td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                  <select style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    {group.allValues.map((value, subIndex) => (
                      <option key={subIndex} value={value}>{value}</option>
                    ))}
                  </select>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{group.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dgodowndetails;
