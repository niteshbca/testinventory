import React, { useState, useEffect } from "react";
import axios from "axios";

const SelectForm = () => {
  const [options, setOptions] = useState([]); // Dropdown options
  const [selectedValue, setSelectedValue] = useState(""); // Selected dropdown value
  const [inputValue, setInputValue] = useState(""); // Input field value
  const [isSaving, setIsSaving] = useState(false); // Flag to track if data is being saved
  const [isStarted, setIsStarted] = useState(false); // Flag to track if the "Start" action has been triggered

  // Fetch unique values from the database when component mounts
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products")
      .then((response) => {
        setOptions(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  // Handle the start action - Save initial data
  const handleStart = () => {
    if (!selectedValue || !inputValue) {
      alert("Please select a value and enter input");
      return;
    }
    setIsSaving(true); // Start saving
    setIsStarted(true); // Mark that the "Start" button has been clicked

    // Save data to the database
    axios
      .post("http://localhost:5000/api/save", {
        selectedOption: selectedValue,
        inputValue: inputValue,
      })
      .then((response) => {
        alert("Data saved successfully!");
        setInputValue(""); // Reset input field after save
      })
      .catch((error) => {
        console.error("Error saving data:", error);
      });
  };

  // Automatically save data as user types in the input field
  useEffect(() => {
    if (isStarted && inputValue && selectedValue) {
      const timer = setTimeout(() => {
        axios
          .post("http://localhost:5000/api/save", {
            selectedOption: selectedValue,
            inputValue: inputValue,
          })
          .then((response) => {
            console.log("Data auto-saved successfully!");
            setInputValue(""); // Reset input field after auto-save
          })
          .catch((error) => {
            console.error("Error saving data:", error);
          });
      }, 500); // Save data after 500ms of typing

      return () => clearTimeout(timer); // Clean up timer if the user stops typing
    }
  }, [inputValue, selectedValue, isStarted]);

  // Stop saving
  const handleStop = () => {
    setIsSaving(false);
    setIsStarted(false);
    alert("Data saving stopped");
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
    select: {
      width: "80%",
      padding: "10px",
      margin: "10px 0",
      borderRadius: "28px",
      border: "1px solid #ccc",
      fontSize: "16px",
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
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
        <h2 style={styles.title}>Select Form</h2>
        <form>
          {/* Select field */}
          <select
            style={styles.select}
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
            disabled={isStarted || isSaving}
          >
            {isSaving ? "Saving..." : isStarted ? "Started" : "Start"}
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
      </div>
      <style>{globalStyles}</style>
    </div>
  );
};

export default SelectForm;
