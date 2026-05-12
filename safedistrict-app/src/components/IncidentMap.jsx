import { useMemo, useState } from 'react';
import { AlertTriangle, Flame, HeartPulse, CarFront, ShieldOff, Crosshair, Maximize2, Minimize2 } from 'lucide-react';

const typeIcons = {
  robo: ShieldOff, accidente: CarFront, incendio: Flame, emergencia_medica: HeartPulse,
};

const priorityConfig = {
  'Crítico': { color: '#ef4444', glow: 'rgba(239,68,68,0.6)' },
  'Alto': { color: '#f97316', glow: 'rgba(249,115,22,0.5)' },
  'Medio': { color: '#eab308', glow: 'rgba(234,179,8,0.4)' },
  'Bajo': { color: '#22c55e', glow: 'rgba(34,197,94,0.3)' },
};

function getMarkerPosition(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  return {
    x: ((Math.abs(hash * 13) % 74) + 10),
    y: ((Math.abs(hash * 7) % 68) + 12),
  };
}

export default function IncidentMap({ incidents, focusedIncident }) {
  const [fullscreen, setFullscreen] = useState(false);

  const activeIncidents = useMemo(() =>
    incidents.filter(i => i.status !== 'Resuelto'),
    [incidents]
  );

  return (
    <div className={`tactical-map ${fullscreen ? 'fullscreen' : ''}`}>
      <div className="map-top-bar">
        <div className="map-legend">
          <span className="legend-title">PRIORIDAD</span>
          {Object.entries(priorityConfig).map(([label, cfg]) => (
            <div key={label} className="legend-item">
              <span className="legend-dot" style={{ background: cfg.color, boxShadow: `0 0 8px ${cfg.glow}` }} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="map-top-right">
          <div className="map-coords">
            <Crosshair size={14} />
            <span>11° 56&apos; S 77° 03&apos; W</span>
          </div>
          <button className="map-action-btn" onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className="map-grid-area">
        <div className="grid-overlay" />
        <div className="scan-line" />

        {[
          { label: 'Zona Norte', x: 8, y: 6 },
          { label: 'Zona Este', x: 82, y: 8 },
          { label: 'Zona Oeste', x: 6, y: 45 },
          { label: 'Zona Sur', x: 80, y: 80 },
          { label: 'CENTRO', x: 45, y: 45 },
        ].map(({ label, x, y }) => (
          <div key={label} className="zone-label" style={{ left: `${x}%`, top: `${y}%` }}>
            {label}
          </div>
        ))}

        <div className="grid-roads">
          <div className="road-h" style={{ top: '30%' }} />
          <div className="road-h" style={{ top: '60%' }} />
          <div className="road-v" style={{ left: '33%' }} />
          <div className="road-v" style={{ left: '66%' }} />
        </div>

        <div className="grid-road-labels">
          <span style={{ top: '29%', left: '2%' }}>Av. Túpac Amaru</span>
          <span style={{ top: '59%', left: '2%' }}>Av. Universitaria</span>
          <span style={{ top: '48%', left: '32%' }}>Jr. Los Olivos</span>
          <span style={{ top: '48%', left: '65%' }}>Av. Revolución</span>
        </div>

        {activeIncidents.map((incident) => {
          const pos = getMarkerPosition(incident.id);
          const cfg = priorityConfig[incident.priority] || priorityConfig.Medio;
          const IconComponent = typeIcons[incident.type] || AlertTriangle;
          const isFocused = focusedIncident?.id === incident.id;

          return (
            <div
              key={incident.id}
              className={`map-node ${isFocused ? 'focused' : ''}`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                '--node-color': cfg.color,
                '--node-glow': cfg.glow,
              }}
            >
              <div className="node-halo" />
              <div className="node-ring" />
              <div className="node-icon" style={{ background: cfg.color }}>
                <IconComponent size={14} color="white" />
              </div>

              <div className="node-tooltip">
                <div className="node-tooltip-header">
                  <strong>{incident.id}</strong>
                  <span className="node-tooltip-badge" style={{ background: cfg.color }}>{incident.priority}</span>
                </div>
                <div className="node-tooltip-desc">{incident.description}</div>
                <div className="node-tooltip-loc">{incident.location}</div>
                <div className="node-tooltip-meta">
                  <span className="node-tooltip-time">{incident.timeElapsed}</span>
                  <span className="node-tooltip-status">{incident.status}</span>
                </div>
              </div>
            </div>
          );
        })}

        {activeIncidents.length === 0 && (
          <div className="map-empty-state">
            <Crosshair size={40} />
            <p>No hay incidentes activos</p>
            <span>Supervisando distrito de Comas</span>
          </div>
        )}
      </div>

      <div className="map-bottom-bar">
        <div className="bottom-left">
          <span className="map-stat">
            ACTIVOS: <strong>{activeIncidents.length}</strong>
          </span>
          <span className="map-stat" style={{ color: '#ef4444' }}>
            CRÍTICOS: <strong>{activeIncidents.filter(i => i.priority === 'Crítico').length}</strong>
          </span>
          <span className="map-stat" style={{ color: '#f97316' }}>
            ALTOS: <strong>{activeIncidents.filter(i => i.priority === 'Alto').length}</strong>
          </span>
        </div>
        <div className="bottom-right">
          <span className="map-update-time">
            Última actualización: {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
}
