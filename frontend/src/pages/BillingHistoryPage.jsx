<<<<<<< HEAD
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

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

function BillingHistoryPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_BASE}/bills`)
            .then(r => r.ok ? r.json() : [])
            .then(data => { setBills(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const totalRevenue = bills.reduce((sum, b) => sum + (b.grand_total || 0), 0);
    const totalOutstanding = bills.reduce((sum, b) => sum + (b.outstanding_amount || 0), 0);

    return (
        <div style={pageStyle}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={headerBoxStyle}>
                    <div>
                        <h1 style={{ margin: 0, color: 'white', fontSize: '1.6em' }}>💳 Billing Overview</h1>
                        <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '14px' }}>
                            Full invoice history &nbsp;·&nbsp;
                            <span style={{ color: '#22c55e', fontWeight: '600' }}>PKR {totalRevenue.toFixed(2)} total revenue</span>
                            {totalOutstanding > 0 && <span style={{ color: '#fb923c', fontWeight: '600', marginLeft: '12px' }}>PKR {totalOutstanding.toFixed(2)} outstanding</span>}
                        </p>
                    </div>
                    <button onClick={() => navigate('/')} style={backBtnStyle}>← Back to Dashboard</button>
                </div>

                <div style={tableContainerStyle}>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading billing history…</p>
                    ) : bills.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No bills found. Create invoices from a patient's Billing tab.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    {['Date', 'Invoice #', 'Patient', 'Staff', 'Discount', 'Amount', 'Outstanding', 'Method'].map(h => (
                                        <th key={h} style={{ padding: '14px 16px', textAlign: (h === 'Amount' || h === 'Discount' || h === 'Outstanding') ? 'right' : 'left', color: '#64748b', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill) => (
                                    <tr key={bill.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px 16px', color: '#e2e8f0', fontSize: '14px' }}>{bill.date}</td>
                                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px', fontFamily: 'monospace' }}>{bill.invoice_number}</td>
                                        <td style={{ padding: '14px 16px', color: '#3b82f6', fontWeight: '600', fontSize: '14px' }}>{bill.patient_name}</td>
                                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>{bill.staff_name || '—'}</td>
                                        <td style={{ padding: '14px 16px', color: '#f87171', fontSize: '13px', textAlign: 'right' }}>
                                            {bill.discount_amount > 0 ? `PKR ${bill.discount_amount.toFixed(2)}` : '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#22c55e', fontWeight: '700', fontSize: '15px', textAlign: 'right' }}>
                                            PKR {bill.grand_total?.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#fb923c', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>
                                            {bill.outstanding_amount > 0 ? `PKR ${bill.outstanding_amount.toFixed(2)}` : '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>{bill.payment_method}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: 'rgba(34,197,94,0.05)', borderTop: '1px solid rgba(34,197,94,0.2)' }}>
                                    <td colSpan={5} style={{ padding: '14px 16px', color: '#94a3b8', fontWeight: '600', fontSize: '14px' }}>Total Revenue ({bills.length} invoices)</td>
                                    <td style={{ padding: '14px 16px', color: '#22c55e', fontWeight: '700', fontSize: '16px', textAlign: 'right' }}>PKR {totalRevenue.toFixed(2)}</td>
                                    <td style={{ padding: '14px 16px', color: '#fb923c', fontWeight: '700', fontSize: '14px', textAlign: 'right' }}>{totalOutstanding > 0 ? `PKR ${totalOutstanding.toFixed(2)}` : ''}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BillingHistoryPage;
=======
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

function BillingHistoryPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${API_BASE}/bills`)
            .then(r => r.ok ? r.json() : [])
            .then(data => { setBills(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const totalRevenue = bills.reduce((sum, b) => sum + (b.grand_total || 0), 0);
    const totalOutstanding = bills.reduce((sum, b) => sum + (b.outstanding_amount || 0), 0);

    return (
        <div style={pageStyle}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={headerBoxStyle}>
                    <div>
                        <h1 style={{ margin: 0, color: 'white', fontSize: '1.6em' }}>💳 Billing Overview</h1>
                        <p style={{ margin: '5px 0 0', color: '#94a3b8', fontSize: '14px' }}>
                            Full invoice history &nbsp;·&nbsp;
                            <span style={{ color: '#22c55e', fontWeight: '600' }}>PKR {totalRevenue.toFixed(2)} total revenue</span>
                            {totalOutstanding > 0 && <span style={{ color: '#fb923c', fontWeight: '600', marginLeft: '12px' }}>PKR {totalOutstanding.toFixed(2)} outstanding</span>}
                        </p>
                    </div>
                    <button onClick={() => navigate('/')} style={backBtnStyle}>← Back to Dashboard</button>
                </div>

                <div style={tableContainerStyle}>
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading billing history…</p>
                    ) : bills.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>No bills found. Create invoices from a patient's Billing tab.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                                    {['Date', 'Invoice #', 'Patient', 'Staff', 'Discount', 'Amount', 'Outstanding', 'Method'].map(h => (
                                        <th key={h} style={{ padding: '14px 16px', textAlign: (h === 'Amount' || h === 'Discount' || h === 'Outstanding') ? 'right' : 'left', color: '#64748b', fontSize: '13px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill) => (
                                    <tr key={bill.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <td style={{ padding: '14px 16px', color: '#e2e8f0', fontSize: '14px' }}>{bill.date}</td>
                                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px', fontFamily: 'monospace' }}>{bill.invoice_number}</td>
                                        <td style={{ padding: '14px 16px', color: '#3b82f6', fontWeight: '600', fontSize: '14px' }}>{bill.patient_name}</td>
                                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>{bill.staff_name || '—'}</td>
                                        <td style={{ padding: '14px 16px', color: '#f87171', fontSize: '13px', textAlign: 'right' }}>
                                            {bill.discount_amount > 0 ? `PKR ${bill.discount_amount.toFixed(2)}` : '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#22c55e', fontWeight: '700', fontSize: '15px', textAlign: 'right' }}>
                                            PKR {bill.grand_total?.toFixed(2)}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#fb923c', fontWeight: '600', fontSize: '14px', textAlign: 'right' }}>
                                            {bill.outstanding_amount > 0 ? `PKR ${bill.outstanding_amount.toFixed(2)}` : '—'}
                                        </td>
                                        <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: '13px' }}>{bill.payment_method}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: 'rgba(34,197,94,0.05)', borderTop: '1px solid rgba(34,197,94,0.2)' }}>
                                    <td colSpan={5} style={{ padding: '14px 16px', color: '#94a3b8', fontWeight: '600', fontSize: '14px' }}>Total Revenue ({bills.length} invoices)</td>
                                    <td style={{ padding: '14px 16px', color: '#22c55e', fontWeight: '700', fontSize: '16px', textAlign: 'right' }}>PKR {totalRevenue.toFixed(2)}</td>
                                    <td style={{ padding: '14px 16px', color: '#fb923c', fontWeight: '700', fontSize: '14px', textAlign: 'right' }}>{totalOutstanding > 0 ? `PKR ${totalOutstanding.toFixed(2)}` : ''}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BillingHistoryPage;
>>>>>>> 21d5d1dd93ec57f1b541daadb89588e7896dc201
