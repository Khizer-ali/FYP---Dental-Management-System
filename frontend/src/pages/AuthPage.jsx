import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const AUTH_BASE = import.meta.env.VITE_AUTH_BASE || 'http://localhost:5000';

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [serviceStatus, setServiceStatus] = useState('checking'); // 'checking' | 'online' | 'offline'

  const currentUser = (() => {
    try { return JSON.parse(window.localStorage.getItem('authUser')); } catch { return null; }
  })();
  const isLoggedIn = !!window.localStorage.getItem('authToken') && !!currentUser;

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });

  // If already signed in, go straight to the app
  // Removed automatic redirect to allow user to choose options on the logged-in screen

  // Check if auth service is reachable (best-effort; do not block login)
  useEffect(() => {
    fetch(`${AUTH_BASE}/health`)
      .then(r => r.ok ? setServiceStatus('online') : setServiceStatus('offline'))
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

      const res = await fetch(`${AUTH_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage(data.detail || 'Login failed. Check your credentials.', 'error');
        return;
      }

      window.localStorage.setItem('authToken', data.access_token);

      // Fetch user profile
      const meRes = await fetch(`${AUTH_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        window.localStorage.setItem('authUser', JSON.stringify(meData.user));
      } else {
        showMessage('Error fetching user profile. Please try again.', 'error');
        setLoading(false);
        return;
      }

      showMessage('Login successful!', 'success');
      setTimeout(() => { window.location.reload(); }, 1000);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showMessage('Cannot connect to auth service (port 5000). Is the backend server running?', 'error');
      } else {
        showMessage('Network error: ' + err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_BASE}/auth/register_admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm),
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage(data.detail || 'Sign-up failed.', 'error');
        return;
      }
      showMessage('Admin account created! You can now log in.', 'success');
      setMode('login');
      setLoginForm({ email: signupForm.email, password: '' });
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        showMessage('Cannot connect to auth service (port 5000). Is the backend server running?', 'error');
      } else {
        showMessage('Network error: ' + err.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('authToken');
    window.localStorage.removeItem('authUser');
    showMessage('Logged out successfully.', 'success');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="auth-page">
      {/* Background decoration */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      {/* Back button removed as per user request */}

      <div className="auth-container">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">🦷</div>
          <h1 className="auth-title">Clinical Assistant</h1>
          <p className="auth-subtitle">Dental Management System</p>
        </div>

        {/* Service Status Indicator */}
        <div className={`auth-service-status ${serviceStatus}`}>
          <div className="status-dot" />
          <span>
            {serviceStatus === 'checking' && 'Checking auth service…'}
            {serviceStatus === 'online' && 'Auth service online (port 5000)'}
            {serviceStatus === 'offline' && 'Auth service offline — start Flask server first'}
          </span>
        </div>

        {/* === Already Logged In Panel === */}
        {isLoggedIn ? (
          <div className="auth-card">
            <div className="auth-logged-in-banner">
              <div className="logged-in-icon">✅</div>
              <div>
                <div className="logged-in-title">You are signed in</div>
                <div className="logged-in-sub">
                  {currentUser?.name} &nbsp;·&nbsp;
                  <span className={`role-badge role-${currentUser?.role}`}>{currentUser?.role}</span>
                </div>
                <div className="logged-in-email">{currentUser?.email}</div>
              </div>
            </div>

            <div className="auth-card-actions">
              <button className="auth-btn auth-btn-primary" onClick={() => navigate('/dashboard')}>
                🏥 Go to Dashboard
              </button>
              {currentUser?.role === 'admin' && (
                <button className="auth-btn auth-btn-secondary" onClick={() => navigate('/doctors')}>
                  👨‍⚕️ Manage Doctors
                </button>
              )}
              <button className="auth-btn auth-btn-danger" onClick={handleLogout}>
                🚪 Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Not Signed In Banner */}
            <div className="auth-not-signed-in-banner">
              <span className="not-signed-icon">🔒</span>
              <div>
                <div className="not-signed-title">You are not signed in</div>
                <div className="not-signed-sub">
                  Please log in below to access the full dashboard. If this is a fresh install, create an admin account first.
                </div>
              </div>
            </div>

            <div className="auth-card">
              {/* Mode Tabs */}
              <div className="auth-tabs">
                <button
                  type="button"
                  className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => { setMode('login'); setMessage({ text: '', type: '' }); }}
                >
                  🔑 Login
                </button>
                <button
                  type="button"
                  className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
                  onClick={() => { setMode('signup'); setMessage({ text: '', type: '' }); }}
                >
                  🛡️ Admin Sign Up
                </button>
              </div>

              {/* Login Form */}
              {mode === 'login' ? (
                <div className="auth-form-section">
                  <div className="auth-form-desc">
                    <p>Enter your <strong>Email</strong> and <strong>Password</strong> to access the dashboard. Both admin and doctor accounts can log in here.</p>
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
                    <button
                      type="submit"
                      className="auth-btn auth-btn-primary auth-btn-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <><span className="spinner" /> Signing in…</>
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
                /* Sign Up Form */
                <div className="auth-form-section">
                  <div className="auth-form-desc">
                    <p>Create the <strong>first Admin account</strong> for this clinic. This can only be done once. After that, admins can create doctor accounts from the <em>Manage Doctors</em> panel.</p>
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
                    <button
                      type="submit"
                      className="auth-btn auth-btn-primary auth-btn-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <><span className="spinner" /> Creating account…</>
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

              {/* Message */}
              {message.text && (
                <div className={`auth-message ${message.type}`}>
                  {message.type === 'error' ? '❌' : '✅'} {message.text}
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer note */}
        <div className="auth-footer-note">
          After signing in, you can manage patients, appointments, and billing from the dashboard.
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
