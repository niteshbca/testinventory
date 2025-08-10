import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [excelFiles, setExcelFiles] = useState([]);
  const [showFilesModal, setShowFilesModal] = useState(false);

  useEffect(() => {
    fetchExcelFiles();
  }, []);

  const fetchExcelFiles = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/excel-files`);
      const data = await response.json();
      setExcelFiles(data);
    } catch (error) {
      console.error('Error fetching Excel files:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel' || 
                 file.type === 'text/csv')) {
      setSelectedFile(file);
    } else {
      alert('Please select a valid Excel file (.xlsx, .xls, .csv)');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('excelFile', selectedFile);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload-excel`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert('File uploaded successfully!');
        setShowUploadModal(false);
        setSelectedFile(null);
        fetchExcelFiles();
      } else {
        alert('Error uploading file: ' + data.message);
      }
    } catch (error) {
      alert('Error uploading file');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/download-excel/${fileId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error downloading file');
      }
    } catch (error) {
      alert('Error downloading file');
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/delete-excel/${fileId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('File deleted successfully!');
          fetchExcelFiles();
        } else {
          alert('Error deleting file');
        }
      } catch (error) {
        alert('Error deleting file');
        console.error('Delete error:', error);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

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
        <button 
          style={styles.button} 
          onClick={() => setShowUploadModal(true)}
        >
          Excel Upload
        </button>
        <button 
          style={styles.button} 
          onClick={() => setShowFilesModal(true)}
        >
          View Files
        </button>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalHeader}>Upload Excel File</h3>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              style={styles.fileInput}
            />
            {selectedFile && (
              <p style={styles.fileInfo}>Selected: {selectedFile.name}</p>
            )}
            <div style={styles.modalButtons}>
              <button 
                onClick={handleUpload} 
                disabled={uploading || !selectedFile}
                style={styles.modalButton}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                style={styles.modalButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Files Modal */}
      {showFilesModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalHeader}>Uploaded Excel Files</h3>
            <div style={styles.filesList}>
              {excelFiles.length === 0 ? (
                <p style={styles.noFiles}>No files uploaded yet</p>
              ) : (
                excelFiles.map((file) => (
                  <div key={file._id} style={styles.fileItem}>
                    <div style={styles.fileInfo}>
                      <p style={styles.fileName}>{file.originalName}</p>
                      <p style={styles.fileDetails}>
                        Size: {formatFileSize(file.size)} | 
                        Uploaded: {formatDate(file.uploadDate)}
                      </p>
                    </div>
                    <div style={styles.fileActions}>
                      <button 
                        onClick={() => handleDownload(file._id, file.originalName)}
                        style={styles.actionButton}
                      >
                        Download
                      </button>
                      <button 
                        onClick={() => handleDelete(file._id)}
                        style={styles.deleteButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              onClick={() => setShowFilesModal(false)}
              style={styles.modalButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '15px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
  },
  modalHeader: {
    textAlign: 'center',
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333',
  },
  fileInput: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
    border: '2px dashed #ccc',
    borderRadius: '8px',
  },
  fileInfo: {
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '5px',
    textAlign: 'center',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
  },
  modalButton: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  filesList: {
    maxHeight: '400px',
    overflow: 'auto',
    marginBottom: '20px',
  },
  noFiles: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: '#f9f9f9',
  },
  fileName: {
    fontWeight: 'bold',
    margin: '0 0 5px 0',
    color: '#333',
  },
  fileDetails: {
    margin: '0',
    fontSize: '12px',
    color: '#666',
  },
  fileActions: {
    display: 'flex',
    gap: '10px',
  },
  actionButton: {
    padding: '5px 10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteButton: {
    padding: '5px 10px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontSize: '12px',
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
