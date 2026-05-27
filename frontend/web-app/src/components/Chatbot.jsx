import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Camera, MapPin, ArrowUp } from 'lucide-react';
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

  return (
    <div className={`chat-bubble ${isBot ? 'bot' : 'user'}`}>
      {isBot && (
        <div className="bubble-avatar">
          <Bot size={16} color="#6366f1" />
        </div>
      )}
      <div className={`bubble-content ${isBot ? 'bot' : 'user'}`}>
        <div className="bubble-text">{msg.text}</div>

        {msg.classification && (
          <div className="bubble-classification">
            <div className="classif-header">CLASIFICACIÓN IA</div>
            <div className="classif-row">
              <span className="classif-type">{msg.classification.typeLabel}</span>
              <span className={`badge priority-${normalizePriority(msg.classification.priority)}`}>
                {msg.classification.priorityLabel}
              </span>
            </div>
            <div className="classif-confidence">Confianza: {Math.round(msg.classification.confidence * 100)}%</div>
            <div className="classif-id">✓ Incidente registrado con ID: {msg.incidentId}</div>
          </div>
        )}

        {msg.options && (
          <div className="bubble-options">
            {msg.options.map((opt, i) => (
              <button key={i} className="option-btn" onClick={() => onOptionClick(opt)}>
                {opt}
              </button>
            ))}
          </div>
        )}

        {msg.typeOptions && (
          <div className="bubble-options type-options">
            {msg.typeOptions.map((opt, i) => (
              <button key={i} className="option-btn type-btn" onClick={() => onTypeSelect(opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {msg.safetyTips && (
          <div className="bubble-tips">
            {msg.safetyTips.map((tip, i) => (
              <details key={i} className="tip-card">
                <summary className="tip-summary">{tip.title}</summary>
                <p className="tip-content">{tip.content}</p>
              </details>
            ))}
          </div>
        )}

        {msg.incidentStatus && (
          <div className="bubble-classification">
            <div className="classif-header">ESTADO DEL REPORTE</div>
            <div className="classif-row">
              <span className="classif-type">{msg.incidentStatus.id}</span>
              <span className={`badge priority-${normalizePriority(msg.incidentStatus.priority)}`}>
                {msg.incidentStatus.priorityLabel}
              </span>
            </div>
            <div className="classif-desc">{msg.incidentStatus.description}</div>
            <div className="classif-id">
              Estado: <span style={{ color: 'var(--priority-medium)' }}>{msg.incidentStatus.status}</span>
            </div>
          </div>
        )}

        {msg.jsonData && (
          <div className="json-card slide-up-fade">
            <div style={{ marginBottom: '8px', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Payload de Respuesta IA (JSON)</div>
            <pre style={{ margin: 0 }}>
              <code dangerouslySetInnerHTML={{ __html: msg.jsonData }}></code>
            </pre>
          </div>
        )}

        <span className="bubble-time">{msg.time}</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="chat-bubble bot">
      <div className="bubble-avatar">
        <Bot size={16} color="#6366f1" />
      </div>
      <div className="bubble-content bot typing">
        <div className="typing-dots">
          <span>●</span><span>●</span><span>●</span>
        </div>
      </div>
    </div>
  );
}

export default function Chatbot({ addIncident, setLastClassification }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState('welcome');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const welcomeSentRef = useRef(false);

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
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setTimeout(() => sendBotMessage(`Has seleccionado **${typeLabel}**. Describe brevemente lo que está sucediendo (incluye ubicación si es posible):`), 400);
  };

  const handleReportSubmit = async () => {
    if (!input.trim()) return;

    const userText = input;
    // 1. Mostramos el mensaje del usuario en el chat
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'user', text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInput('');

    // 2. Activamos el indicador de que el bot está "pensando"
    setIsTyping(true);

    try {
      // 3. Hacemos la petición real al backend en Spring Boot
      const response = await fetch(`${API_BASE}/incidents/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userText,
          location: getRandomLocation() // Mantenemos tu función mock para la ubicación por ahora
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      // 4. Recibimos la respuesta estructurada desde Java
      const data = await response.json();
      const classification = data.classification;

      setIsTyping(false);

      // 5. Actualizamos el estado global (Dashboard) y el Chatbot
      setTimeout(() => {
        // Agregamos el incidente real. Le sumamos 'timeElapsed' para no romper tu UI actual.
        addIncident({
          ...data,
          timeElapsed: '0 min'
        });

        setLastClassification({ ...classification, description: data.description, incidentId: data.id });

        // Formateamos el JSON para mostrarlo en el frontend
        const jsonFormatted = JSON.stringify(data, null, 2)
          .replace(/"(.*?)":/g, '<span class="json-key">"$1"</span>:')
          .replace(/: "(.*?)"/g, ': <span class="json-string">"$1"</span>')
          .replace(/: (\d+(?:\.\d+)?)/g, ': <span class="json-number">$1</span>')
          .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>');

        // Enviamos el mensaje final del bot con la data real de la BD y la IA
        sendBotMessage(
            `**Reporte registrado exitosamente**\n\n**ID:** ${data.id}\n**Tipo:** ${classification.typeLabel}\n**Prioridad:** ${classification.priorityLabel}\n**Confianza:** ${Math.round(classification.confidence * 100)}%\n\n${classification.summary}\n\nLos operadores han sido notificados.`,
            { classification, incidentId: data.id, jsonData: jsonFormatted, options: ['Ver mis reportes', 'Reportar otra emergencia', 'Finalizar'] }
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

  const handleInputSubmit = () => {
    if (step === steps.REPORT_DESCRIPTION) {
      handleReportSubmit();
    } else if (step === steps.CHECK_STATUS) {
      handleStatusCheck();
    }
  };

  const handleStatusCheck = async () => {
    if (!input.trim()) return;

    const incidentId = input.trim().toUpperCase();
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'user', text: incidentId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
        `**Estado del reporte ${data.id}**\n\n**Tipo:** ${cls?.typeLabel || data.type}\n**Prioridad:** ${cls?.priorityLabel || data.priority}\n**Ubicación:** ${data.location}\n**Estado:** ${data.status}`,
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

  const handleOptionFlow = (option) => {
    if (option === 'Ver mis reportes') {
      setMessages(prev => [...prev, {
        id: Date.now(), sender: 'user', text: option,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setTimeout(() => sendBotMessage('Funcionalidad próximamente. Consulta el Dashboard del operador para ver incidentes activos.'), 400);
    } else if (option === 'Reportar otra emergencia') {
      handleOptionClick('Reportar emergencia');
    } else if (option === 'Finalizar' || option === 'No, gracias') {
      setMessages(prev => [...prev, {
        id: Date.now(), sender: 'user', text: option,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
    <div className="chatbot-wrapper">
      <div className="chatbot-card">
        <div className="chatbot-header">
          <div className="header-left">
            <div className="header-avatar">
              <Bot size={22} color="white" />
            </div>
            <div className="header-info">
              <h2>SafeDistrict Assistant</h2>
              <div className="online-status">
                <span className="online-dot" />
                En línea
              </div>
            </div>
          </div>
        </div>

        <div className="chatbot-body">
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

        {shouldShowInput && (
          <div className="chatbot-input-bar">
            <button className="input-icon-btn">
              <Camera size={18} color="#9ca3af" />
            </button>
            <button className="input-icon-btn">
              <MapPin size={18} color="#9ca3af" />
            </button>
            <input
              type="text"
              className="chatbot-input"
              placeholder={
                step === steps.REPORT_DESCRIPTION
                  ? 'Describe la emergencia...'
                  : 'Ingresa el código del reporte...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInputSubmit()}
              autoFocus
            />
            <button className="send-btn" onClick={handleInputSubmit}>
              <ArrowUp size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
