import React, { useState } from 'react';

/**
 * Component for Scanning Center Signup and Onboarding.
 * Captures user details and center branding info.
 * Now uses OTP for login, so no password field.
 */
export default function SignupForm() {
  const [formData, setFormData] = useState({
    phone: '',
    centerName: '',
    address: '',
    workingHours: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    console.log('Attempting signup (onboarding) with:', formData);

    // --- API Call Simulation (POST /v1/scanning/onboarding/template) ---
    // const response = await fetch('/api/v1/scanning/onboarding/template', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });
    // if (response.ok) {
    //   setSuccess('Signup successful! You can now log in with your phone number.');
    // } else {
    //   setError('Signup failed. Is this phone number already registered?');
    // }
    // --- End Simulation ---
    
    // Placeholder logic
    setSuccess('Signup successful! You can now log in using your phone number and OTP.');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <h2>Sign Up & Onboarding</h2>
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <fieldset style={{ border: '1px solid #ddd', padding: '10px' }}>
        <legend>Account Registration</legend>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Admin Phone Number (for login)"
          required
          pattern="[0-9]{10}"
          title="Please enter a 10-digit Indian mobile number"
          style={{ width: 'calc(100% - 16px)', padding: '8px', marginBottom: '10px' }}
        />
         <p style={{fontSize: '12px', color: '#666'}}>You will use this number to log in via OTP.</p>
      </fieldset>

      <fieldset style={{ border: '1Gpx solid #ddd', padding: '10px' }}>
        <legend>Center Details</legend>
        <input type="text" name="centerName" value={formData.centerName} onChange={handleChange} placeholder="Scanning Center Name" required style={{ width: 'calc(100% - 16px)', padding: '8px', marginBottom: '10px' }} />
        <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Center Address" required style={{ width: 'calc(100% - 16px)', padding: '8px', marginBottom: '10px' }} />
        <input type="text" name="workingHours" value={formData.workingHours} onChange={handleChange} placeholder="Working Hours (e.g., 9:00 AM - 6:00 PM)" style={{ width: 'calc(100% - 16px)', padding: '8px' }} />
      </fieldset>

      <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginTop: '10px' }}>
        Register Center
      </button>
    </form>
  );
}

