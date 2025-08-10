import React, { useState, useEffect } from "react";
import Barcode from "react-barcode";
import axios from "axios";
import { jsPDF } from "jspdf";
import JsBarcode from 'jsbarcode';
import * as XLSX from "xlsx";

const QRCreater = () => {
  const [product, setProduct] = useState("");
  const [packed, setPacked] = useState("");
  const [batch, setBatch] = useState("");
  const [shift, setShift] = useState("");
  const [numberOfBarcodes, setNumberOfBarcodes] = useState(1);
  const [location, setLocation] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [rewinder, setRewinder] = useState("");
  const [edge, setEdge] = useState("");
  const [winder, setWinder] = useState("");
  const [mixer, setMixer] = useState("");
  const [skuc, setSku] = useState("");
  const [skun, setSKU] = useState("");
  const [barcodeNumbers, setBarcodeNumbers] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [excelData, setExcelData] = useState([]); // To store parsed Excel data
  const [productSuggestions, setProductSuggestions] = useState([]); // For autocomplete

  // Fetch location using OpenCage API or reverse geolocation API
  const fetchLocation = async (lat, long) => {
    const apiKey = "1a49c2f11ba74841bb2b563c7569b33c"; // Replace with your OpenCage API key
    try {
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${long}&key=${apiKey}`
      );
      const { city, state, country } = response.data.results[0].components;
      setLocation(`${city || ""}, ${state}, ${country || ""}`);
    } catch (error) {
      console.error("Error fetching location:", error);
      setLocation("Location Unavailable");
    }
  };

  // Get current time and location on component mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchLocation(latitude, longitude); // Automatically get location from the device
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocation("Location Unavailable");
      }
    );

    // Set current time
    const date = new Date();
    setCurrentTime(date.toLocaleString());
  }, []);

  // Helper to get and set last used number for a SKU Code No in localStorage
  const getLastUsedNumber = (sku) => {
    const data = localStorage.getItem('barcode_last_number');
    if (!data) return 0;
    try {
      const obj = JSON.parse(data);
      return obj[sku] || 0;
    } catch {
      return 0;
    }
  };
  const setLastUsedNumber = (sku, num) => {
    const data = localStorage.getItem('barcode_last_number');
    let obj = {};
    if (data) {
      try { obj = JSON.parse(data); } catch { obj = {}; }
    }
    obj[sku] = num;
    localStorage.setItem('barcode_last_number', JSON.stringify(obj));
  };

  // Update barcodeNumbers when SKU Code No or numberOfBarcodes changes
  useEffect(() => {
    if (skuc && numberOfBarcodes > 0) {
      const start = getLastUsedNumber(skuc) + 1;
      const arr = Array.from({ length: Number(numberOfBarcodes) }, (_, i) => `${skuc}${start + i}`);
      setBarcodeNumbers(arr);
    } else {
      setBarcodeNumbers([]);
    }
  }, [skuc, numberOfBarcodes]);

  // Fetch and parse Excel file from backend on mount
  useEffect(() => {
    const fetchExcelFile = async () => {
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
        console.log("Fetching Excel file from:", `${backendUrl}/api/latest-excel-file`);
        
        const response = await fetch(`${backendUrl}/api/latest-excel-file`);
        console.log("Response status:", response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Response error:", errorText);
          throw new Error(`Failed to fetch Excel file: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log("Blob received, size:", blob.size);
        
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
            console.log("Raw Excel data:", data);
            
            // Assuming first row is header: [Sr No, Product Name, SKU Code No]
            const [header, ...rows] = data;
            const products = rows.map((row) => ({
              srNo: row[0],
              productName: row[1],
              skuCode: row[2],
            }));
            setExcelData(products);
            console.log("Loaded Excel Data:", products); // Debug log
          } catch (parseError) {
            console.error("Error parsing Excel file:", parseError);
          }
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
        };
        reader.readAsBinaryString(blob);
      } catch (error) {
        console.error("Error fetching Excel file:", error);
      }
    };
    fetchExcelFile();
  }, []);

  // Function to handle PDF creation for individual barcodes (Optimized Version)
  const handleDownloadAllBarcodesPDF = async () => {
    setIsDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: [4, 6], // 4x6 inches page size
      });

      const barcodeOptions = {
        format: "CODE128",
        width: 1.5, // Width of barcode lines
        height: 40, // Height of barcode lines
        displayValue: true, // Set to true to display the value
        fontSize: 24, // Font size for the value displayed by jsbarcode
        margin: 5, // Margin around the barcode (including text)
      };

      // Create a temporary canvas element
      const canvas = document.createElement('canvas');

      for (let index = 0; index < barcodeNumbers.length; index++) {
        const currentBarcodeNumber = barcodeNumbers[index];

        // Generate barcode on the temporary canvas
        JsBarcode(canvas, `${currentBarcodeNumber}`, barcodeOptions);
        const barcodeDataUrl = canvas.toDataURL("image/png"); // Get barcode as PNG

        // Add new page if not the first barcode
        if (index > 0) {
          doc.addPage();
        }

        // --- Add content to PDF page (adjust coordinates as needed) ---
        const pageW = 4; // inches
        const pageH = 6; // inches
        const margin = 0.5; // inches

        // Add Barcode Image (Scale width to fit, maintain aspect ratio)
        const barcodeImgWidth = 1.8; // Slightly increased width to accommodate text better potentially
        const barcodeImgHeight = (canvas.height / canvas.width) * barcodeImgWidth;
        doc.addImage(barcodeDataUrl, "PNG", margin, margin, barcodeImgWidth, barcodeImgHeight);

        // Add Text Details below barcode
        const textStartY = margin + barcodeImgHeight + 0.4; // Increased gap to accommodate barcode text
        let currentY = textStartY;
        const lineSpacing = 0.55;    // Base spacing between lines
        const fontSize = 19;          // Font size for details
        const availableWidth = pageW - (2 * margin); // Max width for text (pageWidth - leftMargin - rightMargin)

        doc.setFontSize(fontSize);
        doc.setFont("helvetica", "bold");

        // Helper function to add text and update Y position correctly
        const addTextLine = (text, y) => {
          const lines = doc.splitTextToSize(text, availableWidth);
          doc.text(lines, margin, y);
          return y + (lines.length * fontSize * 1.15 / 72); // Update Y based on number of lines (adjust multiplier 1.15 if needed)
        };

        currentY = addTextLine(`Barcode No: ${currentBarcodeNumber}`, currentY);
        currentY += (lineSpacing / 2); // Add a bit of spacing

        currentY = addTextLine(`SKU code no: ${skuc}`, currentY);
        currentY += (lineSpacing / 2);

        currentY = addTextLine(`SKU Name: ${skun}`, currentY); // Wrap SKU Name
        currentY += (lineSpacing / 2);

        currentY = addTextLine(`Location: ${location}`, currentY); // Wrap Location
        currentY += (lineSpacing / 2);

        currentY = addTextLine(`Packing Date: ${currentTime}`, currentY);

        // You can add other details (packed by, shift, operators) here if needed
        // currentY += lineSpacing;
        // doc.text(`Packed by: ${packed}`, margin, currentY);
        // ... add other fields ...
      }

      doc.save("barcodes.pdf");

    } catch (error) {
      console.error("Error generating PDF:", error);
      if (error.name === 'InvalidInputException') {
         alert(`Failed to generate PDF. Invalid data for barcode: ${error.message}`);
      } else {
         alert("Failed to generate PDF.");
      }
    } finally {
       setIsDownloading(false);
    }
  };

  // Function to handle printing of the final barcode
  const handlePrint = () => {
    const content = document.getElementById("barcode-total");

    if (content) {
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Final Barcode</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                text-align: center;
              }
              .barcode-container {
                width: 4in;
                height: 6in;
                text-align: center;
                margin: auto;
                font-weight: bold; /* Bold font */
                border: 1px solid #000; /* Optional border for the print layout */
              }
            </style>
          </head>
          <body>
            <div class="barcode-container">${content.innerHTML}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };


   // Function to handle saving data to the database
   const handleSaveToDatabase = async () => {
    const formData = {
      product,
      packed,
      batch,
      shift,
      numberOfBarcodes,
      location,
      currentTime,
      rewinder,
      edge,
      winder,
      mixer,
      skuc,
      skun,
      barcodeNumbers
    };

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(`${backendUrl}/api/saved`, formData);
      alert(response.data.message);
      // Update last used number for this SKU
      if (skuc && barcodeNumbers.length > 0) {
        const lastNum = parseInt(barcodeNumbers[barcodeNumbers.length - 1].replace(skuc, ''));
        setLastUsedNumber(skuc, lastNum);
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data.");
    }
  };

  return (
    <div style={styles.container1}>
          <style>{globalStyles}</style>
    {/* Excel Upload input removed */}
    <div style={styles.container}>
      <h2 style={styles.heading}>Generate Barcodes</h2>

      <div style={styles.form}>
        {/* Product Name with autocomplete */}
        <div style={{ ...styles.inputGroup, position: 'relative' }}>
          <label htmlFor="product" style={styles.label}>Product Name:</label>
          <input
            id="product"
            type="text"
            placeholder="Product name"
            value={product}
            onChange={(e) => {
              const value = e.target.value;
              setProduct(value);
              // Filter suggestions
              if (value.length > 0 && excelData.length > 0) {
                const suggestions = excelData.filter((item) =>
                  item.productName && item.productName.toLowerCase().startsWith(value.toLowerCase())
                );
                setProductSuggestions(suggestions);
                console.log("Suggestions:", suggestions); // Debug log
              } else {
                setProductSuggestions([]);
                console.log("Suggestions: []"); // Debug log
              }
            }}
            required
            style={styles.input}
            autoComplete="off"
          />
          {/* Suggestions dropdown */}
          {productSuggestions.length > 0 && (
            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              maxHeight: "120px",
              overflowY: "auto",
              position: "absolute",
              zIndex: 10,
              width: "100%"
            }}>
              {productSuggestions.map((item, idx) => (
                <li
                  key={idx}
                  style={{ padding: "8px", cursor: "pointer" }}
                  onClick={() => {
                    setProduct(item.productName);
                    setSku(item.skuCode);
                    setProductSuggestions([]);
                    // Do NOT setSKU here, so SKU Name is not auto-filled
                  }}
                >
                  {item.productName}
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Packed By */}
        <div style={styles.inputGroup}>
        <label htmlFor="packed" style={styles.label}>Packed By:</label>
        <input
          id="packed"
          type="text"
          placeholder="Packed by"
          value={packed}
          onChange={(e) => setPacked(e.target.value)}
          required
          style={styles.input}
        />
        </div>
        <div style={styles.inputGroup}>
        <label htmlFor="batch" style={styles.label}>Batch No:</label>
        <input
          id="batch"
          type="number"
          placeholder="Batch no"
          value={batch}
          onChange={(e) => setBatch(e.target.value)}
          required
          style={styles.input}
        />
        </div>
        <div style={styles.inputGroup}>
        <label htmlFor="shift" style={styles.label}>Shift (Day/Night):</label>
        <input
          id="shift"
          type="text"
          placeholder="Shift-Day/Night"
          value={shift}
          onChange={(e) => setShift(e.target.value)}
          required
          style={styles.input}
        />
        </div>
        <div style={styles.inputGroup}>
        <label htmlFor="rewinder" style={styles.label}>Rewinder Operator:</label>
        <input
          id="rewinder"
          type="text"
          placeholder="Rewinder operator"
          value={rewinder}
          onChange={(e) => setRewinder(e.target.value)}
          required
          style={styles.input}
        />
        </div>
         <div style={styles.inputGroup}>
         <label htmlFor="edge" style={styles.label}>Edge Cut Operator:</label>
         <input
          id="edge"
          type="text"
          placeholder="Edge Cut Operator"
          value={edge}
          onChange={(e) => setEdge(e.target.value)}
          required
          style={styles.input}
        />
        </div>
         <div style={styles.inputGroup}>
         <label htmlFor="winder" style={styles.label}>Winder Operator:</label>
         <input
          id="winder"
          type="text"
          placeholder="Winder Operator"
          value={winder}
          onChange={(e) => setWinder(e.target.value)}
          required
          style={styles.input}
        />
        </div>
         <div style={styles.inputGroup}>
         <label htmlFor="mixer" style={styles.label}>Mixer Operator:</label>
         <input
          id="mixer"
          type="text"
          placeholder="Mixer Operator"
          value={mixer}
          onChange={(e) => setMixer(e.target.value)}
          required
          style={styles.input}
        />
        </div>
        {/* SKU Code No (auto-filled, readOnly) */}
        <div style={styles.inputGroup}>
          <label htmlFor="skuc" style={styles.label}>SKU Code No:</label>
          <input
            id="skuc"
            type="text"
            placeholder="SKU code no"
            value={skuc}
            onChange={(e) => setSku(e.target.value)}
            required
            style={styles.input}
            readOnly
          />
        </div>
        {/* SKU Name (auto-filled, readOnly) */}
        <div style={styles.inputGroup}>
          <label htmlFor="skun" style={styles.label}>SKU Name:</label>
          <input
            id="skun"
            type="text"
            placeholder="SKU Name"
            value={skun}
            onChange={(e) => setSKU(e.target.value)}
            required
            style={styles.input}
          />
        </div>
        <div style={styles.inputGroup}>
        <label htmlFor="numberOfBarcodes" style={styles.label}>Number of Barcodes:</label>
        <input
          id="numberOfBarcodes"
          type="number"
          placeholder="Number of Barcodes"
          value={numberOfBarcodes}
          onChange={(e) => setNumberOfBarcodes(e.target.value)}
          required
          style={styles.input}
        />
        </div>

        <button
          className="styled-button"
          onClick={() => {
            handleSaveToDatabase();
          }}
        >
          Add
        </button>

         {/* Download All Barcodes PDF button */}
      <button
        className="styled-button"
        onClick={handleDownloadAllBarcodesPDF}
        disabled={isDownloading}
      >
        {isDownloading ? "Downloading..." : "Download All Barcodes as PDF"}
      </button>


      {/* Print Final Barcode button */}
      <button
        className="styled-button"
        onClick={handlePrint}
      >
        Print Final Barcode
      </button>

      </div>



      {/* Generate individual barcodes */}
      {/* Add a flex container for barcode cards with gap */}
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '30px' }}>
        {Array.from({ length: barcodeNumbers.length }).map((_, index) => (
          <div
            id={`barcode-div-${index}`}
            key={index}
            style={styles.barcodeContainer}
          >
            {/* Barcode value is SKU Code No + running number */}
            <Barcode
              value={barcodeNumbers[index]}
              width={2}
              height={60}
              fontSize={28}
            />
            <div style={styles.barcodeDetails}>
              <p style={{color:"black", fontSize:"15px", fontWeight:"bold"}}>
                <p>Barcode No: {barcodeNumbers[index]}</p>
                <p>SKU code no: {skuc}</p>
                <p>SKU Name: {skun}</p>
                <p>Location: {location}</p>
                <p>Packing Date: {currentTime}</p>
              </p>
            </div>
          </div>
        ))}
      </div>

     

      {/* Final barcode with the start and end batch numbers */}
      <div
        id="barcode-total"
        style={styles.finalBarcodeContainer}
      >
        <h3 style={styles.finalBarcodeHeading}>Final Barcode</h3>

        {/* Final barcode value showing barcode number range */}
        {barcodeNumbers.length > 0 && (
          <Barcode
            value={`${barcodeNumbers[0]}-${barcodeNumbers[barcodeNumbers.length - 1]}`}
            width={2}
            height={60}
            fontSize={28}
          />
        )}
        <div style={styles.barcodeDetails}>
          <p style={{color:"black", fontSize:"15px"}}>
            <h1>Start: {barcodeNumbers[0]}</h1>
            <h1>End: {barcodeNumbers[barcodeNumbers.length - 1]}</h1>
            <h1>SKU code no: {skuc}</h1>
            <h1>SKU Name: {skun}</h1>
            <h1>Location: {location}</h1>
            <h1>Packing Date: {currentTime}</h1>
          </p>
        </div>
      </div>

    </div>
    </div>
  );
};

const styles = {
  container1: {
    textAlign: "center",
    padding: "30px",
    fontFamily: "'Arial', sans-serif",
    background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
    backgroundSize: '400% 400%',
    animation: 'gradientAnimation 12s ease infinite',
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "1500px",
    margin: "auto",
  },
  container: {
    textAlign: "center",
    padding: "30px",
    fontFamily: "'Arial', sans-serif",
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "800px",
    margin: "auto",
  },
  heading: {
    color: "white",
    marginBottom: "30px",
    fontSize: "44px",
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "30px",
    alignItems: 'center',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: '400px',
    marginBottom: '5px',
  },
  label: {
    marginBottom: '5px',
    fontSize: '20px',
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    padding: "12px 15px",
    fontSize: "14px",
    border: "1px solid #ccc",
    borderRadius: "25px",
    width: "100%",
    boxSizing: 'border-box',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  barcodeContainer: {
    margin: "0 12px 24px 12px",
    padding: "15px",
    border: "none",
    backgroundColor: "transparent",
    textAlign: "left",
    fontSize: "10px",
    fontWeight: "bold",
    display: "inline-block",
    width: "200px",
    minWidth: "200px",
  },
  barcodeDetails: {
    fontSize: "12px",
    marginTop: "10px",
    color: "#555",
  },

  finalBarcodeContainer: {
    margin: "20px",
    padding: "15px",
    border: "none",
    backgroundColor: "transparent",
    textAlign: "left",
    fontSize: "10px",
    fontWeight: "bold",
    display: "inline-block",
    width: "100%",
  },
  finalBarcodeHeading: {
    fontSize: "35px",
    fontWeight: "bold",
    color: "black",
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

/* Base button styles */
.styled-button {
  margin: 10px;
  width: 100%;
  max-width: 400px;
  padding: 12px 20px;
  background-color: rgba(218, 216, 224, 0.8);
  color: #333;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.1s ease; /* Added transform transition */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center; /* Ensure text is centered */
}

.styled-button:hover {
  background-color: rgba(180, 180, 190, 0.95);
}

.styled-button:active {
  background-color: rgba(160, 160, 170, 1);
  transform: translateY(1px); /* Add a slight press down effect */
}
`;

export default QRCreater;
