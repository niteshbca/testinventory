import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const apiUrl = process.env.REACT_APP_BACKEND_URL;

    try {
      const response = await axios.post(`${apiUrl}/loginadmin`, {
        username,
        password,
      });

      if (response.data.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage('Invalid credentials');
      }
    } catch (error) {
      setErrorMessage('Error connecting to the server');
    }
  };

  return (
    <div style={styles.container}>
      <style>{globalStyles}</style>
      <div style={styles.card}>
        <h2 style={styles.header}>Login Admin</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputContainer}>
          <label style={styles.label}>User Name :</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputContainer}>
          <label style={styles.label}>Password :</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>Login</button>
          {errorMessage && <p style={styles.error}>{errorMessage}</p>}
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
    backgroundSize: '400% 400%',
    animation: 'gradientAnimation 12s ease infinite',
  },
  card: {
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    padding: '40px',
    borderRadius: '15px',
    backdropFilter: 'blur(15px)',
    boxShadow: '0 10px 30px rgba(106, 12, 236, 0.5)',
    textAlign: 'center',
    color: '#fff',
    width: '350px',
  },
  header: {
    fontSize: '2rem',
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    textAlign: 'left',
    marginBottom: '5px',
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
  },

  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: '20px',
  },
  input: {
    width: '90%',
    padding: '10px 15px',
    fontSize: '1.2rem',
    border: 'none',
    borderRadius: '18px',
    outline: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    caretColor: '#fff',
    transition: 'background-color 0.3s ease',
  },
  button: {
    width: '100%',
    padding: '12px',
    fontSize: '1.5rem',
    backgroundColor: 'rgba(218, 216, 224, 0.8)',
    color: 'white',
    border: 'none',
    borderRadius: '28px',
    cursor: 'pointer',
    transition: 'background-color 0.3s, transform 0.3s',
  },
  error: {
    color: 'red',
    fontSize: '0.9rem',
    marginTop: '15px',
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

export default AdminLogin;
