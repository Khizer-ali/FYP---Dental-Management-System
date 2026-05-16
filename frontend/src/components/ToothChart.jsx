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
    if ([16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48].includes(n)) return TOOTH_TYPES.MOLAR;
    if ([14, 15, 24, 25, 34, 35, 44, 45].includes(n)) return TOOTH_TYPES.PREMOLAR;
    if ([13, 23, 33, 43].includes(n)) return TOOTH_TYPES.CANINE;
    return TOOTH_TYPES.INCISOR;
};

const TOOTH_NAMES = {
    '18': 'Maxillary Right 3rd Molar', '17': 'Maxillary Right 2nd Molar', '16': 'Maxillary Right 1st Molar',
    '15': 'Maxillary Right 2nd Premolar', '14': 'Maxillary Right 1st Premolar', '13': 'Maxillary Right Canine',
    '12': 'Maxillary Right Lateral Incisor', '11': 'Maxillary Right Central Incisor',
    '21': 'Maxillary Left Central Incisor', '22': 'Maxillary Left Lateral Incisor', '23': 'Maxillary Left Canine',
    '24': 'Maxillary Left 1st Premolar', '25': 'Maxillary Left 2nd Premolar',
    '26': 'Maxillary Left 1st Molar', '27': 'Maxillary Left 2nd Molar', '28': 'Maxillary Left 3rd Molar',
    '38': 'Mandibular Left 3rd Molar', '37': 'Mandibular Left 2nd Molar', '36': 'Mandibular Left 1st Molar',
    '35': 'Mandibular Left 2nd Premolar', '34': 'Mandibular Left 1st Premolar', '33': 'Mandibular Left Canine',
    '32': 'Mandibular Left Lateral Incisor', '31': 'Mandibular Left Central Incisor',
    '41': 'Mandibular Right Central Incisor', '42': 'Mandibular Right Lateral Incisor', '43': 'Mandibular Right Canine',
    '44': 'Mandibular Right 1st Premolar', '45': 'Mandibular Right 2nd Premolar',
    '46': 'Mandibular Right 1st Molar', '47': 'Mandibular Right 2nd Molar', '48': 'Mandibular Right 3rd Molar'
};

// Raw Text Templates data
const NOTE_TEMPLATES = {
    option1: `TMJoint Disorders\n\n- Hot Fomentation\n- Soft diet\n- Olive oil Massage\n- Mouth opening Exercise\n- Topical Application of Gel\n- Chew from both sides\n- Avoid wide mouth opening`,
    option2: `دانت نکلوانے کے بعد احتیاطی تدابیر:\n\n1. آپ کے منہ کے اندر روئی کا پیک رکھا گیا ہے اس کو تقریباً 30 منٹ تک دبائے رکھیں۔\n(خون روکنے کے لیے ڈاکٹر نے جو روئی رکھی ہے اسے آدھے گھنٹے تک ہلکا سا دبا کر رکھیں۔)\n\n2. وہی پیک نکلنے کے بعد ٹھنڈی، نرم اور برف والی چیزوں کا استعمال کریں۔\n(پہلے دن آئس کریم، دہی، کولڈ ڈرنک جیسی ٹھنڈی چیزیں کھا سکتے ہیں۔)\n\n3. پہلے 24 گھنٹے تک صرف ٹھنڈی اور نرم چیزیں استعمال کریں۔ اس کے بعد نرم غذا استعمال کی جا سکتی ہے۔\n(گرم، مصالحے دار اور سخت چیزیں 24 گھنٹے تک نہ کھائیں۔)\n\n4. 24 گھنٹے تک تھوکنے اور گرم پینے سے گریز کریں۔\n(تھوکنے اور گرم چائے/کافی سے خون بہنے کا خطرہ بڑھتا ہے۔)\n\n5. دانت نکالی ہوئی جگہ کو زبان یا انگلیوں سے چھونے سے گریز کریں۔\n(زخم کو ہاتھ نہ لگائیں ورنہ انفیکشن ہو سکتی ہے۔)\n\n6. جس طرف سے دانت نکالا گیا ہے اسی جانب پہلے 24 گھنٹے تک برف کی سکائی کریں۔ خون اور درد میں کمی ہو جاتی ہے۔\n(باہر گال پر برف کا ٹکڑا کپڑے میں لپیٹ کر 10-15 منٹ لگائیں۔)\n\n7. سن کرنے کی دوائی کا اثر معمولاً ایک گھنٹے کے بعد ختم ہو جاتا ہے اس کے بعد اگر درد ہو تو ڈاکٹر بتائی ہوئی دوا حسب ہدایت استعمال کریں۔\n(بے حسی ختم ہونے پر دی گئی درد کی دوا لے لیں۔)\n\n8. پہلے 72 گھنٹے میں تھوڑا بہت خون لگنا، درد آنا اور درد ہونا عام معمول ہے۔\n(ہلکا خون آنا اور درد 2-3 دن تک رہ سکتا ہے، پریشان نہ ہوں۔)\n\n9. سرجری سے نکلوانے جانے والے دانت کے 7 دن کے بعد ٹانکے کٹوانے کے لیے ڈاکٹر کے پاس تشریف لائیں۔\n(اگر ٹانکے لگے ہیں تو ایک ہفتے بعد انہیں نکالنے آئیں۔)\n\n10. اگر زیادہ خون بہے تو فوراً اپنے دانتوں کے ڈاکٹر سے رجوع کریں۔\n(زیادہ خون، شدید درد یا سوجن ہو تو ڈاکٹر کو دکھائیں۔)`,
    option3: `مندرجہ ذیل ہدایات پر عمل کریں۔\n\n- ہر کھانے کے بعد اچھی طرح دانت صاف کریں۔\n- عام ٹوتھ پیسٹ سے منہ کے ساتھ چھوٹی سائز والی نرم (Inter Dental) برش کی مدد سے بریسز کے اطراف کی صفائی کے لئے استعمال کریں۔\n- ڈاکٹر کا بتایا ہوا ضروری بریسز والا ٹوتھ پیسٹ استعمال کریں۔\n- روزانہ کم از کم دو مرتبہ دانتوں کے ساتھ مسواک کریں۔\n- کھانا آہستگی اور احتیاط سے چبائیں اور چمچہڑے کے لئے لکڑی کا استعمال کریں۔\n- درد یا انجکشن کی صورت میں گرم پانی کے ساتھ مسواک کریں۔\n- متعلقہ ڈاکٹر کو باقاعدگی سے چیک کروائیں۔\n\nمندرجہ ذیل سے پرہیز کریں۔\n\n- سخت اور چپکنے والی اشیاء کے کھانے سے گریز کریں: شکر، اخروٹ، بادام، سیب، چنا، چیری۔\n- بریسز کی ایڈجسٹمنٹ کے بعد ہونے والے درد کی صورت میں خود سے ادویات بالکل استعمال نہ کریں۔\n- ایپوائنٹمنٹ کے لئے دی گئی وقت اور تاریخ کا خاص خیال رکھیں۔\n- علاج کے اختتام پر پہنے جانے والے Retainers کا پہننا نہ چھوڑیں، تاکہ دانت دوبارہ اپنی اصلی حالت میں نہ آئیں۔`
};

const ToothGraphic = ({ type, isUpper, condition }) => {
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
            return <path className="tooth-path" d="M18,45 Q22,10 28,8 Q34,10 38,45 Z" />;
        } else {
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
    };

    const conditionalClass = `condition-${condition || 'healthy'}`;

    return (
        <svg viewBox="0 0 56 80" width="100%" height="100%" className={conditionalClass}>
            {getRootPaths()}
            <path className="tooth-path tooth-crown" d={getCrownPath()} />
            {getDecayBlob()}
            {getCavity()}
            {getRootCanal()}
            {getMissing()}
        </svg>
    );
};

const ToothChart = ({ patientId, initialTeethData = {} }) => {
    const [teethData, setTeethData] = useState(initialTeethData);
    const [selectedTooth, setSelectedTooth] = useState('36'); 
    const [loading, setLoading] = useState(false);
    const [activeSubTab, setActiveSubTab] = useState('charting');
    const [message, setMessage] = useState(null);

    const [notes, setNotes] = useState(initialTeethData['general_notes'] || '');
    const [selectedNoteOption, setSelectedNoteOption] = useState('');

    const [xRays, setXRays] = useState([]);
    const [selectedXRay, setSelectedXRay] = useState(null);

    useEffect(() => {
        setTeethData(initialTeethData);
        setNotes(initialTeethData['general_notes'] || '');
    }, [initialTeethData]);

    useEffect(() => {
        const fetchXRays = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/patients/${patientId}/images`);
                if (res.ok) {
                    const data = await res.json();
                    setXRays(data.filter(img => (img.image_type && img.image_type.toLowerCase().includes('x-ray')) || img.image_type === 'Medical Image'));
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

    // New change handler for the note selection dropdown template
    const handleTemplateChange = (e) => {
        const val = e.target.value;
        setSelectedNoteOption(val);
        if (val && NOTE_TEMPLATES[val]) {
            setNotes(NOTE_TEMPLATES[val]);
        }
    };

    const handleConditionUpdate = async (condition) => {
        if (!selectedTooth) return;
        const toothId = `t${selectedTooth}`;
        const previousData = { ...teethData };

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
            if (!response.ok) throw new Error('Failed to save condition');
        } catch (error) {
            console.error('Error updating tooth condition:', error);
            setTeethData(previousData); 
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
                            {arch === 'maxilla' && (
                                <div className="tooth-svg-wrapper">
                                    <ToothGraphic type={getToothType(num)} isUpper={true} condition={teethData[`t${num}`]} />
                                </div>
                            )}
                            <div className="tooth-number">{num}</div>
                            {arch === 'mandible' && (
                                <div className="tooth-svg-wrapper">
                                    <ToothGraphic type={getToothType(num)} isUpper={false} condition={teethData[`t${num}`]} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {position === 'bottom' && <div className="group-bracket-bottom"></div>}
                {position === 'bottom' && <div className="tooth-group-label-bottom">{label}</div>}
            </div>
        );
    };

    const renderMaxilla = () => (
        <div className="arch-row maxilla">
            <div className="arch-label">Maxilla</div>
            {renderToothGroup('UR Molar', [18, 17, 16], 'top', 'maxilla')}
            {renderToothGroup('UR Premolar', [15, 14], 'top', 'maxilla')}
            {renderToothGroup('UR Canine', [13], 'top', 'maxilla')}
            {renderToothGroup('Anterior', [12, 11, 21, 22], 'top', 'maxilla')}
            {renderToothGroup('UL Canine', [23], 'top', 'maxilla')}
            {renderToothGroup('UL Premolar', [24, 25], 'top', 'maxilla')}
            {renderToothGroup('UL Molar', [26, 27, 28], 'top', 'maxilla')}
        </div>
    );

    const renderMandible = () => (
        <div className="arch-row mandible">
            <div className="arch-label">Mandible</div>
            {renderToothGroup('LR Molar', [48, 47, 46], 'bottom', 'mandible')}
            {renderToothGroup('LR Premolar', [45, 44], 'bottom', 'mandible')}
            {renderToothGroup('LR Canine', [43], 'bottom', 'mandible')}
            {renderToothGroup('Lower Anterior', [42, 41, 31, 32], 'bottom', 'mandible')}
            {renderToothGroup('LL Canine', [33], 'bottom', 'mandible')}
            {renderToothGroup('LL Premolar', [34, 35], 'bottom', 'mandible')}
            {renderToothGroup('LL Molar', [36, 37, 38], 'bottom', 'mandible')}
        </div>
    );

    const selectedCondition = teethData[`t${selectedTooth}`] || 'healthy';

    // Helper to determine text direction inside the text box based on template selections
    const isUrduTemplate = selectedNoteOption === 'option2' || selectedNoteOption === 'option3';

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
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#334155' }}>Note Template:</label>
                            <select
                                value={selectedNoteOption}
                                onChange={handleTemplateChange}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #94a3b8', backgroundColor: 'white', color: '#1e293b' }}
                            >
                                <option value="">Select a template...</option>
                                {Object.keys(NOTE_TEMPLATES).map((key) => {
                                    const firstLine = NOTE_TEMPLATES[key].split('\n')[0];
                                    return (
                                        <option key={key} value={key}>
                                            {key.replace('option', 'Option ')}: {firstLine}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        
                        <textarea
                            key={selectedNoteOption}
                            className="notes-textarea"
                            placeholder="Type general dental notes, treatment plans, or patient specific findings here..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            style={{ 
                                direction: isUrduTemplate ? 'rtl' : 'ltr', 
                                textAlign: isUrduTemplate ? 'right' : 'left',
                                fontFamily: isUrduTemplate ? 'Tahoma, Arial, sans-serif' : 'inherit',
                                whiteSpace: 'pre-wrap',
                                minHeight: '250px',
                                width: '100%'
                            }}
                        />

                        {/* Mirrors the text for clean multi-line printing */}
                        <div 
                            className="notes-print-mirror"
                            style={{ 
                                direction: isUrduTemplate ? 'rtl' : 'ltr', 
                                textAlign: isUrduTemplate ? 'right' : 'left',
                                fontFamily: isUrduTemplate ? 'Tahoma, Arial, sans-serif' : 'inherit',
                                whiteSpace: 'pre-wrap'
                            }}
                        >
                            {notes}
                        </div>

                        <button
                            className="notes-save-btn"
                            onClick={handleSaveNotes}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Notes'}
                        </button>
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
                            <button className={`condition-btn ${selectedCondition === 'healthy' ? 'active' : ''}`} onClick={() => handleConditionUpdate('healthy')} disabled={loading}>
                                <div className="color-indicator" style={{ backgroundColor: '#edf3ef', border: '1px solid #cbd5e1' }}></div> Set Healthy
                            </button>
                            <button className={`condition-btn ${selectedCondition === 'decay' ? 'active' : ''}`} onClick={() => handleConditionUpdate('decay')} disabled={loading}>
                                <div className="color-indicator" style={{ backgroundColor: '#ef4444' }}></div> Add Decay
                            </button>
                            <button className={`condition-btn ${selectedCondition === 'filling' ? 'active' : ''}`} onClick={() => handleConditionUpdate('filling')} disabled={loading}>
                                <div className="color-indicator" style={{ backgroundColor: '#3b82f6' }}></div> Add Filling
                            </button>
                            <button className={`condition-btn ${selectedCondition === 'crown' ? 'active' : ''}`} onClick={() => handleConditionUpdate('crown')} disabled={loading}>
                                <div className="color-indicator" style={{ backgroundColor: '#f59e0b' }}></div> Add Crown
                            </button>
                            <button className={`condition-btn ${selectedCondition === 'missing' ? 'active' : ''}`} onClick={() => handleConditionUpdate('missing')} disabled={loading}>
                                <div className="color-indicator" style={{ backgroundColor: '#94a3b8' }}></div> Mark Missing
                            </button>
                            <button className={`condition-btn ${selectedCondition === 'root_canal' ? 'active' : ''}`} onClick={() => handleConditionUpdate('root_canal')} disabled={loading}>
                                <div className="color-indicator" style={{ backgroundColor: '#1e293b' }}></div> Root Canal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {selectedXRay && (
                <div className="xray-modal-overlay" onClick={() => setSelectedXRay(null)}>
                    <div className="xray-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="xray-modal-close" onClick={() => setSelectedXRay(null)}>×</button>
                        <img src={`http://localhost:5000/uploads/images/${selectedXRay.filename}`} alt="X-Ray Enlarged" className="xray-modal-img" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToothChart;