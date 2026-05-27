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
    <div className="header-clock">
      {time.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
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

  const showPills = currentView === 'mobile' || currentView === 'chat' || currentView === 'dashboard' || currentView === 'reports';

  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        lastClassification={lastClassification}
      />

      <div className="main-content">
        <header className="header">
          <div className="header-title">
            {currentView === 'dashboard' ? (
              <span>Panel de Administración</span>
            ) : currentView === 'chat' ? (
              <span>Simulador de Reportes Ciudadanos</span>
            ) : currentView === 'reports' ? (
              <span>Reportes del Cuidador</span>
            ) : (
              <span>App Móvil SafeDistrict</span>
            )}
          </div>
          <div className="header-right">
            <Clock />
            <div className="user-profile">
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Operador 01</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Turno Mañana</div>
              </div>
              <div className="avatar">O1</div>
            </div>
          </div>
        </header>

        <main className="content-area">
          {showPills && (
            <PillNav currentView={currentView} setCurrentView={setCurrentView} />
          )}

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
        </main>
      </div>
    </div>
  );
}

export default App;
