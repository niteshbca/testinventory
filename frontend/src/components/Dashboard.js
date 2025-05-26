import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div style={styles.container}>
       <style>{globalStyles}</style>
      <h2 style={styles.header}>Admin Dashboard</h2>
      <div style={styles.buttonContainer}>
        <Link to="/itemCountSummary" style={styles.link}>
          <button style={styles.button}>Inventory</button>
        </Link>
        <Link to="/signupstaff" style={styles.link}>
          <button style={styles.button}>Staff</button>
        </Link>
        <Link to="/godown" style={styles.link}>
          <button style={styles.button}>Godown</button>
        </Link>
        <Link to="/sales" style={styles.link}>
          <button style={styles.button}>Sale</button>
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
    padding: '20px',
    backgroundSize: '400% 400%',
    animation: 'gradientAnimation 12s ease infinite',
  },
  header: {
    fontSize: '44px',
    color: '#ffffff',
    fontFamily: "'Arial', sans-serif",
    textAlign: 'center',
    marginBottom: '30px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  buttonContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
  },
  button: {
    padding: '15px 30px',
    fontSize: '1.6rem',
    backgroundColor: 'rgba(218, 216, 224, 0.8)',
    color: '#fff',
    border: 'none',
    borderRadius: '28px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, transform 0.3s ease',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '0.5px',
  },
  buttonHover: {
    backgroundColor: '#45a049',
    transform: 'scale(1.1)',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
  },
  '@keyframes fadeIn': {
    '0%': {
      opacity: 0,
    },
    '100%': {
      opacity: 1,
    },
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

export default Dashboard;
