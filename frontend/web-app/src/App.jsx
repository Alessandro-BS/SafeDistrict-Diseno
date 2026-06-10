import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import MobileApp from './components/MobileApp';
import Reports from './components/Reports';
import PillNav from './components/PillNav';
import { incidentsData as initialIncidents } from './data/mockData';

const API_BASE = 'http://localhost:8080/api';

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono-data text-label-bold text-primary block" id="current-time">
      {time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
    </span>
  );
}

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [incidents, setIncidents] = useState([]);
  const [lastClassification, setLastClassification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/incidents`);
      if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);
      const data = await res.json();
      setIncidents(data);
    } catch (err) {
      console.error('Error al conectar con el servidor, usando datos de prueba:', err);
      setError(err.message);
      setIncidents(initialIncidents);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const addIncident = (incident) => {
    setIncidents(prev => [incident, ...prev]);
  };

  const getTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Panel de Comando';
      case 'chat': return 'Simulador de Reportes Ciudadanos';
      case 'reports': return 'Reportes del Ciudadano';
      case 'mobile': return 'App Móvil SafeDistrict';
      default: return 'SafeDistrict';
    }
  };

  return (
    <div className="bg-surface text-on-surface h-screen overflow-hidden flex">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        lastClassification={lastClassification}
      />

      <main className="ml-sidebar-width flex-1 h-full flex flex-col relative bg-surface-container-lowest">
        <header className="h-16 border-b border-outline-variant bg-surface px-6 z-40">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-6">
              <h1 className="font-headline-md text-headline-md text-on-surface">{getTitle()}</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <Clock />
                <span className="text-[11px] text-outline">Operador 01 - Turno Mañana</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {currentView === 'dashboard' && (
            <Dashboard
              incidents={incidents}
              lastClassification={lastClassification}
              loading={loading}
              error={error}
              onRetry={fetchIncidents}
            />
          )}
          {currentView === 'chat' && (
            <Chatbot
              addIncident={addIncident}
              setLastClassification={setLastClassification}
              setCurrentView={setCurrentView}
            />
          )}
          {currentView === 'mobile' && (
            <MobileApp
              addIncident={addIncident}
              setLastClassification={setLastClassification}
              setCurrentView={setCurrentView}
            />
          )}
          {currentView === 'reports' && (
            <Reports
              addIncident={addIncident}
              setLastClassification={setLastClassification}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
