import React, { useState, useEffect } from "react";
import axios from "axios";

import { useLocation } from 'react-router-dom';

function Dgodowndetails() {
  const location = useLocation();
  const { godown } = location.state; // Access godown data from the state
  const [options, setOptions] = useState([]); // Dropdown options
  const [selectedValue, setSelectedValue] = useState(""); // Selected dropdown value
  const [inputValue, setInputValue] = useState(""); // Input field value
  const [isSaving, setIsSaving] = useState(false); // Flag to track if data is being saved
  const [isStarted, setIsStarted] = useState(false); // Flag to track if the "Start" action has been triggered

  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch data from backend (MongoDB) and filter by godown name
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/despatch")
      .then((response) => {
        console.log("API Response: ", response.data); // Debugging: Check API response
        
        // Filter the data to match godown name
        const filteredData = response.data.filter(
          (item) => item.godownName === godown?.name
        );
        setData(filteredData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setMessage("Error fetching data.");
      });
  }, [godown]);

  // Group selected options and count their occurrences
  const groupData = () => {
    const grouped = {};

    data.forEach((item) => {
      if (grouped[item.selectedOption]) {
        grouped[item.selectedOption].count += 1;
        grouped[item.selectedOption].inputValues.push(item.inputValue);
      } else {
        grouped[item.selectedOption] = {
          option: item.selectedOption,
          count: 1,
          inputValues: [item.inputValue],
        };
      }
    });

    return Object.values(grouped);
  };


  useEffect(() => {
    axios.get("http://localhost:5000/api/products1")
      .then(response => {
        const uniqueOptions = Array.from(new Set(response.data.map(item => item.selectedOption)));
        setOptions(uniqueOptions);
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  const handleSave = () => {
    if (!selectedValue || !inputValue) {
      alert("Please select a value and enter input");
      return;
    }
  
    axios.post("http://localhost:5000/api/save/select", {
      selectedOption: selectedValue,
      inputValue: inputValue,
      godownName: godown.name, // Godown name add kiya
    })
      .then(response => {
        alert("Data saved successfully!");
        setSelectedValue("");
        setInputValue("");
      })
      .catch(error => {
        alert(error.response?.data?.message || "Error saving data");
      });
  };

  const handleStart = () => {
    if (!selectedValue || !inputValue) {
      alert("Please select a value and enter input");
      return;
    }
    setIsSaving(true);
    setIsStarted(true);
  
    axios.post("http://localhost:5000/api/save/select", {
      selectedOption: selectedValue,
      inputValue: inputValue,
      godownName: godown.name, // Godown name add kiya
    })
      .then(response => {
        alert("Data saved successfully!");
        setInputValue("");
      })
      .catch(error => {
        console.error("Error saving data:", error);
      });
  };
  
  useEffect(() => {
    if (isStarted && inputValue && selectedValue) {
      const timer = setTimeout(() => {
        axios.post("http://localhost:5000/api/save/select", {
          selectedOption: selectedValue,
          inputValue: inputValue,
          godownName: godown.name,
        })
          .then(response => {
            console.log("Data auto-saved successfully!");
            setInputValue("");
          })
          .catch(error => {
            console.error("Error saving data:", error);
          });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [inputValue, selectedValue, isStarted]);

  const handleStop = () => {
    setIsSaving(false);
    setIsStarted(false);
    alert("Data saving stopped");
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
      padding: '12px 30px',
      backgroundColor: 'rgba(218, 216, 224, 0.8)',
      color: '#fff',
      border: 'none',
      borderRadius: '30px',
      fontSize: '1rem',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 5px 15px rgba(247, 244, 239, 0.4)',
    },
    buttonHover: {
      background: 'linear-gradient(218, 216, 224, 0.8)',
      transform: 'translateY(-3px) scale(1.1)',
      boxShadow: '0 8px 20px rgba(235, 232, 228, 0.6)',
    },
    itemList: {
      listStyleType: 'none',
      padding: 0,
      marginTop: '20px',
    },
    listItem: {
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '30px',
      marginBottom: '10px',
      background: '#f9f9f9',
      color: '#333',
      boxShadow: '0 5px 10px rgba(0, 0, 0, 0.1)',
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
<form style={{ marginBottom: '20px' }}>
  <select 
    value={selectedValue} 
    onChange={(e) => setSelectedValue(e.target.value)}
    style={{ 
      padding: '8px', 
      marginBottom: '10px', 
      borderRadius: '25px', 
      border: '1px solid #ccc', 
      width: '90%' ,
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
    }}
  >
    <option value="">Select a Product</option>
    {options.map((option, index) => (
      <option key={index} value={option}>{option}</option>
    ))}
  </select>

  <input
    type="text"
    placeholder="Enter value"
    value={inputValue}
    onChange={(e) => setInputValue(e.target.value)}
    style={{ 
      padding: '8px', 
      marginBottom: '10px', 
      borderRadius: '25px', 
      border: '1px solid #ccc', 
      width: '90%' ,
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
    }}
  />

  <button 
    type="button" 
    onClick={handleSave} 
    style={{ 
      padding: '10px 15px', 
      marginRight: '10px', 
      borderRadius: '25px', 
      border: 'none', 
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
      color: '#fff', 
      cursor: 'pointer', 
      fontSize:'18px'
    }}
  >
    Save Data
  </button>

  <button 
    type="button" 
    onClick={handleStart} 
    disabled={isStarted || isSaving}
    style={{ 
      padding: '10px 15px', 
      marginRight: '10px', 
      borderRadius: '25px', 
      border: 'none', 
      fontSize:'18px',
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
      color: '#fff', 
      cursor: isStarted || isSaving ? 'not-allowed' : 'pointer' 
    }}
  >
    {isSaving ? "Saving..." : isStarted ? "Started" : "Start"}
  </button>

  <button 
    type="button" 
    onClick={handleStop} 
    disabled={!isStarted}
    style={{ 
      padding: '10px 15px', 
      borderRadius: '25px', 
      border: 'none', 
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
      color: '#fff', 
      cursor: !isStarted ? 'not-allowed' : 'pointer' ,
      fontSize:'18px',
    }}
  >
    Stop
  </button>
</form>

<table style={{ 
  width: '100%', 
  borderCollapse: 'collapse', 
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' 
}}>
  <thead>
    <tr style={{  backgroundColor: 'rgba(218, 216, 224, 0.6)', textAlign: 'left' }}>
      <th style={{ border: '1px solid #ddd', padding: '10px' }}>Serial No.</th>
      <th style={{ border: '1px solid #ddd', padding: '10px' }}>Item</th>
      <th style={{ border: '1px solid #ddd', padding: '10px' }}>Count</th>
      <th style={{ border: '1px solid #ddd', padding: '10px' }}>Total Barcode</th>
    </tr>
  </thead>
  <tbody>
    {groupData().map((group, index) => (
      <tr key={index} style={{ textAlign: 'center', backgroundColor: index % 2 === 0 ? 'rgba(218, 216, 224, 0.6)' : 'rgba(218, 216, 224, 0.6)' }}>
        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{index + 1}</td>
        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{group.option}</td>
        <td style={{ border: '1px solid #ddd', padding: '10px' }}>{group.count}</td>
        <td style={{ border: '1px solid #ddd', padding: '10px' }}>
          <select style={{ padding: '5px', borderRadius: '5px', border: '1px solid #ccc' }}>
            {group.inputValues.map((barcode, barcodeIndex) => (
              <option key={barcodeIndex} value={barcode}>
                {barcode}
              </option>
            ))}
          </select>
        </td>
      </tr>
    ))}
  </tbody>
</table>
</div>
    </div>
  );
}

export default Dgodowndetails;
