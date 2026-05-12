# SafeDistrict - Sistema IA para Priorización de Emergencias

SafeDistrict es una solución tecnológica diseñada para optimizar la gestión de emergencias mediante Inteligencia Artificial. El sistema permite la recepción de reportes de ciudadanos, su clasificación automática y la visualización jerárquica de incidentes para los operadores de respuesta.

Este repositorio contiene la **versión estática en React** (Prototipo UI/UX) del frontend de SafeDistrict.

## Características Principales

El prototipo actual incluye los siguientes módulos y funcionalidades:

1. **Dashboard Táctico del Operador**:
   - Panel interactivo con estadísticas en tiempo real (incidentes activos, críticos, tiempos de respuesta).
   - **Mapa Táctico (`IncidentMap`)**: Un mapa interactivo que posiciona los incidentes geográficamente de acuerdo a su tipo (incendio, accidente, emergencia médica, etc.) y muestra un resplandor ("halo") basado en la prioridad.
   - Panel de detalles y despachos (`RightIncidentPanel`) para la gestión individual de cada emergencia.

2. **Simulador de Reporte Ciudadano (`MobileApp`)**:
   - Una interfaz móvil simulada que permite a los ciudadanos enviar alertas.
   - Integración con un simulador de Inteligencia Artificial (Procesamiento de Lenguaje Natural - NLP) que actúa como primer nivel de triaje (Chatbot) y evalúa el nivel de urgencia automáticamente.

3. **Arquitectura y Diseño**:
   - Interfaz de usuario "Glassmorphism" con diseño oscuro, pensada para centros de monitoreo.
   - Alertas visuales con código de colores según el nivel de urgencia: **Crítico** (Rojo), **Alto** (Naranja), **Medio** (Amarillo) y **Bajo** (Verde).
   - Aplicación responsiva construida con Vite y React, sin dependencias de frameworks CSS externos, priorizando código limpio en CSS puro.

## Estructura del Proyecto

```text
/safedistrict-app
 ├── /src
 │   ├── /components
 │   │   ├── Chatbot.jsx            # Interfaz de triaje automático (NLP)
 │   │   ├── Dashboard.jsx          # Panel principal del operador
 │   │   ├── IncidentMap.jsx        # Mapa táctico con geolocalización simulada
 │   │   ├── MobileApp.jsx          # Vista móvil para el reporte ciudadano
 │   │   ├── PillNav.jsx            # Componente de navegación
 │   │   ├── RightIncidentPanel.jsx # Panel lateral de información de incidentes
 │   │   └── Sidebar.jsx            # Menú lateral del dashboard
 │   ├── /data
 │   │   └── mockData.js            # Datos simulados para pruebas
 │   ├── App.jsx                    # Componente principal integrador
 │   ├── index.css                  # Estilos globales y variables de diseño
 │   └── main.jsx                   # Punto de entrada de React
```

## Requisitos Previos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior) en tu computadora.

## Instalación y Uso

Sigue estos pasos para correr la aplicación en tu entorno local:

1. Ingresa a la carpeta de la aplicación React:
   ```bash
   cd safedistrict-app
   ```

2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

4. Abre tu navegador y dirígete a la dirección local que Vite te indique (por defecto es `http://localhost:5173/`).

## Decisiones Técnicas
- **React + Vite**: Elegidos por su velocidad de compilación y excelente experiencia de desarrollo para prototipado rápido.
- **Lucide React**: Librería de iconos vectoriales ligera que mantiene la consistencia visual moderna del proyecto.
- **CSS Vanilla (Variables)**: Para mantener un control detallado de la estética "Dark Mode" y animaciones sin depender de librerías CSS pesadas.
