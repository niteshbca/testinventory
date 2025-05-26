import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginStaff = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`,
        { email, password }
      );

      setMessage('Login successful!');
      console.log('JWT Token:', response.data.token);

      localStorage.setItem('token', response.data.token);

      navigate('/ldashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'An error occurred');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
      backgroundSize: '400% 400%',
      animation: 'gradientAnimation 12s ease infinite',
      fontFamily: `'Poppins', sans-serif`, // Modern font style
      padding: '10px',
      margin: '0',
    },
    form: {
      backgroundColor: 'rgba(218, 216, 224, 0.6)',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center',
      transition: 'all 0.3s ease',
    },
    heading: {
      color: 'white',
      marginBottom: '20px',
      fontSize: '40px',
      fontWeight: 'bold',
      fontFamily: `'Roboto', sans-serif`,
      letterSpacing: '1px',
    },
    label: {
      display: 'block',
      textAlign: 'left',
      marginBottom: '5px',
      fontSize: '18px',
      fontWeight: '600',
      color: 'white',
    },
    input: {
      width: '90%',
      padding: '12px',
      marginBottom: '15px',
      border: '1px solid #ddd',
      borderRadius: '18px',
      fontSize: '16px',
      fontFamily: `'Open Sans', sans-serif`,
      outline: 'none',
      transition: 'border-color 0.3s ease',
    },
    inputFocus: {
      borderColor: '#6e7bff',
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: 'rgba(218, 216, 224, 0.8)',
      border: 'none',
      borderRadius: '28px',
      color: 'white',
      fontSize: '25px',
      fontFamily: `'Poppins', sans-serif`,
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      transform: isHovered ? 'scale(1.05)' : 'none',
    },
    message: {
      color: message.includes('successful') ? 'green' : 'red',
      fontSize: '14px',
      marginTop: '10px',
    },
  };

  const globalStyles = `
    @keyframes gradientAnimation {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{globalStyles}</style>
      <form
        style={styles.form}
        onSubmit={handleSubmit}
      >
        <h2 style={styles.heading}>Staff Login</h2>
        {message && <p style={styles.message}>{message}</p>}
        <div>
          <label htmlFor="email" style={styles.label}>Email :</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label htmlFor="password" style={styles.label}>Password :</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter your password"
          />
        </div>
        <button
          type="submit"
          style={styles.button}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginStaff;
