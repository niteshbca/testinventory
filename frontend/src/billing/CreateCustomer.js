import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateCustomer.css';

function CreateCustomer() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    gstNo: '',
    phoneNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Backend URL from environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (formData.phoneNumber && !/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }
    
    if (formData.gstNo && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNo)) {
      newErrors.gstNo = 'Invalid GST number format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${backendUrl}/api/customers/add`, formData);
      console.log('Customer created:', response.data);
      alert('Customer created successfully!');
      navigate('/billing/customers-list');
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Error creating customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
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
    padding: '30px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    width: '100%',
    maxWidth: '600px',
    transition: 'all 0.3s ease',
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 15px',
    fontSize: '16px',
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
    padding: '12px 30px',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
    width: '100%',
    marginTop: '10px',
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

          .custom-input::placeholder {
            color: rgba(255, 255, 255, 0.7);
          }

          .custom-input:focus {
            border-color: rgba(255, 255, 255, 0.6);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
            transform: scale(1.02);
            background-color: rgba(218, 216, 224, 0.8);
          }

          .custom-btn:hover {
            background-color: rgba(218, 216, 224, 0.8);
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
          }

          .custom-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          }

          .custom-card:hover {
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
            transform: translateY(-2px);
          }
        `}
      </style>

      <div style={cardStyle} className="custom-card">
        <h2 style={{
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
        }}>
          👤 Create New Customer
        </h2>
        
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              👤 Customer Name <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter customer name"
              required
              style={{
                ...inputStyle,
                borderColor: errors.name ? '#ff6b6b' : 'rgba(255, 255, 255, 0.3)'
              }}
              className="custom-input"
            />
            {errors.name && <span style={{ color: '#ff6b6b', fontSize: '14px' }}>{errors.name}</span>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              📍 Address <span style={{ color: '#ff6b6b' }}>*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Enter complete address"
              rows="3"
              required
              style={{
                ...inputStyle,
                borderColor: errors.address ? '#ff6b6b' : 'rgba(255, 255, 255, 0.3)',
                resize: 'vertical'
              }}
              className="custom-input"
            />
            {errors.address && <span style={{ color: '#ff6b6b', fontSize: '14px' }}>{errors.address}</span>}
          </div>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '200px', marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                🏙️ City <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                required
                style={{
                  ...inputStyle,
                  borderColor: errors.city ? '#ff6b6b' : 'rgba(255, 255, 255, 0.3)',
                  marginBottom: '0'
                }}
                className="custom-input"
              />
              {errors.city && <span style={{ color: '#ff6b6b', fontSize: '14px' }}>{errors.city}</span>}
            </div>

            <div style={{ flex: '1', minWidth: '200px', marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                🗺️ State <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Enter state"
                required
                style={{
                  ...inputStyle,
                  borderColor: errors.state ? '#ff6b6b' : 'rgba(255, 255, 255, 0.3)',
                  marginBottom: '0'
                }}
                className="custom-input"
              />
              {errors.state && <span style={{ color: '#ff6b6b', fontSize: '14px' }}>{errors.state}</span>}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              🏢 GST Number
            </label>
            <input
              type="text"
              name="gstNo"
              value={formData.gstNo}
              onChange={handleInputChange}
              placeholder="Enter GST number (optional)"
              style={{
                ...inputStyle,
                borderColor: errors.gstNo ? '#ff6b6b' : 'rgba(255, 255, 255, 0.3)'
              }}
              className="custom-input"
            />
            {errors.gstNo && <span style={{ color: '#ff6b6b', fontSize: '14px' }}>{errors.gstNo}</span>}
            <small style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px' }}>Format: 22AAAAA0000A1Z5</small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              📞 Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
              style={{
                ...inputStyle,
                borderColor: errors.phoneNumber ? '#ff6b6b' : 'rgba(255, 255, 255, 0.3)'
              }}
              className="custom-input"
            />
            {errors.phoneNumber && <span style={{ color: '#ff6b6b', fontSize: '14px' }}>{errors.phoneNumber}</span>}
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...buttonStyle,
                opacity: isSubmitting ? 0.6 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
              className="custom-btn"
            >
              {isSubmitting ? '⏳ Creating...' : '✅ Create Customer'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/billing/customers-list')}
              style={{
                ...buttonStyle,
                backgroundColor: 'rgba(255, 99, 99, 0.6)'
              }}
              className="custom-btn"
            >
              ❌ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCustomer; 