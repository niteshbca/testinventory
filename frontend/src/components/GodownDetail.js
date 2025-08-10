import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function GodownDetail() {
  const location = useLocation();
  const godown = location.state?.godown;  // Get godown data from state

  // Load all stored godown data from localStorage
  const storedData = JSON.parse(localStorage.getItem('godownsData')) || [];

  // Get the current godown data from the stored data or initialize it
  const storedGodownData = storedData.find((item) => item.name === godown.name) || {...godown, additionalItems: []};

  const [newItem, setNewItem] = useState("");  // State for the new item to be added
  const [godownData, setGodownData] = useState(storedGodownData);  // Using the stored data

  // Update localStorage whenever godownData changes
  useEffect(() => {
    const updatedData = storedData.filter(item => item.name !== godownData.name);  // Remove the old godown data
    updatedData.push(godownData);  // Add the updated godown data to the list

    localStorage.setItem('godownsData', JSON.stringify(updatedData));  // Save updated data to localStorage
  }, [godownData]);

  const handleAddItem = () => {
    if (newItem.trim()) {
      // Simply add the new item to the current godown
      const updatedGodownData = {
        ...godownData,
        additionalItems: [...godownData.additionalItems, newItem],
      };

      setGodownData(updatedGodownData); // Update the godownData state

      // Save updated data to localStorage
      const updatedStoredData = storedData.map((item) => {
        if (item.name === godownData.name) {
          return updatedGodownData;
        }
        return item;
      });

      localStorage.setItem('godownsData', JSON.stringify(updatedStoredData)); // Save to localStorage
      setNewItem("");  // Clear the input field
    }
  };

  const handleDeleteItem = (itemToDelete) => {
    // Remove the item from the current Godown
    const updatedGodownData = {
      ...godownData,
      additionalItems: godownData.additionalItems.filter((item) => item !== itemToDelete),
    };
    setGodownData(updatedGodownData);

    // Remove the item from all Godowns in localStorage
    const updatedStoredData = storedData.map((item) => {
      if (item.name === godownData.name) {
        // Remove item from the current Godown
        return updatedGodownData;
      }
      // Remove item from other Godowns if it exists
      return {
        ...item,
        additionalItems: item.additionalItems.filter((i) => i !== itemToDelete),
      };
    });

    localStorage.setItem('godownsData', JSON.stringify(updatedStoredData));  // Save updated data to localStorage
  };

  return (
    <div style={styles.container}>
      {godownData ? (
        <>
          <h2 style={styles.title}>Godown Details</h2>
          <h3 style={styles.godownName}>{godownData.name}</h3>
          <p style={styles.description}>Address: {godownData.address}</p>
          <div style={styles.addItemSection}>
            <input 
              type="text" 
              value={newItem} 
              onChange={(e) => setNewItem(e.target.value)} 
              style={styles.input}
              placeholder="Add an item or description" 
            />
            <button onClick={handleAddItem} style={styles.addButton}>Add</button>
          </div>
          {godownData.additionalItems.length > 0 && (
            <div style={styles.additionalItems}>
              <h4 style={styles.additionalItemsTitle}>Additional Items:</h4>
              <ul>
                {godownData.additionalItems.map((item, index) => (
                  <li key={index} style={styles.item}>
                    {item} 
                    <button 
                      onClick={() => handleDeleteItem(item)} 
                      style={styles.deleteButton}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p style={styles.error}>Godown details not found.</p>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
    background: '#ecf0f1',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
  },
  godownName: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  description: {
    color: '#7f8c8d',
    marginTop: '10px',
  },
  addItemSection: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  input: {
    padding: '8px',
    fontSize: '1rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
    width: '200px',
  },
  addButton: {
    padding: '8px 15px',
    backgroundColor: '#f39c12',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  additionalItems: {
    marginTop: '20px',
    textAlign: 'left',
    display: 'inline-block',
  },
  additionalItemsTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  item: {
    fontSize: '1rem',
    color: '#7f8c8d',
    marginTop: '5px',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#e74c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    marginLeft: '10px',
    transition: 'background-color 0.3s ease',
  },
  error: {
    color: 'red',
  },
};

export default GodownDetail;
