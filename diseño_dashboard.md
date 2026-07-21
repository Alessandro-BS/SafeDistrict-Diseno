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

El diseño visual de SafeDistrict ha sido optimizado con una paleta cromática profesional que previene la fatiga cognitiva del personal de despacho que opera durante jornadas de 8 a 12 horas.

### 2.1 Colores Base (Estructura y Confianza)
Para evitar los contrastes extremos que agotan la vista del operador, se ha desterrado el uso del blanco puro como fondo de lienzo:
* **Fondo Principal (Gris Azulado Muy Claro):** `#F4F6F9` o `#F8FAFC`. Aporta una apariencia limpia, moderna y de software gubernamental o corporativo de alta gama.
* **Fondo de Tarjetas/Contenedores:** `#FFFFFF`. Genera un sutil pero claro contraste sobre el fondo gris claro para delimitar las áreas de trabajo.
* **Color de Identidad / Marca (Azul Policial/Institucional):** `#1E3A8A`. Un azul marino profundo que transmite autoridad, seriedad, institucionalidad y confianza, reemplazando los celestes genéricos.
* **Texto Principal / Títulos:** `#0F172A`. Un azul pizarra muy oscuro (casi negro), mucho más suave y moderno que el negro puro, reduciendo el deslumbramiento.

### 2.2 Colores de Estado y Prioridad (Semáforo de Emergencia)
En lugar de emplear colores puros muy saturados que producen estrés visual y restan profesionalismo, se implementa una escala pastel/desaturada para la tabla de **Nivel de Prioridad**:
* **Prioridad Baja (Verde Calmo):** `#10B981` (para texto directo) o un fondo de celda `#E6F4EA` con texto `#137333`.
* **Prioridad Media (Ámbar/Naranja):** `#F59E0B` (para texto directo) o un fondo de celda `#FEF7E0` con texto `#B06000`.
* **Prioridad Alta / Crítica (Rojo Alerta):** `#EF4444` (para texto directo) o un fondo de celda `#FCE8E6` con texto `#C5221F`.

### 2.3 Colores para Categorías de Incidencias (Mapa y Gráficos)
Para evitar la confusión visual con el semáforo de prioridades en el mapa de calor y el gráfico de barras, se utilizan tonos fríos, neutros y especializados para representar los tipos de reporte:
* **Accidente de Tránsito:** `#475569` (Gris pizarra - neutral).
* **Incendio:** `#D97706` (Naranja oscuro - precaución).
* **Robo:** `#3B82F6` (Azul medio).
* **Emergencia Médica:** `#06B6D4` (Turquesa / Cian - color hospitalario estándar).
* **Sospecha / Actividad Sospechosa:** `#6B7280` (Gris medio).

### 2.4 Resumen de Aplicación Práctica en Power BI
* **El fondo del lienzo:** Se configura con el color `#F8FAFC` o `#F4F6F9`.
* **Las barras de los gráficos:** Se pintan con el Azul Institucional (`#1E3A8A`) para unificar la marca.
* **El gráfico de dona (Total Incidentes por Estado IA):** Utiliza `#1E3A8A` para representar los casos **Validados** y un gris suave como `#E2E8F0` para los **Descartados**. Esto dirige instantáneamente la atención del operador hacia los datos de alto valor operativo.

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