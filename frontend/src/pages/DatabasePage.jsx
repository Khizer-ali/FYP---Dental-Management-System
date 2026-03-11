import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const API_BASE = 'http://localhost:5000/api';

function DatabasePage() {
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();
    const currentUser = (() => {
        try { return JSON.parse(window.localStorage.getItem('authUser')); } catch { return null; }
    })();
    const isAdmin = currentUser?.role === 'admin';


    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const loadPatients = async () => {
        try {
            const response = await fetch(`${API_BASE}/patients`);
            const data = await response.json();
            setPatients(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading patients:', error);
            setLoading(false);
            showMessage('Failed to load patient database.', 'error');
        }
    };

    const viewPatient = (patientId) => navigate(`/patient/${patientId}`);

    const deletePatient = async (patientId, patientName, e) => {
        e.stopPropagation();
        const confirmDelete = window.confirm(`Delete ${patientName} and all associated records? This cannot be undone.`);
        if (!confirmDelete) return;
        try {
            const response = await fetch(`${API_BASE}/patients/${patientId}`, { method: 'DELETE' });
            if (response.ok) {
                showMessage(`Patient ${patientName} deleted.`, 'success');
                loadPatients();
            } else {
                const err = await response.json();
                showMessage(`Failed to delete: ${err.error}`, 'error');
            }
        } catch {
            showMessage('Network error during deletion.', 'error');
        }
    };

    useEffect(() => { loadPatients(); }, []);

    const toggleVisibility = async (patient, e) => {
        e.stopPropagation();
        try {
            const response = await fetch(`${API_BASE}/patients/${patient.id}/visibility`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_hidden: !patient.is_hidden })
            });
            if (response.ok) {
                showMessage(`Patient ${patient.name} is now ${!patient.is_hidden ? 'HIDDEN' : 'VISIBLE'}.`, 'success');
                loadPatients();
            } else {
                showMessage('Failed to update visibility.', 'error');
            }
        } catch {
            showMessage('Network error during visibility update.', 'error');
        }
    };

    // Filter patients based on role and search query
    // Doctors cannot see hidden patients
    const filteredPatients = patients.filter(p => {
        if (!isAdmin && p.is_hidden) return false;
        
        return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (p.cnic && p.cnic.includes(searchQuery));
    });

    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', padding: '24px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '24px', padding: '20px 24px',
                    background: '#1e293b', borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div>
                        <h1 style={{ margin: 0, color: 'white', fontSize: '1.6em' }}>🗄️ Patient Database</h1>
                        <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '14px' }}>Manage and view all registered patients</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                                🔍
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name or CNIC..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    background: 'rgba(15, 23, 42, 0.7)', color: 'white',
                                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                                    padding: '8px 12px 8px 34px', fontSize: '14px', outline: 'none',
                                    width: '250px'
                                }}
                            />
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            style={{
                                background: 'rgba(59,130,246,0.15)', color: 'white',
                                border: '1px solid rgba(59,130,246,0.4)', borderRadius: '8px',
                                padding: '10px 18px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                            }}
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`} style={{ marginBottom: '16px' }}>
                        {message.text}
                    </div>
                )}

                {/* Patient Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {loading ? (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                            Loading patients…
                        </p>
                    ) : filteredPatients.length === 0 ? (
                        <p style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                            No patients found matching your search.
                        </p>
                    ) : filteredPatients.map(patient => (
                        <div
                            key={patient.id}
                            onClick={() => viewPatient(patient.id)}
                            style={{
                                background: 'rgba(30,41,59,0.85)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '10px', padding: '20px',
                                cursor: 'pointer', position: 'relative',
                                transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                                opacity: patient.is_hidden ? 0.6 : 1
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.2)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            {patient.is_hidden && (
                                <div style={{ position: 'absolute', top: '-10px', left: '14px', background: '#fb923c', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                    HIDDEN
                                </div>
                            )}
                            <h3 style={{ color: '#3b82f6', marginBottom: '8px', paddingRight: '60px' }}>{patient.name}</h3>
                            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0' }}>
                                <strong style={{ color: '#cbd5e1' }}>Ref:</strong> {patient.reference_number}
                            </p>
                            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0' }}>
                                <strong style={{ color: '#cbd5e1' }}>Created:</strong> {new Date(patient.created_at).toLocaleDateString()}
                            </p>
                            {patient.cnic && (
                                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0' }}>
                                    <strong style={{ color: '#cbd5e1' }}>CNIC:</strong> {patient.cnic}
                                </p>
                            )}
                            {patient.phone_number && (
                                <p style={{ color: '#94a3b8', fontSize: '14px', margin: '4px 0' }}>
                                    <strong style={{ color: '#cbd5e1' }}>Phone:</strong> {patient.phone_number}
                                </p>
                            )}
                            <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '8px' }}>
                                {isAdmin && (
                                    <button
                                        onClick={(e) => toggleVisibility(patient, e)}
                                        style={{
                                            background: 'none', border: 'none',
                                            color: patient.is_hidden ? '#22c55e' : '#fb923c', 
                                            fontSize: '18px', cursor: 'pointer'
                                        }}
                                        title={patient.is_hidden ? "Unhide Patient" : "Hide Patient"}
                                    >
                                        {patient.is_hidden ? '👁️' : '🙈'}
                                    </button>
                                )}
                                <button
                                    onClick={(e) => deletePatient(patient.id, patient.name, e)}
                                    style={{
                                        background: 'none', border: 'none',
                                        color: '#ef4444', fontSize: '18px', cursor: 'pointer'
                                    }}
                                    title="Delete Patient"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default DatabasePage;
