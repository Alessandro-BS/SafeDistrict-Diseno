import { useState } from 'react';
import { normalizePriority } from '../data/classificationEngine';
import IncidentMap from './IncidentMap';
import RightIncidentPanel from './RightIncidentPanel';
import ReclassifyModal from './ReclassifyModal';
import Reports from './Reports';

export default function Dashboard({ incidents, lastClassification, loading, error, onRetry, updateIncidentStatus }) {
  const [activeTab, setActiveTab] = useState('mapa');
  const [focusedIncident, setFocusedIncident] = useState(null);
  const [incidentToClassify, setIncidentToClassify] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dispatchedUnits, setDispatchedUnits] = useState({});

  const handleDispatch = (incidentId) => {
    setDispatchedUnits(prev => ({
      ...prev,
      [incidentId]: true
    }));
  };

  const criticos = incidents.filter(i => normalizePriority(i.priority) === 'Crítico').length;
  const altos = incidents.filter(i => normalizePriority(i.priority) === 'Alto').length;
  const seguros = incidents.filter(i => normalizePriority(i.priority) === 'Bajo').length;
  const total = incidents.length;

  return (
    <>
      <section className="flex-1 flex flex-col p-6 overflow-y-auto relative">
        {error && (
          <div className="mb-4 bg-error-container text-error px-4 py-3 rounded-xl border border-error/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">warning</span>
              <span className="text-sm font-medium">Usando datos de demostración — No se pudo conectar con el servidor</span>
            </div>
            <button className="text-xs font-bold bg-error text-on-error px-3 py-1.5 rounded-lg" onClick={onRetry}>Reintentar</button>
          </div>
        )}

        {lastClassification && (
          <div className="mb-6 bg-surface border border-primary/20 border-l-4 border-l-primary p-3 rounded-xl flex items-center gap-3 shadow-sm animate-[slideIn_0.3s_ease]">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-primary font-bold uppercase tracking-wider">NUEVA CLASIFICACIÓN IA</div>
              <div className="text-sm text-on-surface truncate font-medium">{lastClassification.description || lastClassification.typeLabel}</div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
              normalizePriority(lastClassification.priority) === 'Crítico' ? 'bg-error' :
              normalizePriority(lastClassification.priority) === 'Alto' ? 'bg-triage-high' : 'bg-triage-medium'
            }`}>
              {lastClassification.priorityLabel}
            </span>
            <span className="text-xs font-bold text-outline">
              {(lastClassification.confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Breadcrumbs / Mode Switcher */}
        <div className="flex items-center gap-2 mb-6">
          <button 
            className={`${activeTab === 'mapa' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'} px-5 py-2 rounded-lg font-label-bold text-label-bold flex items-center gap-2 transition-colors`}
            onClick={() => setActiveTab('mapa')}
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            Mapa Táctico
          </button>
          <button 
            className={`${activeTab === 'incidentes' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'} px-5 py-2 rounded-lg font-label-bold text-label-bold flex items-center gap-2 transition-colors`}
            onClick={() => setActiveTab('incidentes')}
          >
            Incidentes 
            <span className={`${activeTab === 'incidentes' ? 'bg-white/20 text-white' : 'bg-surface-container-highest text-on-surface'} px-1.5 rounded text-[10px]`}>{total}</span>
          </button>
          <button 
            className={`${activeTab === 'alertas' ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant'} px-5 py-2 rounded-lg font-label-bold text-label-bold flex items-center gap-2 transition-colors`}
            onClick={() => setActiveTab('alertas')}
          >
            Alertas 
            <span className="bg-error text-on-error px-1.5 rounded text-[10px]">{criticos}</span>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-surface border border-outline-variant p-4 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[28px]">grid_view</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-outline uppercase">Total Activos</p>
              <p className="text-headline-md font-bold text-on-surface">{total}</p>
            </div>
          </div>
          
          <div className="bg-surface border border-outline-variant p-4 rounded-xl flex items-center gap-4 shadow-sm border-l-4 border-l-triage-critical">
            <div className="w-12 h-12 bg-error-container text-error rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">warning</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-outline uppercase">Críticos</p>
              <p className="text-headline-md font-bold text-error">{criticos}</p>
            </div>
          </div>
          
          <div className="bg-surface border border-outline-variant p-4 rounded-xl flex items-center gap-4 shadow-sm border-l-4 border-l-triage-high">
            <div className="w-12 h-12 bg-orange-100 text-triage-high rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">bolt</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-outline uppercase">Alta Prioridad</p>
              <p className="text-headline-md font-bold text-triage-high">{altos}</p>
            </div>
          </div>
          
          <div className="bg-surface border border-outline-variant p-4 rounded-xl flex items-center gap-4 shadow-sm border-l-4 border-l-triage-low">
            <div className="w-12 h-12 bg-green-100 text-triage-low rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px]">verified_user</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-outline uppercase">Seguros</p>
              <p className="text-headline-md font-bold text-triage-low">{seguros}</p>
            </div>
          </div>
        </div>

        {/* The Tactical Map area */}
        <div className={isFullscreen 
          ? "fixed inset-0 z-[9999] bg-surface-dim flex flex-col" 
          : "flex-1 bg-surface-dim rounded-2xl border border-outline-variant relative overflow-hidden flex flex-col shadow-lg min-h-[400px]"
        }>
          {loading && (
            <div className="absolute inset-0 z-50 bg-surface/50 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-medium text-on-surface">Cargando datos...</p>
            </div>
          )}

          {activeTab === 'mapa' && (
            <>
              {/* Legend overlay */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-4 bg-surface/95 backdrop-blur-md px-5 py-2.5 rounded-xl border border-outline-variant shadow-lg pointer-events-none">
                <span className="text-[11px] font-bold uppercase text-outline">Triage Semántico</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-triage-critical"></span><span className="text-[12px] font-medium">Crítico</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-triage-high"></span><span className="text-[12px] font-medium">Alta</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-triage-medium"></span><span className="text-[12px] font-medium">Media</span></div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-triage-low"></span><span className="text-[12px] font-medium">Baja</span></div>
                </div>
              </div>

              {/* Map controls */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="w-11 h-11 bg-surface border border-outline-variant rounded-xl flex items-center justify-center hover:bg-surface-container-low transition-all shadow-md active:scale-90"
                >
                  <span className="material-symbols-outlined text-[22px]">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
                </button>
                <div className="flex flex-col bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-md">
                  <button 
                    onClick={() => setZoom(z => Math.min(z + 0.2, 3))}
                    className="w-11 h-11 border-b border-outline-variant flex items-center justify-center hover:bg-surface-container-low transition-all active:scale-90"
                  >
                    <span className="material-symbols-outlined text-[22px]">add</span>
                  </button>
                  <button 
                    onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-surface-container-low transition-all active:scale-90"
                  >
                    <span className="material-symbols-outlined text-[22px]">remove</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 relative bg-surface-dim overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none map-grid"></div>
                {/* Use the existing IncidentMap inside this container */}
                <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
                  <IncidentMap 
                    incidents={incidents} 
                    focusedIncident={focusedIncident} 
                    onMarkerClick={(inc) => setFocusedIncident(inc)}
                    zoom={zoom}
                    dispatchedUnits={dispatchedUnits}
                    onDispatch={handleDispatch}
                  />
                </div>
              </div>

              <div className="bg-surface-container px-6 py-3 border-t border-outline-variant flex justify-between items-center z-20">
                <div className="flex gap-6 text-[12px] font-bold">
                  <span className="flex items-center gap-2"><strong className="text-primary">{total}</strong> ACTIVOS</span>
                  <span className="flex items-center gap-2"><strong className="text-triage-critical">{criticos}</strong> CRÍTICO</span>
                  <span className="flex items-center gap-2"><strong className="text-triage-high">{altos}</strong> ALTOS</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-outline">
                  <span className="material-symbols-outlined text-[16px]">update</span>
                  Sincronizado
                </div>
              </div>
            </>
          )}

          {activeTab === 'incidentes' && (
            <div className="flex-1 overflow-hidden flex flex-col bg-surface rounded-b-2xl">
              <Reports incidents={incidents} updateIncidentStatus={updateIncidentStatus} />
            </div>
          )}

          {activeTab === 'alertas' && (
            <div className="flex-1 overflow-y-auto p-6 bg-surface space-y-4 rounded-b-2xl">
              <div className="flex items-center justify-between mb-4 border-b border-outline-variant pb-3">
                <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">notifications_active</span>
                  Centro de Alertas Críticas
                </h3>
                <span className="bg-error/10 text-error px-3 py-1 rounded-full text-xs font-bold">
                  {criticos + altos} Alertas Prioritarias
                </span>
              </div>

              {incidents.filter(i => ['Crítico', 'Alto'].includes(normalizePriority(i.priority))).length === 0 ? (
                <div className="text-center py-12 text-outline">
                  <span className="material-symbols-outlined text-[48px] mb-2 text-green-500">check_circle</span>
                  <p className="font-semibold text-sm">No hay alertas críticas registradas en este momento</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {incidents
                    .filter(i => ['Crítico', 'Alto'].includes(normalizePriority(i.priority)))
                    .map((inc) => {
                      const prio = normalizePriority(inc.priority);
                      const isCritico = prio === 'Crítico';
                      return (
                        <div 
                          key={inc.id}
                          className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                            isCritico 
                              ? 'bg-red-50/60 border-red-200' 
                              : 'bg-amber-50/60 border-amber-200'
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className={`p-2.5 rounded-lg shrink-0 ${isCritico ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                              <span className="material-symbols-outlined text-[20px]">
                                {isCritico ? 'warning' : 'priority_high'}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                  isCritico ? 'bg-red-200 text-red-800' : 'bg-amber-200 text-amber-900'
                                }`}>
                                  {prio}
                                </span>
                                <span className="text-xs text-outline">{inc.time || 'Hace un momento'}</span>
                              </div>
                              <h4 className="font-bold text-sm text-on-surface">{inc.title || inc.category}</h4>
                              <p className="text-xs text-on-surface-variant mt-1">{inc.description || inc.location}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setFocusedIncident(inc);
                              setActiveTab('mapa');
                            }}
                            className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-xs font-bold rounded-lg shrink-0 shadow-sm flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">map</span>
                            Ver en Mapa
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      <RightIncidentPanel
        incidents={incidents}
        dispatchedUnits={dispatchedUnits}
        onViewRoute={(inc) => {
          setFocusedIncident(inc);
          setActiveTab('mapa');
        }}
        onClassify={(inc) => setIncidentToClassify(inc)}
      />

      {incidentToClassify && (
        <ReclassifyModal 
          incident={incidentToClassify}
          onClose={() => setIncidentToClassify(null)}
          onUpdated={() => {
            if (onRetry) onRetry();
          }}
        />
      )}
    </>
  );
}
