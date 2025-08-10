import React, { useState, useEffect } from "react";
import axios from "axios";

const SelectForm = () => {
  const [inputValue, setInputValue] = useState(""); // Input field value
  const [isSaving, setIsSaving] = useState(false); // Flag to track if data is being saved
  const [isStarted, setIsStarted] = useState(false); // Flag to track if the "Start" action has been triggered
  const [savedValues, setSavedValues] = useState([]); // Track saved values

  // Backend URL from environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Auto-save effect when started and input changes
  useEffect(() => {
    if (isStarted && inputValue.trim()) {
      const timer = setTimeout(() => {
        // Save the current input value
        axios
          .post(`${backendUrl}/api/save`, {
            inputValue: inputValue,
          })
          .then((response) => {
            console.log("Data auto-saved successfully!");
            // Add to saved values list at the beginning (top)
            setSavedValues(prev => [inputValue, ...prev]);
            // Clear the input field after saving
            setInputValue("");
          })
          .catch((error) => {
            console.error("Error saving data:", error);
          });
      }, 1000); // Save after 1 second of no typing

      return () => clearTimeout(timer);
    }
  }, [inputValue, isStarted]);

  // Handle the start action - Start auto-saving
  const handleStart = () => {
    if (!inputValue) {
      alert("Please enter a value first");
      return;
    }
    
    // Save the current input value immediately
    axios
      .post(`${backendUrl}/api/save`, {
        inputValue: inputValue,
      })
      .then((response) => {
        console.log("Initial data saved successfully!");
        // Add to saved values list at the beginning (top)
        setSavedValues(prev => [inputValue, ...prev]);
        // Clear the input field after saving
        setInputValue("");
        setIsSaving(true); // Start saving
        setIsStarted(true); // Mark that the "Start" button has been clicked
        alert("Auto-saving started! Just type values and they will be saved automatically after 1 second.");
      })
      .catch((error) => {
        console.error("Error saving data:", error);
        alert("Error saving data. Please try again.");
      });
  };

  // Stop saving
  const handleStop = () => {
    setIsSaving(false);
    setIsStarted(false);
    setSavedValues([]); // Clear saved values
    alert("Auto-saving stopped");
  };

  // Styles
  const styles = {
    container: {
      background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
      backgroundSize: '400% 400%',
      animation: 'gradientAnimation 12s ease infinite',
      minHeight: "100vh",
      padding: "20px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "'Roboto', sans-serif",
      color: "#333",
    },
    formContainer: {
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
      padding: "20px",
      borderRadius: "15px",
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
      textAlign: "center",
      width: "80%",
      maxWidth: "500px",
    },
    title: {
      fontSize: "2.5rem",
      color: "white",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.4)",
      marginBottom: "20px",
    },
    input: {
      width: "80%",
      padding: "10px",
      margin: "10px 0",
      borderRadius: "28px",
      border: "1px solid #ccc",
      fontSize: "16px",
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
    },
    button: {
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
      color: "white",
      padding: "10px 20px",
      margin: "10px",
      border: "none",
      borderRadius: "28px",
      fontSize: "20px",
      cursor: "pointer",
      transition: "background 0.3s",
    },
    buttonHover: {
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
    },
    savedValuesList: {
      marginTop: "20px",
      textAlign: "left",
      maxHeight: "200px",
      overflowY: "auto",
      backgroundColor: "rgba(255, 255, 255, 0.8)",
      padding: "10px",
      borderRadius: "8px",
    },
    savedValue: {
      padding: "5px",
      margin: "2px 0",
      backgroundColor: "rgba(0, 255, 0, 0.2)",
      borderRadius: "4px",
    },
    status: {
      color: "white",
      fontSize: "14px",
      marginTop: "10px",
      fontStyle: "italic",
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
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Auto Save Form</h2>
        <form>
          {/* Input field */}
          <input
            style={styles.input}
            type="text"
            placeholder="Enter value"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          {/* Start Button */}
          <button
            type="button"
            style={styles.button}
            onMouseEnter={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
            onClick={handleStart}
            disabled={isStarted}
          >
            {isSaving ? "Auto-saving Active" : "Start Auto-save"}
          </button>

          {/* Stop Button */}
          <button
            type="button"
            style={styles.button}
            onMouseEnter={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
            onMouseLeave={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
            onClick={handleStop}
            disabled={!isStarted}
          >
            Stop
          </button>
        </form>

        {/* Status message */}
        {isStarted && (
          <div style={styles.status}>
            Auto-saving is active. Type values and they will be saved automatically after 1 second.
          </div>
        )}

        {/* Show saved values */}
        {savedValues.length > 0 && (
          <div style={styles.savedValuesList}>
            <h4 style={{ margin: "0 0 10px 0", color: "white" }}>Saved Values:</h4>
            {savedValues.map((value, index) => (
              <div key={index} style={styles.savedValue}>
                {value}
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{globalStyles}</style>
    </div>
  );
};

export default SelectForm;
