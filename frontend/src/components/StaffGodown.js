import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function StaffGodown({ isAuthenticated }) {
  const [godowns, setGodowns] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch godowns data from the backend if authenticated
    if (isAuthenticated) {
      axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/godowns`)
        .then(response => {
          setGodowns(response.data);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    } else {
      navigate('/login');  // Redirect to login if not authenticated
    }
  }, [isAuthenticated, navigate]);

  const handleClick = (godown) => {
    navigate('/godown-details', { state: { godown } });
  };

  return (
    <div style={styles.container}>
      {godowns.length === 0 ? (
        <h3>No Godowns Available</h3>
      ) : (
        godowns.map((godown, index) => (
          <div key={index} style={styles.godownCard}>
            <h3 style={styles.cardTitle}>{godown.name}</h3>
            <p style={styles.cardDescription}>{godown.address}</p>
            <button onClick={() => handleClick(godown)} style={styles.button}>
              View Details
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: '30px',
    background: 'linear-gradient(to right, #6a11cb, #2575fc)',
  },
  godownCard: {
    width: '250px',
    padding: '20px',
    margin: '15px',
    borderRadius: '15px',
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff',
    textAlign: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  cardTitle: {
    fontSize: '1.2rem',
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  cardDescription: {
    color: '#7f8c8d',
    marginBottom: '20px',
    fontSize: '1rem',
  },
  button: {
    padding: '12px 18px',
    backgroundColor: '#f39c12',
    color: '#fff',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
  },
};

export default StaffGodown;
