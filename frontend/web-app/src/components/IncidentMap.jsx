import { useMemo, useState, useRef } from 'react';
import { normalizePriority } from '../data/classificationEngine';

const priorityConfig = {
  'Crítico': { colorClass: 'bg-triage-critical', icon: 'warning', text: 'text-on-error', size: 'w-10 h-10', iconSize: 'text-[20px]', ping: true },
  'Alto': { colorClass: 'bg-triage-high', icon: 'priority_high', text: 'text-white', size: 'w-8 h-8', iconSize: 'text-[16px]', ping: false },
  'Medio': { colorClass: 'bg-triage-medium', icon: 'report', text: 'text-on-surface', size: 'w-8 h-8', iconSize: 'text-[16px]', ping: false },
  'Bajo': { colorClass: 'bg-triage-low', icon: 'info', text: 'text-white', size: 'w-8 h-8', iconSize: 'text-[16px]', ping: false },
};

function getMarkerPosition(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash) + id.charCodeAt(i);
  return {
    x: ((Math.abs(hash * 13) % 74) + 10),
    y: ((Math.abs(hash * 7) % 68) + 12),
  };
}

const typeTranslation = {
  fire: 'Incendio',
  theft: 'Robo',
  robbery: 'Robo',
  accident: 'Accidente',
  medical: 'Emergencia Médica',
  medical_emergency: 'Emergencia Médica',
  crime_armed: 'Robo Armado',
  criminal_assault: 'Asalto',
  crime: 'Delito'
};

export default function IncidentMap({ incidents, focusedIncident, onMarkerClick, zoom = 1 }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const activeIncidents = useMemo(() =>
    incidents.filter(i => i.status !== 'Resuelto'),
    [incidents]
  );

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="relative w-full h-full transition-transform duration-75 ease-linear"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: 'center center' }}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,50 Q150,100 300,50 T600,50" fill="none" stroke="#737685" strokeWidth="0.5"></path>
            <path d="M100,0 L100,600" fill="none" stroke="#737685" strokeWidth="0.5"></path>
            <path d="M400,0 L400,600" fill="none" stroke="#737685" strokeWidth="0.5"></path>
          </svg>
        </div>
        <div className="relative w-full h-full">
          {activeIncidents.map((incident) => {
            const pos = getMarkerPosition(incident.id);
            const displayPriority = normalizePriority(incident.priority);
            const cfg = priorityConfig[displayPriority] || priorityConfig.Medio;
            const isFocused = focusedIncident?.id === incident.id;
            
            const rawType = incident.type?.toLowerCase() || '';
            const displayType = typeTranslation[rawType] || incident.type;
            
            return (
              <div
                key={incident.id}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-${isFocused ? '50' : '10'}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className="relative">
                  {cfg.ping && !isFocused && (
                    <div className={`absolute -inset-4 ${cfg.colorClass}/20 rounded-full animate-ping`}></div>
                  )}
                  {isFocused && (
                    <div className={`absolute -inset-3 ${cfg.colorClass}/40 rounded-full animate-pulse`}></div>
                  )}
                  <div 
                    className={`relative ${cfg.colorClass} ${cfg.text} ${cfg.size} rounded-full flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform ${isFocused ? 'ring-4 ring-primary ring-offset-2 scale-110 border-none' : 'border-2 border-surface'}`}
                    onClick={(e) => { e.stopPropagation(); onMarkerClick && onMarkerClick(incident); }}
                  >
                    <span className={`material-symbols-outlined ${cfg.iconSize}`} style={{ fontVariationSettings: '"FILL" 1' }}>{cfg.icon}</span>
                  </div>
                  
                  {/* Info Card Popover */}
                  {isFocused && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-surface rounded-xl shadow-xl border border-outline-variant/50 p-3 animate-[slideIn_0.2s_ease-out] z-50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-outline">{incident.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cfg.colorClass} ${cfg.text}`}>
                          {displayPriority}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-on-surface mb-1">{displayType}</p>
                      <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">{incident.description}</p>
                      <div className="flex items-center gap-1 text-[10px] text-outline">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        <span className="truncate">{incident.location}</span>
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-surface border-b border-r border-outline-variant/50 rotate-45"></div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="absolute bottom-4 right-4 bg-surface/80 backdrop-blur-sm px-3 py-1 rounded text-[10px] font-mono-data text-on-surface-variant border border-outline-variant">
        11° 56' S 77° 03' W
      </div>
    </div>
  );
}
