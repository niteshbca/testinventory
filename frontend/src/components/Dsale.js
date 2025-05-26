import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const Dsale = () => {
  const [message, setMessage] = useState('');
  const location = useLocation();
  const godown = location.state ? location.state.godown : null;
  const displayedGodownName = godown ? godown.name : "";

  const [options, setOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [username, setUsername] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [godownNames, setGodownNames] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products3")
      .then((response) => {
        const uniqueOptions = Array.from(
          new Set(response.data.map((item) => item.selectedOption))
        );
        setOptions(uniqueOptions);

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

  const handleSave = () => {
    if (!selectedValue || !inputValue) {
      alert("Please select a value and enter input");
      return;
    }

    if (!isGodownNameMatched()) {
      alert("Godown Name does not match. Cannot save data.");
      return;
    }

    axios
      .post("http://localhost:5000/api/save/delevery1", {
        selectedOption: selectedValue,
        inputValue: inputValue,
        username: username,
        mobileNumber: mobileNumber,
        godownName: displayedGodownName,
      })
      .then((response) => {
        alert("Data saved successfully!");
        setSelectedValue("");
        setInputValue("");
        setUsername("");
        setMobileNumber("");
      })
      .catch((error) => {
        alert(error.response?.data?.message || "Error saving data");
      });
  };

  const handleStart = () => {
    if (!selectedValue || !inputValue) {
      alert("Please select a value and enter input");
      return;
    }

    if (!isGodownNameMatched()) {
      alert("Godown Name does not match. Cannot start saving.");
      return;
    }

    setIsSaving(true);
    setIsStarted(true);

    axios
      .post("http://localhost:5000/api/save/delevery1", {
        selectedOption: selectedValue,
        inputValue: inputValue,
        username: username,
        mobileNumber: mobileNumber,
        godownName: displayedGodownName,
      })
      .then((response) => {
        alert("Data saved successfully!");
        setInputValue("");
        setUsername("");
        setMobileNumber("");
      })
      .catch((error) => {
        console.error("Error saving data:", error);
      });
  };

  const handleStop = () => {
    setIsSaving(false);
    setIsStarted(false);
    alert("Data saving stopped");
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
          
          <div style={styles.formGroup}>
            <select
              style={styles.input}
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
            >
              <option value="">Select a Product</option>
              {options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.formGroup}>
            <input
              type="text"
              placeholder="Enter value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <input
              type="text"
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <input
              type="text"
              placeholder="Enter Mobile Number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button style={styles.button} onClick={handleSave}>
              Save Data
            </button>
            <button style={styles.button} onClick={handleStart} disabled={isStarted || isSaving}>
              {isSaving ? "Saving..." : isStarted ? "Started" : "Start"}
            </button>
            <button style={styles.button} onClick={handleStop} disabled={!isStarted}>
              Stop
            </button>
          </div>
        </div>
      ) : (
        <p style={styles.errorText}>No Godown Data Available</p>
      )}
      <p style={styles.message}>{message}</p>
    </div>
  );
};

const globalStyles = `
@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
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
  },
  header: {
    color: '#fff',
    fontSize: '2.5rem',
    marginBottom: '20px',
    textAlign: 'center',
  },
  godownDetails: {
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    width: '90%',
    maxWidth: '500px',
    color:'white',
    fontSize: '1.5rem',
  },
  formGroup: {
    marginBottom: '15px',
  },
  input: {
    width: '89%',
    padding: '10px',
    borderRadius: '25px',
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    border: '0px solid white',
    fontSize: '1rem',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '25px',
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
  },
  errorText: {
    color: 'red',
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  message: {
    fontSize: '1.2rem',
    color: '#fff',
    fontWeight: 'bold',
  },
};

export default Dsale;
