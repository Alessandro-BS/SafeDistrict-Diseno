import { useMemo, useState } from 'react';
import { normalizePriority, getTimeElapsed } from '../data/classificationEngine';

const priorityConfig = {
  'Crítico': { 
    color: 'text-triage-critical', 
    borderLeft: 'border-triage-critical', 
    badgeClass: 'bg-error text-on-error',
    pulse: true 
  },
  'Alto': { 
    color: 'text-triage-high', 
    borderLeft: 'border-triage-high', 
    badgeClass: 'bg-orange-100 text-triage-high border border-orange-200',
    pulse: false 
  },
  'Medio': { 
    color: 'text-triage-medium', 
    borderLeft: 'border-triage-medium', 
    badgeClass: 'bg-yellow-100 text-triage-medium border border-yellow-200',
    pulse: false 
  },
  'Bajo': { 
    color: 'text-triage-low', 
    borderLeft: 'border-triage-low', 
    badgeClass: 'bg-green-100 text-triage-low border border-green-200',
    pulse: false 
  },
};

export default function RightIncidentPanel({ incidents, onViewRoute, onClassify }) {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterPriority, setFilterPriority] = useState('Todos');

  const filtered = useMemo(() => {
    let result = [...incidents];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.id.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    if (filterPriority !== 'Todos') {
      result = result.filter(i => normalizePriority(i.priority) === filterPriority);
    }
    return result;
  }, [incidents, search, filterPriority]);

  return (
    <aside className="w-incident-panel-width border-l border-outline-variant bg-surface flex flex-col h-full shadow-2xl z-10">
      <div className="p-6 border-b border-outline-variant bg-surface-container-low relative">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>emergency</span>
            <h2 className="font-headline-md text-[18px] font-bold">Incidentes Activos</h2>
          </div>
          <span className="bg-primary text-on-primary px-2.5 py-0.5 rounded-full text-[12px] font-bold">{filtered.length}</span>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">search</span>
            <input 
              className="w-full bg-surface border border-outline-variant pl-10 pr-4 py-2.5 rounded-xl text-body-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-outline/60" 
              placeholder="Filtrar por ID o calle..." 
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <button 
              className={`bg-surface border w-11 h-[42px] rounded-xl flex items-center justify-center hover:bg-surface-container transition-colors shadow-sm active:scale-95 ${filterPriority !== 'Todos' || showFilters ? 'border-primary text-primary' : 'border-outline-variant text-on-surface'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
            
            {showFilters && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-surface rounded-xl shadow-xl border border-outline-variant py-2 z-50 animate-[slideIn_0.2s_ease-out]">
                <div className="px-4 py-2 text-[10px] font-bold text-outline uppercase tracking-wider">Filtrar por Prioridad</div>
                {['Todos', 'Crítico', 'Alto', 'Medio', 'Bajo'].map(prio => (
                  <button
                    key={prio}
                    onClick={() => { setFilterPriority(prio); setShowFilters(false); }}
                    className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-surface-container transition-colors flex items-center justify-between ${filterPriority === prio ? 'text-primary bg-primary/5' : 'text-on-surface'}`}
                  >
                    {prio}
                    {filterPriority === prio && <span className="material-symbols-outlined text-[16px]">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-container-low/50">
        {filtered.map((inc) => {
          const displayPriority = normalizePriority(inc.priority);
          const cfg = priorityConfig[displayPriority] || priorityConfig.Medio;
          
          return (
            <article key={inc.id} className={`bg-surface rounded-xl shadow-sm border-l-4 ${cfg.borderLeft} overflow-hidden hover:shadow-md transition-all group border border-outline-variant`}>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-mono-data text-[11px] text-outline font-bold">{inc.id}</span>
                  <div className="flex gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${cfg.badgeClass}`}>
                      {displayPriority}
                    </span>
                  </div>
                </div>
                
                <h3 className={`font-headline-md text-[16px] font-bold text-on-surface group-hover:${cfg.color} transition-colors mb-2`}>
                  {inc.description}
                </h3>
                
                <div className="space-y-1.5 mb-5">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                    <span className="text-[12px]">{inc.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-outline">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span className="text-[12px]">Reportado hace {getTimeElapsed(inc.createdAt) || inc.timeElapsed || '0 min'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                  <span className={`text-[11px] font-bold ${cfg.color} flex items-center gap-1.5 uppercase`}>
                    {cfg.pulse && <span className="w-2 h-2 rounded-full bg-triage-critical animate-pulse"></span>}
                    {inc.status}
                  </span>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => onClassify?.(inc)}
                      className="text-on-surface-variant bg-surface-container hover:bg-surface-container-high px-4 py-2 rounded-lg text-[12px] font-bold transition-colors"
                    >
                      Clasificar
                    </button>
                    <button 
                      onClick={() => onViewRoute?.(inc)}
                      className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[12px] font-bold hover:bg-primary-container transition-colors shadow-sm"
                    >
                      {displayPriority === 'Crítico' ? 'Ver Detalles' : 'Ver'}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
        
        {filtered.length === 0 ? (
          <div className="py-10 text-center opacity-30 select-none">
            <span className="material-symbols-outlined text-[48px] mb-2 block">search_off</span>
            <p className="text-[12px] font-medium">No se encontraron incidentes</p>
          </div>
        ) : (
          <div className="py-10 text-center opacity-30 select-none">
            <span className="material-symbols-outlined text-[48px] mb-2 block">history</span>
            <p className="text-[12px] font-medium">Fin de la lista de prioridad</p>
          </div>
        )}
      </div>
    </aside>
  );
}
