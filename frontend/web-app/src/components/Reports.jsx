import { useState } from 'react';
import { ShieldCheck, Send, TriangleAlert, MapPin, Check, Loader } from 'lucide-react';

const API_BASE = 'http://localhost:8080/api';

const priorities = [
  { id: 'bajo', label: 'Bajo', color: '#22c55e', bg: '#052e16', border: '#166534', icon: ShieldCheck, desc: 'Controlable, sin riesgo inmediato' },
  { id: 'medio', label: 'Medio', color: '#eab308', bg: '#422006', border: '#854d0e', icon: ShieldCheck, desc: 'Requiere atención, posible riesgo' },
  { id: 'alto', label: 'Alto', color: '#f97316', bg: '#431407', border: '#9a3412', icon: TriangleAlert, desc: 'Urgente, riesgo significativo' },
  { id: 'critico', label: 'Crítico', color: '#ef4444', bg: '#450a0a', border: '#991b1b', icon: TriangleAlert, desc: 'Peligro inminente, acción inmediata' },
];

export default function Reports({ addIncident, setLastClassification }) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priority, setPriority] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !priority) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API_BASE}/incidents/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `[REPORTE CIUDADANO - Prioridad: ${priority.label}] ${description}`,
          location: location.trim() || 'Comas, Lima',
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
      setSuccess(data);
      setSubmitting(false);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const reset = () => {
    setDescription('');
    setLocation('');
    setPriority(null);
    setSuccess(null);
    setError(null);
  };

  if (success) {
    return (
      <div className="reports-wrapper slide-up-fade" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="reports-card premium-glass-card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <div className="reports-success premium-success-content">
            <div className="reports-success-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <div className="success-check-anim" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(34, 197, 94, 0.4)' }}>
                <Check size={48} color="white" />
              </div>
            </div>
            <h2 className="reports-success-title" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f8fafc', marginBottom: '8px' }}>Reporte enviado</h2>
            <p className="reports-success-sub" style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '32px' }}>El reporte del ciudadano ha sido registrado exitosamente.</p>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '24px', marginBottom: '32px', textAlign: 'left' }}>
              <div className="reports-success-id-label" style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Código de reporte</div>
              <div className="reports-success-id" style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '20px', fontFamily: 'monospace' }}>{success.id}</div>

              <div className="reports-success-details" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="reports-detail-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="detail-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="detail-dot" style={{ background: '#22c55e', width: '8px', height: '8px', borderRadius: '50%' }} />
                    <span className="detail-label" style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>Prioridad asignada</span>
                  </div>
                  <span className="detail-value" style={{
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    color: success.classification?.priority === 'Crítico' || success.classification?.priority === 'Critico' ? '#ef4444' :
                      success.classification?.priority === 'Alto' ? '#f97316' :
                        success.classification?.priority === 'Medio' ? '#eab308' : '#22c55e',
                  }}>
                    {success.classification?.priorityLabel || priority.label}
                  </span>
                </div>
                <div className="reports-detail-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="detail-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="detail-dot" style={{ background: '#3b82f6', width: '8px', height: '8px', borderRadius: '50%' }} />
                    <span className="detail-label" style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>Tipo de emergencia</span>
                  </div>
                  <span className="detail-value" style={{ fontWeight: '600', color: '#f8fafc' }}>{success.classification?.typeLabel || '—'}</span>
                </div>
                <div className="reports-detail-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="detail-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="detail-dot" style={{ background: '#8b5cf6', width: '8px', height: '8px', borderRadius: '50%' }} />
                    <span className="detail-label" style={{ color: '#e2e8f0', fontSize: '0.95rem' }}>Confianza de la IA</span>
                  </div>
                  <span className="detail-value" style={{ fontWeight: '600', color: '#a78bfa' }}>{Math.round((success.classification?.confidence || 0) * 100)}%</span>
                </div>
              </div>
            </div>

            <div className="reports-success-actions">
              <button className="reports-btn premium-submit-btn" onClick={reset} style={{ margin: 0 }}>
                Nuevo reporte
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-wrapper slide-up-fade">
      <div className="reports-card premium-glass-card">
        <div className="reports-header premium-header">
          <div className="reports-header-icon premium-icon-glow">
            <ShieldCheck size={24} color="white" />
          </div>
          <div className="reports-header-text">
            <h2 className="reports-header-title">Reporte del Ciudadano</h2>
            <p className="reports-header-sub">Describe la situación y asigna una prioridad</p>
          </div>
        </div>

        <form className="reports-form" onSubmit={handleSubmit}>
          <div className="reports-section">
            <div className="reports-section-header">
              <label className="reports-label">¿Qué está sucediendo?</label>
              <span className="reports-char-count">{description.length} caracteres</span>
            </div>
            <textarea
              className="reports-textarea"
              placeholder="Describe detalladamente la situación que estás reportando como ciudadano..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="reports-section">
            <label className="reports-label">¿Dónde ocurre?</label>
            <div className="reports-input-wrap">
              <MapPin size={16} className="reports-input-icon" />
              <input
                className="reports-input"
                type="text"
                placeholder="Ej: Av. Túpac Amaru 1500, Comas"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="reports-section">
            <label className="reports-label">Nivel de prioridad</label>
            <div className="reports-priority-grid">
              {priorities.map((p) => {
                const PIcon = p.icon;
                const isSelected = priority?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`reports-priority-card ${isSelected ? 'selected' : ''}`}
                    style={{
                      borderColor: isSelected ? p.color : 'var(--border-color)',
                      background: isSelected ? p.bg : 'var(--bg-panel)',
                    }}
                    onClick={() => setPriority(p)}
                  >
                    <div className="priority-top">
                      <div className="priority-icon-wrap" style={{ background: isSelected ? p.color : 'transparent', borderColor: isSelected ? p.color : 'var(--border-color)' }}>
                        <PIcon size={14} color={isSelected ? 'white' : 'var(--text-muted)'} />
                      </div>
                      <span className="priority-label" style={{ color: isSelected ? p.color : 'var(--text-main)' }}>
                        {p.label}
                      </span>
                      {isSelected && <div className="priority-selected-check" style={{ color: p.color }}>✓</div>}
                    </div>
                    <span className="priority-desc">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="reports-error">
              <TriangleAlert size={16} />
              <div className="reports-error-text">
                <span className="reports-error-title">Error al enviar</span>
                <span className="reports-error-desc">{error}. Verifica tu conexión e intenta nuevamente.</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="reports-submit-btn premium-submit-btn"
            disabled={submitting || !description.trim() || !priority}
          >
            {submitting ? (
              <><Loader size={20} className="reports-spinner" /> Enviando reporte...</>
            ) : (
              <><Send size={20} /> Enviar Reporte</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
