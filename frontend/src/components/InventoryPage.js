import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const InventoryPage = () => {
  const location = useLocation();
  const godown = location.state?.godown; // Retrieve the godown data

  const [data, setData] = useState([]);
  const [message, setMessage] = useState("");

  // Fetch data from backend (MongoDB) and filter by godown name
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/delevery1") // Updated endpoint
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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)",
        backgroundSize: "400% 400%",
        animation: "gradientAnimation 8s ease infinite",
        padding: "20px",
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <style>
        {`
          @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes hoverGlow {
            from { box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); }
            to { box-shadow: 0 0 20px rgba(0, 0, 0, 0.3); }
          }
        `}
      </style>

      <h2
        style={{
          color: "white",
          fontSize: "3rem",
          marginBottom: "20px",
          textAlign: "center",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        }}
      >
        Item Inventory
      </h2>

      {godown && (
        <div
          style={{
            backgroundColor: "rgba(218, 216, 224, 0.6)",
            backgroundSize: "200% 200%",
            animation: "divAnimation 3s ease-in-out infinite",
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
            width: "90%",
            maxWidth: "500px",
            marginBottom: "20px",
            textAlign: "center",
            color: "#fff",
            fontWeight: "bold",
          }}
        >
          <p style={{ fontSize: "1.2rem", margin: "5px 0" }}>
            <strong>Godown Name:</strong> {godown.name}
          </p>
          <p style={{ fontSize: "1.2rem", margin: "5px 0" }}>
            <strong>Godown Address:</strong> {godown.address}
          </p>
        </div>
      )}

      {message && (
        <p
          style={{
            fontSize: "1.2rem",
            color: "#ff4e50",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          {message}
        </p>
      )}

<table
  style={{
    width: '70%',
    borderCollapse: 'collapse',
    border: '2px solid #ccc',
    borderRadius: '10px',
    overflow: 'hidden',
    margin: '20px 0',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  }}
>
  <thead>
    <tr style={{ backgroundColor: '#f0f0f0' }}>
      <th
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          textAlign: 'center',
        }}
      >
        Serial No.
      </th>
      <th
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          textAlign: 'center',
        }}
      >
        Item
      </th>
      <th
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          textAlign: 'center',
        }}
      >
        Count
      </th>
      <th
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          textAlign: 'center',
        }}
      >
        Total Barcode
      </th>
    </tr>
  </thead>
  <tbody>
    {groupData().map((group, index) => (
      <tr
        key={index}
        style={{
          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9',
          textAlign: 'center',
        }}
      >
        <td style={{ border: '1px solid #ccc', padding: '10px' }}>
          {index + 1}
        </td>
        <td style={{ border: '1px solid #ccc', padding: '10px' }}>
          {group.option}
        </td>
        <td style={{ border: '1px solid #ccc', padding: '10px' }}>
          {group.count}
        </td>
        <td style={{ border: '1px solid #ccc', padding: '10px' }}>
          <select style={{ padding: '5px', borderRadius: '5px' }}>
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
  );
};

export default InventoryPage;
