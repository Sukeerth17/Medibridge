import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function Dashboard() {
  const router = useRouter();
  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const name = localStorage.getItem('user_name');
    
    if (!token) {
      router.push('/');
      return;
    }

    setUserName(name || 'Patient');
    fetchData(token);
  }, []);

  const fetchData = async (token) => {
    try {
      // Fetch prescriptions
      const prescResponse = await fetch(`${API_URL}/v1/patient/prescriptions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (prescResponse.ok) {
        const prescData = await prescResponse.json();
        setPrescriptions(prescData.data || []);
      }

      // Fetch reports
      const reportsResponse = await fetch(`${API_URL}/v1/patient/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading your health records...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>MediBridge Patient Portal</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {userName}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <main style={styles.main}>
        {/* Prescriptions Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>My Prescriptions</h2>
          {prescriptions.length === 0 ? (
            <div style={styles.emptyState}>
              No prescriptions yet. Visit your doctor to get started.
            </div>
          ) : (
            <div style={styles.cardGrid}>
              {prescriptions.map((presc, idx) => (
                <div key={idx} style={styles.card}>
                  <h3>{presc.diagnosis || 'Medical Prescription'}</h3>
                  <p style={styles.cardMeta}>
                    From: {presc.clinic_name || 'Clinic'}
                  </p>
                  <button 
                    onClick={() => router.push(`/prescriptions/${presc.id}`)}
                    style={styles.viewBtn}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reports Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>My Medical Reports</h2>
          {reports.length === 0 ? (
            <div style={styles.emptyState}>
              No medical reports available yet.
            </div>
          ) : (
            <div style={styles.cardGrid}>
              {reports.map((report, idx) => (
                <div key={idx} style={styles.card}>
                  <h3>{report.scan_type || 'Medical Report'}</h3>
                  <p style={styles.cardMeta}>
                    Status: {report.status}
                  </p>
                  <button 
                    onClick={() => router.push(`/reports/${report.id}`)}
                    style={styles.viewBtn}
                  >
                    View Report
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.actionGrid}>
            <button 
              onClick={() => router.push('/chatbot')}
              style={styles.actionBtn}
            >
              🤖 Health Assistant
            </button>
            <button 
              onClick={() => router.push('/tracker')}
              style={styles.actionBtn}
            >
              💊 Medicine Tracker
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: 'white',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    marginBottom: '15px',
    color: '#333',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '15px',
  },
  card: {
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  cardMeta: {
    fontSize: '14px',
    color: '#666',
    marginTop: '10px',
  },
  viewBtn: {
    marginTop: '15px',
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
  actionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  actionBtn: {
    padding: '20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#666',
  },
};