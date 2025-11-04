import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function PrescriptionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState(false);

  useEffect(() => {
    if (!id) return;

    const token = localStorage.getItem('jwt_token');
    if (!token) {
      router.push('/');
      return;
    }

    fetchPrescription(token);
  }, [id]);

  const fetchPrescription = async (token) => {
    try {
      const response = await fetch(`${API_URL}/v1/patient/prescriptions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPrescription(data);
      } else {
        console.error('Failed to fetch prescription');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logAdherence = async (prescriptionId, drugName) => {
    const token = localStorage.getItem('jwt_token');
    try {
      const response = await fetch(`${API_URL}/v1/patient/adherence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prescription_id: prescriptionId,
          dose_time: Date.now(),
          drug_name: drugName
        })
      });

      if (response.ok) {
        alert(`✓ Logged: Took ${drugName}`);
      }
    } catch (error) {
      console.error('Failed to log adherence:', error);
    }
  };

  const playAudio = () => {
    if (prescription?.audio_file_url) {
      setPlayingAudio(true);
      // In real app, play audio file
      setTimeout(() => setPlayingAudio(false), 3000);
    } else {
      alert('Audio narration not available for this prescription');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading prescription...</div>;
  }

  if (!prescription) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>Prescription not found</div>
        <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={() => router.push('/dashboard')} style={styles.backBtn}>
        ← Back to Dashboard
      </button>

      <div style={styles.card}>
        <h1 style={styles.title}>Prescription Details</h1>
        
        {/* Diagnosis */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Diagnosis</h2>
          <p style={styles.text}>{prescription.diagnosis || 'Not specified'}</p>
        </div>

        {/* Vitals */}
        {prescription.vitals && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Vitals</h2>
            <div style={styles.vitalsGrid}>
              {prescription.vitals.bp && <div>BP: {prescription.vitals.bp}</div>}
              {prescription.vitals.hr && <div>Heart Rate: {prescription.vitals.hr}</div>}
              {prescription.vitals.temp && <div>Temperature: {prescription.vitals.temp}</div>}
            </div>
          </div>
        )}

        {/* Medications */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Medications</h2>
          
          {prescription.audio_file_url && (
            <button 
              onClick={playAudio}
              style={{
                ...styles.audioBtn,
                opacity: playingAudio ? 0.6 : 1
              }}
              disabled={playingAudio}
            >
              🔊 {playingAudio ? 'Playing...' : 'Listen to Instructions'}
            </button>
          )}

          {prescription.instructions?.map((drug, idx) => (
            <div key={idx} style={styles.drugCard}>
              <div style={styles.drugHeader}>
                <h3 style={styles.drugName}>{drug.drug_name}</h3>
                <span style={styles.drugBadge}>{drug.drug_type}</span>
              </div>
              
              <div style={styles.drugDetails}>
                <div style={styles.detailRow}>
                  <strong>Strength:</strong> {drug.strength}
                </div>
                <div style={styles.detailRow}>
                  <strong>Frequency:</strong> {drug.frequency}
                </div>
                <div style={styles.detailRow}>
                  <strong>Timing:</strong> {drug.timing_relation}
                  {drug.time_offset > 0 && ` (${drug.time_offset} minutes later)`}
                </div>
                <div style={styles.detailRow}>
                  <strong>Duration:</strong> {drug.duration_days} days
                </div>
                {drug.patient_note && (
                  <div style={styles.detailRow}>
                    <strong>Note:</strong> {drug.patient_note}
                  </div>
                )}
              </div>

              <button
                onClick={() => logAdherence(prescription.id, drug.drug_name)}
                style={styles.logBtn}
              >
                ✓ Mark as Taken
              </button>
            </div>
          ))}
        </div>

        {/* Translated Text */}
        {prescription.translated_text && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Instructions in Your Language</h2>
            <div style={styles.translatedBox}>
              {prescription.translated_text}
            </div>
          </div>
        )}

        {/* Clinic Info */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Prescribed by: {prescription.clinic_name || 'Clinic'}
          </p>
          <p style={styles.footerText}>
            Date: {new Date(prescription.created_at).toLocaleDateString()}
          </p>
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
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '18px',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  backBtn: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  card: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  title: {
    borderBottom: '2px solid #007bff',
    paddingBottom: '15px',
    marginBottom: '30px',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    color: '#333',
    marginBottom: '15px',
    fontSize: '20px',
  },
  text: {
    color: '#666',
    lineHeight: '1.6',
  },
  vitalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  audioBtn: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  drugCard: {
    padding: '20px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    marginBottom: '15px',
    backgroundColor: '#fafafa',
  },
  drugHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  drugName: {
    margin: 0,
    color: '#333',
  },
  drugBadge: {
    padding: '4px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  drugDetails: {
    marginBottom: '15px',
  },
  detailRow: {
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  logBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  translatedBox: {
    padding: '20px',
    backgroundColor: '#e7f3ff',
    borderRadius: '8px',
    lineHeight: '1.8',
    fontSize: '16px',
  },
  footer: {
    borderTop: '1px solid #e0e0e0',
    paddingTop: '20px',
    marginTop: '30px',
  },
  footerText: {
    color: '#666',
    fontSize: '14px',
    margin: '5px 0',
  },
};