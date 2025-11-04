import React, { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function LoginForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Format phone number to include +91
  const formatPhone = (num) => {
    const clean = num.replace(/[^0-9]/g, '');
    if (clean.startsWith('91')) return '+' + clean;
    return '+91' + clean;
  };

  // Step 1: Request OTP
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
          role: 'Scanning' 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        // For demo purposes, show OTP in console
        console.log('OTP sent:', data.otp);
        alert(`OTP sent! For demo: ${data.otp}`);
      } else {
        setError(data.error || 'Failed to send OTP. Try again.');
      }
    } catch (err) {
      console.error('OTP Request error:', err);
      setError('Network error. Make sure backend is running on port 8080.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
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
          role: 'Scanning' 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('jwt_token', data.token);
        localStorage.setItem('user_role', data.role);
        localStorage.setItem('user_name', data.name);
        window.location.href = '/dashboard';
      } else {
        setError(data.error || 'Invalid OTP. Try again.');
      }
    } catch (err) {
      console.error('OTP Verify error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp}
      style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}
    >
      <h2>Log In (Scanning Center)</h2>
      {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

      {/* Phone Input */}
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone Number (e.g. 9988776655)"
        required
        pattern="[0-9]{10}"
        title="Enter a 10-digit Indian mobile number"
        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        disabled={otpSent}
      />

      {/* OTP Input */}
      {otpSent && (
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-Digit OTP"
          required
          pattern="[0-9]{6}"
          title="Enter the 6-digit OTP"
          style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
      )}

      {/* Button */}
      <button
        type="submit"
        style={{
          padding: '10px',
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer'
        }}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : otpSent ? 'Verify OTP' : 'Send OTP'}
      </button>

      {otpSent && (
        <p
          style={{ textAlign: 'center', cursor: 'pointer', color: 'blue', fontSize: '12px' }}
          onClick={() => {
            setOtpSent(false);
            setError('');
            setOtp('');
          }}
        >
          Change Phone Number
        </p>
      )}

      <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
        <strong>Demo Credentials:</strong><br/>
        Phone: 9988776655<br/>
        User: Alpha Diagnostics (SCN003)
      </p>
    </form>
  );
}