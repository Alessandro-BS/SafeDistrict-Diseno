import { useState } from 'react';
import { MapPin, TriangleAlert, Flame, Car, Heart, ShieldCheck, Phone, Clock, ArrowLeft } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

const emergencyTypes = [
  { id: 'robo', label: 'Robo', icon: TriangleAlert, color: '#ef4444', bg: '#fef2f2' },
  { id: 'incendio', label: 'Incendio', icon: Flame, color: '#ef4444', bg: '#fef2f2' },
  { id: 'accidente', label: 'Accidente', icon: Car, color: '#f97316', bg: '#fff7ed' },
  { id: 'emergencia_medica', label: 'Emerg. Médica', icon: Heart, color: '#f97316', bg: '#fff7ed' },
];

const locations = [
  'Comas, Lima - Vía Pública',
  'Av. Túpac Amaru, Comas',
  'Av. Universitaria, Comas',
  'Jr. Los Olivos, Comas',
  'Av. San Felipe, Comas',
  'Av. Revolución, Comas',
];

function getRandomLocation() {
  return locations[Math.floor(Math.random() * locations.length)];
}

export default function MobileApp({ addIncident, setLastClassification }) {
  const [screen, setScreen] = useState('home');
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleEmergencyClick = async (type) => {
    setSelectedEmergency(type);
    setScreen('status');
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API_BASE}/incidents/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Emergencia reportada desde app móvil: ${type.label}`,
          location: getRandomLocation(),
        }),
      });

      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);

      const data = await res.json();

      addIncident({ ...data, timeElapsed: '0 min' });
      setLastClassification({
        ...data.classification,
        description: data.description,
        incidentId: data.id,
      });

      setSelectedEmergency({ ...type, result: data });
      setSubmitting(false);
    } catch (err) {
      console.error('Error al reportar emergencia:', err);
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  const handleBigEmergency = async () => {
    const type = { id: 'emergencia_medica', label: 'Emergencia General' };
    setSelectedEmergency(type);
    setScreen('status');
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API_BASE}/incidents/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Emergencia general - Botón de pánico desde app móvil',
          location: getRandomLocation(),
        }),
      });

      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);

      const data = await res.json();

      addIncident({ ...data, timeElapsed: '0 min' });
      setLastClassification({
        ...data.classification,
        description: data.description,
        incidentId: data.id,
      });

      setSelectedEmergency({ ...type, result: data });
      setSubmitting(false);
    } catch (err) {
      console.error('Error al reportar emergencia:', err);
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mobile-app-wrapper">
      <div className="mobile-phone-frame">
        <div className="phone-notch" />
        <div className="phone-screen">
          {screen === 'home' ? (
            <HomeScreen
              onTypeClick={handleEmergencyClick}
              onBigEmergency={handleBigEmergency}
            />
          ) : (
            <StatusScreen
              emergency={selectedEmergency}
              submitting={submitting}
              error={submitError}
              onBack={() => {
                setSubmitError(null);
                setScreen('home');
              }}
            />
          )}
        </div>
        <div className="phone-home-bar" />
      </div>
    </div>
  );
}

function HomeScreen({ onTypeClick, onBigEmergency }) {
  return (
    <div className="mobile-home">
      <div className="mobile-header">
        <div className="mobile-brand">
          <ShieldCheck size={18} color="#3b82f6" />
          <span>SafeDistrict</span>
        </div>
        <div className="mobile-time">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>

      <div className="mobile-emergency-section">
        <button className="mobile-emergency-btn" onClick={onBigEmergency}>
          <div className="emergency-inner">
            <TriangleAlert size={36} />
            <span>EMERGENCIA</span>
          </div>
        </button>
        <p className="mobile-emergency-sub">Presiona solo en caso de emergencia</p>
      </div>

      <div className="mobile-grid-section">
        <p className="mobile-grid-title">Reportar emergencia</p>
        <div className="mobile-grid">
          {emergencyTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                className="mobile-grid-card"
                style={{ '--card-color': type.color, '--card-bg': type.bg }}
                onClick={() => onTypeClick(type)}
              >
                <div className="grid-card-icon" style={{ background: type.color }}>
                  <Icon size={22} color="white" />
                </div>
                <span className="grid-card-label">{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mobile-bottom-info">
        <Phone size={12} />
        <span>Central de Emergencias: 105</span>
      </div>
    </div>
  );
}

function StatusScreen({ emergency, submitting, error, onBack }) {
  const result = emergency?.result;

  if (submitting) {
    return (
      <div className="mobile-status">
        <div className="status-header">
          <button className="status-back" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <span>Enviando reporte</span>
          <div style={{ width: 20 }} />
        </div>
        <div className="status-body">
          <div className="status-check-circle">
            <div className="check-circle-outer" style={{ background: 'var(--accent)' }}>
              <Clock size={48} color="white" />
            </div>
          </div>
          <h1 className="status-title">Enviando reporte...</h1>
          <p className="status-subtitle">Conectando con la central de emergencias. Espera un momento.</p>
          <div className="status-loading-spinner">
            <div className="loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mobile-status">
        <div className="status-header">
          <button className="status-back" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <span>Error</span>
          <div style={{ width: 20 }} />
        </div>
        <div className="status-body">
          <div className="status-check-circle">
            <div className="check-circle-outer" style={{ background: '#ef4444' }}>
              <TriangleAlert size={48} color="white" />
            </div>
          </div>
          <h1 className="status-title">Error al enviar</h1>
          <p className="status-subtitle">No se pudo conectar con el servidor de emergencias. Verifica tu conexión e intenta nuevamente.</p>
          <div className="status-actions">
            <button className="status-action-btn primary" onClick={onBack}>Volver a intentar</button>
          </div>
        </div>
      </div>
    );
  }

  const priorityColor = result?.classification?.priority === 'Crítico' || result?.classification?.priority === 'Critico' ? '#ef4444' :
    result?.classification?.priority === 'Alto' ? '#f97316' : '#eab308';

  return (
    <div className="mobile-status">
      <div className="status-header">
        <button className="status-back" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <span>Estado de solicitud</span>
        <div style={{ width: 20 }} />
      </div>

      <div className="status-body">
        <div className="status-check-circle">
          <div className="check-circle-outer">
            <ShieldCheck size={48} color="white" />
          </div>
        </div>

        <h1 className="status-title">¡Ayuda en camino!</h1>
        <p className="status-subtitle">
          Tu emergencia ha sido registrada. Un operador está siendo asignado.
        </p>

        <div className="status-info-card">
          <div className="info-row">
            <div className="info-icon" style={{ background: '#f0fdf4' }}>
              <ShieldCheck size={18} color="#22c55e" />
            </div>
            <div className="info-text">
              <span className="info-label">Código de reporte</span>
              <span className="info-value" style={{ fontWeight: 700 }}>{result?.id || '—'}</span>
            </div>
          </div>
          <div className="info-divider" />
          <div className="info-row">
            <div className="info-icon" style={{ background: result?.classification?.priority === 'Crítico' || result?.classification?.priority === 'Critico' ? '#fef2f2' : '#fff7ed' }}>
              {emergency?.id === 'robo' ? <TriangleAlert size={18} color="#ef4444" /> :
               emergency?.id === 'incendio' ? <Flame size={18} color="#ef4444" /> :
               emergency?.id === 'accidente' ? <Car size={18} color="#f97316" /> :
               <Heart size={18} color={priorityColor} />}
            </div>
            <div className="info-text">
              <span className="info-label">Tipo de emergencia</span>
              <span className="info-value">{result?.classification?.typeLabel || emergency?.label || 'Emergencia General'}</span>
            </div>
          </div>
          <div className="info-divider" />
          <div className="info-row">
            <div className="info-icon" style={{ background: '#eff6ff' }}>
              <MapPin size={18} color="#3b82f6" />
            </div>
            <div className="info-text">
              <span className="info-label">Ubicación</span>
              <span className="info-value">{result?.location || 'Comas, Lima - Vía Pública'}</span>
            </div>
          </div>
          <div className="info-divider" />
          <div className="info-row">
            <div className="info-icon" style={{ background: '#f0fdf4' }}>
              <Clock size={18} color="#22c55e" />
            </div>
            <div className="info-text">
              <span className="info-label">Tiempo estimado de llegada</span>
              <span className="info-value" style={{ color: '#22c55e', fontWeight: 700 }}>5 - 8 minutos</span>
            </div>
          </div>
        </div>

        <div className="status-actions">
          <button className="status-action-btn primary">Llamar a emergencias</button>
          <button className="status-action-btn secondary" onClick={onBack}>Volver al inicio</button>
        </div>
      </div>
    </div>
  );
}
