import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import './Billing.css'; // Import the new stylesheet

function Billing() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [customerItems, setCustomerItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [showInventoryStatus, setShowInventoryStatus] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [priceType, setPriceType] = useState('price'); // 'price' or 'masterPrice'
  const [upiId, setUpiId] = useState('your-upi-id@bank'); // Default UPI ID
  const [showUpiInput, setShowUpiInput] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [godowns, setGodowns] = useState({ matchingGodowns: [], nonMatchingGodowns: [] });
  const [selectedGodown, setSelectedGodown] = useState('');
  const [showGodowns, setShowGodowns] = useState(false);
  const [godownItems, setGodownItems] = useState([]);
  const [selectedGodownData, setSelectedGodownData] = useState(null);
  const [availableItems, setAvailableItems] = useState([]);
  const navigate = useNavigate();
  const billRef = useRef();

  // Backend URL from environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  // Fetch all customers
  useEffect(() => {
    axios.get(`${backendUrl}/api/customers/`)
      .then(response => {
        setCustomers(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  // Fetch items when customer is selected
  useEffect(() => {
    if (selectedCustomer) {
      console.log('Fetching items for billing customer:', selectedCustomer);
      axios.get(`${backendUrl}/api/bills/customer/${selectedCustomer}/items`)
        .then(response => {
          console.log('Billing items received:', response.data);
          setCustomerItems(response.data);
        })
        .catch((error) => {
          console.log('Error fetching billing items:', error);
        });

      // Fetch godowns sorted by location matching
      axios.get(`${backendUrl}/api/godowns/sorted/${selectedCustomer}`)
        .then(response => {
          console.log('Godowns received:', response.data);
          setGodowns(response.data);
          setShowGodowns(true);
        })
        .catch((error) => {
          console.log('Error fetching godowns:', error);
        });
    } else {
      setShowGodowns(false);
      setSelectedGodown('');
    }
  }, [selectedCustomer]);

  // Calculate total amount when selected items change
  useEffect(() => {
    const total = selectedItems.reduce((sum, item) => sum + item.total, 0);
    setTotalAmount(total);
  }, [selectedItems]);

  const handleCustomerChange = async (e) => {
    const customerId = e.target.value;
    setSelectedCustomer(customerId);
    setSelectedItems([]);
    setShowInventoryStatus(false);
    setShowQRCode(false);

    // If godown is also selected, fetch and match items
    if (customerId && selectedGodown) {
      await fetchAndMatchItems(customerId, selectedGodown);
    } else {
      setAvailableItems([]);
    }
  };

  const handlePriceTypeChange = (e) => {
    setPriceType(e.target.value);
    // Recalculate totals with new price type
    const updatedItems = selectedItems.map(item => {
      const selectedPrice = e.target.value === 'masterPrice' ? item.masterPrice : item.price;
      return {
        ...item,
        selectedPrice: selectedPrice,
        total: item.quantity * selectedPrice
      };
    });
    setSelectedItems(updatedItems);
  };

  // Function to fetch and match items based on 3-digit prefix
  const fetchAndMatchItems = async (customerId, godownId) => {
    try {
      console.log('Fetching and matching items for customer:', customerId, 'godown:', godownId);

      // Get billing items for customer
      const billingResponse = await axios.get(`${backendUrl}/api/bills/customer/${customerId}/items`);
      const billingItems = billingResponse.data;
      console.log('Billing items:', billingItems);

      // Get delevery1 items for godown
      const delevery1Response = await axios.get(`${backendUrl}/api/delevery1`);
      const delevery1Items = delevery1Response.data;
      console.log('Delevery1 items:', delevery1Items);

      // Get godown details
      const godownResponse = await axios.get(`${backendUrl}/api/godowns/${godownId}`);
      const godownName = godownResponse.data.name;
      console.log('Godown name:', godownName);

      // Filter delevery1 items for this godown
      const godownDelevery1Items = delevery1Items.filter(item => item.godownName === godownName);
      console.log('Godown delevery1 items:', godownDelevery1Items);

      // Match billing items with delevery1 items based on 3-digit prefix
      const matchedItems = billingItems.map(billingItem => {
        const billingItemName = billingItem.name || '';
        const prefix = billingItemName.substring(0, 3); // Get first 3 digits

        console.log(`Matching billing item: ${billingItemName}, prefix: ${prefix}`);

        // Find all delevery1 items that start with this prefix
        const matchingDelevery1Items = godownDelevery1Items.filter(deleveryItem => {
          const inputValue = deleveryItem.inputValue || '';
          return inputValue.startsWith(prefix);
        });

        console.log(`Found ${matchingDelevery1Items.length} matching items for prefix ${prefix}`);

        return {
          ...billingItem,
          itemName: billingItem.name,
          availableQuantity: matchingDelevery1Items.length,
          matchingItems: matchingDelevery1Items,
          prefix: prefix
        };
      });

      console.log('Matched items:', matchedItems);
      setAvailableItems(matchedItems);

    } catch (error) {
      console.error('Error fetching and matching items:', error);
      setAvailableItems([]);
    }
  };

  const handleGodownChange = async (e) => {
    const godownId = e.target.value;
    setSelectedGodown(godownId);

    if (godownId) {
      // Fetch items from selected godown
      try {
        const response = await axios.get(`${backendUrl}/api/godowns/${godownId}/items`);
        console.log('Godown items received:', response.data);
        setGodownItems(response.data.items);
        setSelectedGodownData(response.data.godown);

        // If customer is also selected, fetch and match items
        if (selectedCustomer) {
          await fetchAndMatchItems(selectedCustomer, godownId);
        }
      } catch (error) {
        console.log('Error fetching godown items:', error);
        setGodownItems([]);
        setSelectedGodownData(null);
      }
    } else {
      setGodownItems([]);
      setSelectedGodownData(null);
      setAvailableItems([]);
    }
  };

  const addItemToBill = (item) => {
    const existingItem = selectedItems.find(selected => selected.itemId === item._id);
    const selectedPrice = priceType === 'masterPrice' ? item.masterPrice : item.price;
    
    if (existingItem) {
      // If item already exists, increase quantity
      const updatedItems = selectedItems.map(selected => 
        selected.itemId === item._id 
          ? { 
              ...selected, 
              quantity: selected.quantity + 1, 
              selectedPrice: selectedPrice,
              total: (selected.quantity + 1) * selectedPrice 
            }
          : selected
      );
      setSelectedItems(updatedItems);
    } else {
      // Add new item
      const newItem = {
        itemId: item._id,
        itemName: item.itemName || item.name, // Handle both godown items and customer items
        price: item.price,
        masterPrice: item.masterPrice,
        selectedPrice: selectedPrice,
        quantity: 1,
        total: selectedPrice
      };
      setSelectedItems([...selectedItems, newItem]);
    }
  };

  const increaseQuantity = (itemId) => {
    const updatedItems = selectedItems.map(item => 
      item.itemId === itemId 
        ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.selectedPrice }
        : item
    );
    setSelectedItems(updatedItems);
  };

  const decreaseQuantity = (itemId) => {
    const updatedItems = selectedItems.map(item => {
      if (item.itemId === itemId) {
        const newQuantity = Math.max(0, item.quantity - 1);
        return { ...item, quantity: newQuantity, total: newQuantity * item.selectedPrice };
      }
      return item;
    }).filter(item => item.quantity > 0); // Remove items with quantity 0
    setSelectedItems(updatedItems);
  };

  const removeItem = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.itemId !== itemId));
  };

  const checkInventory = async () => {
    if (selectedItems.length === 0) {
      alert('Please add items to the bill first');
      return;
    }

    if (!selectedGodown) {
      alert('Please select a godown first');
      return;
    }

    const itemsToCheck = selectedItems.map(item => ({
      itemName: item.itemName,
      quantity: item.quantity
    }));

    console.log('Checking inventory for items:', itemsToCheck);
    console.log('Selected godown:', selectedGodown);

    try {
      const response = await axios.post(`${backendUrl}/api/inventory/check-availability`, {
        items: itemsToCheck,
        godownId: selectedGodown
      });
      console.log('Inventory check response:', response.data);
      setInventoryStatus(response.data);
      setShowInventoryStatus(true);
    } catch (error) {
      console.log(error);
      alert('Error checking inventory');
    }
  };

  const downloadPDF = async () => {
    if (selectedItems.length === 0) {
      alert('Please add items to the bill first');
      return;
    }

    const selectedCustomerData = customers.find(c => c._id === selectedCustomer);

    // Calculate total amount to ensure it's correct
    const calculatedTotal = selectedItems.reduce((sum, item) => sum + item.total, 0);
    console.log('Selected items:', selectedItems);
    console.log('Calculated total:', calculatedTotal);
    console.log('Current totalAmount state:', totalAmount);

    try {
      // Create a temporary div for PDF generation
      const pdfContent = document.createElement('div');
      pdfContent.style.padding = '20px';
      pdfContent.style.fontFamily = 'Arial, sans-serif';
      pdfContent.style.backgroundColor = 'white';
      pdfContent.style.color = 'black';
      pdfContent.style.width = '800px';
      pdfContent.style.minHeight = '600px';
      pdfContent.style.position = 'absolute';
      pdfContent.style.left = '-9999px';
      pdfContent.style.top = '0';
      
      pdfContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">INVOICE</h1>
          <div style="border-bottom: 2px solid #3498db; width: 100px; margin: 0 auto;"></div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h3 style="color: #2c3e50; margin-bottom: 10px;">Bill To:</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${selectedCustomerData.name}</p>
              <p style="margin: 5px 0;"><strong>GST No:</strong> ${selectedCustomerData.gstNo || 'N/A'}</p>
              <p style="margin: 5px 0;"><strong>Address:</strong> ${selectedCustomerData.address}</p>
              <p style="margin: 5px 0;"><strong>City:</strong> ${selectedCustomerData.city}</p>
              <p style="margin: 5px 0;"><strong>State:</strong> ${selectedCustomerData.state}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${selectedCustomerData.phoneNumber || 'N/A'}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Price Type:</strong> ${priceType === 'masterPrice' ? 'Master Price' : 'Regular Price'}</p>
              ${selectedGodownData ? `<p style="margin: 5px 0;"><strong>Godown:</strong> ${selectedGodownData.name}</p>` : ''}
            </div>
          </div>
        </div>
        
        <div style="margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Item Name</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Price (₹)</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Quantity</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${selectedItems.map(item => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 12px;">${item.itemName}</td>
                  <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">₹${item.selectedPrice}</td>
                  <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
                  <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${item.total}</td>
                </tr>
              `).join('')}
              <tr style="background-color: #f8f9fa; font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;" colspan="3">
                  <strong>TOTAL AMOUNT:</strong>
                </td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right; font-size: 18px; color: #2c3e50;">
                  <strong>₹${calculatedTotal}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="text-align: right; margin-top: 20px; margin-bottom: 30px;">
          <h2 style="color: #2c3e50; margin: 0; font-size: 24px;">Grand Total: ₹${calculatedTotal}</h2>
        </div>
        
        <div style="margin-top: 50px; text-align: center; color: #7f8c8d; font-size: 12px;">
          <p>Thank you for your business!</p>
        </div>
      `;
      
      document.body.appendChild(pdfContent);

      // Wait a moment for the content to render
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: pdfContent.scrollWidth,
        height: pdfContent.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      document.body.removeChild(pdfContent);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`bill_${selectedCustomerData.name}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const shareQRCodeOnWhatsApp = async () => {
    if (!qrCodeImage) {
      alert('Please generate a QR Code first.');
      return;
    }

    try {
      const response = await fetch(qrCodeImage);
      const blob = await response.blob();
      const file = new File([blob], 'qrcode.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Payment QR Code',
          text: `Scan this QR code to pay ₹${totalAmount}`,
        });
      } else {
        const link = document.createElement('a');
        link.href = qrCodeImage;
        link.download = 'qrcode.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Web Share API not supported. QR Code downloaded. Please share manually.');
      }
    } catch (error) {
      console.error('Error sharing QR Code:', error);
      alert('Could not share QR Code.');
    }
  };

  const generatePaymentQR = async () => {
    if (selectedItems.length === 0) {
      alert('Please add items to the bill first');
      return;
    }

    try {
      setIsGeneratingQR(true);
    // Generate UPI payment link
    const paymentLink = `upi://pay?pa=${upiId}&pn=Payment&am=${totalAmount}&cu=INR&tn=Bill Payment`;
    
    setQrCodeData(paymentLink);
      
      // Generate QR code image
      const qrCodeDataURL = await QRCode.toDataURL(paymentLink, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeImage(qrCodeDataURL);
    setShowQRCode(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Error generating QR code. Please try again.');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleSubmitBill = async () => {
    if (selectedItems.length === 0) {
      alert('Please add items to the bill');
      return;
    }

    if (!selectedGodown) {
      alert('Please select a godown');
      return;
    }

    // Check if inventory has been verified
    if (!showInventoryStatus) {
      alert('Please check inventory availability first');
      return;
    }

    // Check if all items are available in the selected godown
    const unavailableItems = inventoryStatus.filter(item => !item.isAvailableInSelectedGodown);
    if (unavailableItems.length > 0) {
      const unavailableItemNames = unavailableItems.map(item => item.itemName).join(', ');
      alert(`Cannot generate bill. The following items are not available in the selected godown: ${unavailableItemNames}`);
      return;
    }

    const selectedCustomerData = customers.find(c => c._id === selectedCustomer);

    try {
      const response = await axios.post(`${backendUrl}/api/bills/add`, {
        customerId: selectedCustomer,
        customerName: selectedCustomerData.name,
        godownId: selectedGodown,
        godownName: selectedGodownData?.name || '',
        items: selectedItems,
        totalAmount: totalAmount,
        priceType: priceType
      });

      console.log('Bill creation response:', response.data);

      // Show detailed success message with deletion results
      if (response.data.deletionResults) {
        const totalDeleted = response.data.deletionResults.reduce((sum, result) => sum + result.deletedItems, 0);
        const deletionSummary = response.data.deletionResults.map(result =>
          `${result.itemName}: ${result.deletedItems} items removed`
        ).join('\n');

        alert(`✅ Bill created successfully!\n\n📦 Items removed from inventory:\n${deletionSummary}\n\nTotal items removed: ${totalDeleted}`);
      } else {
        alert('✅ Bill created successfully! Items have been deducted from godown inventory.');
      }

      navigate(`/customer/${selectedCustomer}`);
    } catch (error) {
      console.log(error);
      alert('❌ Error creating bill: ' + (error.response?.data?.message || error.message));
    }
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    minHeight: "100vh",
    background: "linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)",
    backgroundSize: "400% 400%",
    animation: "gradientAnimation 10s ease infinite",
    padding: "20px",
    color: 'white',
    fontSize: '16px',
  };

  const cardStyle = {
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    backdropFilter: 'blur(10px)',
    borderRadius: '15px',
    padding: '20px',
    margin: '10px 0',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    width: '100%',
    transition: 'all 0.3s ease',
  };

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            25% { background-position: 50% 100%; }
            50% { background-position: 100% 50%; }
            75% { background-position: 50% 0%; }
            100% { background-position: 0% 50%; }
          }

          .table {
            color: white;
          }

          .table th {
            border-color: rgba(255, 255, 255, 0.3);
            background-color: rgba(255, 255, 255, 0.1);
          }

          .table td {
            border-color: rgba(255, 255, 255, 0.2);
          }

          .form-select, .form-control {
            background-color: rgba(218, 216, 224, 0.6);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            transition: all 0.3s ease;
          }

          .form-select:focus, .form-control:focus {
            background-color: rgba(218, 216, 224, 0.8);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
            transform: scale(1.02);
            border-color: rgba(255, 255, 255, 0.6);
          }

          .form-select option {
            background-color: rgba(218, 216, 224, 0.9);
            color: white;
          }

          .btn {
            background-color: rgba(218, 216, 224, 0.6);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.3);
          }

          .btn:hover {
            background-color: rgba(218, 216, 224, 0.8);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
            transform: translateY(-3px) scale(1.05);
          }

          .card {
            background-color: rgba(218, 216, 224, 0.6);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
          }

          .card:hover {
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
            transform: translateY(-2px);
          }
        `}
      </style>

      <div style={{ width: '100%', maxWidth: '1400px' }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '3rem',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          💰 Create New Bill
        </h2>

        <div style={{ width: '100%' }}>
          {/* Customer Selection */}
          <div className="card mb-4">
            <div className="card-header">
              <h5>Select Customer</h5>
            </div>
            <div className="card-body">
              <div className="row align-items-center justify-content-center">
                <div className="col-md-6">
              <select
                className="form-select"
                value={selectedCustomer}
                onChange={handleCustomerChange}
                style={{ fontSize: '16px', padding: '12px' }}
              >
                <option value="">Choose a customer...</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.city}, {customer.state} - {customer.gstNo || 'No GST'}
                  </option>
                ))}
              </select>
                </div>
                <div className="col-md-6 text-center">
                  {selectedCustomer && (
                    <button 
                      className="btn btn-outline-info"
                      onClick={() => navigate(`/customer/${selectedCustomer}`)}
                    >
                      View Bill History
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Price Type Selection */}
          {selectedCustomer && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>Select Price Type</h5>
              </div>
              <div className="card-body">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="priceType"
                    id="regularPrice"
                    value="price"
                    checked={priceType === 'price'}
                    onChange={handlePriceTypeChange}
                  />
                  <label className="form-check-label" htmlFor="regularPrice">
                    Regular Price
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="priceType"
                    id="masterPrice"
                    value="masterPrice"
                    checked={priceType === 'masterPrice'}
                    onChange={handlePriceTypeChange}
                  />
                  <label className="form-check-label" htmlFor="masterPrice">
                    Master Price
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Godown Selection */}
          {showGodowns && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>Select Godown</h5>
              </div>
              <div className="card-body">
                <div className="row align-items-center justify-content-center">
                  <div className="col-md-6">
                    <select
                      className="form-select"
                      value={selectedGodown}
                      onChange={handleGodownChange}
                      style={{ fontSize: '16px', padding: '12px' }}
                    >
                      <option value="">Choose a godown...</option>
                      
                      {/* Matching Godowns (Top Priority) */}
                      {godowns.matchingGodowns.length > 0 && (
                        <optgroup label={`📍 Matching Location (${godowns.customerLocation?.city}, ${godowns.customerLocation?.state})`}>
                          {godowns.matchingGodowns.map(godown => (
                            <option key={godown._id} value={godown._id} style={{ fontWeight: 'bold', color: '#28a745' }}>
                              🏢 {godown.name} - {godown.city}, {godown.state}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      
                      {/* Non-Matching Godowns */}
                      {godowns.nonMatchingGodowns.length > 0 && (
                        <optgroup label="🏢 Other Godowns">
                          {godowns.nonMatchingGodowns.map(godown => (
                            <option key={godown._id} value={godown._id}>
                              {godown.name} - {godown.city}, {godown.state}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                  <div className="col-md-6 text-center">
                    {selectedGodown && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          className="btn btn-outline-warning"
                          onClick={async () => {
                            try {
                              await axios.post(`${backendUrl}/api/godowns/${selectedGodown}/initialize-inventory`);
                              alert('Godown inventory initialized successfully!');
                              // Refresh godown items
                              handleGodownChange({ target: { value: selectedGodown } });
                            } catch (error) {
                              console.log(error);
                              alert('Error initializing godown inventory');
                            }
                          }}
                        >
                          Initialize Inventory
                        </button>

                      </div>
                    )}
                  </div>
                </div>
                
                {/* Location Info */}
                {godowns.customerLocation && (
                  <div className="mt-3">
                    <small className="text-muted">
                      <strong>Customer Location:</strong> {godowns.customerLocation.city}, {godowns.customerLocation.state}
                    </small>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Godown Items */}
          {selectedGodownData && godownItems.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>🏢 {selectedGodownData.name} - Available Items</h5>
                <small className="text-muted">
                  Location: {selectedGodownData.city}, {selectedGodownData.state}
                </small>
              </div>
              <div className="card-body">
                <div className="row">
                  {godownItems.map(item => (
                    <div key={item._id} className="col-md-4 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">{item.itemName}</h6>
                          <p className="card-text">
                            <strong>Quantity:</strong> {item.quantity}<br/>
                            <strong>Regular Price:</strong> ₹{item.price}<br/>
                            <strong>Master Price:</strong> ₹{item.masterPrice}<br/>
                            <strong>Category:</strong> {item.category || 'N/A'}
                          </p>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => addItemToBill(item)}
                            disabled={item.quantity <= 0}
                          >
                            {item.quantity > 0 ? 'Add to Bill' : 'Out of Stock'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Matched Items Based on 3-Digit Prefix */}
          {selectedCustomer && selectedGodown && availableItems.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>🔍 Matched Items (3-Digit Prefix Matching)</h5>
                <small className="text-muted">
                  Items matched between billing and inventory based on first 3 digits
                </small>
              </div>
              <div className="card-body">
                <div className="row">
                  {availableItems.map(item => (
                    <div key={item._id} className="col-md-4 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">
                            {item.itemName}
                            <span className="badge bg-info ms-2">Prefix: {item.prefix}</span>
                          </h6>
                          <p className="card-text">
                            <strong>Regular Price:</strong> ₹{item.price}<br/>
                            <strong>Master Price:</strong> ₹{item.masterPrice}<br/>
                            <strong>Available Quantity:</strong>
                            <span className={`badge ${item.availableQuantity > 0 ? 'bg-success' : 'bg-danger'} ms-1`}>
                              {item.availableQuantity}
                            </span>
                          </p>
                          {item.availableQuantity > 0 && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => addItemToBill(item)}
                            >
                              Add to Bill
                            </button>
                          )}
                          {item.availableQuantity === 0 && (
                            <button className="btn btn-secondary btn-sm" disabled>
                              Out of Stock
                            </button>
                          )}
                          <div className="mt-2">
                            <small className="text-muted">
                              Matching items: {item.matchingItems.map(mi => mi.inputValue).join(', ')}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Original Customer Items (when no godown selected) */}
          {selectedCustomer && !selectedGodown && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>Available Items</h5>
                <small className="text-muted">Select a godown to see matched inventory</small>
              </div>
              <div className="card-body">
                <div className="row">
                  {customerItems.map(item => (
                    <div key={item._id} className="col-md-4 mb-3">
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-title">{item.name}</h6>
                          <p className="card-text">
                            <strong>Regular Price:</strong> ₹{item.price}<br/>
                            <strong>Master Price:</strong> ₹{item.masterPrice}
                          </p>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => addItemToBill(item)}
                          >
                            Add to Bill
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected Items */}
          {selectedItems.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>Bill Items</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Price Type</th>
                        <th>Price (₹)</th>
                        <th>Quantity</th>
                        <th>Total (₹)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map(item => {
                        // Find inventory status for this item
                        const itemInventoryStatus = inventoryStatus.find(
                          invItem => invItem.itemName === item.itemName
                        );
                        
                        return (
                          <React.Fragment key={item.itemId}>
                            {/* Main item row */}
                            <tr>
                              <td>{item.itemName}</td>
                              <td>
                                <span className={`badge ${priceType === 'masterPrice' ? 'bg-warning' : 'bg-info'}`}>
                                  {priceType === 'masterPrice' ? 'Master Price' : 'Regular Price'}
                                </span>
                              </td>
                              <td>₹{item.selectedPrice}</td>
                              <td>
                                <div className="btn-group" role="group">
                                  <button 
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => decreaseQuantity(item.itemId)}
                                  >
                                    -
                                  </button>
                                  <span className="btn btn-outline-secondary btn-sm disabled">
                                    {item.quantity}
                                  </span>
                                  <button 
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => increaseQuantity(item.itemId)}
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td>₹{item.total}</td>
                              <td>
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => removeItem(item.itemId)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                            
                            {/* Inventory status row (shown when inventory is checked) */}
                            {showInventoryStatus && itemInventoryStatus && (
                              <tr>
                                <td colSpan="6">
                                  <div className="table-responsive">
                                    <table className="table inventory-status-table mb-0">
                                      <thead>
                                        <tr>
                                          <th>Item Name</th>
                                          <th>Requested Qty</th>
                                          <th>Available in Selected Godown</th>
                                          <th>Status</th>
                                          <th>Other Godowns with Item</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr>
                                          <td>{itemInventoryStatus.itemName}</td>
                                          <td>{itemInventoryStatus.requestedQuantity}</td>
                                          <td>
                                            <span className={`badge ${itemInventoryStatus.isAvailableInSelectedGodown ? 'bg-success' : 'bg-danger'}`}>
                                              {itemInventoryStatus.availableQuantity || 0}
                                            </span>
                                          </td>
                                          <td>
                                            <span className={`badge ${itemInventoryStatus.isAvailableInSelectedGodown ? 'bg-success' : 'bg-danger'}`}>
                                              {itemInventoryStatus.message || itemInventoryStatus.status}
                                            </span>
                                          </td>
                                          <td>
                                            {itemInventoryStatus.alternativeGodowns && itemInventoryStatus.alternativeGodowns.length > 0 ? (
                                              <div>
                                                {itemInventoryStatus.alternativeGodowns.map((godown, index) => (
                                                  <div key={index} className="mb-1">
                                                    <small className="text-muted">
                                                      🏢 {godown.godownName}: {godown.availableQuantity} items
                                                    </small>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <span className="text-muted">No other godowns have this item</span>
                                            )}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {/* Total Amount */}
                <div className="row">
                  <div className="col-md-6 offset-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5 className="card-title">Total Amount: ₹{totalAmount}</h5>
                        <small className="text-muted">
                          Using {priceType === 'masterPrice' ? 'Master Price' : 'Regular Price'}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inventory Summary */}
                {showInventoryStatus && inventoryStatus.length > 0 && (
                  <div className="row mt-3">
                    <div className="col-md-12">
                      <div className="card">
                        <div className="card-header">
                          <h5>📦 Inventory Check Summary</h5>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <h6>✅ Available Items:</h6>
                              {inventoryStatus.filter(item => item.isAvailableInSelectedGodown).map((item, index) => (
                                <div key={index} className="mb-1">
                                  <span className="badge bg-success me-2">✓</span>
                                  <strong>{item.itemName}</strong> - {item.availableQuantity} available
                                </div>
                              ))}
                              {inventoryStatus.filter(item => item.isAvailableInSelectedGodown).length === 0 && (
                                <p className="text-muted">No items available in selected godown</p>
                              )}
                            </div>
                            <div className="col-md-6">
                              <h6>❌ Unavailable Items:</h6>
                              {inventoryStatus.filter(item => !item.isAvailableInSelectedGodown).map((item, index) => (
                                <div key={index} className="mb-1">
                                  <span className="badge bg-danger me-2">✗</span>
                                  <strong>{item.itemName}</strong> - Not available in {item.selectedGodownName}
                                  {item.alternativeGodowns && item.alternativeGodowns.length > 0 && (
                                    <div className="ms-3 mt-1">
                                      <small className="text-muted">
                                        Available in: {item.alternativeGodowns.map(g => g.godownName).join(', ')}
                                      </small>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {inventoryStatus.filter(item => !item.isAvailableInSelectedGodown).length === 0 && (
                                <p className="text-success">All items are available! 🎉</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="row mt-3">
                  <div className="col-md-12 text-center">
                    <button 
                      className={`btn btn-lg me-2 ${showInventoryStatus ? 'btn-success' : 'btn-info'}`}
                      onClick={checkInventory}
                      disabled={!selectedGodown}
                    >
                      {showInventoryStatus ? '✓ Inventory Checked' : 'Check Inventory'}
                    </button>
                    <button 
                      className="btn btn-warning me-2"
                      onClick={downloadPDF}
                    >
                      Download Bill PDF
                    </button>
                    <button 
                      className="btn btn-primary me-2"
                      onClick={generatePaymentQR}
                      disabled={isGeneratingQR}
                    >
                      {isGeneratingQR ? 'Generating QR Code...' : 'Generate Payment Link'}
                    </button>
                    <button 
                      className="btn btn-success btn-lg"
                      onClick={handleSubmitBill}
                      disabled={!showInventoryStatus}
                    >
                      Generate Bill
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* QR Code */}
          {showQRCode && (
            <div className="card mb-4">
              <div className="card-header">
                <h5>Payment QR Code</h5>
              </div>
              <div className="card-body text-center">
                <div className="mb-3">
                  <p><strong>Amount:</strong> ₹{totalAmount}</p>
                  <p>Scan this QR code to make payment</p>
                  
                  {/* UPI ID Configuration */}
                  <div className="mb-3">
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowUpiInput(!showUpiInput)}
                    >
                      {showUpiInput ? 'Hide' : 'Configure'} UPI ID
                    </button>
                    
                    {showUpiInput && (
                      <div className="mt-2">
                        <div className="row justify-content-center">
                          <div className="col-md-6">
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Enter UPI ID (e.g., yourname@bank)"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                              />
                              <button 
                                className="btn btn-primary"
                                onClick={generatePaymentQR}
                              >
                                Update QR Code
                              </button>
                            </div>
                            <small className="text-muted">Format: yourname@bank or yourname@upi</small>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border p-3 d-inline-block">
                  <div style={{ width: '200px', height: '200px', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {qrCodeImage ? (
                      <img src={qrCodeImage} alt="Payment QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span className="text-muted">Generating QR Code...</span>
                    )}
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-muted">
                    <strong>Payment Link:</strong> {qrCodeData}
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(qrCodeData);
                        alert('Payment link copied to clipboard!');
                      }}
                    >
                      Copy Payment Link
                    </button>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={shareQRCodeOnWhatsApp}
                    >
                      📱 Send on WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Billing; 