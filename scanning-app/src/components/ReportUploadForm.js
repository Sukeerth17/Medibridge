import React, { useState, useCallback } from 'react';

/**
 * Component for the "Digital Report Metadata Form" and "Original Report Upload".
 * This form will eventually call POST /v1/scanning/reports/upload
 */
export default function ReportUploadForm({ onUploadSuccess }) {
  const [formData, setFormData] = useState({
    patientName: '',
    patientId: '', // Patient's Unique ID
    age: '',
    scanType: '',
    referringClinic: '',
    scanDateTime: '', // <-- ADDED THIS
  });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- File Drag-and-Drop Handlers ---
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };
  // --- End Handlers ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please attach a report file (PDF).');
      return;
    }
    setError('');
    setIsUploading(true);
    console.log('Uploading report with metadata:', formData);

    // --- API Call Simulation (POST /v1/scanning/reports/upload) ---
    // In a real app, you'd use FormData to send the file + metadata
    // const apiFormData = new FormData();
    // apiFormData.append('file', file);
    // apiFormData.append('patientName', formData.patientName);
    // apiFormData.append('patientId', formData.patientId);
    // ... (append all other form data) ...
    // apiFormData.append('scanDateTime', formData.scanDateTime); // <-- ADD THIS TO API CALL
    //
    // const token = localStorage.getItem('jwt_token');
    // const response = await fetch('/api/v1/scanning/reports/upload', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${token}` },
    //   body: apiFormData
    // });
    // if (response.ok) {
    //   const newReport = await response.json();
    //   onUploadSuccess(newReport); // Pass data to parent
    //   setFormData({ patientName: '', patientId: '', age: '', scanType: '', referringClinic: '', scanDateTime: '' }); // <-- UPDATED THIS
    //   setFile(null);
    // } else {
    //   setError('Upload failed. Please try again.');
    // }
    // --- End Simulation ---

    // Simulating success
    setTimeout(() => {
      onUploadSuccess(formData); // Pass mock data to parent
      setFormData({ patientName: '', patientId: '', age: '', scanType: '', referringClinic: '', scanDateTime: '' }); // <-- UPDATED THIS
      setFile(null);
      setIsUploading(false);
    }, 1000);
  };

  const dropzoneStyle = {
    border: `2px dashed ${dragOver ? '#007bff' : '#ccc'}`,
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
    backgroundColor: dragOver ? '#f0f8ff' : '#f9f9f9',
    cursor: 'pointer',
    marginBottom: '15px'
  };

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <h2>Upload New Report</h2>
      <form onSubmit={handleSubmit}>
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
          <legend>Digital Report Metadata</legend>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} placeholder="Patient Full Name" required style={{ padding: '10px' }} />
            <input type="text" name="patientId" value={formData.patientId} onChange={handleChange} placeholder="Patient Unique ID" required style={{ padding: '10px' }} />
            <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Patient Age" required style={{ padding: '10px' }} />
            <input type="text" name="scanType" value={formData.scanType} onChange={handleChange} placeholder="Type of Scan" required style={{ padding: '10px' }} />
            <input type="text" name="referringClinic" value={formData.referringClinic} onChange={handleChange} placeholder="Referring Clinic/Doctor" required style={{ padding: '10px' }} />
            {/* --- ADDED THIS INPUT --- */}
            <input type="datetime-local" name="scanDateTime" value={formData.scanDateTime} onChange={handleChange} placeholder="Date/Time of Scan" required style={{ padding: '10px' }} />
          </div>
        </fieldset>
        
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
          <legend>Original Report Upload</legend>
          <input
            type="file"
            id="file-upload"
            accept=".pdf" // Restrict to PDF
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <label htmlFor="file-upload">
            <div
              style={dropzoneStyle}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? `File selected: ${file.name}` : 'Drag & drop PDF report here, or click to select file'}
            </div>
          </label>
        </fieldset>

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <button 
          type="submit" 
          disabled={isUploading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            backgroundColor: isUploading ? '#ccc' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            marginTop: '20px', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {isUploading ? 'Uploading...' : 'Upload Report'}
        </button>
      </form>
    </div>
  );
}