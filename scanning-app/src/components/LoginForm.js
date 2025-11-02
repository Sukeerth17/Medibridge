import React, { useState } from 'react';

/**
 * Component for handling Scanning Center login with Phone + OTP.
 * Step 1: Request OTP (POST /v1/auth/otp/request)
 * Step 2: Verify OTP (POST /v1/auth/otp/verify)
 */
export default function LoginForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false); // Controls the UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('Requesting OTP for:', phone);

    // --- API Call Simulation (POST /v1/auth/otp/request) ---
    // const response = await fetch('/api/v1/auth/otp/request', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ phone, role: 'SCANNING' })
    // });
    // if (response.ok) {
    //   setOtpSent(true);
    // } else {
    //   setError('Failed to send OTP. Is this number registered?');
    // }
    // --- End Simulation ---

    // Placeholder logic - Simulating OTP request for ANY valid 10-digit number
    setTimeout(() => {
      setIsLoading(false);
      // For demo purposes, we'll accept any 10-digit number.
      if (phone.match(/^[0-9]{10}$/)) {
        setOtpSent(true);
        console.log('Simulating OTP sent to', phone);
      } else {
        setError('Please enter a valid 10-digit phone number.');
      }
    }, 1000);
  };

  // Step 2: Verify OTP and Log In
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log('Verifying OTP:', otp);

    // --- API Call Simulation (POST /v1/auth/otp/verify) ---
    // const response = await fetch('/api/v1/auth/otp/verify', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ phone, otp, role: 'SCANNING' })
    // });
    // if (response.ok) {
    //   const { token } = await response.json();
    //   localStorage.setItem('jwt_token', token);
    //   window.location.href = '/dashboard'; // Redirect
    // } else {
    //   setError('Invalid OTP. Please try again.');
    // }
    // --- End Simulation ---

    // Placeholder logic
    setTimeout(() => {
      setIsLoading(false);
      if (otp === '123456') { // Magic OTP for demo
        localStorage.setItem('jwt_token', 'fake_scanning_jwt_token_otp');
        console.log('Login successful, redirecting to dashboard...');
        // In Next.js, you'd use router.push('/dashboard')
      } else {
        setError('Invalid OTP (hint: use 123456 for demo)');
      }
    }, 1000);
  };

  return (
    <form onSubmit={otpSent ? handleVerifyOtp : handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h2>Log In</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Phone Number Input */}
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone Number (e.g., 9876543210)"
        required
        pattern="[0-9]{10}"
        title="Please enter a 10-digit Indian mobile number"
        style={{ padding: '8px' }}
        disabled={otpSent} // Disable phone input after OTP is sent
      />

      {/* OTP Input (Conditional) */}
      {otpSent && (
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-Digit OTP"
          required
          pattern="[0-9]{6}"
          title="Please enter the 6-digit OTP"
          style={{ padding: '8px' }}
        />
      )}

      {/* Submit Button (Conditional) */}
      <button 
        type="submit" 
        style={{ padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : (otpSent ? 'Log In' : 'Send OTP')}
      </button>
      
      {otpSent && (
        <p 
          style={{ textAlign: 'center', cursor: 'pointer', color: 'blue', fontSize: '12px' }} 
          onClick={() => { setOtpSent(false); setError(''); setOtp(''); }}
        >
          Change Phone Number
        </p>
      )}
    </form>
  );
}

