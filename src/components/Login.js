import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBan, FaShieldAlt, FaBolt, FaGlobe, FaEnvelope, FaWhatsapp, FaArrowRight, FaLock, FaUnlock } from 'react-icons/fa';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isBanned, setIsBanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsBanned(false);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { identifier, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('isAdmin', res.data.user.isAdmin ? 'true' : 'false');
      navigate(res.data.user.isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      if (err?.response?.status === 403) {
        setIsBanned(true);
      } else {
        setError(err?.response?.data?.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setForgotStatus('');
    setResetSent(false);
    if (!forgotEmail.trim()) {
      setError('Please enter your email to reset your password.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email: forgotEmail.trim() });
      setForgotStatus(res.data.message || 'Reset instructions have been sent to your email.');
      setResetSent(true);
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not send reset instructions.');
    }
  };

  const handleReviewRequest = async () => {
    setReviewStatus('');
    setReviewLoading(true);
    try {
      const identifierValue = identifier || forgotEmail || '';
      const res = await axios.post('http://localhost:5000/api/auth/review-request', {
        identifier: identifierValue,
        message: 'I am requesting a formal account review for my banned Alphatrade account.'
      });
      setReviewStatus(res.data.message || 'Your review request has been submitted.');
    } catch (err) {
      setReviewStatus('Unable to submit review request at this time.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleClearBan = () => {
    setIsBanned(false);
    setError('');
  };

  const banWarningText = 'Your account has been banned due to security reasons. Please contact us for more information.';

  if (isBanned) {
    return (
      <div className="login-page">
        <div className="login-container" style={{ gridTemplateColumns: '1fr', maxWidth: '640px' }}>
          <div className="ban-card">
            <div className="login-header">
              <div className="login-logo"><FaBan /></div>
              <h1>Account Banned</h1>
              <p>Your access is restricted for security reasons.</p>
            </div>
            <div className="status-message ban-message">{banWarningText}</div>
            <div className="ban-actions">
              <button className="btn-review" onClick={handleReviewRequest} disabled={reviewLoading}>
                {reviewLoading ? <><span className="spinner"></span> Request Review</> : <><FaEnvelope /> Request Account Review</>}
              </button>
              <a
                className="btn-whatsapp"
                href={`https://wa.me/254798072427?text=${encodeURIComponent(`Hello Alphatrade Support, I am requesting an account review for my banned account. My email or username is ${identifier || 'not provided'}. Please assist.`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp /> Contact via WhatsApp
              </a>
            </div>
            {reviewStatus && <div className="status-message info">{reviewStatus}</div>}
            <button className="btn-login" onClick={handleClearBan}>
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img src="/logo.png" alt="Alphatrade logo" className="login-logo-image" />
            <h1>Alphatrade</h1>
            <p>Secure digital asset management</p>
          </div>

          {showForgotPassword ? (
            <form className="login-form" onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label htmlFor="forgotEmail">Registered Email</label>
                <input
                  id="forgotEmail"
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />
              </div>

              {forgotStatus && <div className="success-message">{forgotStatus}</div>}
              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? (
                  <><span className="spinner"></span> Sending reset...</>
                ) : (
                  <>Send Reset Instructions</>
                )}
              </button>

              <button type="button" className="btn-link" onClick={() => { setShowForgotPassword(false); setError(''); setForgotStatus(''); }}>
                <FaArrowRight /> Back to sign in
              </button>
            </form>
          ) : (
            <>
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="identifier">Email or Username</label>
                  <input 
                    id="identifier"
                    type="text" 
                    placeholder="email or username" 
                    value={identifier} 
                    onChange={(e) => setIdentifier(e.target.value)} 
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input 
                    id="password"
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>

                {error && <div className="error-message">{error}</div>}

                <button type="submit" className="btn-login" disabled={loading}>
                  {loading ? (
                    <><span className="spinner"></span> Logging in...</>
                  ) : (
                    <>Sign In</>
                  )}
                </button>
              </form>

              <button type="button" className="btn-link" onClick={() => { setShowForgotPassword(true); setError(''); setForgotStatus(''); }}>
                <FaUnlock /> Forgot password?
              </button>

              <div className="login-divider">Don't have an account?</div>
              
              <Link to="/register" className="btn-register">Create new account</Link>
            </>
          )}
        </div>

        <div className="login-features">
          <div className="feature">
            <span className="feature-icon"><FaShieldAlt /></span>
            <h3>Secure</h3>
            <p>Bank-level encryption</p>
          </div>
          <div className="feature">
            <span className="feature-icon"><FaBolt /></span>
            <h3>Fast</h3>
            <p>Instant transactions</p>
          </div>
          <div className="feature">
            <span className="feature-icon"><FaGlobe /></span>
            <h3>Global</h3>
            <p>Support worldwide</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;