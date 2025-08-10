import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Backend URL from environment variable
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${backendUrl}/api/godown-login`, { email, password });

      if (response.data.success) {
        navigate('/godownpage', { state: { godown: response.data.godown } });
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Server error');
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
      fontFamily: `'Poppins', sans-serif`,
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
    header: {
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
      fontSize: '20px',
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
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: 'rgba(218, 216, 224, 0.8)',
      border: 'none',
      borderRadius: '28px',
      color: 'white',
      fontSize: '20px',
      fontFamily: `'Poppins', sans-serif`,
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    buttonHover: {
      backgroundColor: '#ff5722',
      transform: 'scale(1.05)',
    },
    error: {
      color: 'red',
      marginTop: '15px',
      fontSize: '14px',
      textAlign: 'center',
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
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.header}>Godown Login</h2>
        <div>
          <label style={styles.label}>Godown Email :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter godown email"
          />
        </div>
        <div>
          <label style={styles.label}>Password :</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter password"
          />
        </div>
        <button
          type="submit"
          style={styles.button}
        >
          Login
        </button>
        {error && <p style={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default LoginForm;
