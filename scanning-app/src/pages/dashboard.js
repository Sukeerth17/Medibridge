import React, { useState, useEffect } from 'react';
import ReportUploadForm from '../components/ReportUploadForm';
import StatusDashboard from '../components/StatusDashboard';

/**
 * Main dashboard page for the Scanning Center.
 * It fetches and displays the list of all reports and their statuses.
 * It also includes the form to upload new reports.
 */
export default function Dashboard() {
  // State to hold the list of reports
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  // --- Mock Data & API Simulation ---
  // In a real app, this useEffect would fetch the reports from the Go API
  useEffect(() => {
    // Simulating GET /v1/scanning/reports
    console.log('Fetching reports from backend...');
    const mockReports = [
      { id: 'rep-001', patientName: 'Jane Doe', scanType: 'MRI - Brain', status: 'Ready to Share' },
      { id: 'rep-002', patientName: 'John Smith', scanType: 'CT Scan - Chest', status: 'AI Processing' },
      { id: 'rep-003', patientName: 'Alice Brown', scanType: 'X-Ray - Left Arm', status: 'Uploaded' },
    ];
    setReports(mockReports);
  }, []);

  // Callback function for when a new report is successfully uploaded
  const handleUploadSuccess = (newReport) => {
    // Adds the newly uploaded report to the top of the list
    // The real API would return this new report object
    const reportWithStatus = {
      ...newReport,
      id: `rep-00${reports.length + 1}`, // Mock ID
      status: 'Uploaded', // Initial status after upload
    };
    setReports([reportWithStatus, ...reports]);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    // In Next.js, you'd use router.push('/')
    window.location.href = '/'; 
    console.log('Logged out');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h1 style={{ color: '#333' }}>Scanning Center Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 12px', backgroundColor: '#d9534f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Log Out
        </button>
      </header>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <main style={{ marginTop: '20px' }}>
        {/* Section 1: The Upload Form */}
        <ReportUploadForm onUploadSuccess={handleUploadSuccess} />

        {/* Section 2: The Status Monitor */}
        <StatusDashboard reports={reports} />
      </main>
    </div>
  );
}
