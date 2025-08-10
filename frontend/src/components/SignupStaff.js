import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SignupStaff = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [users, setUsers] = useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        fetchUsers();

        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/users`);
            setUsers(response.data);
        } catch (err) {
            console.error("Error fetching users", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/signup`, {
                username,
                email,
                password,
            });
            alert('Signup successful');
            fetchUsers();
        } catch (err) {
            setError(err.response.data.message);
        }
    };

    const handleDelete = async (userId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/users/${userId}`);
            alert('User deleted');
            fetchUsers();
        } catch (err) {
            console.error("Error deleting user", err);
        }
    };

    const styles = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: '20px',
            background: 'linear-gradient(-45deg, #fcb900, #9900ef, #ff6900, #00ff07)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            flexDirection: windowWidth <= 600 ? 'column' : 'row',
        },
        formContainer: {
            width: '100%',
            maxWidth: '500px',
            padding: '25px',
            borderRadius: '12px',
            backgroundColor: 'rgba(218, 216, 224, 0.6)',
          animation: "gradientBG 10s ease infinite",
          flexDirection: windowWidth <= 600 ? "column" : "row",
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 1s ease',
            margin: windowWidth <= 600 ? '0' : '20px',
        },
        header: {
            textAlign: 'center',
            marginBottom: '20px',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: '600',
            fontSize: '29px',
            color:'white',
        },
        formGroup: {
            marginBottom: '15px',
        },
        label: {
            display: 'block',
            fontWeight: 'bold',
            marginBottom: '5px',
            fontFamily: "'Roboto', sans-serif",
            color: 'white',
            fontSize:'20px',
        },
        input: {
            width: '94%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '18px',
            fontSize: '16px',
            fontFamily: "'Roboto', sans-serif",
            transition: 'box-shadow 0.3s ease',
        },
        inputFocus: {
            boxShadow: '0 0 8px rgba(0, 128, 255, 0.5)',
        },
        button: {
            width: '100%',
            padding: '12px',
            backgroundColor: 'rgba(218, 216, 224, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '28px',
            fontSize: '20px',
            fontFamily: "'Roboto', sans-serif",
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
        },
        buttonHover: {
            backgroundColor: 'rgba(218, 216, 224, 0.8)',
        },
        buttonActive: {
            transform: 'scale(0.98)',
        },
        error: {
            color: 'red',
            fontSize: '14px',
            marginTop: '10px',
            textAlign: 'center',
        },
        userList: {
            listStyleType: 'none',
            padding: 0,
            marginTop: '20px',
            width: '100%',
        },
        userItem: {
            marginBottom: '10px',
            padding: '10px',
            backgroundColor: '#f9f9f9',
            borderRadius: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: "'Roboto', sans-serif",
        },
        userItemButton: {
            padding: '8px 12px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '28px',
            cursor: 'pointer',
        },
    };

    return (
        <div style={styles.container}>
            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
            <div style={styles.formContainer}>
                <h2 style={styles.header}>Signup</h2>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Username:</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            onFocus={(e) => (e.target.style.boxShadow = styles.inputFocus.boxShadow)}
                            onBlur={(e) => (e.target.style.boxShadow = 'none')}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            onFocus={(e) => (e.target.style.boxShadow = styles.inputFocus.boxShadow)}
                            onBlur={(e) => (e.target.style.boxShadow = 'none')}
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            onFocus={(e) => (e.target.style.boxShadow = styles.inputFocus.boxShadow)}
                            onBlur={(e) => (e.target.style.boxShadow = 'none')}
                        />
                    </div>
                    {error && <p style={styles.error}>{error}</p>}
                    <button
                        type="submit"
                        style={styles.button}
                        onMouseOver={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
                        onMouseOut={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
                        onMouseDown={(e) => (e.target.style.transform = styles.buttonActive.transform)}
                        onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
                    >
                        Signup
                    </button>
                </form>

                <h3 style={styles.header}>User List</h3>
                <ul style={styles.userList}>
                    {users.map((user) => (
                        <li key={user._id} style={styles.userItem}>
                            {user.username} - {user.email}
                            <button onClick={() => handleDelete(user._id)} style={styles.userItemButton}>
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SignupStaff;
