import { useState } from 'react';
import { useRouter } from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhone = (num) => {
    const clean = num.replace(/[^0-9]/g, '');
    if (clean.startsWith('91')) return '+' + clean;
    return '+91' + clean;
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const fullPhone = formatPhone(phone);

    try {
      const response = await fetch(`${API_URL}/v1/auth/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: fullPhone, 
          role: 'Patient' 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        console.log('OTP sent:', data.otp);
        alert(`OTP sent! For demo: ${data.otp}`);
      } else {
        setError(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('OTP Request error:', err);
      setError('Network error. Make sure backend is running on port 8080.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const fullPhone = formatPhone(phone);

    try {
      const response = await fetch(`${API_URL}/v1/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: fullPhone, 
          otp, 
          role: 'Patient' 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_name', data.name);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid OTP');
      }
    } catch (err) {
      console.error('OTP Verify error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>MediBridge</h1>
        <h2 style={styles.subtitle}>Patient Portal Login</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9876543210"
              required
              pattern="[0-9]{10}"
              style={styles.input}
              disabled={otpSent}
            />
          </div>

          {otpSent && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                required
                pattern="[0-9]{6}"
                style={styles.input}
                autoFocus
              />
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: isLoading ? 0.6 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : otpSent ? 'Verify OTP & Login' : 'Send OTP'}
          </button>

          {otpSent && (
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setError('');
                setOtp('');
              }}
              style={styles.changeBtn}
            >
              Change Phone Number
            </button>
          )}
        </form>

        <div style={styles.demoInfo}>
          <strong>Demo Credentials:</strong><br/>
          Phone: 9876543210<br/>
          User: Amit Sharma (PAT001)
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f7fa',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    color: '#007bff',
    marginBottom: '10px',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px',
    fontSize: '18px',
  },
  error: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '500',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  changeBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    borderRadius: '6px',
    fontSize: '14px',
    marginTop: '10px',
    cursor: 'pointer',
  },
  demoInfo: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#666',
    textAlign: 'center',
  },
};