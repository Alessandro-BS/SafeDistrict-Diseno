# SafeDistrict: Sistema Inteligente de Priorización de Emergencias
## Propuesta de Diseño de Dashboard de Control Operativo (Power BI)
**Curso: Diseño de Productos y Servicios — Universidad Tecnológica del Perú (UTP)**

---

Este documento presenta la arquitectura detallada, la interfaz de usuario (UI/UX), los KPIs y el plan de implementación de un prototipo de Dashboard en **Power BI** para **SafeDistrict**. Esta herramienta está diseñada para alinear los objetivos del curso (comunicación efectiva, sostenibilidad y propuesta de valor) con una solución tecnológica robusta que optimice la respuesta ante emergencias en el distrito de Comas, Lima.

---

## 1. Arquitectura de Información y KPIs

El dashboard de control operativo de emergencias está estructurado jerárquicamente para facilitar la toma de decisiones inmediata en entornos de alta presión.

### Panel Superior: Tarjetas de KPIs Principales
* **Total de Incidentes Reportados:** Volumen total acumulado de reportes en las últimas 24 horas.
* **Tasa de Filtrado de IA (%):** Porcentaje de reportes falsos, duplicados o spam descartados automáticamente por el modelo de IA. Este indicador demuestra de forma directa la mitigación del problema de saturación en las centrales de Serenazgo.
* **Tiempo Promedio de Respuesta:** Métrica crítica expresada en minutos que mide el lapso entre la validación de la alerta y la asignación efectiva de unidades.
* **Nivel de Emergencias Críticas Activas:** Conteo dinámico de incidentes prioritarios que requieren atención inmediata (Color Rojo).

### Sección Izquierda: Filtros y Control de Flujo
Panel lateral interactivo que permite a los operadores segmentar los datos de manera ágil:
* **Sector / Zona:** Comas Norte, Comas Sur, Collique, San Agustín, La Balanza, etc.
* **Tipo de Emergencia:** Robo, Accidente de Tránsito, Emergencia Médica, Incendio, Sospecha.
* **Estado del Reporte:** Pendiente, En Proceso, Atendido.

### Sección Central: Visualización Espacial y Lista de Prioridades
* **Mapa de Calor en Tiempo Real (Map Visual):** Representación geográfica interactiva de Comas para la identificación de zonas calientes (*hotspots*) de delincuencia, delincuencia común o siniestros.
* **Tabla de Emergencias Priorizadas (Ordenada por IA):**
    Visualización detallada en formato de matriz que prioriza dinámicamente los incidentes aplicando código de colores:
    
    | ID | Tipo de Emergencia | Ubicación | Prioridad | Tiempo Espera | Estado |
    | :--- | :--- | :--- | :--- | :--- | :--- |
    | #1042 | Robo con Violencia | Av. Tupac Amaru - Collique | 🔴 Alta | 1.5 min | Pendiente |
    | #1043 | Accidente de Tránsito | Av. Universitaria | 🟡 Media | 4.2 min | En Proceso |
    | #1044 | Contaminación Sonora | Jr. Libertad | 🟢 Baja | 12.0 min | Pendiente |

### Sección Derecha: Gráficos Analíticos de Apoyo
* **Gráfico de Barras (Incidentes por Hora):** Permite predecir patrones de demanda y horas punta para realizar patrullajes preventivos sostenibles.
* **Gráfico de Anillo (Alertas Reales vs. Descartadas):** Demuestra visualmente el ahorro de recursos públicos gracias al pre-filtrado algorítmico del sistema.

---

## 2. Guía de Diseño Visual (UI/UX) y Usabilidad

El diseño visual está optimizado para evitar la fatiga cognitiva del personal de despacho que opera durante jornadas largas.

### Paleta de Colores Operativa (Accesible y Profesional)
* **Fondo de Interfaz:** `#F8F9FA` (Gris ultra-claro) o Blanco puro para evitar contrastes duros y cansancio ocular.
* **Prioridad Alta (Crítica):** `#D9383A` (Rojo vibrante de alta visibilidad).
* **Prioridad Media (Moderada):** `#F2B705` (Amarillo cálido, sin distorsión visual).
* **Prioridad Baja (Baja):** `#2CA649` (Verde esmeralda suave).
* **Textos Principales:** `#1A1D20` (Antracita oscuro para garantizar legibilidad de acuerdo con las pautas WCAG de contraste).

### Tipografía y Jerarquía
* **Fuente Principal:** *Segoe UI* o *Arial* (Fuentes estándar del sistema que previenen errores de renderizado en Power BI Service).
* **Tamaños Recomendados:**
    * **KPIs principales (Tarjetas):** 28pt - 32pt (Negrita).
    * **Títulos de sección:** 14pt (Negrita).
    * **Tablas y etiquetas de gráficos:** 10pt (Regular/Semibold).

### Inclusión y Sostenibilidad
* **Uso de Iconos + Texto:** Las prioridades no dependen exclusivamente del color (previniendo barreras para usuarios con daltonismo). Se incluye siempre texto aclaratorio junto al color (ej. "🔴 Alta").
* **Tooltips Enriquecidos:** Cada visualización posee información contextual explicativa al pasar el cursor, reduciendo el tiempo de capacitación de nuevos operadores.
* **Eficiencia Energética (Sostenibilidad):** El panel está optimizado para consultas de datos programadas e indexadas que reducen la carga del servidor de base de datos, reduciendo indirectamente la huella de carbono de la infraestructura TI local.

---

## 3. Plan de Implementación Paso a Paso (Prototipo en Power BI)

Para llevar esta propuesta del papel a un prototipo interactivo en el aula de la UTP, se sugiere seguir las siguientes fases metodológicas:

### Fase 1: Simulación y Preparación de Datos (Mock Data)
1.  **Creación del Dataset:** Generar una tabla de datos ficticia en formato Excel o CSV que simule el histórico de llamadas de emergencia del distrito de Comas (aprox. 500 filas).
2.  **Variables Clave:** Incluir variables de geolocalización (Latitud/Longitud específicas de Comas), marca de tiempo (*Timestamp*), tipo de reporte, confiabilidad del usuario y una puntuación de prioridad numérica autogenerada (de 1 a 100).

### Fase 2: Modelado en Power BI
1.  **Carga mediante Power Query:** Importar el set de datos simulado.
2.  **Métricas DAX clave:** Crear medidas calculadas personalizadas para dinamizar el reporte:
    ```dax
    // Cálculo de Alertas Filtradas automáticamente
    Tasa_Filtrado_IA = DIVIDE(
        CALCULATE(COUNT(Emergencias[ID]), Emergencias[Estado_IA] = "Descartado"),
        COUNT(Emergencias[ID]),
        0
    )
    ```
    ```dax
    // Tiempo promedio de respuesta en minutos
    Tiempo_Prom_Respuesta = AVERAGE(Emergencias[Tiempo_Respuesta_Min])
    ```

### Fase 3: Diseño de la Interfaz y Visuales
1.  **Maquetación del Grid:** Estructurar el lienzo en una proporción estándar de `16:9` (1280 x 720 píxeles).
2.  **Configuración del Mapa:** Utilizar el componente visual nativo de Mapas de Bing o Mapbox en Power BI para cargar los hotspots de Comas mediante las coordenadas generadas.
3.  **Formato Condicional:** Aplicar reglas de color en la tabla de emergencias según la prioridad para automatizar el color de fondo/texto (Rojo, Amarillo, Verde).

### Fase 4: Validación y Feedback con Stakeholders
1.  **Prueba de Comunicación:** Presentar el prototipo interactivo (utilizando la función de filtros dinámicos) simulando un pico de delincuencia nocturno para verificar cómo la IA redistribuye los recursos en la pantalla en tiempo real.
2.  **Alineación Académica:** Demostrar cómo el diseño cumple con la propuesta de valor del curso de la UTP: un sistema de emergencias inclusivo, que optimiza el gasto público municipal (Sostenibilidad) y que se comunica visualmente de manera clara e intuitiva ante cualquier perfil técnico u operativo (Comunicación Efectiva).
