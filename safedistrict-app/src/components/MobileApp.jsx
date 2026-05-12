import { useState } from 'react';
import { MapPin, TriangleAlert, Flame, Car, Heart, ShieldCheck, Phone, Clock, ArrowLeft } from 'lucide-react';

const emergencyTypes = [
  { id: 'robo', label: 'Robo', icon: TriangleAlert, color: '#ef4444', bg: '#fef2f2' },
  { id: 'incendio', label: 'Incendio', icon: Flame, color: '#ef4444', bg: '#fef2f2' },
  { id: 'accidente', label: 'Accidente', icon: Car, color: '#f97316', bg: '#fff7ed' },
  { id: 'emergencia_medica', label: 'Emerg. Médica', icon: Heart, color: '#f97316', bg: '#fff7ed' },
];

export default function MobileApp({ addIncident, setLastClassification }) {
  const [screen, setScreen] = useState('home');
  const [selectedEmergency, setSelectedEmergency] = useState(null);

  const handleEmergencyClick = (type) => {
    setSelectedEmergency(type);
    setScreen('status');

    if (addIncident) {
      const newIncident = {
        id: `INC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        description: `Emergencia reportada: ${type.label}`,
        location: 'Comas, Lima - Vía Pública',
        priority: type.id === 'incendio' || type.id === 'emergencia_medica' ? 'Crítico' : 'Alto',
        timeElapsed: '0 min',
        status: 'Pendiente',
        reporter: 'App Móvil',
        type: type.id,
      };
      addIncident(newIncident);
      if (setLastClassification) {
        setLastClassification({
          priority: newIncident.priority,
          priorityLabel: newIncident.priority,
          confidence: 0.95,
          description: newIncident.description,
          incidentId: newIncident.id,
        });
      }
    }
  };

  const handleBigEmergency = () => {
    setSelectedEmergency({ id: 'emergencia_medica', label: 'Emergencia General' });
    setScreen('status');

    if (addIncident) {
      const newIncident = {
        id: `INC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        description: 'Emergencia general - Botón de pánico',
        location: 'Comas, Lima - Ubicación detectada',
        priority: 'Crítico',
        timeElapsed: '0 min',
        status: 'Pendiente',
        reporter: 'App Móvil (Botón EMERGENCIA)',
        type: 'emergencia_medica',
      };
      addIncident(newIncident);
      if (setLastClassification) {
        setLastClassification({
          priority: 'Crítico',
          priorityLabel: 'Crítico',
          confidence: 0.98,
          description: newIncident.description,
          incidentId: newIncident.id,
        });
      }
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
              onBack={() => setScreen('home')}
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

function StatusScreen({ emergency, onBack }) {
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
            <div className="info-icon" style={{ background: '#eff6ff' }}>
              <MapPin size={18} color="#3b82f6" />
            </div>
            <div className="info-text">
              <span className="info-label">Ubicación confirmada</span>
              <span className="info-value">Comas, Lima - Vía Pública</span>
            </div>
          </div>
          <div className="info-divider" />
          <div className="info-row">
            <div className="info-icon" style={{ background: emergency?.id === 'robo' || emergency?.id === 'incendio' ? '#fef2f2' : '#fff7ed' }}>
              {emergency?.id === 'robo' ? <TriangleAlert size={18} color="#ef4444" /> :
               emergency?.id === 'incendio' ? <Flame size={18} color="#ef4444" /> :
               emergency?.id === 'accidente' ? <Car size={18} color="#f97316" /> :
               <Heart size={18} color="#f97316" />}
            </div>
            <div className="info-text">
              <span className="info-label">Tipo de emergencia</span>
              <span className="info-value">{emergency?.label || 'Emergencia General'}</span>
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
