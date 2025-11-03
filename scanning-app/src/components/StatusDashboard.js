import React from 'react';

export default function StatusDashboard({ reports, onShareReport }) {

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready to Share':
        return '#28a745';
      case 'AI Processing':
        return '#fd7e14';
      case 'Uploaded':
        return '#6c757d';
      case 'Shared':
        return '#007bff';
      default:
        return '#333';
    }
  };

  const statusBadgeStyle = (status) => ({
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '12px',
    backgroundColor: getStatusColor(status),
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
  });

  const handleShare = (reportId) => {
    console.log(`Sharing report: ${reportId}`);
    onShareReport(reportId);
  };

  const tableHeaderStyle = {
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #ddd',
  };

  const tableCellStyle = {
    padding: '12px',
    textAlign: 'left',
    verticalAlign: 'top',
  };

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Processing Status Monitor</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead style={{ backgroundColor: '#f9f9f9' }}>
          <tr>
            <th style={tableHeaderStyle}>Patient Details</th>
            <th style={tableHeaderStyle}>Scan Details</th>
            <th style={tableHeaderStyle}>Status</th>
            <th style={{...tableHeaderStyle, textAlign: 'center'}}>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No reports found. Upload one above to begin.</td>
            </tr>
          )}
          {reports.map((report) => (
            <tr key={report.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={tableCellStyle}>
                <strong>{report.patientName}</strong> (ID: {report.patientId})
                <br/>{report.age} years old
              </td>
              <td style={tableCellStyle}>
                <strong>{report.scanType}</strong>
                {report.scanDateTime && (
                  <>
                    <br/>{new Date(report.scanDateTime).toLocaleString()}
                  </>
                )}
                <br/>Ref: {report.referringClinic}
              </td>
              <td style={tableCellStyle}>
                <span style={statusBadgeStyle(report.status)}>{report.status}</span>
              </td>
              <td style={{...tableCellStyle, textAlign: 'center'}}>
                {report.status === 'Ready to Share' ? (
                  <button 
                    onClick={() => handleShare(report.id)}
                    style={{ 
                      padding: '5px 10px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer' 
                    }}
                  >
                    Share
                  </button>
                ) : (
                  <span style={{ color: '#999', fontSize: '12px' }}>{report.status === 'Shared' ? 'Completed' : 'Processing...'}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}