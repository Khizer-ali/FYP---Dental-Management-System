import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/patient-details.css';
import '../styles/billing.css';
import '../index.css';
import ToothChart from '../components/ToothChart';
import { SERVICE_CATALOG } from '../constants/serviceCatalog';
import { MEDICINE_LIST } from '../constants/medicineList';

const API_BASE = 'http://localhost:5000/api';

function PatientDetails() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('documents');
  const [patientData, setPatientData] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(true); // Added loading state

  // Data states
  const [documents, setDocuments] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [familyHistory, setFamilyHistory] = useState([]);
  const [images, setImages] = useState([]);
  const [teethData, setTeethData] = useState({});
  const [chatMessages, setChatMessages] = useState([
    {
      type: 'bot',
      text: "Hello! I'm your medical assistant. I have access to this patient's medical records including documents, vital signs, and family history. How can I help you today?"
    }
  ]);

  // Appointments / SMS
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    appointment_datetime: '',
    alert_datetime: ''
  });
  const [triggerSmsStatus, setTriggerSmsStatus] = useState('');
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);

  // Billing States
  const [bills, setBills] = useState([]);
  const [billServices, setBillServices] = useState([
    { id: 1, name: '', qty: 1, price: 0, total: 0 }
  ]);
  const [billDetails, setBillDetails] = useState({
    staff_name: '',
    invoice_number: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    appointment_date: new Date().toLocaleDateString('en-GB'),
    date: new Date().toLocaleDateString('en-GB'),
    discount_type: '0',
    custom_discount: 0,
    outstanding_amount: 0,
    payment_method: 'ONLINE BANK TRANSFER',
    payment_datetime: new Date().toUTCString().slice(0, 22)
  });

  // Prescription States
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionServices, setPrescriptionServices] = useState([
    { id: 1, name: '', qty: 1, price: 0, total: 0 }
  ]);
  const [prescriptionDetails, setPrescriptionDetails] = useState({
    staff_name: '',
    invoice_number: `RX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    appointment_date: new Date().toLocaleDateString('en-GB'),
    date: new Date().toLocaleDateString('en-GB'),
    discount_type: '0',
    custom_discount: 0,
    outstanding_amount: 0,
    payment_method: 'ONLINE BANK TRANSFER',
    payment_datetime: new Date().toUTCString().slice(0, 22)
  });

  // Form states
  const [documentForm, setDocumentForm] = useState({ file: null, document_type: 'Medical Report' });
  const [imageForm, setImageForm] = useState({ file: null, image_type: 'Medical Image', description: '' });

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      try {
        const [patientRes, docsRes, vitalsRes, familyRes, imagesRes, teethRes, billsRes, appointmentsRes, prescriptionsRes] = await Promise.all([
          fetch(`${API_BASE}/patients/${patientId}`),
          fetch(`${API_BASE}/patients/${patientId}/documents`),
          fetch(`${API_BASE}/patients/${patientId}/vitals`),
          fetch(`${API_BASE}/patients/${patientId}/family-history`),
          fetch(`${API_BASE}/patients/${patientId}/images`),
          fetch(`${API_BASE}/patients/${patientId}/teeth`),
          fetch(`${API_BASE}/patients/${patientId}/bills`),
          fetch(`${API_BASE}/patients/${patientId}/appointments`),
          fetch(`${API_BASE}/patients/${patientId}/prescriptions`)
        ]);

        if (patientRes.ok) setPatientData(await patientRes.json());
        if (docsRes.ok) setDocuments(await docsRes.json());
        if (vitalsRes.ok) setVitals(await vitalsRes.json());
        if (familyRes.ok) setFamilyHistory(await familyRes.json());
        if (imagesRes.ok) setImages(await imagesRes.json());
        if (billsRes.ok) setBills(await billsRes.json());
        if (appointmentsRes.ok) setAppointments(await appointmentsRes.json());
        if (prescriptionsRes.ok) setPrescriptions(await prescriptionsRes.json());

        if (teethRes.ok) {
          const tData = await teethRes.json();
          // The updated backend returns { teeth_data: {...}, teeth_drawing: "base64..." }
          // Handle backwards compatibility if the backend hasn't been reloaded yet
          if (tData.teeth_data !== undefined) {
            setTeethData(tData.teeth_data);
            if (tData.teeth_drawing) {
              // Legacy drawing data support
            }
          } else {
            setTeethData(tData);
          }
        }

      } catch (error) {
        console.error('Error loading initial patient data:', error);
        showMessage('general', 'Failed to load patient data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    initialLoad();
  }, [patientId]);

  useEffect(() => {
    if (activeTab) {
      loadTabData(activeTab);
    }
  }, [activeTab, patientId]);

  useEffect(() => {
    if (activeTab) {
      loadTabData(activeTab);
    }
  }, [activeTab, patientId]);

  const loadTabData = async (tabName) => {
    switch (tabName) {
      case 'documents':
        await loadDocuments();
        break;
      case 'vitals':
        await loadVitals();
        break;
      case 'family':
        await loadFamilyHistory();
        break;
      case 'images':
        await loadImages();
        break;
      case 'dental':
        await loadDental();
        break;
      case 'billing':
        await loadBills();
        break;
      case 'appointments':
        await loadAppointments();
        break;
      case 'prescription':
        await loadPrescriptions();
        break;
    }
  };

  const showMessage = (containerId, text, type) => {
    setMessages({ ...messages, [containerId]: { text, type } });
    setTimeout(() => {
      setMessages({ ...messages, [containerId]: null });
    }, 5000);
  };

  // Documents
  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', documentForm.file);
    formData.append('document_type', documentForm.document_type);

    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/documents`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('documentMessage', 'Document uploaded and parsed successfully!', 'success');
        setDocumentForm({ file: null, document_type: 'Medical Report' });
        e.target.reset();
        loadDocuments();
      } else {
        showMessage('documentMessage', result.error || 'Error uploading document', 'error');
      }
    } catch (error) {
      showMessage('documentMessage', 'Network error: ' + error.message, 'error');
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/documents`);
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  // Vitals
  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));

    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/vitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('vitalsMessage', 'Vitals recorded successfully!', 'success');
        e.target.reset();
        loadVitals();
      } else {
        showMessage('vitalsMessage', result.error || (result.errors ? result.errors.join(', ') : 'Error recording vitals'), 'error');
      }
    } catch (error) {
      showMessage('vitalsMessage', 'Network error: ' + error.message, 'error');
    }
  };

  const loadVitals = async () => {
    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/vitals`);
      const data = await response.json();
      setVitals(data);
    } catch (error) {
      console.error('Error loading vitals:', error);
    }
  };

  // Family History
  const handleFamilySubmit = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));

    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/family-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('familyMessage', 'Family history added successfully!', 'success');
        e.target.reset();
        loadFamilyHistory();
      } else {
        showMessage('familyMessage', result.error || (result.errors ? result.errors.join(', ') : 'Error adding family history'), 'error');
      }
    } catch (error) {
      showMessage('familyMessage', 'Network error: ' + error.message, 'error');
    }
  };

  const loadFamilyHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/family-history`);
      const data = await response.json();
      setFamilyHistory(data);
    } catch (error) {
      console.error('Error loading family history:', error);
    }
  };

  // Images
  const handleImageSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', imageForm.file);
    formData.append('image_type', imageForm.image_type);
    formData.append('description', imageForm.description);

    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/images`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('imageMessage', 'Image uploaded successfully!', 'success');
        setImageForm({ file: null, image_type: 'Medical Image', description: '' });
        e.target.reset();
        loadImages();
      } else {
        showMessage('imageMessage', result.error || 'Error uploading image', 'error');
      }
    } catch (error) {
      showMessage('imageMessage', 'Network error: ' + error.message, 'error');
    }
  };

  const loadImages = async () => {
    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/images`);
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  // Dental (Moved mostly to ToothChart)

  const loadDental = async () => {
    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/teeth`);
      const data = await response.json();

      if (data.teeth_data !== undefined) {
        setTeethData(data.teeth_data);
      } else {
        setTeethData(data || {});
      }
    } catch (error) {
      console.error('Error loading dental data:', error);
      showMessage('dentalMessage', 'Error loading dental data: ' + error.message, 'error');
    }
  };

  // Billing functions
  const loadBills = async () => {
    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/bills`);
      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const calculateBillTotals = () => {
    let subtotal = 0;
    const items = billServices.map(service => {
      const net = (Number(service.qty) || 0) * (Number(service.price) || 0);
      subtotal += net;
      return { ...service, total: net };
    });

    let discountPercent = 0;
    if (billDetails.discount_type === 'custom') {
      discountPercent = Number(billDetails.custom_discount) || 0;
    } else {
      discountPercent = Number(billDetails.discount_type) || 0;
    }

    const discountAmount = (subtotal * discountPercent) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;

    const outstanding = Number(billDetails.outstanding_amount) || 0;
    const grandTotal = subtotalAfterDiscount + outstanding;

    return {
      items,
      subtotal,
      discountPercent,
      discountAmount,
      subtotalAfterDiscount,
      grandTotal
    };
  };

  const handleBillServiceChange = (id, field, value) => {
    setBillServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSelectCatalogService = (id, selectedName) => {
    if (selectedName === '__custom__') {
      setBillServices(prev =>
        prev.map(s => (s.id === id ? { ...s, name: '', isCustom: true } : s))
      );
      return;
    }

    const match = SERVICE_CATALOG.find(s => s.name === selectedName);
    setBillServices(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, name: selectedName, price: match ? match.price : s.price, isCustom: false }
          : s
      )
    );
  };

  const addBillRow = () => {
    setBillServices(prev => [...prev, { id: Date.now(), name: '', qty: 1, price: 0, total: 0 }]);
  };

  const removeBillRow = (id) => {
    if (billServices.length > 1) {
      setBillServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const saveBill = async () => {
    const totals = calculateBillTotals();

    // Filter out empty services
    const validItems = totals.items.filter(item => item.name.trim() !== '');

    if (validItems.length === 0) {
      showMessage('billingMessage', 'Please add at least one service to the bill.', 'error');
      return;
    }

    const payload = {
      patient_id: patientId,
      invoice_number: billDetails.invoice_number,
      staff_name: billDetails.staff_name,
      appointment_date: billDetails.appointment_date,
      date: billDetails.date,
      subtotal: totals.subtotal,
      discount_percent: totals.discountPercent,
      discount_amount: totals.discountAmount,
      outstanding_amount: billDetails.outstanding_amount,
      grand_total: totals.grandTotal,
      payment_method: billDetails.payment_method,
      payment_datetime: billDetails.payment_datetime,
      items: validItems.map(item => ({
        service_name: item.name,
        quantity: item.qty,
        price: item.price,
        total: item.total
      }))
    };

    try {
      const response = await fetch(`${API_BASE}/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('billingMessage', 'Bill saved successfully!', 'success');
        // Reset form
        setBillServices([{ id: Date.now(), name: '', qty: 1, price: 0, total: 0 }]);
        setBillDetails(prev => ({
          ...prev,
          invoice_number: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        }));
        loadBills();
      } else {
        showMessage('billingMessage', result.error || 'Error saving bill', 'error');
      }
    } catch (error) {
      showMessage('billingMessage', 'Network error: ' + error.message, 'error');
    }
  };

  // Prescription functions
  const loadPrescriptions = async () => {
    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/prescriptions`);
      const data = await response.json();
      setPrescriptions(data);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    }
  };

  const calculatePrescriptionTotals = () => {
    let subtotal = 0;
    const items = prescriptionServices.map(service => {
      const net = (Number(service.qty) || 0) * (Number(service.price) || 0);
      subtotal += net;
      return { ...service, total: net };
    });

    let discountPercent = 0;
    if (prescriptionDetails.discount_type === 'custom') {
      discountPercent = Number(prescriptionDetails.custom_discount) || 0;
    } else {
      discountPercent = Number(prescriptionDetails.discount_type) || 0;
    }

    const discountAmount = (subtotal * discountPercent) / 100;
    const subtotalAfterDiscount = subtotal - discountAmount;

    const outstanding = Number(prescriptionDetails.outstanding_amount) || 0;
    const grandTotal = subtotalAfterDiscount + outstanding;

    return {
      items,
      subtotal,
      discountPercent,
      discountAmount,
      subtotalAfterDiscount,
      grandTotal
    };
  };

  const handlePrescriptionServiceChange = (id, field, value) => {
    setPrescriptionServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleSelectPrescriptionMedicine = (id, selectedName) => {
    if (selectedName === '__custom__') {
      setPrescriptionServices(prev =>
        prev.map(s => (s.id === id ? { ...s, name: '', isCustom: true } : s))
      );
      return;
    }

    setPrescriptionServices(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, name: selectedName, isCustom: false }
          : s
      )
    );
  };

  const addPrescriptionRow = () => {
    setPrescriptionServices(prev => [...prev, { id: Date.now(), name: '', qty: 1, price: 0, total: 0 }]);
  };

  const removePrescriptionRow = (id) => {
    if (prescriptionServices.length > 1) {
      setPrescriptionServices(prev => prev.filter(s => s.id !== id));
    }
  };

  const savePrescription = async () => {
    const totals = calculatePrescriptionTotals();

    // Filter out empty medicines
    const validItems = totals.items.filter(item => item.name.trim() !== '');

    if (validItems.length === 0) {
      showMessage('prescriptionMessage', 'Please add at least one medicine to the prescription.', 'error');
      return;
    }

    const payload = {
      patient_id: patientId,
      invoice_number: prescriptionDetails.invoice_number,
      staff_name: prescriptionDetails.staff_name,
      appointment_date: prescriptionDetails.appointment_date,
      date: prescriptionDetails.date,
      subtotal: totals.subtotal,
      discount_percent: totals.discountPercent,
      discount_amount: totals.discountAmount,
      outstanding_amount: prescriptionDetails.outstanding_amount,
      grand_total: totals.grandTotal,
      payment_method: prescriptionDetails.payment_method,
      payment_datetime: prescriptionDetails.payment_datetime,
      items: validItems.map(item => ({
        medicine_name: item.name,
        quantity: item.qty,
        price: item.price,
        total: item.total
      }))
    };

    try {
      const response = await fetch(`${API_BASE}/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        showMessage('prescriptionMessage', 'Prescription saved successfully!', 'success');
        // Reset form
        setPrescriptionServices([{ id: Date.now(), name: '', qty: 1, price: 0, total: 0 }]);
        setPrescriptionDetails(prev => ({
          ...prev,
          invoice_number: `RX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        }));
        loadPrescriptions();
      } else {
        showMessage('prescriptionMessage', result.error || 'Error saving prescription', 'error');
      }
    } catch (error) {
      showMessage('prescriptionMessage', 'Network error: ' + error.message, 'error');
    }
  };

  // ----------------------------------------------------

  // Appointments handlers
  const loadAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/appointments`);
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      showMessage('appointmentsMessage', 'Error loading appointments: ' + error.message, 'error');
    }
  };

  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    if (!newAppointment.appointment_datetime || !newAppointment.alert_datetime) {
      showMessage('appointmentsMessage', 'Please fill out both dates', 'error');
      return;
    }

    try {
      const url = editingAppointmentId
        ? `${API_BASE}/appointments/${editingAppointmentId}`
        : `${API_BASE}/patients/${patientId}/appointments`;

      const response = await fetch(url, {
        method: editingAppointmentId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_datetime: new Date(newAppointment.appointment_datetime).toISOString(),
          alert_datetime: new Date(newAppointment.alert_datetime).toISOString()
        })
      });

      if (response.ok) {
        const appointment = await response.json();
        if (editingAppointmentId) {
          setAppointments(appointments.map(a => a.id === editingAppointmentId ? appointment : a));
          setEditingAppointmentId(null);
          showMessage('appointmentsMessage', 'Appointment updated successfully!', 'success');
        } else {
          setAppointments([...appointments, appointment]);
          showMessage('appointmentsMessage', 'Appointment scheduled successfully!', 'success');
        }
        setNewAppointment({ appointment_datetime: '', alert_datetime: '' });
      } else {
        const err = await response.json();
        showMessage('appointmentsMessage', err.error || 'Failed to schedule appointment', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('appointmentsMessage', 'Error scheduling appointment', 'error');
    }
  };

  const handleEditAppointment = (appt) => {
    // Format ISO string to datetime-local format (YYYY-MM-DDTHH:MM)
    const formatForInput = (isoStr) => {
      const date = new Date(isoStr);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISODate = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
      return localISODate;
    };

    setNewAppointment({
      appointment_datetime: formatForInput(appt.appointment_datetime),
      alert_datetime: formatForInput(appt.alert_datetime)
    });
    setEditingAppointmentId(appt.id);
    // Scroll to form
    const formEl = document.querySelector('.vitals-form');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingAppointmentId(null);
    setNewAppointment({ appointment_datetime: '', alert_datetime: '' });
  };

  const handleDeleteAppointment = async (apptId) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const response = await fetch(`${API_BASE}/appointments/${apptId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showMessage('appointmentsMessage', 'Appointment deleted successfully', 'success');
        loadAppointments();
      } else {
        const err = await response.json();
        showMessage('appointmentsMessage', err.error || 'Failed to delete appointment', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showMessage('appointmentsMessage', 'Error deleting appointment', 'error');
    }
  };

  const handleTriggerSmsWorker = async () => {
    setTriggerSmsStatus('Checking for pending SMS...');
    try {
      const response = await fetch(`${API_BASE}/cron/send-sms`, { method: 'POST' });
      const data = await response.json();
      setTriggerSmsStatus(`SMS Check Complete. Processed ${data.alerts_processed} alerts.`);

      // Refresh appointments to get updated SMS status
      const appointmentsRes = await fetch(`${API_BASE}/patients/${patientId}/appointments`);
      if (appointmentsRes.ok) {
        setAppointments(await appointmentsRes.json());
      }
    } catch (error) {
      console.error('Error triggering SMS', error);
      setTriggerSmsStatus('Failed to trigger SMS worker');
    }

    setTimeout(() => setTriggerSmsStatus(''), 5000);
  };


  useEffect(() => {
    if (activeTab === 'dental') {
      loadDental();
    }
    if (activeTab === 'appointments') {
      loadAppointments();
    }

    // Auto-scroll chat messages
    if (activeTab === 'chatbot') {
      const chatMessagesEl = document.getElementById('chatMessages');
      if (chatMessagesEl) {
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
      }
    }
  }, [activeTab]);

  // Chatbot
  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  };

  const sendChatMessage = async () => {
    const input = document.getElementById('chatInput');
    const question = input.value.trim();

    if (!question) return;

    // Add user message
    const newMessages = [...chatMessages, { type: 'user', text: question }];
    setChatMessages(newMessages);
    input.value = '';

    // Scroll to bottom
    setTimeout(() => {
      const chatMessagesEl = document.getElementById('chatMessages');
      if (chatMessagesEl) {
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
      }
    }, 100);

    try {
      const response = await fetch(`${API_BASE}/patients/${patientId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });

      const result = await response.json();
      setChatMessages(prev => {
        const updated = [...prev, { type: 'bot', text: result.response }];
        setTimeout(() => {
          const chatMessagesEl = document.getElementById('chatMessages');
          if (chatMessagesEl) {
            chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
          }
        }, 100);
        return updated;
      });
    } catch {
      setChatMessages(prev => {
        const updated = [...prev, { type: 'bot', text: 'Sorry, I encountered an error. Please try again.' }];
        setTimeout(() => {
          const chatMessagesEl = document.getElementById('chatMessages');
          if (chatMessagesEl) {
            chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
          }
        }, 100);
        return updated;
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading patient details...</div>;
  }

  if (!patientData) {
    return <div>Error: Patient data not found.</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1 id="patientName">{patientData.name} ({patientData.reference_number})</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setActiveTab('chatbot')}>💬 Open Chatbot</button>
          <button className="btn" onClick={() => navigate('/')}>← Back to Dashboard</button>
        </div>
      </div>

      <div className="content">
        <div className="tabs">
          <button className={`tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
            📄 Documents
          </button>
          <button className={`tab ${activeTab === 'vitals' ? 'active' : ''}`} onClick={() => setActiveTab('vitals')}>
            📊 Vitals
          </button>
          <button className={`tab ${activeTab === 'family' ? 'active' : ''}`} onClick={() => setActiveTab('family')}>
            👨‍👩‍👧‍👦 Family History
          </button>
          <button className={`tab ${activeTab === 'images' ? 'active' : ''}`} onClick={() => setActiveTab('images')}>
            🖼️ RI
          </button>
          <button className={`tab ${activeTab === 'dental' ? 'active' : ''}`} onClick={() => setActiveTab('dental')}>
            🦷 Tooth Chart
          </button>
          <button className={`tab ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>
            💳 Billing
          </button>
          <button className={`tab ${activeTab === 'prescription' ? 'active' : ''}`} onClick={() => setActiveTab('prescription')}>
            💊 Prescription
          </button>
          <button className={`tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
            📅 Appointments
          </button>
          <button className={`tab ${activeTab === 'chatbot' ? 'active' : ''}`} onClick={() => setActiveTab('chatbot')}>
            💬 Chatbot
          </button>
        </div>

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div id="documents" className="tab-content active">
            <div className="form-section">
              <h3>Upload Medical Document</h3>
              <form id="documentForm" onSubmit={handleDocumentSubmit} encType="multipart/form-data">
                <div className="form-group">
                  <label htmlFor="documentFile">Select Document (PDF, TXT, Images)</label>
                  <input
                    type="file"
                    id="documentFile"
                    name="file"
                    accept=".pdf,.txt,.png,.jpg,.jpeg"
                    required
                    onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files[0] })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="documentType">Document Type</label>
                  <input
                    type="text"
                    id="documentType"
                    name="document_type"
                    placeholder="e.g., Lab Report, X-Ray Report"
                    value={documentForm.document_type}
                    onChange={(e) => setDocumentForm({ ...documentForm, document_type: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary">Upload & Parse Document</button>
              </form>
              {messages.documentMessage && (
                <div id="documentMessage" className={`message ${messages.documentMessage.type}`}>
                  {messages.documentMessage.text}
                </div>
              )}
            </div>
            <div className="data-list" id="documentsList">
              {documents.length === 0 ? (
                <p>No documents uploaded yet.</p>
              ) : (
                documents.map(doc => (
                  <div key={doc.id} className="data-item">
                    <h4>{doc.filename}</h4>
                    <p><strong>Type:</strong> {doc.document_type || 'N/A'}</p>
                    <p><strong>Uploaded:</strong> {new Date(doc.uploaded_at).toLocaleString()}</p>
                    {doc.parsed_text && (
                      <p><strong>Extracted Text:</strong> {doc.parsed_text.substring(0, 200)}...</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Vitals Tab */}
        {activeTab === 'vitals' && (
          <div id="vitals" className="tab-content active">
            <div className="form-section">
              <h3>Record Vital Signs</h3>
              <form id="vitalsForm" onSubmit={handleVitalsSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="temperature">Temperature (°C)</label>
                    <input type="number" id="temperature" name="temperature" step="0.1" placeholder="36.5" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="weight">Weight (kg)</label>
                    <input type="number" id="weight" name="weight" step="0.1" placeholder="70.0" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="height">Height (cm)</label>
                    <input type="number" id="height" name="height" step="0.1" placeholder="175.0" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="bpSystolic">Blood Pressure - Systolic (mmHg)</label>
                    <input type="number" id="bpSystolic" name="blood_pressure_systolic" placeholder="120" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="bpDiastolic">Blood Pressure - Diastolic (mmHg)</label>
                    <input type="number" id="bpDiastolic" name="blood_pressure_diastolic" placeholder="80" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="heartRate">Heart Rate (bpm)</label>
                    <input type="number" id="heartRate" name="heart_rate" placeholder="72" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="respiratoryRate">Respiratory Rate (per min)</label>
                    <input type="number" id="respiratoryRate" name="respiratory_rate" placeholder="16" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="oxygenSaturation">Oxygen Saturation (%)</label>
                    <input type="number" id="oxygenSaturation" name="oxygen_saturation" step="0.1" placeholder="98.0" />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Record Vitals</button>
              </form>
              {messages.vitalsMessage && (
                <div id="vitalsMessage" className={`message ${messages.vitalsMessage.type}`}>
                  {messages.vitalsMessage.text}
                </div>
              )}
            </div>
            <div className="data-list" id="vitalsList">
              {vitals.length === 0 ? (
                <p>No vitals recorded yet.</p>
              ) : (
                vitals.map(vital => (
                  <div key={vital.id} className="data-item">
                    <h4>Recorded: {new Date(vital.recorded_at).toLocaleString()}</h4>
                    {vital.temperature && <p><strong>Temperature:</strong> {vital.temperature}°C</p>}
                    {vital.weight && <p><strong>Weight:</strong> {vital.weight} kg</p>}
                    {vital.height && <p><strong>Height:</strong> {vital.height} cm</p>}
                    {vital.blood_pressure_systolic && (
                      <p><strong>Blood Pressure:</strong> {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic || ''} mmHg</p>
                    )}
                    {vital.heart_rate && <p><strong>Heart Rate:</strong> {vital.heart_rate} bpm</p>}
                    {vital.respiratory_rate && <p><strong>Respiratory Rate:</strong> {vital.respiratory_rate} per min</p>}
                    {vital.oxygen_saturation && <p><strong>Oxygen Saturation:</strong> {vital.oxygen_saturation}%</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Family History Tab */}
        {activeTab === 'family' && (
          <div id="family" className="tab-content active">
            <div className="form-section">
              <h3>Add Family History</h3>
              <form id="familyHistoryForm" onSubmit={handleFamilySubmit}>
                <div className="form-group">
                  <label htmlFor="condition">Medical Condition *</label>
                  <input type="text" id="condition" name="condition" required placeholder="e.g., Diabetes, Hypertension" />
                </div>
                <div className="form-group">
                  <label htmlFor="relation">Relation</label>
                  <select id="relation" name="relation">
                    <option value="">Select relation</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Maternal Grandmother">Maternal Grandmother</option>
                    <option value="Maternal Grandfather">Maternal Grandfather</option>
                    <option value="Paternal Grandmother">Paternal Grandmother</option>
                    <option value="Paternal Grandfather">Paternal Grandfather</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Cousin">Cousin</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="ageOfOnset">Age of Onset (years)</label>
                  <input type="number" id="ageOfOnset" name="age_of_onset" placeholder="e.g., 45" />
                </div>
                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea id="notes" name="notes" rows="3" placeholder="Any additional information..."></textarea>
                </div>
                <button type="submit" className="btn-primary">Add Family History</button>
              </form>
              {messages.familyMessage && (
                <div id="familyMessage" className={`message ${messages.familyMessage.type}`}>
                  {messages.familyMessage.text}
                </div>
              )}
            </div>
            <div className="data-list" id="familyList">
              {familyHistory.length === 0 ? (
                <p>No family history recorded yet.</p>
              ) : (
                familyHistory.map(fh => (
                  <div key={fh.id} className="data-item">
                    <h4>{fh.condition}</h4>
                    {fh.relation && <p><strong>Relation:</strong> {fh.relation}</p>}
                    {fh.age_of_onset && <p><strong>Age of Onset:</strong> {fh.age_of_onset} years</p>}
                    {fh.notes && <p><strong>Notes:</strong> {fh.notes}</p>}
                    <p><strong>Recorded:</strong> {new Date(fh.recorded_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div id="images" className="tab-content active">
            <div className="form-section">
              <h3>Upload Medical Image</h3>
              <form id="imageForm" onSubmit={handleImageSubmit} encType="multipart/form-data">
                <div className="form-group">
                  <label htmlFor="imageFile">Select Image (PNG, JPG, JPEG, DICOM)</label>
                  <input
                    type="file"
                    id="imageFile"
                    name="file"
                    accept=".png,.jpg,.jpeg,.dicom,.dcm"
                    required
                    onChange={(e) => setImageForm({ ...imageForm, file: e.target.files[0] })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imageType">Image Type</label>
                  <input
                    type="text"
                    id="imageType"
                    name="image_type"
                    placeholder="e.g., X-Ray, CT Scan, MRI"
                    value={imageForm.image_type}
                    onChange={(e) => setImageForm({ ...imageForm, image_type: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imageDescription">Description</label>
                  <textarea
                    id="imageDescription"
                    name="description"
                    rows="3"
                    placeholder="Describe the image..."
                    value={imageForm.description}
                    onChange={(e) => setImageForm({ ...imageForm, description: e.target.value })}
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary">Upload Image</button>
              </form>
              {messages.imageMessage && (
                <div id="imageMessage" className={`message ${messages.imageMessage.type}`}>
                  {messages.imageMessage.text}
                </div>
              )}
            </div>
            <div className="data-list" id="imagesList">
              {images.length === 0 ? (
                <p>No images uploaded yet.</p>
              ) : (
                images.map(img => (
                  <div key={img.id} className="data-item">
                    <h4>{img.filename}</h4>
                    <p><strong>Type:</strong> {img.image_type || 'N/A'}</p>
                    {img.description && <p><strong>Description:</strong> {img.description}</p>}
                    <p><strong>Uploaded:</strong> {new Date(img.uploaded_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Dental Tab */}
        {activeTab === 'dental' && (
          <div id="dental" className="tab-content active">
            <ToothChart
              patientId={patientId}
              initialTeethData={teethData}
            />
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div id="billing" className="tab-content active">

            {messages.billingMessage && (
              <div id="billingMessage" className={`message ${messages.billingMessage.type}`} style={{ marginBottom: '20px' }}>
                {messages.billingMessage.text}
              </div>
            )}

            <div className="invoice-container">
              <div className="invoice-header">
                <div className="invoice-logo-area">
                  {/* You can replace this src with a real logo path if available */}
                  <img src="https://via.placeholder.com/250x60?text=Venus+Aesthetics" alt="Venus Aesthetics" />
                </div>
                <div className="invoice-header-text">
                  <h1>Invoice</h1>
                  <input type="text" className="invoice-subtitle" defaultValue="Venus Aesthetics Islamabad F7" />
                </div>
              </div>

              <div className="invoice-info-grid">
                <div className="invoice-info-box">
                  <h4>From</h4>
                  <p>13-K Moaiz Center, F-7 Markaz, Islamabad</p>
                  <p>www.venusaesthetics.pk</p>
                  <p>03111117546</p>
                </div>

                <div className="invoice-info-box">
                  <div className="invoice-input-wrap">
                    <h4>Issued To</h4>
                    <input type="text" value={patientData.name} readOnly placeholder="Customer Name" />
                  </div>
                  <div className="invoice-input-wrap">
                    <h4>Issued By</h4>
                    <input
                      type="text"
                      value={billDetails.staff_name}
                      onChange={(e) => setBillDetails({ ...billDetails, staff_name: e.target.value })}
                      placeholder="Staff Name"
                    />
                  </div>
                </div>

                <div className="invoice-info-box">
                  <div className="invoice-input-wrap">
                    <h4>Invoice</h4>
                    <input
                      type="text"
                      value={billDetails.invoice_number}
                      onChange={(e) => setBillDetails({ ...billDetails, invoice_number: e.target.value })}
                      placeholder="Invoice #"
                    />
                  </div>
                  <div className="invoice-input-wrap">
                    <h4>Appointment date</h4>
                    <input
                      type="text"
                      value={billDetails.appointment_date}
                      onChange={(e) => setBillDetails({ ...billDetails, appointment_date: e.target.value })}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <div className="invoice-input-wrap">
                    <h4>Date</h4>
                    <input
                      type="text"
                      value={billDetails.date}
                      onChange={(e) => setBillDetails({ ...billDetails, date: e.target.value })}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th style={{ width: '45%', display: 'flex', alignItems: 'center' }}>
                      Item Name
                      <button className="invoice-add-service-btn" onClick={addBillRow} title="Add Service">+</button>
                    </th>
                    <th style={{ width: '10%' }}>Qty</th>
                    <th style={{ width: '15%' }}>Price</th>
                    <th style={{ width: '15%' }}>Net</th>
                    <th style={{ width: '10%' }}>Total</th>
                    <th style={{ width: '5%' }} className="invoice-controls-col"></th>
                  </tr>
                </thead>
                <tbody>
                  {calculateBillTotals().items.map((service) => (
                    <tr key={service.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: '#666', marginRight: '8px', fontSize: '11px' }}>◆</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                            <select
                              value={
                                service.isCustom
                                  ? '__custom__'
                                  : (SERVICE_CATALOG.some(s => s.name === service.name) ? service.name : '')
                              }
                              onChange={(e) => handleSelectCatalogService(service.id, e.target.value)}
                              style={{ width: '100%' }}
                            >
                              <option value="">Select procedure</option>
                              {SERVICE_CATALOG.map((s) => (
                                <option key={s.name} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                              <option value="__custom__">Custom…</option>
                            </select>

                            {service.isCustom && (
                              <input
                                type="text"
                                value={service.name}
                                onChange={(e) => handleBillServiceChange(service.id, 'name', e.target.value)}
                                placeholder="Custom procedure"
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="invoice-qty"
                          value={service.qty}
                          onChange={(e) => handleBillServiceChange(service.id, 'qty', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="invoice-price"
                          value={service.price}
                          step="0.01"
                          onChange={(e) => handleBillServiceChange(service.id, 'price', e.target.value)}
                        />
                      </td>
                      <td><span>{service.total.toFixed(2)}</span></td>
                      <td><span>{service.total.toFixed(2)}</span></td>
                      <td className="invoice-controls-col">
                        {billServices.length > 1 && (
                          <button className="invoice-remove-btn" onClick={() => removeBillRow(service.id)}>✕</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-discount-container">
                <label htmlFor="discountSelect" style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a5f7a' }}>Discount:</label>
                <select
                  id="discountSelect"
                  value={billDetails.discount_type}
                  onChange={(e) => setBillDetails({ ...billDetails, discount_type: e.target.value })}
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                  <option value="15">15%</option>
                  <option value="20">20%</option>
                  <option value="25">25%</option>
                  <option value="50">50%</option>
                  <option value="custom">Custom</option>
                </select>
                {billDetails.discount_type === 'custom' && (
                  <input
                    type="number"
                    value={billDetails.custom_discount}
                    onChange={(e) => setBillDetails({ ...billDetails, custom_discount: e.target.value })}
                    style={{ width: '60px', marginLeft: '10px', border: '1px solid #ddd', padding: '5px', background: 'white' }}
                    placeholder="%"
                  />
                )}
              </div>

              {(() => {
                const totals = calculateBillTotals();
                return (
                  <>
                    <div className="invoice-summary-section">
                      <div className="invoice-summary-col">
                        <span className="invoice-summary-title">Sub - Total amount discount</span>
                        <span className="invoice-summary-value">PKR<span style={{ marginLeft: '2px' }}>{totals.subtotalAfterDiscount.toFixed(2)}</span></span>
                      </div>
                      <div className="invoice-summary-col">
                        <span className="invoice-summary-title">Outstanding amount</span>
                        <span className="invoice-summary-value">PKR
                          <input
                            type="number"
                            value={billDetails.outstanding_amount}
                            onChange={(e) => setBillDetails({ ...billDetails, outstanding_amount: e.target.value })}
                            step="0.01"
                            style={{ width: '80px', marginLeft: '2px' }}
                          />
                        </span>
                      </div>
                      <div className="invoice-summary-col invoice-grand-col">
                        <span className="invoice-summary-title">Grand total</span>
                        <span className="invoice-summary-value">PKR<span style={{ marginLeft: '2px' }}>{totals.grandTotal.toFixed(2)}</span></span>
                      </div>
                    </div>

                    <div className="invoice-payment-section">
                      <div className="invoice-payment-title">Payment Details</div>
                      <div className="invoice-payment-info">
                        <input
                          type="text"
                          value={billDetails.payment_datetime}
                          onChange={(e) => setBillDetails({ ...billDetails, payment_datetime: e.target.value })}
                          style={{ width: '220px' }}
                        />
                        <span className="invoice-separator">|</span>
                        <select
                          value={billDetails.payment_method}
                          onChange={(e) => setBillDetails({ ...billDetails, payment_method: e.target.value })}
                          style={{ width: '200px', cursor: 'pointer', outline: 'none', border: 'none', appearance: 'none', background: 'transparent', color: 'black' }}
                        >
                          <option value="CASH" style={{ color: 'black' }}>CASH</option>
                          <option value="ONLINE BANK TRANSFER" style={{ color: 'black' }}>ONLINE BANK TRANSFER</option>
                          <option value="CARD PAYMENT" style={{ color: 'black' }}>CARD PAYMENT</option>
                        </select>
                        <span className="invoice-separator">|</span>
                        <span style={{ marginLeft: '5px' }}>Amount paid PKR<span style={{ marginLeft: '2px' }}>{totals.grandTotal.toFixed(2)}</span></span>
                      </div>
                    </div>
                  </>
                );
              })()}

              <div className="invoice-footer">
                <div className="invoice-footer-line1">Thank you for visiting us today!</div>
                <div className="invoice-footer-line2">Prices are inclusive of Sales Tax. All payments made including advance payments are non-refundable.</div>
              </div>

              <div className="invoice-controls">
                <button className="invoice-btn invoice-save-btn" onClick={saveBill}>💾 Save</button>
                <button className="invoice-btn print-btn" onClick={() => window.print()}>🖨️ Print</button>
              </div>
            </div>

            <div className="data-list" style={{ marginTop: '40px' }}>
              <h3>Previous Bills</h3>
              {bills.length === 0 ? (
                <p>No bills saved yet.</p>
              ) : (
                bills.map(bill => (
                  <div key={bill.id} className="data-item">
                    <h4>{bill.invoice_number}</h4>
                    <p><strong>Date:</strong> {bill.date} | <strong>Staff:</strong> {bill.staff_name || 'N/A'}</p>
                    <p><strong>Grand Total:</strong> PKR {bill.grand_total.toFixed(2)}
                      {bill.discount_amount > 0 && (
                        <span style={{ color: '#f87171', marginLeft: '10px', fontSize: '0.9em' }}>
                          (Discount: PKR {bill.discount_amount.toFixed(2)} - {bill.discount_percent}%)
                        </span>
                      )}
                    </p>
                    <p><strong>Items:</strong> {bill.items.length}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* Prescription Tab */}
        {activeTab === 'prescription' && (
          <div id="prescription" className="tab-content active">

            {messages.prescriptionMessage && (
              <div id="prescriptionMessage" className={`message ${messages.prescriptionMessage.type}`} style={{ marginBottom: '20px' }}>
                {messages.prescriptionMessage.text}
              </div>
            )}

            <div className="invoice-container">
              <div className="invoice-header">
                <div className="invoice-logo-area">
                  <img src="https://via.placeholder.com/250x60?text=Venus+Aesthetics" alt="Venus Aesthetics" />
                </div>
                <div className="invoice-header-text">
                  <h1>Prescription Invoice</h1>
                  <input type="text" className="invoice-subtitle" defaultValue="Venus Aesthetics Islamabad F7" />
                </div>
              </div>

              <div className="invoice-info-grid">
                <div className="invoice-info-box">
                  <h4>From</h4>
                  <p>13-K Moaiz Center, F-7 Markaz, Islamabad</p>
                  <p>www.venusaesthetics.pk</p>
                  <p>03111117546</p>
                </div>

                <div className="invoice-info-box">
                  <div className="invoice-input-wrap">
                    <h4>Issued To</h4>
                    <input type="text" value={patientData.name} readOnly placeholder="Customer Name" />
                  </div>
                  <div className="invoice-input-wrap">
                    <h4>Issued By</h4>
                    <input
                      type="text"
                      value={prescriptionDetails.staff_name}
                      onChange={(e) => setPrescriptionDetails({ ...prescriptionDetails, staff_name: e.target.value })}
                      placeholder="Staff Name"
                    />
                  </div>
                </div>

                <div className="invoice-info-box">
                  <div className="invoice-input-wrap">
                    <h4>Invoice</h4>
                    <input
                      type="text"
                      value={prescriptionDetails.invoice_number}
                      onChange={(e) => setPrescriptionDetails({ ...prescriptionDetails, invoice_number: e.target.value })}
                      placeholder="Invoice #"
                    />
                  </div>
                  <div className="invoice-input-wrap">
                    <h4>Appointment date</h4>
                    <input
                      type="text"
                      value={prescriptionDetails.appointment_date}
                      onChange={(e) => setPrescriptionDetails({ ...prescriptionDetails, appointment_date: e.target.value })}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <div className="invoice-input-wrap">
                    <h4>Date</h4>
                    <input
                      type="text"
                      value={prescriptionDetails.date}
                      onChange={(e) => setPrescriptionDetails({ ...prescriptionDetails, date: e.target.value })}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>
              </div>

              <table className="invoice-table">
                <thead>
                  <tr>
                    <th style={{ width: '45%', display: 'flex', alignItems: 'center' }}>
                      Medicine Name
                      <button className="invoice-add-service-btn" onClick={addPrescriptionRow} title="Add Medicine">+</button>
                    </th>
                    <th style={{ width: '10%' }}>Qty</th>
                    <th style={{ width: '15%' }}>Price</th>
                    <th style={{ width: '15%' }}>Net</th>
                    <th style={{ width: '10%' }}>Total</th>
                    <th style={{ width: '5%' }} className="invoice-controls-col"></th>
                  </tr>
                </thead>
                <tbody>
                  {calculatePrescriptionTotals().items.map((service) => (
                    <tr key={service.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ color: '#666', marginRight: '8px', fontSize: '11px' }}>◆</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                            <select
                              value={
                                service.isCustom
                                  ? '__custom__'
                                  : (MEDICINE_LIST.includes(service.name) ? service.name : '')
                              }
                              onChange={(e) => handleSelectPrescriptionMedicine(service.id, e.target.value)}
                              style={{ width: '100%' }}
                            >
                              <option value="">Select medicine</option>
                              {MEDICINE_LIST.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                              <option value="__custom__">Custom…</option>
                            </select>

                            {service.isCustom && (
                              <input
                                type="text"
                                value={service.name}
                                onChange={(e) => handlePrescriptionServiceChange(service.id, 'name', e.target.value)}
                                placeholder="Custom medicine name"
                              />
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <input
                          type="number"
                          className="invoice-qty"
                          value={service.qty}
                          onChange={(e) => handlePrescriptionServiceChange(service.id, 'qty', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="invoice-price"
                          value={service.price}
                          step="0.01"
                          onChange={(e) => handlePrescriptionServiceChange(service.id, 'price', e.target.value)}
                        />
                      </td>
                      <td><span>{service.total.toFixed(2)}</span></td>
                      <td><span>{service.total.toFixed(2)}</span></td>
                      <td className="invoice-controls-col">
                        {prescriptionServices.length > 1 && (
                          <button className="invoice-remove-btn" onClick={() => removePrescriptionRow(service.id)}>✕</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="invoice-discount-container">
                <label htmlFor="pDiscountSelect" style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a5f7a' }}>Discount:</label>
                <select
                  id="pDiscountSelect"
                  value={prescriptionDetails.discount_type}
                  onChange={(e) => setPrescriptionDetails({ ...prescriptionDetails, discount_type: e.target.value })}
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                  <option value="15">15%</option>
                  <option value="20">20%</option>
                  <option value="25">25%</option>
                  <option value="50">50%</option>
                  <option value="custom">Custom</option>
                </select>
                {prescriptionDetails.discount_type === 'custom' && (
                  <input
                    type="number"
                    value={prescriptionDetails.custom_discount}
                    onChange={(e) => setPrescriptionDetails({ ...prescriptionDetails, custom_discount: e.target.value })}
                    style={{ width: '60px', marginLeft: '10px', border: '1px solid #ddd', padding: '5px', background: 'white' }}
                    placeholder="%"
                  />
                )}
              </div>

              {(() => {
                const totals = calculatePrescriptionTotals();
                return (
                  <>
                    <div className="invoice-summary-section">
                      <div className="invoice-summary-col">
                        <span className="invoice-summary-title">Sub - Total amount discount</span>
                        <span className="invoice-summary-value">PKR<span style={{ marginLeft: '2px' }}>{totals.subtotalAfterDiscount.toFixed(2)}</span></span>
                      </div>
                      <div className="invoice-summary-col">
                        <span className="invoice-summary-title">Outstanding amount</span>
                        <span className="invoice-summary-value">PKR
                          <input
                            type="number"
                            value={prescriptionDetails.outstanding_amount}
                            onChange={(e) => setPrescriptionDetails({ ...prescriptionDetails, outstanding_amount: e.target.value })}
                            step="0.01"
                            style={{ width: '80px', marginLeft: '2px' }}
                          />
                        </span>
                      </div>
                      <div className="invoice-summary-col invoice-grand-col">
                        <span className="invoice-summary-title">Grand total</span>
                        <span className="invoice-summary-value">PKR<span style={{ marginLeft: '2px' }}>{totals.grandTotal.toFixed(2)}</span></span>
                      </div>
                    </div>

                    <div className="invoice-payment-section">
                      <div className="invoice-payment-title">Payment Details</div>
                      <div className="invoice-payment-info">
                        <input
                          type="text"
                          value={prescriptionDetails.payment_datetime}
                          onChange={(e) => setPrescriptionDetails({ ...prescriptionDetails, payment_datetime: e.target.value })}
                          style={{ width: '220px' }}
                        />
                        <span className="invoice-separator">|</span>
                        <select
                          value={prescriptionDetails.payment_method}
                          onChange={(e) => setPrescriptionDetails({ ...prescriptionDetails, payment_method: e.target.value })}
                          style={{ width: '200px', cursor: 'pointer', outline: 'none', border: 'none', appearance: 'none', background: 'transparent', color: 'black' }}
                        >
                          <option value="CASH" style={{ color: 'black' }}>CASH</option>
                          <option value="ONLINE BANK TRANSFER" style={{ color: 'black' }}>ONLINE BANK TRANSFER</option>
                          <option value="CARD PAYMENT" style={{ color: 'black' }}>CARD PAYMENT</option>
                        </select>
                        <span className="invoice-separator">|</span>
                        <span style={{ marginLeft: '5px' }}>Amount paid PKR<span style={{ marginLeft: '2px' }}>{totals.grandTotal.toFixed(2)}</span></span>
                      </div>
                    </div>
                  </>
                );
              })()}

              <div className="invoice-footer">
                <div className="invoice-footer-line1">Thank you for visiting us today!</div>
                <div className="invoice-footer-line2">Prices are inclusive of Sales Tax. All payments made including advance payments are non-refundable.</div>
              </div>

              <div className="invoice-controls">
                <button className="invoice-btn invoice-save-btn" onClick={savePrescription}>💾 Save</button>
                <button className="invoice-btn print-btn" onClick={() => window.print()}>🖨️ Print</button>
              </div>
            </div>

            <div className="data-list" style={{ marginTop: '40px' }}>
              <h3>Previous Prescriptions</h3>
              {prescriptions.length === 0 ? (
                <p>No prescriptions saved yet.</p>
              ) : (
                prescriptions.map(p => (
                  <div key={p.id} className="data-item">
                    <h4>{p.invoice_number}</h4>
                    <p><strong>Date:</strong> {p.date} | <strong>Staff:</strong> {p.staff_name || 'N/A'}</p>
                    <p><strong>Grand Total:</strong> PKR {p.grand_total.toFixed(2)}</p>
                    <p><strong>Medicines:</strong> {p.items.length}</p>
                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* Chatbot Tab */}
        {activeTab === 'chatbot' && (
          <div id="chatbot" className="tab-content active">
            <div className="chat-container">
              <div className="chat-messages" id="chatMessages">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.type}`}>
                    <strong>{msg.type === 'user' ? 'You:' : 'Medical Assistant:'}</strong> {msg.text}
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  id="chatInput"
                  placeholder="Ask a question about the patient..."
                  onKeyPress={handleChatKeyPress}
                />
                <button className="btn-primary" onClick={sendChatMessage}>Send</button>
              </div>
            </div>
          </div>
        )}

        {/* ================= APPOINTMENTS TAB ================= */}
        {activeTab === 'appointments' && (
          <div id="appointments" className="tab-content active">
            <h2>Appointments & SMS Alerts</h2>

            <div className="form-section" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p>Schedule an appointment and set up when the automated SMS alert should trigger.</p>
                <button onClick={handleTriggerSmsWorker} className="btn btn-secondary">
                  Trigger SMS Worker Manually
                </button>
              </div>
              {triggerSmsStatus && <p style={{ color: 'green', marginTop: '10px' }}>{triggerSmsStatus}</p>}
              {messages.appointmentsMessage && (
                <div id="appointmentsMessage" className={`message ${messages.appointmentsMessage.type}`}>
                  {messages.appointmentsMessage.text}
                </div>
              )}
            </div>

            <form onSubmit={handleScheduleAppointment} className="vitals-form" style={{ marginBottom: '30px' }}>
              <div className="form-group">
                <label>Appointment Date & Time</label>
                <input
                  type="datetime-local"
                  value={newAppointment.appointment_datetime}
                  onChange={(e) => setNewAppointment({ ...newAppointment, appointment_datetime: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>When should the SMS Alert send?</label>
                <input
                  type="datetime-local"
                  value={newAppointment.alert_datetime}
                  onChange={(e) => setNewAppointment({ ...newAppointment, alert_datetime: e.target.value })}
                  required
                />
                <small style={{ display: 'block', color: '#666', marginTop: '5px' }}>The system checks this time against the current time.</small>
              </div>

              <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary">
                  {editingAppointmentId ? 'Update Appointment' : 'Schedule Appointment'}
                </button>
                {editingAppointmentId && (
                  <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="data-list">
              <h3>Upcoming & Past Appointments</h3>
              {appointments.length === 0 ? (
                <p>No appointments scheduled.</p>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {appointments.map(appt => (
                    <div key={appt.id} className="data-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px' }}>
                      <div>
                        <strong>Date:</strong> {new Date(appt.appointment_datetime).toLocaleString()}
                        <br />
                        <span style={{ fontSize: '0.9em', color: '#555' }}>
                          <strong>Alert set for:</strong> {new Date(appt.alert_datetime).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge">Status: {appt.status}</span>
                        <br />
                        <span className={`badge ${appt.sms_status === 'Sent' ? 'success' : appt.sms_status === 'Pending' ? 'warning' : 'error'}`} style={{ marginTop: '5px', display: 'inline-block' }}>
                          SMS: {appt.sms_status}
                        </span>
                        <div style={{ marginTop: '10px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                            onClick={() => handleEditAppointment(appt)}
                          >
                            ✎ Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ padding: '4px 8px', fontSize: '12px', marginLeft: '5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            onClick={() => handleDeleteAppointment(appt.id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
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

export default PatientDetails;
