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
  },
  asistencia: {
    keywords: ['gato', 'mascota', 'arbol', 'árbol', 'basura', 'ruido', 'fiesta', 'musica', 'música', 'vecino', 'molestia', 'bache', 'agua', 'luz', 'calle'],
    basePriority: 'Bajo',
    icon: 'info'
  }
};

const urgencyKeywords = {
  Critico: ['inmediato', 'grave', 'muerte', 'desangr', 'incendio', 'explosión', 'explosion', 'derrumbe', 'secuestro', 'violento', 'arma de fuego', 'balacera', 'atentado', 'terrorista', 'paro cardíaco', 'paro cardiaco'],
  Alto: ['urgente', 'robo', 'asalto', 'accidente', 'choque', 'herido', 'sangrado', 'violencia', 'agresión', 'agresion', 'peligro'],
  Medio: ['molestia', 'ruido', 'discusión', 'discusion', 'desorden', 'caída', 'caida', 'dolor', 'fiebre'],
  Bajo: ['tranquilo', 'calma', 'informacion', 'consulta', 'duda', 'despues']
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
      priority: 'Bajo',
      priorityLabel: 'Bajo',
      confidence: 0.2,
      summary: 'No se encontraron palabras clave de emergencia. Se asignará prioridad baja por defecto.',
      matchedKeywords: [],
      icon: 'help-circle'
    };
  }

  let urgencyScore = 0;
  
  for (const [, levelKeywords] of Object.entries(urgencyKeywords)) {
    for (const keyword of levelKeywords) {
      if (normalized.includes(keyword)) {
        urgencyScore++;
      }
    }
  }

  const basePriority = emergencyTypes[bestType].basePriority;
  let urgencyLevel = basePriority; // Initialize with base priority

  if (basePriority === 'Critico') {
    urgencyLevel = 'Critico';
  } else if (basePriority === 'Alto' && urgencyScore > 0) {
    urgencyLevel = 'Critico';
  } else if (basePriority === 'Alto') {
    urgencyLevel = 'Alto';
  } else if (basePriority === 'Bajo' && urgencyScore > 1) {
    urgencyLevel = 'Medio';
  } else if (basePriority === 'Medio' && urgencyScore > 2) {
    urgencyLevel = 'Alto';
  }

  const typeLabels = {
    robo: 'Robo',
    accidente: 'Accidente',
    incendio: 'Incendio',
    emergencia_medica: 'Emergencia Médica',
    asistencia: 'Asistencia / Reporte Menor'
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

export function normalizePriority(p) {
  if (!p) return 'Medio';
  const strP = String(p).toLowerCase().trim();

  const map = {
    // Crítico
    critico: 'Crítico',
    crítico: 'Crítico',
    critical: 'Crítico',
    p1: 'Crítico',
    '1': 'Crítico',
    urgente: 'Crítico',

    // Alto
    alto: 'Alto',
    high: 'Alto',
    p2: 'Alto',
    '2': 'Alto',

    // Medio
    medio: 'Medio',
    medium: 'Medio',
    normal: 'Medio',
    p3: 'Medio',
    '3': 'Medio',

    // Bajo
    bajo: 'Bajo',
    low: 'Bajo',
    p4: 'Bajo',
    '4': 'Bajo',
  };

  return map[strP] || 'Medio';
}

export function getTimeElapsed(createdAt) {
  if (!createdAt) return null;

  let created;
  if (typeof createdAt === 'string') {
    const cleaned = createdAt.includes('T') ? createdAt : createdAt.replace(' ', 'T');
    created = new Date(cleaned);
  } else {
    created = new Date(createdAt);
  }

  if (isNaN(created.getTime())) return null;

  const diffMs = Date.now() - created.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return '0 min';
  if (diffMin < 60) return `${diffMin} min`;

  const diffH = Math.floor(diffMin / 60);
  const remMin = diffMin % 60;
  if (diffH < 24) return `${diffH}h ${remMin}min`;

  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ${diffH % 24}h`;
}

export function translateType(type) {
  if (!type) return 'Desconocido';
  const raw = type.toLowerCase().trim();
  const map = {
    fire: 'Incendio',
    fire_emergency: 'Incendio',
    theft: 'Robo',
    robbery: 'Robo',
    accident: 'Accidente',
    traffic_accident: 'Accidente de Tránsito',
    medical: 'Emergencia Médica',
    medical_emergency: 'Emergencia Médica',
    crime_armed: 'Robo Armado',
    criminal_assault: 'Asalto',
    crime: 'Delito',
    emergency_general: 'Emergencia General',
    security_incident: 'Incidente de Seguridad',
    suspicious_activity: 'Actividad Sospechosa',
    vandalism: 'Vandalismo',
    domestic_violence: 'Violencia Doméstica'
  };
  
  if (map[raw]) return map[raw];
  
  // Fallback: replace underscores with spaces and capitalize
  return raw.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
