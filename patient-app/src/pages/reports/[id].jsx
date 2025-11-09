import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { patientAPI, isAuthenticated } from '../../lib/api';

export default function ReportDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/');
      return;
    }

    if (id) {
      fetchReport();
    }
  }, [id]);

  const fetchReport = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await patientAPI.getReportById(id);
      setReport(data.report || data);
    } catch (err) {
      console.error('Failed to fetch report:', err);
      setError(err.message || 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <h2>Failed to Load Report</h2>
          <p style={styles.errorText}>{error || 'Report not found'}</p>
          <div style={styles.errorActions}>
            <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>
              ← Back to Dashboard
            </button>
            <button onClick={fetchReport} style={styles.retryBtn}>
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusColor = {
    'Ready to Share': '#10B981',
    'AI Processing': '#FBBF24',
    'Uploaded': '#6B7280',
  }[report.status] || '#6B7280';

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>
              🔬 {report.scan_type || 'Medical Report'}
            </h1>
            <div style={styles.headerMeta}>
              <span style={{...styles.statusBadge, backgroundColor: statusColor}}>
                {report.status}
              </span>
              {report.created_at && (
                <span style={styles.dateText}>
                  {new Date(report.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Report Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 Report Information</h2>
          <div style={styles.infoGrid}>
            {report.scanning_center_id && (
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Scanning Center</div>
                <div style={styles.infoValue}>{report.scanning_center_id}</div>
              </div>
            )}
            {report.referring_clinic_id && (
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Referred By</div>
                <div style={styles.infoValue}>{report.referring_clinic_id}</div>
              </div>
            )}
            {report.scan_type && (
              <div style={styles.infoItem}>
                <div style={styles.infoLabel}>Test Type</div>
                <div style={styles.infoValue}>{report.scan_type}</div>
              </div>
            )}
            <div style={styles.infoItem}>
              <div style={styles.infoLabel}>Report ID</div>
              <div style={{...styles.infoValue, fontFamily: 'monospace', fontSize: '13px'}}>
                {report.id}
              </div>
            </div>
          </div>
        </div>

        {/* Simplified Summary (Patient-Friendly) */}
        {report.simplified_summary && (
          <div style={styles.section}>
            <div style={styles.summaryHeader}>
              <h2 style={styles.sectionTitle}>
                📝 Summary (Easy to Understand)
              </h2>
              <span style={styles.aiPoweredBadge}>✨ AI Simplified</span>
            </div>
            
            <div style={styles.simplifiedBox}>
              {report.simplified_summary}
            </div>

            <div style={styles.disclaimerBox}>
              <strong>📌 Note:</strong> This is a simplified explanation of your report. 
              Always consult your doctor for detailed medical advice.
            </div>
          </div>
        )}

        {/* Technical Report Toggle */}
        {(report.full_technical_report || report.original_file_url) && (
          <div style={styles.section}>
            <div style={styles.technicalHeader}>
              <h2 style={styles.sectionTitle}>📄 Technical Report</h2>
              <button
                onClick={() => setShowTechnical(!showTechnical)}
                style={styles.toggleBtn}
              >
                {showTechnical ? '▼ Hide' : '▶ Show'} Technical Details
              </button>
            </div>

            {showTechnical && (
              <>
                {report.full_technical_report && (
                  <div style={styles.technicalBox}>
                    <pre style={styles.technicalText}>
                      {report.full_technical_report}
                    </pre>
                  </div>
                )}

                {report.original_file_url && (
                  <div style={styles.downloadSection}>
                    <button
                      onClick={() => window.open(report.original_file_url, '_blank')}
                      style={styles.downloadBtn}
                    >
                      📥 Download Original Report
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.actionsSection}>
          <button
            onClick={() => window.print()}
            style={styles.actionBtn}
          >
            🖨️ Print Report
          </button>
          
          {report.status === 'Ready to Share' && report.referring_clinic_id && (
            <div style={styles.shareInfo}>
              <span style={styles.shareIcon}>✓</span>
              <span>
                This report has been shared with {report.referring_clinic_id}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.footerWarning}>
            ⚠️ <strong>Important:</strong> This report should be reviewed by a qualified 
            healthcare professional. Do not make medical decisions based solely on this 
            simplified summary.
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    padding: '20px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    gap: '20px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #0070F3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    maxWidth: '600px',
    margin: '100px auto',
    textAlign: 'center',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  errorIcon: {
    fontSize: '80px',
    marginBottom: '20px',
  },
  errorText: {
    color: '#666',
    marginBottom: '30px',
  },
  errorActions: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },
  topBar: {
    maxWidth: '900px',
    margin: '0 auto 20px',
  },
  backBtn: {
    padding: '10px 20px',
    backgroundColor: '#0070F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
  },
  retryBtn: {
    padding: '10px 20px',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '500',
  },
  card: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  header: {
    borderBottom: '3px solid #0070F3',
    paddingBottom: '20px',
    marginBottom: '30px',
  },
  title: {
    margin: '0 0 15px 0',
    color: '#333',
  },
  headerMeta: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  statusBadge: {
    padding: '6px 16px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: 'bold',
    color: 'white',
  },
  dateText: {
    color: '#666',
    fontSize: '14px',
  },
  section: {
    marginBottom: '35px',
  },
  sectionTitle: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '20px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  infoItem: {
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  infoLabel: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: '16px',
    color: '#333',
    fontWeight: '500',
  },
  summaryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  aiPoweredBadge: {
    padding: '6px 12px',
    backgroundColor: '#e7f3ff',
    color: '#0070F3',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  simplifiedBox: {
    padding: '25px',
    backgroundColor: '#f0f7ff',
    borderLeft: '4px solid #0070F3',
    borderRadius: '8px',
    fontSize: '16px',
    lineHeight: '1.8',
    marginBottom: '15px',
  },
  disclaimerBox: {
    padding: '15px',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  technicalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  toggleBtn: {
    padding: '8px 16px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  technicalBox: {
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    marginBottom: '15px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  technicalText: {
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.6',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    color: '#333',
  },
  downloadSection: {
    marginTop: '15px',
  },
  downloadBtn: {
    padding: '12px 24px',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
  },
  actionsSection: {
    padding: '25px 0',
    borderTop: '1px solid #e0e0e0',
    borderBottom: '1px solid #e0e0e0',
    marginBottom: '25px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  actionBtn: {
    padding: '12px 24px',
    backgroundColor: '#0070F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  shareInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    backgroundColor: '#f0f9f4',
    borderRadius: '8px',
    color: '#10B981',
    fontSize: '14px',
  },
  shareIcon: {
    fontSize: '20px',
  },
  footer: {
    paddingTop: '20px',
  },
  footerWarning: {
    padding: '20px',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#856404',
  },
};