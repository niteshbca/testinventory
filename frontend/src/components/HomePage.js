import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        fontFamily: "'Poppins', sans-serif",
        color: '#444',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background Video */}
      <video
        src="https://cdn.dribbble.com/userupload/14351043/file/original-e8f92507edede186d6fa91bf0aec6760.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
        }}
      ></video>

      <h1
        style={{
          fontSize: '3.9rem',
          color: 'white', // Sky blue color
          marginBottom: '29px',
          animation: 'fadeIn 1.5s ease-out',
          position: 'absolute',
          fontFamily:'Arial Rounded MT Bold',
          top: '20px', // Positioned at the top
          fontWeight:'bold',
        }}
      >
        Welcome 
      </h1>

      <div style={{ marginTop: '100px' }}>
        <button
          style={{
            backgroundColor: 'rgba(218, 216, 224, 0.8)',
            color: 'white',
            border: 'none',
            padding: '15px 32px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '25px',
            margin: '10px',
            borderRadius: '28px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s ease, transform 0.3s ease',
            fontFamily: "'Poppins', sans-serif",
          }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        >
          <Link
            to="/loginadmin"
            style={{
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Login as Admin
          </Link>
        </button>

        <button
          style={{
            backgroundColor: 'rgba(218, 216, 224, 0.8)',
            color: 'white',
            border: 'none', 
            padding: '15px 32px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '25px',
            margin: '10px',
            borderRadius: '28px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s ease, transform 0.3s ease',
            fontFamily: "'Poppins', sans-serif",
          }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        >
          <Link
            to="/loginstaff"
            style={{
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Login as Staff
          </Link>
        </button>

        <button
          style={{
            backgroundColor: 'rgba(218, 216, 224, 0.8)',
            color: 'white',
            border: 'none',
            padding: '15px 32px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '24px',
            margin: '10px',
            borderRadius: '28px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s ease, transform 0.3s ease',
            fontFamily: "'Poppins', sans-serif",
          }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        >
          <Link
            to="/loginfrom"
            style={{
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Login as Godown
          </Link>
        </button>

        <button
          style={{
            backgroundColor: 'rgba(218, 216, 224, 0.8)',
            color: 'white',
            border: 'none',
            padding: '15px 32px',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'inline-block',
            fontSize: '24px',
            margin: '10px',
            borderRadius: '28px',
            cursor: 'pointer',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'background-color 0.3s ease, transform 0.3s ease',
            fontFamily: "'Poppins', sans-serif",
          }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
        >
          <Link
            to="/billing"
            style={{
              color: 'white',
              textDecoration: 'none',
            }}
          >
            Billing
          </Link>
        </button>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(-20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          h1 {
            animation: fadeIn 1.5s ease-out;
          }

          button {
            transition: background-color 0.3s ease, transform 0.3s ease;
          }

          button:hover {
            transform: scale(1.1);
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;
