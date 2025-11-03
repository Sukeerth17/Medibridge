import React, { useState } from 'react';

/**
 * Scanning Center Login Form (Phone + OTP)
 * Step 1: Request OTP (POST /v1/auth/otp/request)
 * Step 2: Verify OTP (POST /v1/auth/otp/verify)
 */
export default function LoginForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Automatically format Indian numbers
  const formatPhone = (num) => {
    // remove spaces and + signs
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
      // --- Backend API Call ---
      const response = await fetch('/api/v1/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, role: 'SCANNING' }),
      });

      if (response.ok) {
        setOtpSent(true);
      } else {
        const { error } = await response.json();
        setError(error || 'Failed to send OTP. Try again.');
      }
    } catch (err) {
      console.error('OTP Request error:', err);
      setError('Network error. Please try again.');
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
      // --- Backend API Call ---
      const response = await fetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, otp, role: 'SCANNING' }),
      });

      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('jwt_token', token);
        window.location.href = '/dashboard';
      } else {
        const { error } = await response.json();
        setError(error || 'Invalid OTP. Try again.');
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
      <h2>Log In (India)</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Phone Input */}
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone Number (e.g. 9876543210)"
        required
        pattern="[0-9]{10}"
        title="Enter a 10-digit Indian mobile number"
        style={{ padding: '8px' }}
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
          style={{ padding: '8px' }}
        />
      )}

      {/* Button */}
      <button
        type="submit"
        style={{
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
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
    </form>
  );
}
