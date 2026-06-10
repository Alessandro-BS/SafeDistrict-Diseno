# Diagramas del Sistema: SafeDistrict

Este documento recopila los diagramas principales que modelan el comportamiento y flujo de datos del sistema.

## 1. Diagrama de Flujo: Reporte de Incidente por Ciudadano (Chatbot)

Describe el proceso paso a paso desde que un ciudadano interactúa con el chatbot hasta que el incidente es clasificado y despachado.

```mermaid
sequenceDiagram
    actor Ciudadano
    participant Frontend as Web App (React)
    participant Backend as Spring Boot API
    participant IA as Google Gemini (Spring AI)
    participant DB as PostgreSQL
    participant Operador
    
    Ciudadano->>Frontend: Abre Simulador de Chatbot
    Frontend-->>Ciudadano: Saludo Automático
    Ciudadano->>Frontend: Describe la emergencia
    Frontend->>Backend: POST /api/incident/report {text, location}
    Backend->>IA: Analiza texto (Prompt)
    IA-->>Backend: Devuelve {type, priority, confidence}
    Backend->>DB: Guarda Incidente (INSERT)
    Backend-->>Frontend: Response (200 OK, incident_id)
    Frontend->>Operador: Refleja nuevo incidente en Mapa
    Operador->>Frontend: "Despachar Unidad"
    Frontend->>Backend: PUT /api/incident/{id}/dispatch
    Backend->>DB: Actualiza estado a "En Ruta"
    Backend-->>Frontend: Confirma despacho
```

## 2. Diagrama Entidad-Relación (Base de Datos)

Modelo conceptual de la base de datos `safedistrict_db`.

```mermaid
erDiagram
    INCIDENT ||--o{ DISPATCH : "genera"
    INCIDENT {
        string id PK "Ej: INC-2026-0012"
        string description
        string location
        string type "Ej: robo, incendio"
        string priority "Ej: Critico, Alto"
        float confidence
        string status "Pendiente, En Ruta, Resuelto"
        timestamp created_at
    }
    DISPATCH {
        int id PK
        string incident_id FK
        string unit_id
        int estimated_eta "Minutos"
        timestamp dispatched_at
    }
```

## 3. Diagrama de Componentes (Frontend React)

Estructura de la interfaz de usuario en la Web App.

```mermaid
graph TD
    App[App.jsx] --> Sidebar[Sidebar.jsx]
    App --> Dashboard[Dashboard.jsx]
    App --> Chatbot[Chatbot.jsx]
    App --> MobileApp[App Móvil View]
    
    Dashboard --> Map[IncidentMap.jsx]
    Dashboard --> Panel[RightIncidentPanel.jsx]
    
    Panel --> Classification[Motor de Clasificación Local]
```
