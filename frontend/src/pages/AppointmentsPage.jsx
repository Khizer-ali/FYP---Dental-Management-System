import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const pageStyle = { minHeight: '100vh', background: '#0f172a', padding: '24px' };
const headerBoxStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '24px', padding: '20px 24px',
    background: '#1e293b', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)'
};
const backBtnStyle = {
    background: 'rgba(59,130,246,0.15)', color: 'white',
    border: '1px solid rgba(59,130,246,0.4)', borderRadius: '8px',
    padding: '10px 18px', cursor: 'pointer', fontWeight: '600', fontSize: '14px'
};
const tableContainerStyle = {
    background: '#1e293b', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden'
};

function AppointmentsPage() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_BASE}/appointments`)
            .then(r => r.ok ? r.json() : [])
            .then(data => { setAppointments(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const statusColor = (status) => {
        if (!status) return '#94a3b8';
        const s = status.toLowerCase();
        if (s === 'scheduled') return '#3b82f6';
        if (s === 'completed') return '#22c55e';
        if (s === 'cancelled') return '#ef4444';
        return '#94a3b8';
    };

    return (
        <div style={pageStyle}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={headerBoxStyle}>
                    <div>
                        <h1 style={{ margin: 0, color: 'white', fontSize: '1.6em' }}>📅 Appointments</h1>
                        <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '14px' }}>All scheduled and pending appointments</p>
                    </div>
                    <button onClick={() => navigate('/')} style={backBtnStyle}>← Back to Dashboard</button>
                </div>

                <div style={tableContainerStyle}>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading appointments…</p>
                    ) : appointments.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No appointments found. Schedule one from a patient's profile.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Date &amp; Time</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Patient</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Status</th>
                                    <th style={{ padding: '14px 16px', textAlign: 'left', color: '#64748b', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>SMS Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.map((apt) => (
                                    <tr key={apt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px 16px', color: '#e2e8f0', fontSize: '14px' }}>
                                            {new Date(apt.appointment_datetime).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#3b82f6', fontWeight: '600', fontSize: '14px' }}>{apt.patient_name}</td>
                                        <td style={{ padding: '14px 16px' }}>
                                            <span style={{
                                                background: `${statusColor(apt.status)}22`,
                                                color: statusColor(apt.status),
                                                padding: '4px 10px', borderRadius: '20px',
                                                fontSize: '12px', fontWeight: '600'
                                            }}>{apt.status}</span>
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>{apt.sms_status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AppointmentsPage;
