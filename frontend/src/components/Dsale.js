import React, { useState, useEffect, useRef } from "react";
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Dsale = () => {
  const [message, setMessage] = useState('');
  const location = useLocation();
  const godown = location.state ? location.state.godown : null;
  const displayedGodownName = godown ? godown.name : "";

  const [inputValue, setInputValue] = useState("");
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [godownNames, setGodownNames] = useState([]);
  const inputRef = useRef(null);

  // Backend URL from environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    axios
      .get(`${backendUrl}/api/products3`)
      .then((response) => {
        const fetchedGodownNames = Array.from(
          new Set(response.data.map((item) => item.godownName))
        );
        setGodownNames(fetchedGodownNames);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const isGodownNameMatched = () => {
    return godownNames.includes(displayedGodownName);
  };

  // Auto-check and save on input change (only when started)
  useEffect(() => {
    if (!isStarted || inputValue.trim() === "" || username.trim() === "" || mobileNumber.trim() === "") return;
    const timer = setTimeout(async () => {
      if (!isGodownNameMatched()) {
        setMessage("Godown Name does not match. Cannot save data.");
        return;
      }
      
      setIsSaving(true);
      setMessage("");
      try {
        await axios.post(`${backendUrl}/api/save/delevery1`, {
          selectedOption: "default",
          inputValue: inputValue.trim(),
          username: username.trim(),
          mobileNumber: mobileNumber.trim(),
          godownName: displayedGodownName,
        });
        setMessage("Data saved successfully!");
        setInputValue("");
        setUsername("");
        setMobileNumber("");
        // Focus the input field after clearing
        if (inputRef.current) inputRef.current.focus();
      } catch (error) {
        setMessage("Error saving data.");
      }
      setIsSaving(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [inputValue, username, mobileNumber, isStarted, displayedGodownName]);

  // Always focus input after clearing (for fast repeated entry)
  useEffect(() => {
    if (isStarted && inputValue === "" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputValue, isStarted]);

  // Start auto-save
  const handleStart = () => {
    if (!isGodownNameMatched()) {
      alert("Godown Name does not match. Cannot start auto-save.");
      return;
    }
    setIsStarted(true);
    setMessage("Auto-saving is active. Fill all fields and they will be saved automatically after 1.5 seconds.");
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

  return (
    <div style={styles.container}>
      <style>{globalStyles}</style>
      <h2 style={styles.header}>Sale Page</h2>
      {godown ? (
        <div style={styles.godownDetails}>
          <h3 style={styles.godownHeader}>Godown Details</h3>
          <p style={styles.godownText}><strong>Name:</strong> {displayedGodownName}</p>
          <p style={styles.godownText}><strong>Address:</strong> {godown.address}</p>
          
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={styles.input}
            disabled={isSaving || !isStarted}
          />

          <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            disabled={isSaving || !isStarted}
          />

          <input
            type="text"
            placeholder="Enter Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
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
        </div>
      ) : (
        <p style={styles.errorText}>No Godown Data Available</p>
      )}
    </div>
  );
};

const globalStyles = `
@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
    backgroundSize: '400% 400%',
    animation: 'gradientAnimation 10s ease infinite',
    padding: '20px',
    color:'white',
    fontSize:'20px',
  },
  header: {
    color: '#fff',
    fontSize: '3rem',
    marginBottom: '20px',
    textAlign: 'center',
  },
  godownDetails: {
    backgroundColor: 'rgba(218, 216, 224, 0.7)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    width: '90%',
    maxWidth: '600px',
  },
  godownHeader: {
    color: '#fff',
    fontSize: '1.5rem',
    marginBottom: '10px',
  },
  godownText: {
    color: '#fff',
    fontSize: '1.1rem',
    marginBottom: '5px',
  },
  input: {
    padding: '12px',
    width: '90%',
    margin: '10px 0',
    border: '1px solid #ccc',
    borderRadius: '20px',
    fontSize: '1rem',
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
  },
  button: {
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    color: '#fff',
    padding: '10px 20px',
    margin: '10px',
    border: 'none',
    borderRadius: '25px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(180, 180, 190, 0.95)',
    color: '#fff',
    padding: '10px 20px',
    margin: '10px',
    border: 'none',
    borderRadius: '25px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'not-allowed',
  },
  errorText: {
    color: 'red',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  message: {
    color: 'black',
    fontWeight: 'bold',
    margin: '10px 0',
    fontSize: '1.1rem',
  },
};

export default Dsale;
