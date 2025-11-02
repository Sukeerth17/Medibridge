import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

/**
 * Main authentication page for the Scanning Center.
 * Uses state to toggle between the Login and Signup forms.
 */
export default function AuthPage() {
  // Default to login view
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center' }}>Scanning Center Portal</h1>
      
      {isLoginView ? (
        <>
          <LoginForm />
          <p style={{ textAlign: 'center', cursor: 'pointer', color: 'blue' }} onClick={() => setIsLoginView(false)}>
            Need an account? Sign Up
          </p>
        </>
      ) : (
        <>
          <SignupForm />
          <p style={{ textAlign: 'center', cursor: 'pointer', color: 'blue' }} onClick={() => setIsLoginView(true)}>
            Already have an account? Log In
          </p>
        </>
      )}
    </div>
  );
}