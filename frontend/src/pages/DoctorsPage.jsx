import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/doctors.css';

const AUTH_BASE = import.meta.env.VITE_AUTH_BASE || 'http://localhost:5000';

function DoctorsPage() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const currentUser = (() => {
        try { return JSON.parse(window.localStorage.getItem('authUser')); } catch { return null; }
    })();
    const token = window.localStorage.getItem('authToken');
    const isAdmin = currentUser?.role === 'admin';

    const [createForm, setCreateForm] = useState({
        name: '',
        email: '',
        password: '',
    });

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const authHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }), [token]);

    const loadDoctors = useCallback(async () => {
        if (!token) { setLoading(false); return; }
        try {
            const res = await fetch(`${AUTH_BASE}/users/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) {
                window.localStorage.removeItem('authToken');
                window.localStorage.removeItem('authUser');
                navigate('/');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setDoctors(data);
            } else {
                showMessage('Failed to load users.', 'error');
            }
        } catch {
            showMessage('Cannot connect to auth service (port 5000).', 'error');
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);

    useEffect(() => { loadDoctors(); }, [loadDoctors]);

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const res = await fetch(`${AUTH_BASE}/auth/create_doctor`, {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(createForm),
            });
            const data = await res.json();
            if (!res.ok) {
                showMessage(data.detail || 'Failed to create doctor.', 'error');
                return;
            }
            showMessage(`Doctor "${data.name}" created successfully!`, 'success');
            setCreateForm({ name: '', email: '', password: '' });
            setShowCreateForm(false);
            loadDoctors();
        } catch {
            showMessage('Network error. Is the auth service running?', 'error');
        } finally {
            setCreating(false);
        }
    };

    const handleToggleActive = async (user) => {
        try {
            const res = await fetch(`${AUTH_BASE}/users/${user.id}`, {
                method: 'PATCH',
                headers: authHeaders(),
                body: JSON.stringify({ is_active: !user.is_active }),
            });
            if (res.ok) {
                showMessage(`${user.name} ${!user.is_active ? 'activated' : 'deactivated'}.`, 'success');
                loadDoctors();
            } else {
                const d = await res.json();
                showMessage(d.detail || 'Update failed.', 'error');
            }
        } catch {
            showMessage('Network error.', 'error');
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Delete account for "${user.name}" (${user.email})? This cannot be undone.`)) return;
        try {
            const res = await fetch(`${AUTH_BASE}/users/${user.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 204) {
                showMessage(`${user.name}'s account deleted.`, 'success');
                loadDoctors();
            } else {
                const d = await res.json();
                showMessage(d.detail || 'Delete failed.', 'error');
            }
        } catch {
            showMessage('Network error.', 'error');
        }
    };

    const filtered = doctors.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Not logged in state
    if (!token) {
        return (
            <div className="doctors-page">
                <div className="doctors-bg-orb orb1" />
                <div className="doctors-bg-orb orb2" />
                <div className="doctors-center-card">
                    <div className="doctors-lock-icon">🔒</div>
                    <h2>Authentication Required</h2>
                    <p>You must be signed in as an <strong>Admin</strong> to manage doctor accounts.</p>
                    <button className="doc-btn doc-btn-primary" onClick={() => navigate('/')}>
                        Sign In
                    </button>
                    <button className="doc-btn doc-btn-secondary" onClick={() => navigate('/dashboard')}>
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Not admin state
    if (!isAdmin) {
        return (
            <div className="doctors-page">
                <div className="doctors-bg-orb orb1" />
                <div className="doctors-bg-orb orb2" />
                <div className="doctors-center-card">
                    <div className="doctors-lock-icon">⛔</div>
                    <h2>Admin Access Only</h2>
                    <p>You are logged in as <strong>{currentUser?.name}</strong> ({currentUser?.role}), but this page requires <strong>Admin</strong> privileges.</p>
                    <button className="doc-btn doc-btn-secondary" onClick={() => navigate('/dashboard')}>
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const admins = filtered.filter(u => u.role === 'admin');
    const doctorList = filtered.filter(u => u.role === 'doctor');

    return (
        <div className="doctors-page">
            <div className="doctors-bg-orb orb1" />
            <div className="doctors-bg-orb orb2" />

            <div className="doctors-layout">
                {/* Header */}
                <div className="doctors-header">
                    <div className="doctors-header-left">
                        <button className="doc-back-btn" onClick={() => navigate('/dashboard')}>← Dashboard</button>
                        <div>
                            <h1>👨‍⚕️ User Management</h1>
                            <p>Manage admin and doctor accounts for the clinic system</p>
                        </div>
                    </div>
                    <div className="doctors-header-right">
                        <div className="current-user-badge">
                            👤 {currentUser?.name}
                            <span className="role-chip admin">Admin</span>
                        </div>
                        <button
                            className="doc-btn doc-btn-primary"
                            onClick={() => setShowCreateForm(true)}
                        >
                            ➕ Add Doctor
                        </button>
                    </div>
                </div>

                {/* Message */}
                {message.text && (
                    <div className={`doc-message ${message.type}`}>
                        {message.type === 'error' ? '❌' : '✅'} {message.text}
                    </div>
                )}

                {/* Stats Bar */}
                <div className="doctors-stats-bar">
                    <div className="stat-pill">
                        <span className="stat-num">{doctors.length}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-num">{doctors.filter(u => u.role === 'doctor').length}</span>
                        <span className="stat-label">Doctors</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-num">{doctors.filter(u => u.role === 'admin').length}</span>
                        <span className="stat-label">Admins</span>
                    </div>
                    <div className="stat-pill">
                        <span className="stat-num">{doctors.filter(u => u.is_active).length}</span>
                        <span className="stat-label">Active</span>
                    </div>
                    <div className="stat-pill inactive">
                        <span className="stat-num">{doctors.filter(u => !u.is_active).length}</span>
                        <span className="stat-label">Inactive</span>
                    </div>
                </div>

                {/* Search */}
                <div className="doctors-search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name, email or role…"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Create Doctor Modal */}
                {showCreateForm && (
                    <div className="doc-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowCreateForm(false); }}>
                        <div className="doc-modal">
                            <div className="doc-modal-header">
                                <h2>➕ Create Doctor Account</h2>
                                <button className="doc-modal-close" onClick={() => setShowCreateForm(false)}>✕</button>
                            </div>
                            <p className="doc-modal-desc">
                                The new doctor will be able to log in using these credentials. Share them securely.
                            </p>
                            <form onSubmit={handleCreateDoctor}>
                                <div className="doc-form-group">
                                    <label htmlFor="doc-name">Full Name</label>
                                    <input
                                        id="doc-name"
                                        type="text"
                                        required
                                        placeholder="Dr. Jane Smith"
                                        value={createForm.name}
                                        onChange={e => setCreateForm({ ...createForm, name: e.target.value })}
                                    />
                                </div>
                                <div className="doc-form-group">
                                    <label htmlFor="doc-email">Email Address</label>
                                    <input
                                        id="doc-email"
                                        type="email"
                                        required
                                        placeholder="dr.smith@clinic.com"
                                        value={createForm.email}
                                        onChange={e => setCreateForm({ ...createForm, email: e.target.value })}
                                    />
                                </div>
                                <div className="doc-form-group">
                                    <label htmlFor="doc-password">
                                        Password
                                        <span className="field-hint"> (min 8 chars, letters + digits + symbol)</span>
                                    </label>
                                    <input
                                        id="doc-password"
                                        type="password"
                                        required
                                        minLength={8}
                                        placeholder="SecureP@ss1"
                                        value={createForm.password}
                                        onChange={e => setCreateForm({ ...createForm, password: e.target.value })}
                                    />
                                </div>
                                <div className="doc-modal-actions">
                                    <button type="button" className="doc-btn doc-btn-secondary" onClick={() => setShowCreateForm(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="doc-btn doc-btn-primary" disabled={creating}>
                                        {creating ? '⏳ Creating…' : '✅ Create Doctor'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="doctors-loading">
                        <div className="loading-spinner-lg" />
                        <p>Loading user accounts…</p>
                    </div>
                ) : (
                    <div className="doctors-content">
                        {/* Admins Section */}
                        {admins.length > 0 && (
                            <div className="user-section">
                                <div className="section-divider">
                                    <span>🛡️ Admins ({admins.length})</span>
                                </div>
                                <div className="users-grid">
                                    {admins.map(user => (
                                        <UserCard
                                            key={user.id}
                                            user={user}
                                            currentUser={currentUser}
                                            onToggleActive={handleToggleActive}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Doctors Section */}
                        <div className="user-section">
                            <div className="section-divider">
                                <span>👨‍⚕️ Doctors ({doctorList.length})</span>
                                <button
                                    className="section-add-btn"
                                    onClick={() => setShowCreateForm(true)}
                                >
                                    ➕ Add Doctor
                                </button>
                            </div>
                            {doctorList.length === 0 ? (
                                <div className="empty-doctors">
                                    <div className="empty-icon">👨‍⚕️</div>
                                    <h3>No Doctors Yet</h3>
                                    <p>Create doctor accounts so they can log in and access the clinic dashboard.</p>
                                    <button className="doc-btn doc-btn-primary" onClick={() => setShowCreateForm(true)}>
                                        ➕ Create First Doctor
                                    </button>
                                </div>
                            ) : (
                                <div className="users-grid">
                                    {doctorList.map(user => (
                                        <UserCard
                                            key={user.id}
                                            user={user}
                                            currentUser={currentUser}
                                            onToggleActive={handleToggleActive}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function UserCard({ user, currentUser, onToggleActive, onDelete }) {
    const isMe = user.id === currentUser?.id;
    const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className={`user-card ${!user.is_active ? 'inactive' : ''}`}>
            <div className="user-card-top">
                <div className={`user-avatar role-${user.role}`}>{initials}</div>
                <div className="user-meta">
                    <div className="user-name">
                        {user.name}
                        {isMe && <span className="me-badge">YOU</span>}
                    </div>
                    <div className="user-email">{user.email}</div>
                    <div className={`user-role-chip ${user.role}`}>{user.role}</div>
                </div>
                <div className={`user-status-dot ${user.is_active ? 'active' : 'inactive'}`} title={user.is_active ? 'Active' : 'Inactive'} />
            </div>

            <div className="user-card-info">
                <div className="user-info-row">
                    <span className="info-label">Status</span>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                        {user.is_active ? '● Active' : '○ Inactive'}
                    </span>
                </div>
                <div className="user-info-row">
                    <span className="info-label">Joined</span>
                    <span className="info-value">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="user-info-row">
                    <span className="info-label">ID</span>
                    <span className="info-value">#{user.id}</span>
                </div>
            </div>

            {!isMe && (
                <div className="user-card-actions">
                    <button
                        className={`doc-btn ${user.is_active ? 'doc-btn-warning' : 'doc-btn-success'}`}
                        onClick={() => onToggleActive(user)}
                        title={user.is_active ? 'Deactivate Account' : 'Activate Account'}
                    >
                        {user.is_active ? '⏸ Deactivate' : '▶ Activate'}
                    </button>
                    <button
                        className="doc-btn doc-btn-danger"
                        onClick={() => onDelete(user)}
                        title="Delete Account"
                    >
                        🗑️ Delete
                    </button>
                </div>
            )}
            {isMe && (
                <div className="user-card-actions">
                    <span className="own-account-note">Your account</span>
                </div>
            )}
        </div>
    );
}

export default DoctorsPage;
