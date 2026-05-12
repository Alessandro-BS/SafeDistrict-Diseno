import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Camera, MapPin, ArrowUp } from 'lucide-react';
import { classifyText, generateIncidentId, emergencyTypeOptions, safetyInfoTips } from '../data/classificationEngine';

const steps = {
  WELCOME: 'welcome',
  REPORT_TYPE: 'report_type',
  REPORT_DESCRIPTION: 'report_description',
  REPORT_RESULT: 'report_result',
  CHECK_STATUS: 'check_status',
  SAFETY_INFO: 'safety_info',
};

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
              <span className={`badge priority-${msg.classification.priority === 'Critico' ? 'Crítico' : msg.classification.priority}`}>
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
              <span className={`badge priority-${msg.incidentStatus.priority === 'Critico' ? 'Crítico' : msg.incidentStatus.priority}`}>
                {msg.incidentStatus.priorityLabel}
              </span>
            </div>
            <div className="classif-desc">{msg.incidentStatus.description}</div>
            <div className="classif-id">
              Estado: <span style={{ color: 'var(--priority-medium)' }}>{msg.incidentStatus.status}</span>
            </div>
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

  const handleReportSubmit = () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'user', text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInput('');

    const classification = classifyText(userText);
    const incidentId = generateIncidentId();

    const newIncident = {
      id: incidentId,
      description: userText.length > 40 ? userText.substring(0, 40) + '...' : userText,
      location: getRandomLocation(),
      priority: classification.priority === 'Critico' ? 'Crítico' : classification.priority,
      timeElapsed: '0 min', status: 'Pendiente',
      reporter: 'Ciudadano', type: classification.type,
      confidence: classification.confidence,
    };

    setTimeout(() => {
      addIncident(newIncident);
      setLastClassification({ ...classification, description: newIncident.description, incidentId });

      sendBotMessage(
        `**Reporte registrado exitosamente**\n\n**ID:** ${incidentId}\n**Tipo:** ${classification.typeLabel}\n**Prioridad:** ${classification.priorityLabel}\n**Confianza:** ${Math.round(classification.confidence * 100)}%\n\n${classification.summary}\n\nLos operadores han sido notificados.`,
        { classification, incidentId, options: ['Ver mis reportes', 'Reportar otra emergencia', 'Finalizar'] }
      );
      setStep(steps.REPORT_RESULT);
    }, 1500);
  };

  const handleInputSubmit = () => {
    if (step === steps.REPORT_DESCRIPTION) {
      handleReportSubmit();
    } else if (step === steps.CHECK_STATUS) {
      const userText = input;
      setMessages(prev => [...prev, {
        id: Date.now(), sender: 'user', text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setInput('');
      setTimeout(() => {
        sendBotMessage(`No se encontró un reporte con el código **${userText}**. Verifica el código e inténtalo de nuevo.`,
          { options: ['Reportar emergencia', 'Intentar de nuevo', 'Información de seguridad'] });
        setStep(steps.WELCOME);
      }, 1000);
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
    } else if (option === 'Intentar de nuevo') {
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
