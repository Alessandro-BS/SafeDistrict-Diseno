import { useState } from 'react';
import { ShieldAlert, Bell, Activity, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { normalizePriority } from '../data/classificationEngine';
import IncidentMap from './IncidentMap';
import RightIncidentPanel from './RightIncidentPanel';
import ReclassifyModal from './ReclassifyModal';

export default function Dashboard({ incidents, lastClassification, loading, error, onRetry }) {
  const [activeTab, setActiveTab] = useState('mapa');
  const [focusedIncident, setFocusedIncident] = useState(null);
  const [incidentToClassify, setIncidentToClassify] = useState(null);

  const criticos = incidents.filter(i => normalizePriority(i.priority) === 'Crítico').length;
  const total = incidents.length;

  const tabs = [
    { id: 'mapa', label: 'Mapa Táctico', count: null },
    { id: 'incidentes', label: 'Incidentes', count: total },
    { id: 'alertas', label: 'Alertas', count: criticos, urgent: true },
  ];

  return (
    <div className="command-center">
      {error && (
        <div className="error-banner">
          <AlertTriangle size={16} />
          <span className="error-banner-text">Usando datos de demostración — No se pudo conectar con el servidor</span>
          <button className="retry-btn" onClick={onRetry}>Reintentar</button>
        </div>
      )}
      <div className="command-header">
        <div className="command-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`command-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`tab-count ${tab.urgent ? 'urgent' : ''}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="command-stats-row">
          <div className="cmd-stat">
            <ShieldAlert size={16} />
            <span className="cmd-stat-label">Total</span>
            <span className="cmd-stat-value">{total}</span>
          </div>
          <div className="cmd-stat critical">
            <AlertTriangle size={16} />
            <span className="cmd-stat-label">Críticos</span>
            <span className="cmd-stat-value">{criticos}</span>
          </div>
          <div className="cmd-stat">
            <Activity size={16} />
            <span className="cmd-stat-label">En curso</span>
            <span className="cmd-stat-value">{incidents.filter(i => i.status === 'En curso' || i.status === 'En Curso').length}</span>
          </div>
          <div className="cmd-stat">
            <TrendingUp size={16} />
            <span className="cmd-stat-label">Hoy</span>
            <span className="cmd-stat-value">24</span>
          </div>
          <div className="cmd-stat">
            <Clock size={16} />
            <span className="cmd-stat-label">Turno</span>
            <span className="cmd-stat-value">08:00 - 16:00</span>
          </div>
        </div>
      </div>

      {lastClassification && (
        <div className="classification-banner">
          <div className="banner-icon">
            <Bell size={16} />
          </div>
          <div className="banner-content">
            <span className="banner-label">NUEVA CLASIFICACIÓN IA</span>
            <span className="banner-text">
              {lastClassification.description || lastClassification.typeLabel}
            </span>
          </div>
          <div className="banner-badge" style={{
            background: normalizePriority(lastClassification.priority) === 'Crítico' ? '#ef4444' :
                        normalizePriority(lastClassification.priority) === 'Alto' ? '#f97316' : '#eab308'
          }}>
            {lastClassification.priorityLabel}
          </div>
          <span className="banner-confidence">
            {(lastClassification.confidence * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {loading ? (
        <div className="loading-overlay">
          <div className="loading-spinner" />
          <p>Cargando incidentes...</p>
        </div>
      ) : (
      <div className="command-main">
        <div className="command-map-area">
          {activeTab === 'mapa' && (
            <IncidentMap
              incidents={incidents}
              focusedIncident={focusedIncident}
            />
          )}
          {activeTab === 'incidentes' && (
            <div className="placeholder-panel">
              <Activity size={48} />
              <h3>Panel de Incidentes</h3>
              <p>Vista detallada de todos los incidentes con opciones de filtro avanzado.</p>
            </div>
          )}
          {activeTab === 'alertas' && (
            <div className="placeholder-panel">
              <Bell size={48} />
              <h3>Centro de Alertas</h3>
              <p>Notificaciones en tiempo real sobre eventos críticos en el distrito.</p>
            </div>
          )}
        </div>

        <RightIncidentPanel
          incidents={incidents}
          onViewRoute={(inc) => {
            setFocusedIncident(inc);
            setActiveTab('mapa');
          }}
          onClassify={(inc) => setIncidentToClassify(inc)}
        />
      </div>
      )}

      {incidentToClassify && (
        <ReclassifyModal 
          incident={incidentToClassify}
          onClose={() => setIncidentToClassify(null)}
          onUpdated={() => {
            if (onRetry) onRetry(); // Fetch updated incidents
          }}
        />
      )}
    </div>
  );
}
