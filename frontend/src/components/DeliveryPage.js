import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const DeliveryPage = () => {
  const [message, setMessage] = useState("");
  const location = useLocation();
  const godown = location.state ? location.state.godown : null;
  const displayedGodownName = godown ? godown.name : "";

  const [options, setOptions] = useState([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [godownNames, setGodownNames] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/products2")
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
      .post("http://localhost:5000/api/save/despatch", {
        selectedOption: selectedValue,
        inputValue: inputValue,
        godownName: displayedGodownName,
      })
      .then(() => {
        alert("Data saved successfully!");
        setSelectedValue("");
        setInputValue("");
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
      .post("http://localhost:5000/api/save/despatch", {
        selectedOption: selectedValue,
        inputValue: inputValue,
        godownName: displayedGodownName,
      })
      .then(() => {
        alert("Data saved successfully!");
        setInputValue("");
      })
      .catch((error) => {
        console.error("Error saving data:", error);
      });
  };

  useEffect(() => {
    if (isStarted && inputValue && selectedValue) {
      const timer = setTimeout(() => {
        if (isGodownNameMatched()) {
          axios
            .post("http://localhost:5000/api/save/despatch", {
              selectedOption: selectedValue,
              inputValue: inputValue,
              godownName: displayedGodownName,
            })
            .then(() => {
              console.log("Data auto-saved successfully!");
              setInputValue("");
            })
            .catch((error) => {
              console.error("Error saving data:", error);
            });
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [inputValue, selectedValue, isStarted, displayedGodownName]);

  const handleStop = () => {
    setIsSaving(false);
    setIsStarted(false);
    alert("Data saving stopped");
  };

  return (
    <div style={styles.container}>
      <style>{globalStyles}</style>
      <h2 style={styles.header}>Delivery Page</h2>
      {godown ? (
        <div style={styles.godownDetails}>
          <h3 style={styles.godownHeader}>Godown Details</h3>
          <p style={styles.godownText}>
            <strong>Name:</strong> {displayedGodownName}
          </p>
          <p style={styles.godownText}>
            <strong>Address:</strong> {godown.address}
          </p>
          <form style={styles.form}>
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

            <input
              style={styles.input}
              type="text"
              placeholder="Enter value"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <button style={styles.button} type="button" onClick={handleSave}>
              Save Data
            </button>

            <button
              style={styles.button}
              type="button"
              onClick={handleStart}
              disabled={isStarted || isSaving}
            >
              {isSaving ? "Saving..." : isStarted ? "Started" : "Start"}
            </button>

            <button
              style={styles.button}
              type="button"
              onClick={handleStop}
              disabled={!isStarted}
            >
              Stop
            </button>
          </form>
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
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)",
    backgroundSize: "400% 400%",
    animation: "gradientAnimation 10s ease infinite",
    padding: "20px",
    color:'white',
    fontSize:'20px',
  },
  header: {
    color: "#fff",
    fontSize: "3rem",
    marginBottom: "20px",
    textAlign: "center",
  },
  godownDetails: {
    backgroundColor: "rgba(218, 216, 224, 0.7)",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    width: "90%",
    maxWidth: "600px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  select: {
    padding: "10px",
    borderRadius: "28px",
    border: "1px solid #ccc",
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
  },
  input: {
    padding: "10px",
    borderRadius: "28px",
    border: "1px solid #ccc",
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
  },
  button: {
    padding: "10px",
    borderRadius: "28px",
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    color: "#fff",
    border: "none",
    cursor: "pointer",
    transition: "background 0.3s ease",
    fontSize:'20px',
  },
  errorText: {
    color: "red",
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  message: {
    fontSize: "1.1rem",
    color: "#fff",
    fontWeight: "bold",
  },
};

export default DeliveryPage;
