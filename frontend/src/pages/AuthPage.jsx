import { useState, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';
import { fetchJson } from '../utils/fetchJson';

const AUTH_BASE = import.meta.env.VITE_AUTH_BASE || '';

function hasValidStoredSession() {
  const token = window.localStorage.getItem('authToken');
  const userRaw = window.localStorage.getItem('authUser');
  if (!token || !userRaw) return false;
  try {
    JSON.parse(userRaw);
    return true;
  } catch {
    return false;
  }
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [serviceStatus, setServiceStatus] = useState('checking'); // 'checking' | 'online' | 'offline'
  const [sessionRedirect, setSessionRedirect] = useState(() => hasValidStoredSession());

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });

  // Drop corrupt localStorage pairs so login / RequireAuth stay consistent
  useEffect(() => {
    const token = window.localStorage.getItem('authToken');
    const userRaw = window.localStorage.getItem('authUser');
    if (token && userRaw) {
      try {
        JSON.parse(userRaw);
      } catch {
        window.localStorage.removeItem('authToken');
        window.localStorage.removeItem('authUser');
        setSessionRedirect(false);
      }
    }
  }, []);

  // If already signed in, seamlessly go straight to the app
  useEffect(() => {
    if (sessionRedirect) {
      navigate('/dashboard', { replace: true });
    }
  }, [sessionRedirect, navigate]);

  // Check if auth service is reachable (best-effort; do not block login)
  useEffect(() => {
    fetch(`${AUTH_BASE}/health`)
      .then((r) => (r.ok ? setServiceStatus('online') : setServiceStatus('offline')))
      .catch(() => setServiceStatus('offline'));
  }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 6000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = new URLSearchParams();
      body.append('username', loginForm.email);
      body.append('password', loginForm.password);

      const { res, data } = await fetchJson(`${AUTH_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!res.ok) {
        showMessage(data?.detail || `Login failed (${res.status}). Check your credentials.`, 'error');
        return;
      }

      if (!data?.access_token) {
        showMessage('Login response was missing a token. Check the backend /auth/login route.', 'error');
        return;
      }

      window.localStorage.setItem('authToken', data.access_token);

      const { res: meRes, data: mePayload } = await fetchJson(`${AUTH_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });

      if (!meRes.ok || !mePayload?.user) {
        window.localStorage.removeItem('authToken');
        showMessage(
          mePayload?.detail || mePayload?.message || 'Could not load your profile. Please try again.',
          'error'
        );
        return;
      }

      window.localStorage.setItem('authUser', JSON.stringify(mePayload.user));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.code === 'NETWORK') {
        showMessage(err.message, 'error');
      } else if (err.code === 'BAD_JSON') {
        showMessage(err.message, 'error');
      } else {
        showMessage('Something went wrong: ' + err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { res, data } = await fetchJson(`${AUTH_BASE}/auth/register_admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm),
      });

      if (!res.ok) {
        showMessage(data?.detail || 'Sign-up failed.', 'error');
        return;
      }
      showMessage('Admin account created! You can now log in.', 'success');
      setMode('login');
      setLoginForm({ email: signupForm.email, password: '' });
    } catch (err) {
      if (err.code === 'NETWORK') {
        showMessage(err.message, 'error');
      } else if (err.code === 'BAD_JSON') {
        showMessage(err.message, 'error');
      } else {
        showMessage('Network error: ' + err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (sessionRedirect) {
    return (
      <div className="auth-page auth-session-handoff">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <p className="auth-session-handoff-text">Opening dashboard…</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">🦷</div>
          <h1 className="auth-title">Clinical Assistant</h1>
          <p className="auth-subtitle">Dental Management System</p>
        </div>

        <div className={`auth-service-status ${serviceStatus}`}>
          <div className="status-dot" />
          <span>
            {serviceStatus === 'checking' && 'Checking auth service…'}
            {serviceStatus === 'online' && 'Auth service online'}
            {serviceStatus === 'offline' && 'Auth service offline — start Flask server first'}
          </span>
        </div>

        <div className="auth-not-signed-in-banner">
          <span className="not-signed-icon">🔒</span>
          <div>
            <div className="not-signed-title">You are not signed in</div>
            <div className="not-signed-sub">
              Please log in below to access the full dashboard. If this is a fresh install, create an admin account
              first.
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setMessage({ text: '', type: '' });
              }}
            >
              🔑 Login
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setMode('signup');
                setMessage({ text: '', type: '' });
              }}
            >
              🛡️ Admin Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <div className="auth-form-section">
              <div className="auth-form-desc">
                <p>
                  Enter your <strong>Email</strong> and <strong>Password</strong> to access the dashboard. Both admin and
                  doctor accounts can log in here.
                </p>
              </div>
              <form onSubmit={handleLogin}>
                <div className="auth-form-group">
                  <label htmlFor="login-email">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="you@clinic.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    autoComplete="email"
                  />
                </div>
                <div className="auth-form-group">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    autoComplete="current-password"
                  />
                </div>
                <button type="submit" className="auth-btn auth-btn-primary auth-btn-full" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" /> Signing in…
                    </>
                  ) : (
                    '🔑 Sign In'
                  )}
                </button>
              </form>
              <div className="auth-hint">
                🆕 First time here? Switch to <strong>Admin Sign Up</strong> to create your admin account.
              </div>
            </div>
          ) : (
            <div className="auth-form-section">
              <div className="auth-form-desc">
                <p>
                  Create the <strong>first Admin account</strong> for this clinic. This can only be done once. After
                  that, admins can create doctor accounts from the <em>Manage Doctors</em> panel.
                </p>
              </div>
              <form onSubmit={handleSignup}>
                <div className="auth-form-group">
                  <label htmlFor="signup-name">Full Name</label>
                  <input
                    id="signup-name"
                    type="text"
                    required
                    placeholder="Dr. Admin Name"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  />
                </div>
                <div className="auth-form-group">
                  <label htmlFor="signup-email">Email Address</label>
                  <input
                    id="signup-email"
                    type="email"
                    required
                    placeholder="admin@clinic.com"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  />
                </div>
                <div className="auth-form-group">
                  <label htmlFor="signup-password">
                    Password
                    <span className="password-hint"> (min 8 chars, letters + digits + symbol)</span>
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="StrongP@ss1"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  />
                </div>
                <button type="submit" className="auth-btn auth-btn-primary auth-btn-full" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" /> Creating account…
                    </>
                  ) : (
                    '🛡️ Create Admin Account'
                  )}
                </button>
              </form>
              <div className="auth-hint">
                ⚠️ Already have an account? Switch to <strong>Login</strong> instead.
              </div>
            </div>
          )}

          {message.text && (
            <div className={`auth-message ${message.type}`}>
              {message.type === 'error' ? '❌' : '✅'} {message.text}
            </div>
          )}
        </div>

        <div className="auth-footer-note">
          After signing in, you can manage patients, appointments, and billing from the dashboard.
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
