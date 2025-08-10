import React, { useState, useEffect } from "react";

const Godown = () => {
  const [godowns, setGodowns] = useState([]);
  const [newGodown, setNewGodown] = useState({ name: "", address: "", email: "", password: "", city: "", state: "" });
  const [editId, setEditId] = useState(null);
  const [editGodown, setEditGodown] = useState({ name: "", address: "", email: "", password: "", city: "", state: "" });

  // Fetch Godowns from the database when the component mounts
  useEffect(() => {
    fetchGodowns();
  }, []);

  const fetchGodowns = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/godowns`
      );
      const data = await response.json();
      setGodowns(data);
    } catch (error) {
      console.error("Error fetching godowns:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGodown({ ...newGodown, [name]: value });
  };

  const handleAddGodown = async () => {
    if (newGodown.name && newGodown.address && newGodown.email && newGodown.password && newGodown.city && newGodown.state) {
      // Check for duplicate email
      if (godowns.some((g) => g.email === newGodown.email)) {
        alert('Email already exists. Please use a unique email.');
        return;
      }
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/godowns`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newGodown),
          }
        );

        const data = await response.json();
        if (data && data.email === newGodown.email) {
          setGodowns([...godowns, data]);
          setNewGodown({ name: "", address: "", email: "", password: "", city: "", state: "" });
          console.log("Godown added to database", data);
        } else if (data && data.message && data.message.includes('duplicate')) {
          alert('Email already exists. Please use a unique email.');
        }
      } catch (error) {
        console.error("Error adding godown:", error);
      }
    }
  };

  const handleRemoveGodown = async (id) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/godowns/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setGodowns(godowns.filter((godown) => godown._id !== id));
        console.log("Godown removed from database");
      }
    } catch (error) {
      console.error("Error deleting godown:", error);
    }
  };

  const handleEditClick = (godown) => {
    setEditId(godown._id);
    setEditGodown({
      name: godown.name,
      address: godown.address,
      email: godown.email,
      password: godown.password,
      city: godown.city,
      state: godown.state,
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditGodown({ ...editGodown, [name]: value });
  };

  const handleSaveEdit = async (id) => {
    // Check for duplicate email (excluding the current editing godown)
    if (godowns.some((g) => g.email === editGodown.email && g._id !== id)) {
      alert('Email already exists. Please use a unique email.');
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/godowns/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editGodown),
        }
      );
      if (response.ok) {
        const updated = await response.json();
        setGodowns(godowns.map((g) => (g._id === id ? updated : g)));
        setEditId(null);
        setEditGodown({ name: "", address: "", email: "", password: "", city: "", state: "" });
      } else {
        const data = await response.json();
        if (data && data.message && data.message.includes('duplicate')) {
          alert('Email already exists. Please use a unique email.');
        }
      }
    } catch (error) {
      console.error("Error updating godown:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditGodown({ name: "", address: "", email: "", password: "", city: "", state: "" });
  };

  return (
    <div style={styles.container}>
      <style>{globalStyles1}</style>
      <h2 style={styles.header}>Godown Page</h2>
      <p style={styles.description}>
        Welcome to the Godown page. Here you can manage the storage facilities
        and the goods within.
      </p>

      <div style={styles.formContainer}>
        <input
          type="text"
          name="name"
          value={newGodown.name}
          onChange={handleInputChange}
          placeholder="Enter Godown Name"
          style={styles.input}
        />
        <input
          type="text"
          name="address"
          value={newGodown.address}
          onChange={handleInputChange}
          placeholder="Enter Godown Address"
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          value={newGodown.email}
          onChange={handleInputChange}
          placeholder="Enter Godown Email"
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          value={newGodown.password}
          onChange={handleInputChange}
          placeholder="Enter Godown Password"
          style={styles.input}
        />
        <input
          type="text"
          name="city"
          value={newGodown.city}
          onChange={handleInputChange}
          placeholder="Enter City"
          style={styles.input}
        />
        <input
          type="text"
          name="state"
          value={newGodown.state}
          onChange={handleInputChange}
          placeholder="Enter State"
          style={styles.input}
        />
        <button onClick={handleAddGodown} style={styles.addButton}>
          Add Godown
        </button>
      </div>

      <div style={styles.godownList}>
        {godowns.length === 0 ? (
          <p>No Godowns available</p>
        ) : (
          godowns.map((godown) => (
            <div key={godown._id} style={styles.godownItem}>
              {editId === godown._id ? (
                <>
                  <input
                    type="text"
                    name="name"
                    value={editGodown.name}
                    onChange={handleEditInputChange}
                    style={styles.input}
                  />
                  <input
                    type="text"
                    name="address"
                    value={editGodown.address}
                    onChange={handleEditInputChange}
                    style={styles.input}
                  />
                  <input
                    type="email"
                    name="email"
                    value={editGodown.email}
                    onChange={handleEditInputChange}
                    style={styles.input}
                  />
                  <input
                    type="password"
                    name="password"
                    value={editGodown.password}
                    onChange={handleEditInputChange}
                    style={styles.input}
                  />
                  <input
                    type="text"
                    name="city"
                    value={editGodown.city}
                    onChange={handleEditInputChange}
                    style={styles.input}
                  />
                  <input
                    type="text"
                    name="state"
                    value={editGodown.state}
                    onChange={handleEditInputChange}
                    style={styles.input}
                  />
                  <button onClick={() => handleSaveEdit(godown._id)} style={styles.addButton}>
                    Save
                  </button>
                  <button onClick={handleCancelEdit} style={{ ...styles.removeButton, marginLeft: 10 }}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <p>
                    <strong>Name:</strong> {godown.name}
                  </p>
                  <p>
                    <strong>Address:</strong> {godown.address}
                  </p>
                  <p>
                    <strong>Email:</strong> {godown.email}
                  </p>
                  <p>
                    <strong>Password:</strong> {godown.password}
                  </p>
                  <p>
                    <strong>City:</strong> {godown.city}
                  </p>
                  <p>
                    <strong>State:</strong> {godown.state}
                  </p>
                  <button
                    onClick={() => handleEditClick(godown)}
                    style={styles.addButton}
                  >
                    Edit
                  </button>
                  <span style={{ display: 'inline-block', width: 10 }} />
                  <button
                    onClick={() => handleRemoveGodown(godown._id)}
                    style={styles.removeButton}
                  >
                    Remove Godown
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "20px",
   background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
    backgroundSize: '400% 400%',
    animation: 'gradientAnimation 12s ease infinite',
    color: "#fff",
    textAlign: "center",
  },
  header: {
    fontSize: "48px",
    fontWeight: "bold",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
    marginBottom: "20px",
  },
  description: {
    fontSize: "20px",
    marginBottom: "30px",
    color: "#fff",
  },
  formContainer: {
    marginBottom: "30px",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    animation: "form-animation 5s infinite alternate",
    boxShadow: "0px 5px 15px rgba(0,0,0,0.3)",
  },
  input: {
    padding: "10px 15px",
    margin: "10px",
    borderRadius: "18px",
    border: "2px solid #fff",
    outline: "none",
    fontSize: "16px",
    width: "250px",
  },
  addButton: {
    padding: "12px 20px",
    backgroundColor: 'rgba(218, 216, 224, 0.8)',
    color: "#fff",
    border: "none",
    borderRadius: "28px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "transform 0.2s, background-color 0.3s",
  },
  godownList: {
    width: "100%",
    maxWidth: "800px",
    marginTop: "30px",
  },
  godownItem: {
    padding: "20px",
    margin: "15px 0",
    borderRadius: "28px",
    backgroundColor: 'rgba(218, 216, 224, 0.6)',
    boxShadow: "0px 5px 15px rgba(0,0,0,0.3)",
    transition: "transform 0.2s",
    transform: "scale(1)",
  },
  removeButton: {
    padding: "8px 15px",
    backgroundColor: 'rgba(218, 216, 224, 0.8)',
    color: "#fff",
    border: "none",
    borderRadius: "28px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background-color 0.3s",
  },
};

// Add global animation styles
const globalStyles = `
@keyframes bg-animation {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
@keyframes form-animation {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}
`;

const globalStyles1 = `
@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  25% { background-position: 50% 100%; }
  50% { background-position: 100% 50%; }
  75% { background-position: 50% 0%; }
  100% { background-position: 0% 50%; }
}
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = globalStyles;
document.head.appendChild(styleSheet);

export default Godown;
