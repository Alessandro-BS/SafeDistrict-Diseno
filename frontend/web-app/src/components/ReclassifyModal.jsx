import { useState } from 'react';
import { X, Save, AlertTriangle } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

const priorityOptions = ['Bajo', 'Medio', 'Alto', 'Crítico'];
const typeOptions = [
  { value: 'robo', label: 'Robo' },
  { value: 'accidente', label: 'Accidente' },
  { value: 'incendio', label: 'Incendio' },
  { value: 'emergencia_medica', label: 'Emergencia Médica' },
  { value: 'no_detectado', label: 'Otro / No detectado' }
];

export default function ReclassifyModal({ incident, onClose, onUpdated }) {
  const [priority, setPriority] = useState(incident?.priority || 'Medio');
  const [type, setType] = useState(incident?.type || 'no_detectado');
  const [saving, setSaving] = useState(false);

  if (!incident) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const typeLabel = typeOptions.find(t => t.value === type)?.label || 'Desconocido';
      const res = await fetch(`${API_BASE}/incidents/${incident.id}/classify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, typeLabel, priority })
      });
      if (res.ok) {
        onUpdated();
        onClose();
      } else {
        alert("Error al actualizar la clasificación");
      }
    } catch (e) {
      console.error(e);
      alert("Error de conexión al servidor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="premium-glass-card reclassify-modal slide-up-fade">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>
        
        <h3 className="modal-title">
          <AlertTriangle size={20} style={{ color: '#f97316' }} />
          Reclasificar Incidente
        </h3>
        
        <div className="reclassify-id">{incident.id}</div>
        
        <div className="reports-section">
          <label className="reports-label">Prioridad</label>
          <select 
            className="reports-input" 
            value={priority} 
            onChange={e => setPriority(e.target.value)}
          >
            {priorityOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="reports-section">
          <label className="reports-label">Tipo de Emergencia</label>
          <select 
            className="reports-input" 
            value={type} 
            onChange={e => setType(e.target.value)}
          >
            {typeOptions.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <button 
          className="reports-btn premium-submit-btn" 
          onClick={handleSave} 
          disabled={saving}
          style={{ marginTop: '16px' }}
        >
          <Save size={18} />
          {saving ? 'Guardando...' : 'Guardar Clasificación'}
        </button>
      </div>
    </div>
  );
}
