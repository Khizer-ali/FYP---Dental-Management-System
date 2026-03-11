import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import '../styles/dashboard.css';

const API_BASE = 'http://localhost:5000/api';
const CHART_W = 560;
const CHART_H = 160;
const PAD = { top: 20, right: 20, bottom: 30, left: 42 };
const PAK_PHONE_REGEX = /^(\+92|92|0|0092)?(3\d{9}|(2[1-2]|25|4[1-2]|4[4,6-8]|5[1-3,5-8]|6[1-8]|7[1,4]|81|91|9[3-4,6])\d{7,8})$/;

function PatientTrendsChart({ data }) {
  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map(d => d.count), 1);
  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top - PAD.bottom;

  // Build the polyline points
  const pts = data.map((d, i) => {
    const x = PAD.left + (i / (data.length - 1)) * innerW;
    const y = PAD.top + innerH - (d.count / maxCount) * innerH;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');

  // Area fill (close path back along the bottom)
  const firstPt = pts[0].split(',');
  const lastPt = pts[pts.length - 1].split(',');
  const areaPath = `M ${polyline.replace(/ /g, ' L ')} L ${lastPt[0]},${PAD.top + innerH} L ${firstPt[0]},${PAD.top + innerH} Z`;

  // Y-axis labels
  const yLabels = [0, Math.round(maxCount / 2), maxCount];
  // X-axis day labels (show every 4th)
  const xLabels = data.filter((_, i) => i % 4 === 0 || i === data.length - 1);

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yLabels.map((val, i) => {
        const y = PAD.top + innerH - (val / maxCount) * innerH;
        return (
          <g key={i}>
            <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y}
              stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">{val}</text>
          </g>
        );
      })}

      {/* Area */}
      <path d={areaPath} fill="url(#areaGrad)" />

      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />

      {/* X-axis labels */}
      {xLabels.map((d, i) => {
        const idx = data.indexOf(d);
        const x = PAD.left + (idx / (data.length - 1)) * innerW;
        return (
          <text key={i} x={x} y={CHART_H - 4} textAnchor="middle" fill="#64748b" fontSize="10">{d.day}</text>
        );
      })}
    </svg>
  );
}

function AppointmentCalendar({ appointments }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar');

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = endOfMonth.getDate();
  const startDay = startOfMonth.getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const dayCounts = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const count = appointments.filter(a => {
      const ad = new Date(a.appointment_datetime);
      return ad.getDate() === d && ad.getMonth() === currentDate.getMonth() && ad.getFullYear() === currentDate.getFullYear();
    }).length;
    return { day: d, count };
  });
  const maxCount = Math.max(...dayCounts.map(d => d.count), 1);

  const days = [];
  for (let i = 0; i < startDay; i++) days.push(<div key={`pad-${i}`} className="calendar-day padding"></div>);
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
    const hasAppt = appointments.some(a => {
      const ad = new Date(a.appointment_datetime);
      return ad.getDate() === d && ad.getMonth() === currentDate.getMonth() && ad.getFullYear() === currentDate.getFullYear();
    });
    days.push(
      <div key={d} className={`calendar-day ${isToday ? 'today' : ''} ${hasAppt ? 'has-appt' : ''}`}>
        {d}
        {hasAppt && <div className="appt-dot"></div>}
      </div>
    );
  }

  const barW = 7;
  const chartH = 110;
  const gapW = 2;
  const totalW = daysInMonth * (barW + gapW);

  return (
    <div className="calendar-container">
      <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            title={viewMode === 'calendar' ? 'Switch to Chart' : 'Switch to Calendar'}
            onClick={() => setViewMode(v => v === 'calendar' ? 'graph' : 'calendar')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', padding: '2px 4px' }}
          >
            {viewMode === 'calendar' ? '📊' : '📅'}
          </button>
          <div className="calendar-nav">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>‹</button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>›</button>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <>
          <div className="calendar-weekdays">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="weekday">{d}</div>)}
          </div>
          <div className="calendar-grid">{days}</div>
        </>
      ) : (
        <div style={{ marginTop: '10px', overflowX: 'auto' }}>
          <svg width={totalW} height={chartH + 24} style={{ display: 'block' }}>
            {dayCounts.map(({ day, count }, i) => {
              const barH = count === 0 ? 2 : Math.max(4, (count / maxCount) * chartH);
              const x = i * (barW + gapW);
              const y = chartH - barH;
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
              return (
                <g key={day}>
                  <rect x={x} y={y} width={barW} height={barH} rx="2" ry="2"
                    fill={count > 0 ? (isToday ? '#22c55e' : '#3b82f6') : 'rgba(255,255,255,0.07)'} />
                  {(day % 5 === 0 || day === 1) && (
                    <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fill="#64748b" fontSize="9">{day}</text>
                  )}
                  {count > 0 && (
                    <text x={x + barW / 2} y={y - 3} textAnchor="middle" fill="#94a3b8" fontSize="8">{count}</text>
                  )}
                </g>
              );
            })}
          </svg>
          <div style={{ display: 'flex', gap: '14px', marginTop: '6px', fontSize: '10px', color: '#64748b' }}>
            <span>🟦 Appointments</span>
            <span style={{ color: '#22c55e' }}>🟩 Today</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [totalPatients, setTotalPatients] = useState(0);
  const [trendData, setTrendData] = useState([]);
  const [trendRange, setTrendRange] = useState(30);
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({ name: '', cnic: '', phone_number: '' });
  const navigate = useNavigate();

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/patients`);
      if (res.ok) {
        const data = await res.json();
        setTotalPatients(data.length);
      }
    } catch (err) {
      console.error('Failed to fetch patients', err);
    }
  }, []);

  const fetchTrends = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/patient-trends?days=${trendRange}`);
      if (res.ok) {
        const data = await res.json();
        setTrendData(data);
      }
    } catch (err) {
      console.error('Failed to fetch trends', err);
    }
  }, [trendRange]);

  const fetchAllAppointments = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/appointments`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error('Failed to fetch appointments', err);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients, message]);
  useEffect(() => { fetchTrends(); }, [fetchTrends]);
  useEffect(() => { fetchAllAppointments(); }, [fetchAllAppointments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { phone_number } = formData;
    if (phone_number && !PAK_PHONE_REGEX.test(phone_number)) {
      showMessage('Invalid', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (response.ok) {
        showMessage('Patient created successfully!', 'success');
        setFormData({ name: '', cnic: '', phone_number: '' });
      } else {
        showMessage(result.error || 'Error creating patient', 'error');
      }
    } catch (error) {
      showMessage('Network error: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const handleCnicChange = (e) => {
    // Strip everything except digits
    const digits = e.target.value.replace(/\D/g, '').slice(0, 13);
    // Auto-insert dashes: XXXXX-XXXXXXX-X
    let formatted = digits;
    if (digits.length > 5) formatted = digits.slice(0, 5) + '-' + digits.slice(5);
    if (digits.length > 12) formatted = formatted.slice(0, 13) + '-' + formatted.slice(13);
    setFormData({ ...formData, cnic: formatted });
  };

  const totalRegistrationsInRange = trendData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div className="sidebar-icon active" title="Dashboard">⊞</div>
        <div className="sidebar-icon" title="Patients" onClick={() => navigate('/database')}>👥</div>
        <div className="sidebar-icon" title="Appointments" onClick={() => navigate('/appointments')}>📅</div>
        <div className="sidebar-icon" title="Billing" onClick={() => navigate('/billing')}>💳</div>
        <div className="sidebar-icon" title="Settings">⚙️</div>
        <div className="sidebar-icon" style={{ marginTop: 'auto', marginBottom: '20px' }} title="Back to home" onClick={() => navigate('/')}>🚪</div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Topbar */}
        <div className="dashboard-topbar">
          <div className="topbar-title">
            <h1>🏥 Dentrixa Ai</h1>
            <span>Agentic Dental Management System</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">

          {/* Column 1: Stats */}
          <div className="stats-column">
            <div className="dash-card stat-card">
              <div className="card-title">👥 Total Patients</div>
              <div className="stat-number">
                {totalPatients.toLocaleString()} <span className="stat-trend-up">↗</span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>All registered patients</div>
            </div>
            <div className="dash-card stat-card">
              <div className="card-title">📊 New This Period</div>
              <div className="stat-number" style={{ fontSize: '32px' }}>
                {totalRegistrationsInRange} <span className="stat-trend-up" style={{ fontSize: '18px' }}>↗</span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '10px' }}>Last {trendRange} days</div>
            </div>
          </div>

          {/* Column 2: Create Patient */}
          <div className="dash-card create-patient-card">
            <div className="card-title">Create New Patient</div>
            <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
              <div className="dark-form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter patient name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="dark-form-group">
                <label>CNIC (Optional)</label>
                <input
                  type="text"
                  placeholder="XXXXX-XXXXXXX-X"
                  value={formData.cnic}
                  onChange={handleCnicChange}
                  maxLength={15}
                />
              </div>
              <div className="dark-form-group">
                <label>Phone Number (Optional)</label>
                <PhoneInput
                  international
                  defaultCountry="PK"
                  value={formData.phone_number}
                  onChange={(val) => setFormData({ ...formData, phone_number: val || '' })}
                  className="dark-phone-input"
                  maxLength={15}
                />
              </div>
              <button type="submit" className="dark-btn" disabled={loading}>
                {loading ? 'Creating...' : 'Create Patient'}
              </button>
            </form>
            {message.text && (
              <div className={`dash-message ${message.type}`}>{message.text}</div>
            )}
          </div>

          {/* Column 3: Quick Actions */}
          <div className="stats-column">
            <div className="dash-card">
              <div className="card-title">Quick-Action</div>
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', cursor: 'pointer' }} onClick={() => navigate('/database')}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '20px' }}>🗄️</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>View Patient Database</div>
                    <div style={{ fontSize: '12px', color: '#22c55e' }}>Manage all patient records</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px', cursor: 'pointer' }} onClick={() => navigate('/appointments')}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e', fontSize: '20px' }}>📅</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>Appointments</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>View pending &amp; upcoming</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' }} onClick={() => navigate('/billing')}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(250, 204, 21, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15', fontSize: '20px' }}>💳</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'white' }}>Billing Overview</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>Issued invoice history</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="dash-card" style={{ justifyContent: 'center' }}>
              <button className="action-btn primary" onClick={() => navigate('/database')} style={{ margin: 0 }}>
                🗄️ View Patient Database
              </button>
            </div>
          </div>

          {/* Analytics & Calendar Row */}
          <div className="dash-card analytics-card" style={{ gridColumn: '1 / -1' }}>
            <div className="analytics-header">
              <div className="analytics-title-group">
                <div className="card-title" style={{ marginBottom: 0 }}>
                  📈 Patient Registration Trends
                </div>
                <div className="trend-selectors">
                  {[7, 14, 30].map(r => (
                    <button
                      key={r}
                      onClick={() => setTrendRange(r)}
                      className={`range-btn ${trendRange === r ? 'active' : ''}`}
                    >
                      Last {r} days
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="analytics-content-split">
              <div className="chart-section">
                <div className="chart-info">
                  <span className="info-label">Last {trendRange} days</span>
                </div>
                <div className="chart-wrapper">
                  <PatientTrendsChart data={trendData} />
                </div>
              </div>

              <div className="calendar-section">
                <div className="section-header">
                  <div className="card-title">📅 Appointment Calendar</div>
                </div>
                <AppointmentCalendar appointments={appointments} />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="dashboard-footer">
          <div>System time: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="footer-status">
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
              Agent Status: <span className="status-badge">On</span>
            </span>
          </div>
          <div>System: Current</div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
