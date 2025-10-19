// src/components/Auth.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Topbar from './Topbar';
import '../styles/auth.css';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [language, setLanguage] = useState('english');

  // form state
  const [name, setName] = useState('');
  const [roll, setRoll] = useState('');
  const [dept, setDept] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('student');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [remember, setRemember] = useState(false);

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setErrors({});
  }, [isSignUp]);

  const validate = () => {
    const e = {};
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'Password must be at least 6 characters';
    if (isSignUp) {
      if (!name.trim()) e.name = 'Name is required';
      if (!roll.trim()) e.roll = 'Roll / Faculty ID is required';
      if (password !== confirm) e.confirm = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    // Demo: simulate successful auth
    if (isSignUp) {
      // pretend to sign up, then auto sign in
      alert('Signed up successfully — redirecting to dashboard');
    } else {
      alert('Signed in — redirecting to dashboard');
    }

    // In real app: call backend API here
    navigate('/dashboard', { replace: true });
  };

  // simple social button handlers (demo)
  const handleSocial = (provider) => {
    alert(`Social sign in with ${provider} (demo)`);
    navigate('/dashboard');
  };

  return (
    <div className="auth-viewport">
      <Topbar language={language} setLanguage={setLanguage} />

      <main className="auth-main">
        <div className={`auth-card ${isSignUp ? 'signup-mode' : 'signin-mode'}`}>
          <div className="card-left">
            <div className="brand">
              <h1>NITW</h1>
              <p>College Portal</p>
            </div>
            <div className="card-illus">
              {/* decorative content or college slogan */}
              <p>Welcome to the student & faculty portal.</p>
            </div>
          </div>

          <div className="card-right">
            <div className="form-top">
              <h2>{isSignUp ? 'Create account' : 'Sign in to your account'}</h2>
              <p className="muted">{isSignUp ? 'Join your college community' : 'Enter email and password to continue'}</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {isSignUp && (
                <>
                  <div className={`field ${errors.name ? 'error' : ''}`}>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                    <label htmlFor="name">Full name</label>
                    <div className="field-error">{errors.name}</div>
                  </div>

                  <div className={`field ${errors.roll ? 'error' : ''}`}>
                    <input type="text" id="roll" value={roll} onChange={(e) => setRoll(e.target.value)} required />
                    <label htmlFor="roll">{userType === 'student' ? 'Roll number' : 'Faculty ID'}</label>
                    <div className="field-error">{errors.roll}</div>
                  </div>

                  <div className="field">
                    <input type="text" id="dept" value={dept} onChange={(e) => setDept(e.target.value)} />
                    <label htmlFor="dept">Department (optional)</label>
                  </div>
                </>
              )}

              <div className={`field ${errors.email ? 'error' : ''}`}>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <label htmlFor="email">Email</label>
                <div className="field-error">{errors.email}</div>
              </div>

              <div className={`field ${errors.password ? 'error' : ''}`}>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <label htmlFor="password">Password</label>
                <div className="field-error">{errors.password}</div>
              </div>

              {isSignUp && (
                <div className={`field ${errors.confirm ? 'error' : ''}`}>
                  <input type="password" id="confirm" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                  <label htmlFor="confirm">Confirm password</label>
                  <div className="field-error">{errors.confirm}</div>
                </div>
              )}

              <div className="row small">
                <div className="radio-group">
                  <label>
                    <input type="radio" name="userType" checked={userType === 'student'} value="student" onChange={(e) => setUserType(e.target.value)} />
                    Student
                  </label>
                  <label>
                    <input type="radio" name="userType" checked={userType === 'faculty'} value="faculty" onChange={(e) => setUserType(e.target.value)} />
                    Faculty
                  </label>
                </div>

                {!isSignUp && (
                  <label className="remember">
                    <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                    Remember me
                  </label>
                )}
              </div>

              <div className="actions">
                <button type="submit" className="btn primary">{isSignUp ? 'Create account' : 'Sign in'}</button>

                <div className="alt">
                  <button type="button" className="btn ghost" onClick={() => handleSocial('Google')}>Sign in with Google</button>
                  <button type="button" className="btn ghost" onClick={() => handleSocial('Microsoft')}>Sign in with Microsoft</button>
                </div>

                {!isSignUp && (
                  <div className="forgot">
                    <a href="#!" onClick={(e) => { e.preventDefault(); alert('Reset link sent (demo)'); }}>Forgot password?</a>
                  </div>
                )}
              </div>
            </form>

            <div className="switch">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button className="link-btn" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Sign in' : 'Create account'}
              </button>
            </div>

            <div className="footer-small">
              &copy; {new Date().getFullYear()} NIT Warangal — <a href="#!">Terms</a> • <a href="#!">Privacy</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
