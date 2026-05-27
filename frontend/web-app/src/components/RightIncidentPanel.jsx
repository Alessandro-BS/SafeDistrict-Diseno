import { useMemo, useState } from 'react';
import { AlertTriangle, Clock, MapPin, Search, Eye, Edit2 } from 'lucide-react';
import { normalizePriority, getTimeElapsed } from '../data/classificationEngine';

const priorityConfig = {
  'Crítico': { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
  'Alto': { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)' },
  'Medio': { color: '#eab308', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.25)' },
  'Bajo': { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)' },
};

export default function RightIncidentPanel({ incidents, onViewRoute, onClassify }) {
  const [filter, setFilter] = useState('Todas');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = [...incidents];
    if (filter !== 'Todas') result = result.filter(i => normalizePriority(i.priority) === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(i => i.id.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return result;
  }, [incidents, filter, search]);

  return (
    <div className="right-panel">
      <div className="right-panel-header">
        <h3>
          <AlertTriangle size={16} />
          Incidentes Activos
          <span className="incident-count">{incidents.length}</span>
        </h3>
      </div>

      <div className="right-panel-controls">
        <div className="right-search">
          <Search size={14} />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="right-filter" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="Todas">Todos</option>
          <option value="Crítico">Crítico</option>
          <option value="Alto">Alto</option>
          <option value="Medio">Medio</option>
          <option value="Bajo">Bajo</option>
        </select>
      </div>

      <div className="right-panel-list">
        {filtered.map((inc) => {
          const displayPriority = normalizePriority(inc.priority);
          const cfg = priorityConfig[displayPriority] || priorityConfig.Medio;
          return (
            <div key={inc.id} className="incident-card" style={{ borderColor: cfg.border }}>
              <div className="incident-card-top">
                <span className="incident-id">{inc.id}</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="incident-badge" style={{ background: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: `1px solid rgba(148, 163, 184, 0.3)` }}>
                    {inc.typeLabel || 'Otro'}
                  </span>
                  <span className="incident-badge" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    {displayPriority}
                  </span>
                </div>
              </div>
              <div className="incident-card-desc">{inc.description}</div>
              <div className="incident-card-meta">
                <span><MapPin size={12} /> {inc.location}</span>
                <span><Clock size={12} /> {getTimeElapsed(inc.createdAt) || inc.timeElapsed || '0 min'}</span>
              </div>
              <div className="incident-card-footer">
                <span className="incident-status" style={{
                  color: inc.status === 'Pendiente' ? cfg.color : '#22c55e'
                }}>
                  {inc.status}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="route-btn" onClick={() => onClassify?.(inc)} style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', borderColor: 'rgba(249, 115, 22, 0.2)' }}>
                    <Edit2 size={14} />
                    Clasificar
                  </button>
                  <button className="route-btn" onClick={() => onViewRoute?.(inc)}>
                    <Eye size={14} />
                    Ver
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="right-panel-empty">
            No hay incidentes con estos filtros.
          </div>
        )}
      </div>
    </div>
  );
}
