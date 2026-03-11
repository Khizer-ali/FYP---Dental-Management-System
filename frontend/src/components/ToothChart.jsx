import React, { useState, useEffect } from 'react';
import '../styles/tooth-chart.css';

const TOOTH_TYPES = {
    MOLAR: 'Molar',
    PREMOLAR: 'Premolar',
    CANINE: 'Canine',
    INCISOR: 'Incisor'
};

const getToothType = (number) => {
    const n = parseInt(number);
    if ([1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32].includes(n)) return TOOTH_TYPES.MOLAR;
    if ([4, 5, 12, 13, 20, 21, 28, 29].includes(n)) return TOOTH_TYPES.PREMOLAR;
    if ([6, 11, 22, 27].includes(n)) return TOOTH_TYPES.CANINE;
    return TOOTH_TYPES.INCISOR;
};

const getGridPosition = (number) => {
    const n = parseInt(number);
    if (n >= 1 && n <= 16) return { arch: 'maxilla', index: n - 1 };
    if (n >= 17 && n <= 32) return { arch: 'mandible', index: 32 - n };
    return { arch: 'unknown', index: 0 };
};

const TOOTH_NAMES = {
    '1': 'Maxillary 3rd Molar', '2': 'Maxillary 2nd Molar', '3': 'Maxillary 1st Molar',
    '4': 'Maxillary 2nd Premolar', '5': 'Maxillary 1st Premolar', '6': 'Maxillary Canine',
    '7': 'Maxillary Lateral Incisor', '8': 'Maxillary Central Incisor', '9': 'Maxillary Central Incisor',
    '10': 'Maxillary Lateral Incisor', '11': 'Maxillary Canine', '12': 'Maxillary 1st Premolar',
    '13': 'Maxillary 2nd Premolar', '14': 'Maxillary 1st Molar', '15': 'Maxillary 2nd Molar', '16': 'Maxillary 3rd Molar',
    '17': 'Mandibular 3rd Molar', '18': 'Mandibular 2nd Molar', '19': 'Mandibular 1st Molar',
    '20': 'Mandibular 2nd Premolar', '21': 'Mandibular 1st Premolar', '22': 'Mandibular Canine',
    '23': 'Mandibular Lateral Incisor', '24': 'Mandibular Central Incisor', '25': 'Mandibular Central Incisor',
    '26': 'Mandibular Lateral Incisor', '27': 'Mandibular Canine', '28': 'Mandibular 1st Premolar',
    '29': 'Mandibular 2nd Premolar', '30': 'Mandibular 1st Molar', '31': 'Mandibular 2nd Molar', '32': 'Mandibular 3rd Molar'
};

const ToothGraphic = ({ type, isUpper, condition }) => {
    const isHealthy = condition === 'healthy' || !condition;

    const getRootPaths = () => {
        if (isUpper) {
            if (type === TOOTH_TYPES.MOLAR) {
                return (
                    <>
                        <path className="tooth-path" d="M12,45 Q10,15 17,10 Q22,10 22,45 Z" />
                        <path className="tooth-path" d="M23,45 Q25,5 28,10 Q32,5 33,45 Z" />
                        <path className="tooth-path" d="M34,45 Q36,15 39,10 Q45,15 44,45 Z" />
                    </>
                );
            }
            if (type === TOOTH_TYPES.PREMOLAR) {
                return (
                    <>
                        <path className="tooth-path" d="M16,45 Q15,15 22,10 Q28,15 28,45 Z" />
                        <path className="tooth-path" d="M29,45 Q32,15 35,10 Q40,15 40,45 Z" />
                    </>
                );
            }
            // Canine / Incisor
            return <path className="tooth-path" d="M18,45 Q22,10 28,8 Q34,10 38,45 Z" />;
        } else {
            // Mandible
            if (type === TOOTH_TYPES.MOLAR) {
                return (
                    <>
                        <path className="tooth-path" d="M14,35 Q10,65 18,70 Q24,65 24,35 Z" />
                        <path className="tooth-path" d="M30,35 Q30,65 38,70 Q45,65 42,35 Z" />
                    </>
                );
            }
            return <path className="tooth-path" d="M20,35 Q22,65 28,70 Q34,65 36,35 Z" />;
        }
    };

    const getCrownPath = () => {
        if (isUpper) {
            if (type === TOOTH_TYPES.MOLAR) return "M10,40 Q28,45 46,40 Q50,60 40,65 Q28,60 16,65 Q6,60 10,40 Z";
            if (type === TOOTH_TYPES.PREMOLAR) return "M15,40 Q28,45 41,40 Q45,60 35,65 Q28,60 21,65 Q11,60 15,40 Z";
            if (type === TOOTH_TYPES.CANINE) return "M17,40 Q28,45 39,40 Q45,60 28,70 Q11,60 17,40 Z";
            if (type === TOOTH_TYPES.INCISOR) return "M18,40 Q28,42 38,40 Q42,55 38,65 L18,65 Q14,55 18,40 Z";
        } else {
            if (type === TOOTH_TYPES.MOLAR) return "M12,40 Q28,35 44,40 Q50,20 40,15 Q28,20 16,15 Q6,20 12,40 Z";
            if (type === TOOTH_TYPES.PREMOLAR) return "M15,40 Q28,35 41,40 Q45,20 35,15 Q28,20 21,15 Q11,20 15,40 Z";
            if (type === TOOTH_TYPES.CANINE) return "M17,40 Q28,35 39,40 Q45,20 28,10 Q11,20 17,40 Z";
            if (type === TOOTH_TYPES.INCISOR) return "M18,40 Q28,38 38,40 Q42,25 38,15 L18,15 Q14,25 18,40 Z";
        }
        return "";
    };

    const getDecayBlob = () => {
        if (condition !== 'decay') return null;
        const cy = isUpper ? 60 : 20;
        return <circle cx="28" cy={cy} r="5" className="decay-blob" />;
    };

    const getRootCanal = () => {
        if (condition !== 'root_canal' && condition !== 'root' && condition !== 'both') return null;
        const y1 = isUpper ? 12 : 68;
        const y2 = isUpper ? 42 : 38;

        return (
            <g>
                <line x1="28" y1={y1} x2="28" y2={y2} className="rc-line" />
                <text x="28" y={isUpper ? 58 : 22} textAnchor="middle" className="rc-text">RC</text>
            </g>
        );
    };

    const getMissing = () => {
        if (condition !== 'missing') return null;
        return (
            <g>
                <line x1="10" y1="20" x2="46" y2="60" className="missing-x" />
                <line x1="46" y1="20" x2="10" y2="60" className="missing-x" />
            </g>
        );
    };

    const getCavity = () => {
        if (condition !== 'cavity' && condition !== 'both') return null;
        const cy = isUpper ? 58 : 22;
        return <circle cx="28" cy={cy} r="6" fill="#000" />;
    }

    const conditionalClass = `condition-${condition || 'healthy'}`;

    return (
        <svg viewBox="0 0 56 80" width="100%" height="100%" className={conditionalClass}>
            {/* Roots */}
            {getRootPaths()}
            {/* Crown */}
            <path className="tooth-path tooth-crown" d={getCrownPath()} />
            {/* Overlays */}
            {getDecayBlob()}
            {getCavity()}
            {getRootCanal()}
            {getMissing()}
        </svg>
    );
};

const ToothChart = ({ patientId, initialTeethData = {} }) => {
    const [teethData, setTeethData] = useState(initialTeethData);
    const [selectedTooth, setSelectedTooth] = useState('19'); // Default selection
    const [loading, setLoading] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('charting');
    const [message, setMessage] = useState(null);

    // Notes state
    const [notes, setNotes] = useState(initialTeethData['general_notes'] || '');

    // X-Ray State
    const [xRays, setXRays] = useState([]);
    const [selectedXRay, setSelectedXRay] = useState(null);

    useEffect(() => {
        setTeethData(initialTeethData);
        setNotes(initialTeethData['general_notes'] || '');
    }, [initialTeethData]);

    useEffect(() => {
        // Fetch X-Rays when the component mounts or patientId changes
        const fetchXRays = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/patients/${patientId}/images`);
                if (res.ok) {
                    const data = await res.json();
                    setXRays(data.filter(img => img.image_type && img.image_type.toLowerCase().includes('x-ray') || img.image_type === 'Medical Image'));
                }
            } catch (err) {
                console.error("Failed to fetch X-Rays for chart viewing:", err);
            }
        };
        fetchXRays();
    }, [patientId]);

    const handleToothSelect = (number) => {
        setSelectedTooth(number.toString());
    };

    const handleConditionUpdate = async (condition) => {
        if (!selectedTooth) return;

        const toothId = `t${selectedTooth}`;
        const previousData = { ...teethData };

        // Optimistic Update
        const updatedData = { ...teethData };
        if (condition === 'healthy') {
            delete updatedData[toothId];
        } else {
            updatedData[toothId] = condition;
        }
        setTeethData(updatedData);
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:5000/api/patients/${patientId}/teeth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tooth_id: toothId,
                    condition: condition === 'healthy' ? '' : condition
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save condition');
            }
        } catch (error) {
            console.error('Error updating tooth condition:', error);
            setTeethData(previousData); // Revert
            setMessage({ text: 'Failed to save tooth condition.', type: 'error' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNotes = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/patients/${patientId}/teeth`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tooth_id: 'general_notes',
                    condition: notes
                })
            });
            if (response.ok) {
                // Update local state to reflect saved notes
                setTeethData(prev => ({ ...prev, 'general_notes': notes }));
                setMessage({ text: 'Notes saved successfully!', type: 'success' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ text: 'Failed to save notes.', type: 'error' });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (err) {
            console.error("Failed to save notes", err);
            setMessage({ text: 'Failed to save notes.', type: 'error' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const renderToothGroup = (label, teethArray, position, arch) => {
        return (
            <div className="tooth-group" key={label}>
                {position === 'top' && <div className="tooth-group-label-top">{label}</div>}
                {position === 'top' && <div className="group-bracket-top"></div>}

                <div style={{ display: 'flex' }}>
                    {teethArray.map(num => (
                        <div
                            key={num}
                            className={`tooth-item ${selectedTooth === num.toString() ? 'selected' : ''}`}
                            onClick={() => handleToothSelect(num)}
                        >
                            {arch === 'maxilla' && <div className="tooth-svg-wrapper">
                                <ToothGraphic type={getToothType(num)} isUpper={true} condition={teethData[`t${num}`]} />
                            </div>}
                            <div className="tooth-number">{num}</div>
                            {arch === 'mandible' && <div className="tooth-svg-wrapper">
                                <ToothGraphic type={getToothType(num)} isUpper={false} condition={teethData[`t${num}`]} />
                            </div>}
                        </div>
                    ))}
                </div>

                {position === 'bottom' && <div className="group-bracket-bottom"></div>}
                {position === 'bottom' && <div className="tooth-group-label-bottom">{label}</div>}
            </div>
        );
    };

    const renderMaxilla = () => {
        return (
            <div className="arch-row maxilla">
                <div className="arch-label">Maxilla</div>
                {renderToothGroup('Molars', [1, 2, 3], 'top', 'maxilla')}
                {renderToothGroup('Premolars', [4, 5], 'top', 'maxilla')}
                {renderToothGroup('Canines', [6], 'top', 'maxilla')}
                {renderToothGroup('Incisors', [7, 8, 9, 10], 'top', 'maxilla')}
                {renderToothGroup('Canines', [11], 'top', 'maxilla')}
                {renderToothGroup('Premolars', [12, 13], 'top', 'maxilla')}
                {renderToothGroup('Molars', [14, 15, 16], 'top', 'maxilla')}
            </div>
        );
    };

    const renderMandible = () => {
        return (
            <div className="arch-row mandible">
                <div className="arch-label">Mandible</div>
                {renderToothGroup('Molars', [32, 31, 30], 'bottom', 'mandible')}
                {renderToothGroup('Premolars', [29, 28], 'bottom', 'mandible')}
                {renderToothGroup('Canines', [27], 'bottom', 'mandible')}
                {renderToothGroup('Incisors', [26, 25, 24, 23], 'bottom', 'mandible')}
                {renderToothGroup('Canines', [22], 'bottom', 'mandible')}
                {renderToothGroup('Premolars', [21, 20], 'bottom', 'mandible')}
                {renderToothGroup('Molars', [19, 18, 17], 'bottom', 'mandible')}
            </div>
        );
    };

    const selectedCondition = teethData[`t${selectedTooth}`] || 'healthy';

    return (
        <div className="tooth-chart-container">
            {message && (
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#166534' : '#991b1b',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    zIndex: 1000,
                    fontSize: '14px',
                    fontWeight: '600'
                }}>
                    {message.type === 'success' ? '✓' : '⚠'} {message.text}
                </div>
            )}
            {/* Main Chart Area */}
            <div className="chart-main-area">
                <div className="chart-header-tabs">
                    <button
                        className={`chart-tab ${activeSubTab === 'charting' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('charting')}
                    >
                        <span style={{ color: activeSubTab === 'charting' ? '#3b82f6' : 'inherit' }}>◷</span> Charting
                    </button>
                    <button
                        className={`chart-tab ${activeSubTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveSubTab('notes')}
                    >
                        📄 Notes
                    </button>

                    <div className="chart-tab-controls">
                        <input type="date" className="chart-date-picker" defaultValue={new Date().toISOString().slice(0, 10)} />
                        <button className="chart-icon-btn" onClick={handlePrint} title="Print Chart">🖨️</button>
                    </div>
                </div>

                {activeSubTab === 'charting' && (
                    <div className="teeth-grid">
                        {renderMaxilla()}
                        {renderMandible()}
                    </div>
                )}

                {activeSubTab === 'notes' && (
                    <div className="tab-content-area">
                        <textarea
                            className="notes-textarea"
                            placeholder="Type general dental notes, treatment plans, or patient specific findings here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                        <button
                            className="notes-save-btn"
                            onClick={handleSaveNotes}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Notes'}
                        </button>
                    </div>
                )}

                {activeSubTab === 'xrays' && (
                    <div className="tab-content-area">
                        {xRays.length === 0 ? (
                            <p style={{ color: '#64748b' }}>No X-Rays uploaded for this patient yet. Use the Images tab to upload some.</p>
                        ) : (
                            <div className="xrays-gallery">
                                {xRays.map(img => (
                                    <div key={img.id} className="xray-item" onClick={() => setSelectedXRay(img)}>
                                        <img src={`http://localhost:5000/uploads/images/${img.filename}`} alt="X-Ray" className="xray-img" />
                                        <div className="xray-caption">{img.filename.split('_').pop()}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sidebar Area */}
            <div className="chart-sidebar">
                <div className="sidebar-title">TOOTH DETAILS & CODING</div>

                <div className="status-legend">
                    <div className="legend-item"><div className="legend-color healthy"></div> Healthy</div>
                    <div className="legend-item"><div className="legend-color decay"></div> Decay</div>
                    <div className="legend-item"><div className="legend-color filling"></div> Filling</div>
                    <div className="legend-item"><div className="legend-color missing"></div> Missing</div>
                    <div className="legend-item"><div className="legend-color crown"></div> Crown</div>
                    <div className="legend-item"><div className="legend-color rc"></div> Root Canal</div>
                </div>

                <div className="selected-tooth-details">
                    <div className="details-header">
                        <span>Tooth #{selectedTooth}</span>
                        <div className="details-header-check">✓</div>
                    </div>
                    <div className="details-content">
                        <div className="detail-row">
                            <div className="detail-label">Tooth #{selectedTooth}:</div>
                            <div className="detail-value">{TOOTH_NAMES[selectedTooth] || 'Unknown Tooth'}</div>
                        </div>

                        <div className="detail-row">
                            <div className="detail-label">Current Finding:</div>
                            <div className="detail-value" style={{ textTransform: 'capitalize' }}>
                                {selectedCondition.replace('_', ' ')}
                                {selectedCondition === 'decay' && ' (Active Decay)'}
                                {selectedCondition === 'filling' && ' (Composite Filling)'}
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0' }} />

                        <div className="detail-label">Apply New Condition:</div>
                        <div className="condition-actions">
                            <button
                                className={`condition-btn ${selectedCondition === 'healthy' ? 'active' : ''}`}
                                onClick={() => handleConditionUpdate('healthy')}
                                disabled={loading}
                            >
                                <div className="color-indicator" style={{ backgroundColor: '#edf3ef', border: '1px solid #cbd5e1' }}></div> Set Healthy
                            </button>
                            <button
                                className={`condition-btn ${selectedCondition === 'decay' ? 'active' : ''}`}
                                onClick={() => handleConditionUpdate('decay')}
                                disabled={loading}
                            >
                                <div className="color-indicator" style={{ backgroundColor: '#ef4444' }}></div> Add Decay
                            </button>
                            <button
                                className={`condition-btn ${selectedCondition === 'filling' ? 'active' : ''}`}
                                onClick={() => handleConditionUpdate('filling')}
                                disabled={loading}
                            >
                                <div className="color-indicator" style={{ backgroundColor: '#3b82f6' }}></div> Add Filling
                            </button>
                            <button
                                className={`condition-btn ${selectedCondition === 'crown' ? 'active' : ''}`}
                                onClick={() => handleConditionUpdate('crown')}
                                disabled={loading}
                            >
                                <div className="color-indicator" style={{ backgroundColor: '#f59e0b' }}></div> Add Crown
                            </button>
                            <button
                                className={`condition-btn ${selectedCondition === 'missing' ? 'active' : ''}`}
                                onClick={() => handleConditionUpdate('missing')}
                                disabled={loading}
                            >
                                <div className="color-indicator" style={{ backgroundColor: '#94a3b8' }}></div> Mark Missing
                            </button>
                            <button
                                className={`condition-btn ${selectedCondition === 'root_canal' ? 'active' : ''}`}
                                onClick={() => handleConditionUpdate('root_canal')}
                                disabled={loading}
                            >
                                <div className="color-indicator" style={{ backgroundColor: '#1e293b' }}></div> Root Canal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* X-Ray Modal */}
            {selectedXRay && (
                <div className="xray-modal-overlay" onClick={() => setSelectedXRay(null)}>
                    <div className="xray-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="xray-modal-close" onClick={() => setSelectedXRay(null)}>×</button>
                        <img
                            src={`http://localhost:5000/uploads/images/${selectedXRay.filename}`}
                            alt="X-Ray Enlarged"
                            className="xray-modal-img"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToothChart;
