import React, { useState, useEffect } from "react";
import Barcode from "react-barcode";
import axios from "axios";
import { jsPDF } from "jspdf";
import JsBarcode from 'jsbarcode';

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
  const [batchNumbers, setBatchNumbers] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Handle batch number collection and increment
  useEffect(() => {
    if (batch) {
      const startBatchNumber = parseInt(batch);
      setBatchNumbers(
        Array.from({ length: numberOfBarcodes }, (_, index) => startBatchNumber + index)
      );
    }
  }, [batch, numberOfBarcodes]);

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

      for (let index = 0; index < numberOfBarcodes; index++) {
        const currentBatchNumber = batchNumbers[index];

        // Generate barcode on the temporary canvas
        JsBarcode(canvas, `${currentBatchNumber}`, barcodeOptions);
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

        currentY = addTextLine(`Batch No: ${currentBatchNumber}`, currentY);
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
      batchNumbers
    };

    try {
      const response = await axios.post("http://13.235.75.71:5000/api/saved", formData);
      alert(response.data.message);
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Failed to save data.");
    }
  };

  return (
    <div style={styles.container1}>
          <style>{globalStyles}</style>
    <div style={styles.container}>
      <h2 style={styles.heading}>Generate Barcodes</h2>

      <div style={styles.form}>
      <div style={styles.inputGroup}>
        <label htmlFor="product" style={styles.label}>Product Name:</label>
        <input
          id="product"
          type="text"
          placeholder="Product name"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          required
          style={styles.input}
        />
        </div>
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
        />
        </div>
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
      {Array.from({ length: numberOfBarcodes }).map((_, index) => (
        <div
          id={`barcode-div-${index}`}
          key={index}
          style={styles.barcodeContainer}
        >
          {/* Only batch number in the barcode value */}
          <Barcode
            value={`${batchNumbers[index]}`}  // Only batch number
            width={2}
            height={60}
            fontSize={28}
          />

         <div style={styles.barcodeDetails}>
          {/* Displaying batch number only */}
           <p style={{color:"black", fontSize:"15px", fontWeight:"bold"}}>
           
            <p>Batch No: {batch}</p>
            <p>SKU code no: {skuc}</p>
            <p>SKU Name: {skun}</p>
            <p>Location: {location}</p>
            <p>Packing Date: {currentTime}</p></p>
           
          </div>
        </div>
      ))}

     

      {/* Final barcode with the start and end batch numbers */}
      <div
        id="barcode-total"
        style={styles.finalBarcodeContainer}
      >
        <h3 style={styles.finalBarcodeHeading}>Final Barcode</h3>

        {/* Final barcode value showing batch number range */}
    
        <Barcode
          value={`${batchNumbers[0]}-${batchNumbers[batchNumbers.length - 1]}`} // Batch number range
          width={2}
          height={60}
          fontSize={28}
        />
        <div style={styles.barcodeDetails}>
          {/* Displaying batch number range */}
          <p style={{color:"black", fontSize:"15px"}}>  
            <h1>Batch No:  {batchNumbers[batchNumbers.length - 1]}</h1>
            <h1>SKU code no: {skuc}</h1>
            <h1>SKU Name: {skun}</h1>
        
          <h1>Location: {location}</h1>
          <h1>Packing Date: {currentTime}</h1></p>
         
          
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
    margin: "20px auto",
    padding: "15px",
    border: "none",
    backgroundColor: "transparent",
    textAlign: "left",
    fontSize: "10px",
    fontWeight: "bold",
    display: "inline-block",
    width: "200px",
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
