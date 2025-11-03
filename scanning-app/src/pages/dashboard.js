import React, { useState, useEffect } from 'react';
import ReportUploadForm from '../components/ReportUploadForm';
import StatusDashboard from '../components/StatusDashboard';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Fetching reports from backend...');
    const mockReports = [
      { 
        id: 'rep-001', 
        patientName: 'Jane Doe', 
        patientId: 'PAT001',
        age: 45,
        scanType: 'MRI - Brain', 
        referringClinic: 'City Hospital',
        scanDateTime: new Date().toISOString(),
        status: 'Ready to Share' 
      },
      { 
        id: 'rep-002', 
        patientName: 'John Smith', 
        patientId: 'PAT002',
        age: 62,
        scanType: 'CT Scan - Chest', 
        referringClinic: 'Metro Clinic',
        scanDateTime: new Date(Date.now() - 86400000).toISOString(),
        status: 'AI Processing' 
      },
      { 
        id: 'rep-003', 
        patientName: 'Alice Brown', 
        patientId: 'PAT003',
        age: 28,
        scanType: 'X-Ray - Left Arm', 
        referringClinic: 'Community Health',
        scanDateTime: new Date(Date.now() - 172800000).toISOString(),
        status: 'Uploaded' 
      },
    ];
    setReports(mockReports);
  }, []);

  const handleUploadSuccess = (newReport) => {
    const reportWithStatus = {
      ...newReport,
      id: `rep-${Date.now()}`,
      status: 'Uploaded',
    };
    setReports([reportWithStatus, ...reports]);
  };

  const handleShareReport = (reportId) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status: 'Shared' } : report
    ));
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
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
        <ReportUploadForm onUploadSuccess={handleUploadSuccess} />
        <StatusDashboard reports={reports} onShareReport={handleShareReport} />
      </main>
    </div>
  );
}