import { useState, useRef, useEffect, useCallback } from 'react';
import { classifyText, generateIncidentId, emergencyTypeOptions, safetyInfoTips, normalizePriority } from '../data/classificationEngine';

const steps = {
  WELCOME: 'welcome',
  REPORT_TYPE: 'report_type',
  REPORT_DESCRIPTION: 'report_description',
  REPORT_RESULT: 'report_result',
  CHECK_STATUS: 'check_status',
  SAFETY_INFO: 'safety_info',
};

const API_BASE = 'http://localhost:8080/api';

const locations = [
  'Av. Túpac Amaru 1500, Comas', 'Av. Universitaria 2200, Comas',
  'Jr. Los Olivos 345, Comas', 'Av. San Felipe 780, Comas',
  'Psje. Las Flores 120, Comas', 'Av. Revolución 560, Comas',
  'Calle Los Pinos 890, Comas', 'Av. Belaunde 430, Comas',
];

function getRandomLocation() {
  return locations[Math.floor(Math.random() * locations.length)];
}

function MessageBubble({ msg, onOptionClick, onTypeSelect }) {
  const isBot = msg.sender === 'bot';

  if (!isBot) {
    return (
      <div className="flex flex-col items-end gap-1 ml-auto max-w-[85%] animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="bg-primary text-on-primary p-3 rounded-2xl rounded-tr-none shadow-md text-sm">
          <p>{msg.text}</p>
          <span className="text-[10px] opacity-70 mt-1 block text-right">{msg.time}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 max-w-[85%] animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="w-8 h-8 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings: '"FILL" 1'}}>robot_2</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-outline-variant shadow-sm text-sm">
          {/* Support simple markdown-like bold */}
          <p dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}></p>

          {msg.classification && (
            <div className="mt-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-primary tracking-wider">CLASIFICACIÓN IA</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{msg.classification.typeLabel}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    msg.classification.priority === 'Crítico' ? 'bg-red-100 text-red-700' :
                    msg.classification.priority === 'Alto' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                }`}>
                  {msg.classification.priorityLabel}
                </span>
              </div>
              <span className="text-xs text-outline">Confianza: {Math.round(msg.classification.confidence * 100)}%</span>
              <span className="text-xs font-bold text-green-600">✓ Incidente registrado ID: {msg.incidentId}</span>
            </div>
          )}

          {msg.incidentStatus && (
            <div className="mt-3 p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/30 flex flex-col gap-2">
              <span className="text-[10px] font-bold text-primary tracking-wider">ESTADO DEL REPORTE</span>
              <div className="flex items-center gap-2">
                <span className="font-bold">{msg.incidentStatus.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    msg.incidentStatus.priority === 'Crítico' ? 'bg-red-100 text-red-700' :
                    msg.incidentStatus.priority === 'Alto' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                }`}>
                  {msg.incidentStatus.priorityLabel}
                </span>
              </div>
              <span className="text-xs text-on-surface-variant">{msg.incidentStatus.description}</span>
              <span className="text-xs font-bold text-primary">Estado: {msg.incidentStatus.status}</span>
            </div>
          )}

          <span className="text-[10px] text-outline mt-1 block text-right">{msg.time}</span>
        </div>

        {msg.options && (
          <div className="flex flex-wrap gap-2">
            {msg.options.map((opt, i) => (
              <button 
                key={i} 
                className="px-3 py-1.5 bg-white border border-outline-variant text-on-surface-variant rounded-full text-xs font-medium hover:bg-surface-container-high transition-colors active:scale-95"
                onClick={() => onOptionClick(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {msg.typeOptions && (
          <div className="flex flex-wrap gap-2">
            {msg.typeOptions.map((opt, i) => (
              <button 
                key={i} 
                className="px-4 py-2 bg-white border border-outline-variant text-on-surface-variant rounded-lg text-xs font-medium hover:border-primary transition-colors flex items-center gap-1 active:scale-95"
                onClick={() => onTypeSelect(opt.value)}
              >
                {opt.label === 'Robo' && <span className="material-symbols-outlined text-sm">running_with_errors</span>}
                {opt.label === 'Accidente' && <span className="material-symbols-outlined text-sm">car_crash</span>}
                {opt.label === 'Incendio' && <span className="material-symbols-outlined text-sm">local_fire_department</span>}
                {opt.label === 'Emergencia Médica' && <span className="material-symbols-outlined text-sm">medical_services</span>}
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {msg.safetyTips && (
          <div className="flex flex-col gap-2">
            {msg.safetyTips.map((tip, i) => (
              <details key={i} className="bg-white border border-outline-variant rounded-xl p-3 text-sm shadow-sm">
                <summary className="font-bold text-on-surface cursor-pointer focus:outline-none">{tip.title}</summary>
                <p className="text-on-surface-variant mt-2 text-xs">{tip.content}</p>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 max-w-[85%] animate-in fade-in duration-300">
      <div className="w-8 h-8 flex-shrink-0 bg-primary/10 rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-sm" style={{fontVariationSettings: '"FILL" 1'}}>robot_2</span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-outline-variant shadow-sm text-sm flex items-center gap-1 h-[44px]">
            <div className="w-1.5 h-1.5 bg-outline-variant rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-outline-variant rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
            <div className="w-1.5 h-1.5 bg-outline-variant rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
        </div>
      </div>
    </div>
  );
}

export default function Chatbot({ addIncident, setLastClassification, setCurrentView }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState('welcome');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const welcomeSentRef = useRef(false);

  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: false 
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendBotMessage = useCallback((text, extras = {}, delay = 600) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const newMsg = {
        id: Date.now(),
        sender: 'bot',
        text,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }),
        ...extras
      };
      setMessages(prev => [...prev, newMsg]);
    }, delay);
  }, []);

  useEffect(() => {
    if (messages.length === 0 && !welcomeSentRef.current) {
      welcomeSentRef.current = true;
      setTimeout(() => sendBotMessage(
        '¡Hola! Soy el asistente de **SafeDistrict**. ¿En qué puedo ayudarte hoy?',
        { options: ['Reportar emergencia', 'Estado de mi reporte', 'Información de seguridad'] }
      ), 500);
    }
  }, [messages.length, sendBotMessage]);

  const handleOptionClick = (option) => {
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'user', text: option,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
    }]);

    if (option === 'Reportar emergencia') {
      setStep(steps.REPORT_TYPE);
      setTimeout(() => sendBotMessage('¿Qué tipo de emergencia necesitas reportar?', { typeOptions: emergencyTypeOptions }), 400);
    } else if (option === 'Estado de mi reporte') {
      setStep(steps.CHECK_STATUS);
      setTimeout(() => sendBotMessage('Por favor, ingresa el código de tu reporte (ej: INC-2026-XXXX):'), 400);
    } else if (option === 'Información de seguridad') {
      setStep(steps.SAFETY_INFO);
      setTimeout(() => sendBotMessage('Aquí tienes información útil de seguridad para el distrito de Comas:', { safetyTips: safetyInfoTips }), 400);
      setTimeout(() => sendBotMessage('¿Necesitas algo más?', { options: ['Reportar emergencia', 'Información de seguridad', 'No, gracias'] }), 1200);
    } else if (option === 'No, gracias') {
      setTimeout(() => sendBotMessage('Recuerda que puedes contactarnos en cualquier momento. ¡Cuídate!'), 400);
    }
  };

  const handleTypeSelect = (typeValue) => {
    setStep(steps.REPORT_DESCRIPTION);
    const typeLabel = emergencyTypeOptions.find(o => o.value === typeValue).label;
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'user', text: typeLabel,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
    }]);
    setTimeout(() => sendBotMessage(`Has seleccionado **${typeLabel}**. Describe brevemente lo que está sucediendo (incluye ubicación si es posible):`), 400);
  };

  const handleReportSubmit = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'user', text: userText,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
    }]);
    setInput('');
    setIsTyping(true);

    const extractLocation = (text) => {
      const lower = text.toLowerCase();
      if (lower.includes('retablo')) return 'Av. El Retablo';
      if (lower.includes('trapiche')) return 'Av. Trapiche';
      if (lower.includes('universitaria')) return 'Av. Universitaria';
      if (lower.includes('belaunde')) return 'Av. Belaunde';
      if (lower.includes('san felipe')) return 'Av. San Felipe';
      if (lower.includes('revolucion')) return 'Av. Revolución';
      if (lower.includes('collique')) return 'Collique';
      if (lower.includes('sur')) return 'Zona Sur (Comas)';
      if (lower.includes('norte')) return 'Zona Norte (Comas)';
      if (lower.includes('este')) return 'Zona Este (Comas)';
      if (lower.includes('oeste')) return 'Zona Oeste (Comas)';
      if (lower.includes('centro')) return 'Zona Centro (Comas)';
      return getRandomLocation(); // Fallback si no menciona un lugar claro
    };

    try {
      const response = await fetch(`${API_BASE}/incidents/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userText,
          location: extractLocation(userText)
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      const classification = data.classification;

      setIsTyping(false);

      setTimeout(() => {
        addIncident({
          ...data,
          timeElapsed: '0 min'
        });

        setLastClassification({ ...classification, description: data.description, incidentId: data.id });

        sendBotMessage(
            `**Reporte registrado exitosamente**\n\nLos operadores han sido notificados.`,
            { classification, incidentId: data.id, options: ['Ver mis reportes', 'Reportar otra emergencia', 'Finalizar'] }
        );
        setStep(steps.REPORT_RESULT);
      }, 500);

    } catch (error) {
      console.error("Error al enviar el reporte:", error);
      setIsTyping(false);
      sendBotMessage(
          'Hubo un problema de conexión al procesar tu emergencia. Por favor, intenta nuevamente o llama directamente al 105.',
          { options: ['Reportar emergencia'] }
      );
      setStep(steps.WELCOME);
    }
  };

  const handleStatusCheck = async () => {
    if (!input.trim()) return;

    const incidentId = input.trim().toUpperCase();
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'user', text: incidentId,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
    }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/incidents/${incidentId}`);

      if (res.status === 400 || res.status === 404) {
        setIsTyping(false);
        sendBotMessage(`No se encontró un reporte con el código **${incidentId}**. Verifica el código e inténtalo de nuevo.`,
          { options: ['Reportar emergencia', 'Intentar de nuevo', 'Información de seguridad'] });
        setStep(steps.WELCOME);
        return;
      }

      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);

      const data = await res.json();
      const cls = data.classification;

      setIsTyping(false);
      sendBotMessage(
        `Aquí tienes el estado de tu reporte:`,
        {
          incidentStatus: {
            id: data.id,
            priority: cls?.priority || data.priority,
            priorityLabel: cls?.priorityLabel || data.priority,
            description: data.description,
            status: data.status,
          },
          options: ['Reportar emergencia', 'Consultar otro reporte', 'Información de seguridad', 'Finalizar']
        }
      );
      setStep(steps.REPORT_RESULT);

    } catch (error) {
      console.error('Error al consultar estado:', error);
      setIsTyping(false);
      sendBotMessage(
        'Hubo un problema de conexión al consultar el estado. Por favor, intenta nuevamente.',
        { options: ['Intentar de nuevo', 'Reportar emergencia'] }
      );
      setStep(steps.WELCOME);
    }
  };

  const handleInputSubmit = () => {
    if (step === steps.REPORT_DESCRIPTION) {
      handleReportSubmit();
    } else if (step === steps.CHECK_STATUS) {
      handleStatusCheck();
    }
  };

  const handleOptionFlow = (option) => {
    if (option === 'Ver mis reportes') {
      setMessages(prev => [...prev, {
        id: Date.now(), sender: 'user', text: option,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
      }]);
      setTimeout(() => sendBotMessage('Funcionalidad próximamente. Consulta el Dashboard del operador para ver incidentes activos.'), 400);
    } else if (option === 'Reportar otra emergencia') {
      handleOptionClick('Reportar emergencia');
    } else if (option === 'Finalizar' || option === 'No, gracias') {
      setMessages(prev => [...prev, {
        id: Date.now(), sender: 'user', text: option,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
      }]);
      setTimeout(() => sendBotMessage('Gracias por contactarte con SafeDistrict. ¡Cuídate!'), 400);
    } else if (option === 'Intentar de nuevo' || option === 'Consultar otro reporte') {
      setStep(steps.CHECK_STATUS);
      setTimeout(() => sendBotMessage('Ingresa el código de tu reporte (ej: INC-2026-XXXX):'), 400);
    } else {
      handleOptionClick(option);
    }
  };

  const shouldShowInput = step === steps.REPORT_DESCRIPTION || step === steps.CHECK_STATUS;

  return (
    <section className="flex-1 bg-surface-container-low p-8 overflow-y-auto flex flex-col items-center">
      {/* Secondary Navigation Tabs */}
      <div className="flex bg-surface-container-high p-1.5 rounded-xl mb-8 self-center border border-outline-variant shadow-sm">
        <button 
          onClick={() => setCurrentView('mobile')}
          className="flex items-center gap-2 px-6 py-2.5 text-on-surface-variant hover:text-on-surface font-label-bold transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">smartphone</span>
          App Móvil
        </button>
        <button 
          className="flex items-center gap-2 px-6 py-2.5 bg-surface text-primary rounded-lg shadow-sm font-label-bold border border-outline-variant/30 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: '"FILL" 1'}}>forum</span>
          Chatbot
        </button>
        <button 
          onClick={() => setCurrentView('powerbi')}
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

      {/* Mobile Device Simulator Container */}
      <div className="relative flex justify-center items-center w-full max-w-4xl py-12 my-4 bg-white/50 backdrop-blur-sm rounded-[40px] border border-outline-variant shadow-xl">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none rounded-[40px]" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #003d9b 1px, transparent 0)', backgroundSize: '32px 32px'}}></div>
        
        <div className="iphone-frame ring-8 ring-black/5" style={{ transform: 'scale(0.85)', transformOrigin: 'center center' }}>
          <div className="iphone-notch"></div>
          
          {/* iOS Status Bar */}
          <div className="h-10 w-full flex justify-between items-center px-8 pt-4">
            <span className="text-[14px] font-bold">{timeStr.slice(0, 5)}</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">signal_cellular_4_bar</span>
              <span className="material-symbols-outlined text-[18px]">wifi</span>
              <span className="material-symbols-outlined text-[18px]">battery_full</span>
            </div>
          </div>

          {/* Chat Header */}
          <div className="bg-primary px-6 pt-6 pb-4 flex items-center gap-4 text-on-primary">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined" style={{fontVariationSettings: '"FILL" 1'}}>robot_2</span>
            </div>
            <div>
              <h3 className="font-bold text-md leading-tight">SafeDistrict Assistant</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-xs opacity-90">En línea</span>
              </div>
            </div>
            <button className="ml-auto material-symbols-outlined opacity-80">more_vert</button>
          </div>

          {/* Chat Body */}
          <div className="chat-container flex flex-col gap-4 p-4 h-[calc(100%-40px-64px-300px)] overflow-y-auto bg-[#F4F5F7]">
            {messages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                onOptionClick={handleOptionFlow}
                onTypeSelect={handleTypeSelect}
              />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area & Keyboard */}
          <div className="absolute bottom-0 w-full bg-surface-container-low border-t border-outline-variant">
            <div className="p-3 flex items-center gap-2">
              <button className="material-symbols-outlined text-primary-container">add_circle</button>
              <div className="flex-1 bg-white border border-outline-variant rounded-full px-4 py-1.5 text-sm flex items-center">
                {shouldShowInput ? (
                  <input
                    type="text"
                    className="w-full bg-transparent outline-none text-on-surface-variant"
                    placeholder={step === steps.REPORT_DESCRIPTION ? 'Describe la emergencia...' : 'Ingresa el código...'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
                    autoFocus
                  />
                ) : (
                  <span className="text-on-surface-variant opacity-50">Selecciona una opción arriba...</span>
                )}
                {shouldShowInput && <div className="w-[1px] h-4 bg-primary animate-pulse ml-1"></div>}
              </div>
              <button 
                className={`material-symbols-outlined ${shouldShowInput && input.trim() ? 'text-primary' : 'text-outline-variant'}`}
                style={{fontVariationSettings: '"FILL" 1'}}
                onClick={handleInputSubmit}
                disabled={!shouldShowInput || !input.trim()}
              >
                send
              </button>
            </div>

            {/* iOS Keyboard Simulator */}
            <div className="bg-surface-dim p-2 flex flex-col gap-3 pb-8">
              <div className="flex justify-between gap-1">
                {['Q','W','E','R','T','Y','U','I','O','P'].map(k => (
                  <div key={k} className="h-[42px] bg-surface-container-highest border border-outline-variant rounded shadow-sm flex items-center justify-center text-on-surface font-medium flex-1 cursor-pointer active:scale-95 transition-transform" onClick={() => shouldShowInput && setInput(i => i + k.toLowerCase())}>{k}</div>
                ))}
              </div>
              <div className="flex justify-center gap-1 px-4">
                {['A','S','D','F','G','H','J','K','L'].map(k => (
                  <div key={k} className="h-[42px] bg-surface-container-highest border border-outline-variant rounded shadow-sm flex items-center justify-center text-on-surface font-medium flex-1 cursor-pointer active:scale-95 transition-transform" onClick={() => shouldShowInput && setInput(i => i + k.toLowerCase())}>{k}</div>
                ))}
              </div>
              <div className="flex justify-between gap-1">
                <div className="h-[42px] w-12 bg-surface-container-highest border border-outline-variant rounded shadow-sm flex items-center justify-center text-on-surface font-medium cursor-pointer active:scale-95 transition-transform"><span className="material-symbols-outlined text-[18px]">shift</span></div>
                {['Z','X','C','V','B','N','M'].map(k => (
                  <div key={k} className="h-[42px] bg-surface-container-highest border border-outline-variant rounded shadow-sm flex items-center justify-center text-on-surface font-medium flex-1 cursor-pointer active:scale-95 transition-transform" onClick={() => shouldShowInput && setInput(i => i + k.toLowerCase())}>{k}</div>
                ))}
                <div className="h-[42px] w-12 bg-surface-container-highest border border-outline-variant rounded shadow-sm flex items-center justify-center text-on-surface font-medium cursor-pointer active:scale-95 transition-transform" onClick={() => shouldShowInput && setInput(i => i.slice(0, -1))}><span className="material-symbols-outlined text-[18px]">backspace</span></div>
              </div>
              <div className="flex justify-between gap-1">
                <div className="h-[42px] w-16 text-xs bg-surface-container-highest border border-outline-variant rounded shadow-sm flex items-center justify-center text-on-surface font-medium cursor-pointer active:scale-95 transition-transform">123</div>
                <div className="h-[42px] w-10 bg-surface-container-highest border border-outline-variant rounded shadow-sm flex items-center justify-center text-on-surface font-medium cursor-pointer active:scale-95 transition-transform"><span className="material-symbols-outlined text-[18px]">language</span></div>
                <div className="h-[42px] w-10 bg-surface-container-highest border border-outline-variant rounded shadow-sm flex items-center justify-center text-on-surface font-medium cursor-pointer active:scale-95 transition-transform"><span className="material-symbols-outlined text-[18px]">mic</span></div>
                <div className="h-[42px] flex-[4] text-xs bg-surface-container-highest border border-outline-variant rounded shadow-sm flex items-center justify-center text-on-surface font-medium cursor-pointer active:scale-95 transition-transform" onClick={() => shouldShowInput && setInput(i => i + ' ')}>espacio</div>
                <div className="h-[42px] w-16 text-xs text-primary font-bold bg-surface-container-highest border border-outline-variant rounded shadow-sm flex items-center justify-center cursor-pointer active:scale-95 transition-transform" onClick={handleInputSubmit}>INTRO</div>
              </div>
            </div>
            
            {/* iOS Home Indicator */}
            <div className="w-1/3 h-1 bg-on-surface rounded-full mx-auto my-2 opacity-30"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
