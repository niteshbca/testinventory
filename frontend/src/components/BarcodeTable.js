import React, { useEffect, useState } from "react";

const BarcodeTable = () => {
  const [barcodes, setBarcodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Backend URL from environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${backendUrl}/api/barcodes`)
      .then((res) => res.json())
      .then((data) => setBarcodes(data))
      .catch((err) => console.error("Error fetching barcodes:", err));
  }, []);

  // 🔍 सर्च की गई लिस्ट
  const filteredBarcodes = barcodes.filter((barcode) =>
    barcode.product?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
        padding: "20px",
        boxSizing: "border-box",
        background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
        backgroundSize: '400% 400%',
        animation: 'gradientAnimation 12s ease infinite', }}>
      <h2 style={{ fontSize: "34px", marginBottom: "20px", color: "white" }}>Barcode Data</h2>

      {/* 🔍 Search Box */}
      <input
        type="text"
        placeholder="Search Product..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: "10px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          width: "250px",
          textAlign: "center",
        }}
      />

      <div style={{ overflowX: "auto" }}>
      <style>{globalStyles}</style>
        <table style={tableStyle}>
          <thead>
            <tr style={headerStyle}>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Packed</th>
              <th style={thStyle}>Batch</th>
              <th style={thStyle}>Shift</th>
              <th style={thStyle}>No. of Barcodes</th>
              <th style={thStyle}>Location</th>
              <th style={thStyle}>Current Time</th>
              <th style={thStyle}>Rewinder</th>
              <th style={thStyle}>Edge</th>
              <th style={thStyle}>Winder</th>
              <th style={thStyle}>Mixer</th>
              <th style={thStyle}>SKUC</th>
              <th style={thStyle}>SKUN</th>
              <th style={thStyle}>Batch Numbers</th>
            </tr>
          </thead>
          <tbody>
            {filteredBarcodes.map((barcode, index) => (
              <tr key={index} style={index % 2 === 0 ? rowEvenStyle : rowOddStyle}>
                <td style={tdStyle}>{barcode.product || "-"}</td>
                <td style={tdStyle}>{barcode.packed || "-"}</td>
                <td style={tdStyle}>{barcode.batch || "-"}</td>
                <td style={tdStyle}>{barcode.shift || "-"}</td>
                <td style={tdStyle}>{barcode.numberOfBarcodes || "-"}</td>
                <td style={tdStyle}>{barcode.location || "-"}</td>
                <td style={tdStyle}>{barcode.currentTime || "-"}</td>
                <td style={tdStyle}>{barcode.rewinder || "-"}</td>
                <td style={tdStyle}>{barcode.edge || "-"}</td>
                <td style={tdStyle}>{barcode.winder || "-"}</td>
                <td style={tdStyle}>{barcode.mixer || "-"}</td>
                <td style={tdStyle}>{barcode.skuc || "-"}</td>
                <td style={tdStyle}>{barcode.skun || "-"}</td>
                <td style={tdStyle}>
                  {barcode.batchNumbers?.length > 0 ? (
                    <select style={dropdownStyle}>
                      {barcode.batchNumbers.map((batch, i) => (
                        <option key={i} value={batch}>
                          {batch}
                        </option>
                      ))}
                    </select>
                  ) : (
                    "[]"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
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

// ✅ Table Styles
const tableStyle = {
  width: "90%",
  margin: "auto",
  borderCollapse: "collapse",
  backgroundColor: 'rgba(218, 216, 224, 0.8)',
  boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
  borderRadius: "8px",
  overflow: "hidden",
};

// ✅ Header Row Style
const headerStyle = {
    backgroundColor: 'rgba(218, 216, 224, 0.8)',
  color: "white",
  textAlign: "center",
};

// ✅ Table Header (th) Style
const thStyle = {
  padding: "12px",
  borderBottom: "2px solid #ddd",
  fontWeight: "bold",
};

// ✅ Table Data (td) Style
const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  textAlign: "center",
};

// ✅ Row Styles
const rowEvenStyle = { backgroundColor: "#f9f9f9" };
const rowOddStyle = { backgroundColor: "#ffffff" };

// ✅ Dropdown Style
const dropdownStyle = {
  padding: "5px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  backgroundColor: "#fff",
  cursor: "pointer",
};

export default BarcodeTable;
