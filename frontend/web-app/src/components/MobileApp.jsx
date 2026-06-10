import { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, Clock, TriangleAlert, Flame, Car, Heart } from 'lucide-react';

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

export default function MobileApp({ addIncident, setLastClassification, setCurrentView }) {
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
    <section className="flex-1 bg-surface-container-low p-8 overflow-y-auto flex flex-col items-center">
      {/* Secondary Navigation Tabs */}
      <div className="flex bg-surface-container-high p-1.5 rounded-xl mb-8 self-center border border-outline-variant shadow-sm">
        <button 
          className="flex items-center gap-2 px-6 py-2.5 bg-surface text-primary rounded-lg shadow-sm font-label-bold border border-outline-variant/30 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: '"FILL" 1'}}>smartphone</span>
          App Móvil
        </button>
        <button 
          onClick={() => setCurrentView('chat')}
          className="flex items-center gap-2 px-6 py-2.5 text-on-surface-variant hover:text-on-surface font-label-bold transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">forum</span>
          Chatbot
        </button>
        <button 
          onClick={() => setCurrentView('reports')}
          className="flex items-center gap-2 px-6 py-2.5 text-on-surface-variant hover:text-on-surface font-label-bold transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">analytics</span>
          Reportes
        </button>
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 px-6 py-2.5 text-on-surface-variant hover:text-on-surface font-label-bold transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">grid_view</span>
          Panel Admin
        </button>
      </div>

      {/* Mobile App Preview Area */}
      <div className="relative flex justify-center items-center w-full max-w-4xl py-8 bg-white/50 backdrop-blur-sm rounded-[40px] border border-outline-variant shadow-xl overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #003d9b 1px, transparent 0)', backgroundSize: '32px 32px'}}></div>
        
        {/* Phone Frame */}
        <div className="phone-frame ring-8 ring-black/5">
          <div className="phone-notch"></div>
          
          <div className="h-full w-full bg-white relative">
            {screen === 'home' ? (
              <HomeScreen
                onTypeClick={handleEmergencyClick}
                onBigEmergency={handleBigEmergency}
                onChatbot={() => setCurrentView('chat')}
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
        </div>
      </div>
    </section>
  );
}

function HomeScreen({ onTypeClick, onBigEmergency, onChatbot }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
      }).toLowerCase().replace('am', 'a. m.').replace('pm', 'p. m.'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-white px-5 pt-8 pb-4 absolute inset-0 overflow-y-auto">
      {/* App Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[20px]" style={{fontVariationSettings: '"FILL" 0, "wght" 400'}}>verified_user</span>
          <span className="font-bold text-[14px] text-on-surface">SafeDistrict</span>
        </div>
        <span className="text-[11px] text-outline">{timeStr}</span>
      </div>

      {/* Emergency Button Section */}
      <div className="flex flex-col items-center mb-6">
        <button 
          onClick={onBigEmergency}
          className="w-[140px] h-[140px] rounded-full bg-error flex flex-col items-center justify-center gap-0.5 emergency-glow active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-white text-[48px]" style={{fontVariationSettings: '"wght" 300'}}>warning</span>
          <span className="text-white font-extrabold text-[12px] tracking-wider">EMERGENCIA</span>
        </button>
        <p className="mt-4 text-[10px] text-outline text-center">Presiona solo en caso de emergencia</p>
      </div>

      {/* Report Section */}
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-[13px] text-on-surface px-1">Reportar emergencia</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Robo */}
          <button onClick={() => onTypeClick(emergencyTypes[0])} className="bg-white p-4 rounded-2xl flex flex-col items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-outline-variant/10 active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600 text-[20px]" style={{fontVariationSettings: '"FILL" 0'}}>warning</span>
            </div>
            <span className="text-[12px] font-bold text-on-surface">Robo</span>
          </button>
          
          {/* Incendio */}
          <button onClick={() => onTypeClick(emergencyTypes[1])} className="bg-white p-4 rounded-2xl flex flex-col items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-outline-variant/10 active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600 text-[20px]">local_fire_department</span>
            </div>
            <span className="text-[12px] font-bold text-on-surface">Incendio</span>
          </button>
          
          {/* Accidente */}
          <button onClick={() => onTypeClick(emergencyTypes[2])} className="bg-white p-4 rounded-2xl flex flex-col items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-outline-variant/10 active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-600 text-[20px]">directions_car</span>
            </div>
            <span className="text-[12px] font-bold text-on-surface">Accidente</span>
          </button>
          
          {/* Emerg. Médica */}
          <button onClick={() => onTypeClick(emergencyTypes[3])} className="bg-white p-4 rounded-2xl flex flex-col items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-outline-variant/10 active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-600 text-[20px]">favorite</span>
            </div>
            <span className="text-[12px] font-bold text-on-surface">Emerg. Médica</span>
          </button>
        </div>

        {/* Assistant Button */}
        <button onClick={onChatbot} className="mt-2 flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-[#5b8cff] to-[#7c66ff] text-white rounded-xl shadow-lg active:opacity-90 transition-all">
          <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
          <span className="text-[12px] font-bold">Hablar con asistente virtual</span>
        </button>
      </div>

      {/* Phone Footer */}
      <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center justify-center gap-1.5">
        <span className="material-symbols-outlined text-outline text-[16px]">call</span>
        <span className="text-[10px] font-medium text-outline">Central de Emergencias: 105</span>
      </div>
    </div>
  );
}

function StatusScreen({ emergency, submitting, error, onBack }) {
  const result = emergency?.result;

  if (submitting) {
    return (
      <div className="flex flex-col h-full bg-white px-5 pt-8 pb-4 absolute inset-0 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-container active:scale-95 transition-all text-on-surface">
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-[14px]">Enviando reporte</span>
          <div style={{ width: 36 }}></div>
        </div>

        <div className="flex flex-col items-center flex-1 justify-center pb-20">
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center animate-pulse shadow-[0_0_30px_rgba(0,61,155,0.3)] mb-6">
            <Clock size={40} color="white" />
          </div>
          <h1 className="text-xl font-bold text-on-surface mb-2">Enviando reporte...</h1>
          <p className="text-sm text-outline text-center px-4 mb-8">Conectando con la central de emergencias. Espera un momento.</p>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-white px-5 pt-8 pb-4 absolute inset-0 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-container active:scale-95 transition-all text-on-surface">
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-[14px]">Error</span>
          <div style={{ width: 36 }}></div>
        </div>

        <div className="flex flex-col items-center flex-1 justify-center pb-20">
          <div className="w-24 h-24 rounded-full bg-error flex items-center justify-center shadow-[0_0_30px_rgba(186,26,26,0.3)] mb-6">
            <TriangleAlert size={40} color="white" />
          </div>
          <h1 className="text-xl font-bold text-on-surface mb-2">Error al enviar</h1>
          <p className="text-sm text-outline text-center px-4 mb-8">No se pudo conectar con el servidor de emergencias. Verifica tu conexión e intenta nuevamente.</p>
          <button onClick={onBack} className="w-full py-3.5 bg-error text-white rounded-xl font-bold active:scale-95 transition-transform">
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  const priorityColor = result?.classification?.priority === 'Crítico' || result?.classification?.priority === 'Critico' ? '#ba1a1a' :
    result?.classification?.priority === 'Alto' ? '#f97316' : '#22c55e';
    
  const priorityBg = result?.classification?.priority === 'Crítico' || result?.classification?.priority === 'Critico' ? '#fef2f2' :
    result?.classification?.priority === 'Alto' ? '#fff7ed' : '#f0fdf4';

  return (
    <div className="flex flex-col h-full bg-white px-5 pt-8 pb-4 absolute inset-0 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-surface-container active:scale-95 transition-all text-on-surface">
          <ArrowLeft size={20} />
        </button>
        <span className="font-bold text-[14px]">Estado de solicitud</span>
        <div style={{ width: 36 }}></div>
      </div>

      <div className="flex flex-col items-center mb-6 mt-4">
        <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)] mb-4">
          <ShieldCheck size={36} color="white" />
        </div>
        <h1 className="text-xl font-bold text-on-surface mb-2">¡Ayuda en camino!</h1>
        <p className="text-xs text-outline text-center px-2">Tu emergencia ha sido registrada. Un operador está siendo asignado.</p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-sm mb-6 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} color="#22c55e" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-outline font-medium uppercase">Código de reporte</span>
            <span className="text-sm font-bold text-on-surface">{result?.id || '—'}</span>
          </div>
        </div>
        
        <div className="h-px bg-outline-variant/20 w-full"></div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: priorityBg }}>
            <TriangleAlert size={16} color={priorityColor} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-outline font-medium uppercase">Tipo de emergencia</span>
            <span className="text-sm font-bold text-on-surface">{result?.classification?.typeLabel || emergency?.label || 'Emergencia General'}</span>
          </div>
        </div>
        
        <div className="h-px bg-outline-variant/20 w-full"></div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-outline font-medium uppercase">Ubicación</span>
            <span className="text-sm font-bold text-on-surface">{result?.location || 'Comas, Lima - Vía Pública'}</span>
          </div>
        </div>
        
        <div className="h-px bg-outline-variant/20 w-full"></div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <Clock size={16} color="#22c55e" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-outline font-medium uppercase">Tiempo estimado</span>
            <span className="text-sm font-bold text-green-600">5 - 8 minutos</span>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <button className="w-full py-3.5 bg-error text-white rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[18px]">call</span>
          Llamar a emergencias
        </button>
        <button onClick={onBack} className="w-full py-3.5 bg-surface-container text-on-surface rounded-xl font-bold border border-outline-variant/50 hover:bg-surface-container-high active:scale-95 transition-colors">
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
