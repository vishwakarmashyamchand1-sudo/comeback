import React, { useState } from 'react';
import { useOnboarding } from '../lib/store.jsx';
import { auth } from '../lib/firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { PrimaryButton, TextField, StepIntro } from '../components/UI.jsx';
import { API_URL } from '../lib/api.js';

export default function Auth() {
  const { dispatch } = useOnboarding();
  const [isLogin, setIsLogin] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // NEW: Name state
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const valid = isLogin ? (email && password.length >= 6) : (name && email && password.length >= 6);

  const handleSubmit = async () => {
    if (!valid) return;
    setLoading(true);
    setError('');

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      const token = await userCredential.user.getIdToken();

      let res;
      let data;

      if (isLogin) {
        // If logging in, just fetch their existing profile!
        res = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // If signing up, hit the register endpoint with their Name
        res = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            name: name,
            email: userCredential.user.email,
            firebaseUid: userCredential.user.uid
          })
        });
      }

      data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Backend returns isNewUser flag on register, or onboardingComplete on /me. 
      // In this setup, we just mark auth as success and app will render Step 1
      dispatch({ type: 'login_success', token });

    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen anim-fwd">
      <div style={{ marginTop: '20px', marginBottom: '30px' }}>
        <div className="wordmark">
          <span className="come">COME</span>
          <span className="back" style={{ color: '#fff' }}>BACK</span>
        </div>
      </div>

      <StepIntro 
        icon={isLogin ? 'login' : 'user-plus'} 
        tag="Authentication"
        title={isLogin ? "Welcome back" : "Create account"}
        sub={isLogin ? "Log in to view your dashboard or continue onboarding." : "Sign up to generate your custom AI plan."} 
      />

      <div style={{ marginTop: '10px' }}>
        
        {/* Only show Name field if they are signing up */}
        {!isLogin && (
          <div style={{ marginBottom: '16px' }}>
            <TextField 
              value={name} 
              onChange={setName} 
              placeholder="Your full name" 
              type="text"
            />
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <TextField 
            value={email} 
            onChange={setEmail} 
            placeholder="Email address" 
            type="email"
            autoComplete="off"
          />
        </div>

        <div style={{ marginBottom: '8px' }}>
          <TextField 
            value={password} 
            onChange={setPassword} 
            placeholder="Password (min 6 characters)" 
            type="password"
            autoComplete="new-password"
          />
        </div>

        {error && <div className="err-text"><i className="ti ti-alert-circle" /> {error}</div>}
      </div>

      <div style={{ marginTop: '15px' }}>
        <button 
          className="skip-btn" 
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
        >
          {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>

      <div className="cta">
        <PrimaryButton onClick={handleSubmit} disabled={!valid || loading}>
          {loading ? "Please wait..." : (isLogin ? "Log In" : "Sign Up")} 
          {!loading && <i className="ti ti-arrow-right btn-icon" />}
        </PrimaryButton>
      </div>
    </div>
  );
}
