const emergencyTypes = {
  robo: {
    keywords: ['robo', 'asalt', 'ladrón', 'ladron', 'susto', 'arma', 'pistola', 'cuchillo', 'amenaz', 'chantaj', 'hurto', 'delincuente', 'sospechoso'],
    basePriority: 'Alto',
    icon: 'shield-off'
  },
  accidente: {
    keywords: ['accidente', 'choque', 'atropell', 'vuelco', 'colisión', 'colision', 'impacto', 'chocado', 'chocar', 'siniestro'],
    basePriority: 'Alto',
    icon: 'car-front'
  },
  incendio: {
    keywords: ['incendio', 'fuego', 'quem', 'humo', 'llama', 'explosión', 'explosion', 'arder', 'ardiendo', 'quema', 'carbon', 'gas'],
    basePriority: 'Critico',
    icon: 'flame'
  },
  emergencia_medica: {
    keywords: ['médico', 'medico', 'ambulancia', 'herido', 'desmay', 'paro', 'respir', 'corazón', 'corazon', 'infarto', 'sangr', 'fractura', 'quemadura', 'intoxicación', 'intoxicacion', 'convulsión', 'convulsion', 'inconsciente', 'dolor', 'enfermo', 'emergencia'],
    basePriority: 'Critico',
    icon: 'heart-pulse'
  }
};

const urgencyKeywords = {
  Critico: ['inmediato', 'grave', 'muerte', 'desangr', 'incendio', 'explosión', 'explosion', 'derrumbe', 'secuestro', 'violento', 'arma de fuego', 'balacera', 'atentado', 'terrorista', 'paro cardíaco', 'paro cardiaco'],
  Alto: ['urgente', 'robo', 'asalto', 'accidente', 'choque', 'herido', 'sangrado', 'violencia', 'agresión', 'agresion', 'peligro'],
  Medio: ['molestia', 'ruido', 'discusión', 'discusion', 'desorden', 'caída', 'caida', 'dolor', 'fiebre'],
};

export function classifyText(text) {
  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let typeScores = {};
  let bestType = null;
  let bestTypeScore = 0;
  let matchedKeywords = [];

  for (const [type, config] of Object.entries(emergencyTypes)) {
    typeScores[type] = 0;
    for (const keyword of config.keywords) {
      if (normalized.includes(keyword)) {
        typeScores[type]++;
        matchedKeywords.push({ keyword, type });
      }
    }
    if (typeScores[type] > bestTypeScore) {
      bestTypeScore = typeScores[type];
      bestType = type;
    }
  }

  if (!bestType) {
    return {
      type: 'no_detectado',
      typeLabel: 'No detectado',
      priority: 'Medio',
      priorityLabel: 'Medio',
      confidence: 0.2,
      summary: 'No se pudo clasificar automáticamente. Se asignará prioridad media por defecto.',
      matchedKeywords: [],
      icon: 'help-circle'
    };
  }

  let urgencyScore = 0;
  let urgencyLevel = 'Medio';

  for (const [, levelKeywords] of Object.entries(urgencyKeywords)) {
    for (const keyword of levelKeywords) {
      if (normalized.includes(keyword)) {
        urgencyScore++;
      }
    }
  }

  const basePriority = emergencyTypes[bestType].basePriority;
  if (basePriority === 'Critico') {
    urgencyLevel = 'Critico';
  } else if (basePriority === 'Alto' && urgencyScore > 0) {
    urgencyLevel = 'Critico';
  } else if (basePriority === 'Alto') {
    urgencyLevel = 'Alto';
  } else if (urgencyScore > 2) {
    urgencyLevel = urgencyScore > 4 ? 'Critico' : 'Alto';
  }

  const typeLabels = {
    robo: 'Robo',
    accidente: 'Accidente',
    incendio: 'Incendio',
    emergencia_medica: 'Emergencia Médica'
  };

  const totalKeywords = matchedKeywords.length;
  const confidence = Math.min(0.5 + (totalKeywords * 0.1), 0.98);

  return {
    type: bestType,
    typeLabel: typeLabels[bestType],
    priority: urgencyLevel,
    priorityLabel: urgencyLevel === 'Critico' ? 'Crítico' : urgencyLevel,
    confidence: Math.round(confidence * 100) / 100,
    summary: `Emergencia clasificada como **${typeLabels[bestType]}** con prioridad **${urgencyLevel === 'Critico' ? 'Crítico' : urgencyLevel}**.`,
    matchedKeywords,
    icon: emergencyTypes[bestType].icon
  };
}

export function generateIncidentId() {
  const year = new Date().getFullYear();
  const random = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `INC-${year}-${random}`;
}

export const emergencyTypeOptions = [
  { value: 'robo', label: 'Robo', icon: 'shield-off' },
  { value: 'accidente', label: 'Accidente', icon: 'car-front' },
  { value: 'incendio', label: 'Incendio', icon: 'flame' },
  { value: 'emergencia_medica', label: 'Emergencia Médica', icon: 'heart-pulse' }
];

export const safetyInfoTips = [
  {
    title: 'Números de Emergencia',
    content: 'Central de Emergencias: 105 | Bomberos: 116 | Ambulancia: 106 | Defensa Civil: 115'
  },
  {
    title: 'Prevención de Robos',
    content: 'Mantén puertas y ventanas aseguradas. Instala cámaras de vigilancia. No publiques en redes sociales cuando estés de viaje.'
  },
  {
    title: 'Seguridad Vial',
    content: 'Respeta las señales de tránsito. Usa el cinturón de seguridad. No uses el celular mientras conduces.'
  },
  {
    title: 'Qué hacer en un Incendio',
    content: 'Mantén la calma. Llama al 116. Evacúa por las rutas de emergencia. No uses ascensores. Si hay humo, gatea cerca del suelo.'
  },
  {
    title: 'Primeros Auxilios',
    content: 'No muevas a un herido grave. Controla hemorragias con presión directa. Llama al 106 para una ambulancia.'
  }
];
