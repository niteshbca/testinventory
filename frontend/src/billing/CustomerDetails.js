import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// A component to display and edit a single item
const Item = ({ item, onDelete, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [updatedItem, setUpdatedItem] = useState({ ...item });

    const handleUpdate = () => {
        onUpdate(item._id, updatedItem);
        setIsEditing(false);
    };

    return (
        <tr>
            <td>{isEditing ? <input type="text" value={updatedItem.name} onChange={(e) => setUpdatedItem({ ...updatedItem, name: e.target.value })} /> : item.name}</td>
            <td>{isEditing ? <input type="number" value={updatedItem.price} onChange={(e) => setUpdatedItem({ ...updatedItem, price: e.target.value })} /> : item.price}</td>
            <td>{isEditing ? <input type="number" value={updatedItem.masterPrice} onChange={(e) => setUpdatedItem({ ...updatedItem, masterPrice: e.target.value })} /> : item.masterPrice}</td>
            <td>
                {isEditing ? (
                    <button className="btn btn-success btn-sm me-2" onClick={handleUpdate}>Save</button>
                ) : (
                    <button className="btn btn-primary btn-sm me-2" onClick={() => setIsEditing(true)}>Edit</button>
                )}
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(item._id)}>Delete</button>
            </td>
        </tr>
    );
};

// Component to display bill history
const BillHistory = ({ bills, customer }) => {
    const downloadBillPDF = async (bill) => {
        try {
            // Create a temporary div for PDF generation
            const pdfContent = document.createElement('div');
            pdfContent.style.padding = '20px';
            pdfContent.style.fontFamily = 'Arial, sans-serif';
            pdfContent.style.backgroundColor = 'white';
            pdfContent.style.color = 'black';
            pdfContent.style.width = '800px';
            
            pdfContent.innerHTML = `
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2c3e50; margin-bottom: 10px;">INVOICE</h1>
                    <div style="border-bottom: 2px solid #3498db; width: 100px; margin: 0 auto;"></div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                        <div>
                            <h3 style="color: #2c3e50; margin-bottom: 10px;">Bill To:</h3>
                            <p style="margin: 5px 0;"><strong>Name:</strong> ${customer.name}</p>
                            <p style="margin: 5px 0;"><strong>GST No:</strong> ${customer.gstNo}</p>
                            <p style="margin: 5px 0;"><strong>Address:</strong> ${customer.address}</p>
                            <p style="margin: 5px 0;"><strong>Phone:</strong> ${customer.phoneNumber}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 5px 0;"><strong>Bill No:</strong> ${bill.billNumber}</p>
                            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleDateString()}</p>
                            <p style="margin: 5px 0;"><strong>Price Type:</strong> ${bill.priceType === 'masterPrice' ? 'Master Price' : 'Regular Price'}</p>
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
                            ${bill.items.map(item => `
                                <tr>
                                    <td style="border: 1px solid #ddd; padding: 12px;">${item.itemName}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.selectedPrice}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${item.quantity}</td>
                                    <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">${item.total}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="text-align: right; margin-top: 30px;">
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; display: inline-block;">
                        <h2 style="color: #2c3e50; margin: 0;">Total Amount: ₹${bill.totalAmount}</h2>
                    </div>
                </div>
                
                <div style="margin-top: 50px; text-align: center; color: #7f8c8d; font-size: 12px;">
                    <p>Thank you for your business!</p>
                </div>
            `;
            
            document.body.appendChild(pdfContent);
            
            const canvas = await html2canvas(pdfContent, {
                scale: 2,
                useCORS: true,
                allowTaint: true
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
            
            pdf.save(`bill_${customer.name}_${bill.billNumber}_${new Date(bill.createdAt).toISOString().split('T')[0]}.pdf`);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF. Please try again.');
        }
    };

    if (bills.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3>Bill History</h3>
                </div>
                <div className="card-body">
                    <p className="text-muted">No bills generated yet for this customer.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3>Bill History</h3>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Bill Number</th>
                                <th>Date</th>
                                <th>Items Count</th>
                                <th>Total Amount</th>
                                <th>Price Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bills.map(bill => (
                                <tr key={bill._id}>
                                    <td>{bill.billNumber}</td>
                                    <td>{new Date(bill.createdAt).toLocaleDateString()}</td>
                                    <td>{bill.items.length}</td>
                                    <td>₹{bill.totalAmount}</td>
                                    <td>
                                        <span className={`badge ${bill.priceType === 'masterPrice' ? 'bg-warning' : 'bg-info'}`}>
                                            {bill.priceType === 'masterPrice' ? 'Master Price' : 'Regular Price'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            onClick={() => downloadBillPDF(bill)}
                                        >
                                            Download PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

function CustomerDetails() {
  const [customer, setCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Backend URL from environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
  // Excel upload state
  const [excelData, setExcelData] = useState([]);
  const [showExcelPreview, setShowExcelPreview] = useState(false);
  const [excelFileName, setExcelFileName] = useState('');

  // Form state for new item
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [masterPrice, setMasterPrice] = useState('');

  // Search states
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [billSearchTerm, setBillSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);

  const { id } = useParams();
  console.log('CustomerDetails - Customer ID from params:', id);

  const fetchItems = useCallback(async () => {
    try {
      if (!customer) {
        console.log('Customer not loaded yet, skipping fetchItems');
        return;
      }
      console.log('Fetching billing items for customer ID:', customer._id);
      const itemsRes = await axios.get(`${backendUrl}/api/bills/customer/${customer._id}/items`);
      console.log('Billing items received:', itemsRes.data);
      console.log('Billing items array length:', itemsRes.data.length);
      setItems(itemsRes.data);
      setFilteredItems(itemsRes.data);
    } catch (error) {
      console.log("Error fetching billing items", error);
      console.log("Error details:", error.response?.data);
    }
  }, [customer]);

  const fetchBills = useCallback(async () => {
    try {
      if (!customer) {
        console.log('Customer not loaded yet, skipping fetchBills');
        return;
      }
      const billsRes = await axios.get(`${backendUrl}/api/bills/customer/${customer._id}/bills`);
      setBills(billsRes.data);
      setFilteredBills(billsRes.data);
    } catch (error) {
      console.log("Error fetching bills", error);
    }
  }, [customer]);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      setLoading(true);
      try {
        console.log('Fetching customer details for ID:', id);
        const customerRes = await axios.get(`${backendUrl}/api/customers/${id}`);
        console.log('Customer details received:', customerRes.data);
        setCustomer(customerRes.data);
      } catch (error) {
        console.log('Error fetching customer details:', error);
        console.log('Error response:', error.response?.data);
      }
      setLoading(false);
    };

    fetchCustomerDetails();
  }, [id]);

  // Fetch items and bills after customer is loaded
  useEffect(() => {
    if (customer) {
      fetchItems();
      fetchBills();
    }
  }, [customer, fetchItems, fetchBills]);

  // Filter items based on search term
  useEffect(() => {
    if (itemSearchTerm === '') {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
        item.price.toString().includes(itemSearchTerm) ||
        item.masterPrice.toString().includes(itemSearchTerm)
      );
      setFilteredItems(filtered);
    }
  }, [itemSearchTerm, items]);

  // Filter bills based on search term
  useEffect(() => {
    if (billSearchTerm === '') {
      setFilteredBills(bills);
    } else {
      const filtered = bills.filter(bill =>
        bill.billNumber.toLowerCase().includes(billSearchTerm.toLowerCase()) ||
        bill.totalAmount.toString().includes(billSearchTerm) ||
        bill.priceType.toLowerCase().includes(billSearchTerm.toLowerCase()) ||
        new Date(bill.createdAt).toLocaleDateString().includes(billSearchTerm)
      );
      setFilteredBills(filtered);
    }
  }, [billSearchTerm, bills]);

  const handleAddItem = (e) => {
    e.preventDefault();
    const newItem = {
        name, price: parseFloat(price), masterPrice: parseFloat(masterPrice), customerId: customer._id
    };
    console.log('Adding new billing item:', newItem);
    console.log('Customer ID being used:', customer._id);
    axios.post(`${backendUrl}/api/bills/customer/items/add`, newItem)
        .then(res => {
            console.log('Billing item added successfully:', res.data);
            fetchItems(); // Refetch items to show the new one
            // Clear form
            setName('');
            setPrice('');
            setMasterPrice('');
            alert('Item added successfully!');
        })
        .catch(err => {
            console.log('Error adding billing item:', err);
            console.log('Error response:', err.response?.data);
            alert('Error adding item: ' + (err.response?.data?.message || err.message));
        });
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      axios.delete(`${backendUrl}/api/bills/customer/items/${itemId}`)
          .then(res => {
              console.log(res.data);
              fetchItems(); // Refetch
              alert('Item deleted successfully!');
          })
          .catch(err => {
              console.log(err);
              alert('Error deleting item: ' + (err.response?.data?.message || err.message));
          });
    }
  };

  const handleUpdateItem = (itemId, updatedItem) => {
      axios.put(`${backendUrl}/api/bills/customer/items/${itemId}`, {
          name: updatedItem.name,
          price: parseFloat(updatedItem.price),
          masterPrice: parseFloat(updatedItem.masterPrice)
      })
        .then(res => {
            console.log(res.data);
            fetchItems(); // Refetch
            alert('Item updated successfully!');
        })
        .catch(err => {
            console.log(err);
            alert('Error updating item: ' + (err.response?.data?.message || err.message));
        });
  };

  // Excel Download Handler
  const handleDownloadExcel = () => {
    if (!items.length) return;
    const ws = XLSX.utils.json_to_sheet(items.map(({ _id, customerId, ...rest }) => rest));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Items');
    XLSX.writeFile(wb, `${customer.name}_items.xlsx`);
  };

  // Excel Upload Handler
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    setExcelFileName(file?.name || '');
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
      setExcelData(data);
      setShowExcelPreview(true);
    };
    reader.readAsBinaryString(file);
  };

  // Save Excel Data to Backend
  const handleSaveExcelData = async () => {
    try {
      console.log('Saving Excel data for customer:', customer._id);
      console.log('Excel data:', excelData);
      const response = await axios.post(`${backendUrl}/api/items/bulk-update/${customer._id}`, { items: excelData });
      console.log('Excel upload response:', response.data);
      setShowExcelPreview(false);
      setExcelData([]);
      setExcelFileName('');
      await fetchItems();
      alert('Items updated successfully!');
    } catch (err) {
      console.error('Error updating items from Excel:', err);
      alert('Error updating items from Excel');
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
    maxWidth: '1200px',
    transition: 'all 0.3s ease',
  };

  const searchInputStyle = {
    width: '100%',
    padding: '10px 15px',
    fontSize: '14px',
    borderRadius: '20px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    color: 'white',
    marginBottom: '15px',
    outline: 'none',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
  };

  const buttonStyle = {
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    cursor: 'pointer',
    margin: '5px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  };

  if (loading) {
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
          `}
        </style>
        <p style={{ fontSize: '24px', textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

  if (!customer) {
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
          `}
        </style>
        <p style={{ fontSize: '24px', textAlign: 'center' }}>Customer not found.</p>
      </div>
    );
  }

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

          .search-input::placeholder {
            color: rgba(255, 255, 255, 0.7);
          }

          .search-input:focus {
            border-color: rgba(255, 255, 255, 0.6);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
            transform: scale(1.02);
          }

          .custom-btn:hover {
            background-color: rgba(218, 216, 224, 0.8);
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
          }

          .table-responsive {
            background-color: rgba(218, 216, 224, 0.6);
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)";
            border-radius: 10px;
            padding: 15px;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
          }

          .table-responsive:hover {
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
            transform: translateY(-2px);
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
        `}
      </style>

      <div style={{ width: '100%', maxWidth: '1200px' }}>
        {/* Customer Information */}
        <div style={cardStyle}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '2.5rem', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' }}>
            👤 {customer.name}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
            <p><strong>📍 Address:</strong> {customer.address}</p>
            <p><strong>🏙️ City:</strong> {customer.city}</p>
            <p><strong>🗺️ State:</strong> {customer.state}</p>
            <p><strong>🏢 GST No:</strong> {customer.gstNo || 'N/A'}</p>
            <p><strong>📞 Phone:</strong> {customer.phoneNumber || 'N/A'}</p>
          </div>
        </div>

        {/* Excel Download/Upload Buttons */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>📊 Data Management</h3>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <button
              style={buttonStyle}
              className="custom-btn"
              onClick={handleDownloadExcel}
              disabled={!items.length}
            >
              📥 Download Excel
            </button>
            <label style={buttonStyle} className="custom-btn">
              📤 Upload Excel
              <input type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={handleExcelUpload} />
            </label>
            {excelFileName && <span style={{ color: 'rgba(255, 255, 255, 0.8)', marginLeft: '10px' }}>{excelFileName}</span>}
          </div>
        </div>

        {/* Excel Preview and Save Button */}
        {showExcelPreview && (
          <div style={cardStyle}>
            <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>📋 Excel Preview</h3>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    {Object.keys(excelData[0] || {}).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((val, i) => (
                        <td key={i}>{val}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <button style={buttonStyle} className="custom-btn" onClick={handleSaveExcelData}>
                💾 Save
              </button>
              <button style={buttonStyle} className="custom-btn" onClick={() => setShowExcelPreview(false)}>
                ❌ Cancel
              </button>
            </div>
          </div>
        )}

        {/* Add New Item Section */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>➕ Add New Item</h3>
          <form onSubmit={handleAddItem} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="Item Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{
                ...searchInputStyle,
                flex: '1',
                minWidth: '200px',
                marginBottom: '0'
              }}
              className="search-input"
            />
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={e => setPrice(e.target.value)}
              step="0.01"
              required
              style={{
                ...searchInputStyle,
                flex: '1',
                minWidth: '150px',
                marginBottom: '0'
              }}
              className="search-input"
            />
            <input
              type="number"
              placeholder="Master Price"
              value={masterPrice}
              onChange={e => setMasterPrice(e.target.value)}
              step="0.01"
              required
              style={{
                ...searchInputStyle,
                flex: '1',
                minWidth: '150px',
                marginBottom: '0'
              }}
              className="search-input"
            />
            <button type="submit" style={buttonStyle} className="custom-btn">
              ➕ Add Item
            </button>
          </form>
        </div>

        {/* Items Table */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>📦 Items</h3>

          {/* Items Search */}
          <input
            type="text"
            placeholder="🔍 Search items by name, price, or master price..."
            value={itemSearchTerm}
            onChange={(e) => setItemSearchTerm(e.target.value)}
            style={searchInputStyle}
            className="search-input"
          />

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Master Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems && filteredItems.length > 0 ? (
                  filteredItems.map(item => (
                    <Item item={item} onDelete={handleDeleteItem} onUpdate={handleUpdateItem} key={item._id} />
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                      {itemSearchTerm ? `No items found matching "${itemSearchTerm}"` : 'No items found. Add items manually or upload via Excel.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill History Section */}
        <div style={cardStyle}>
          <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>📄 Bill History</h3>

          {/* Bills Search */}
          <input
            type="text"
            placeholder="🔍 Search bills by bill number, amount, price type, or date..."
            value={billSearchTerm}
            onChange={(e) => setBillSearchTerm(e.target.value)}
            style={searchInputStyle}
            className="search-input"
          />

          <BillHistory bills={filteredBills} customer={customer} />
        </div>
      </div>
    </div>
  );
}

export default CustomerDetails; 