import { LayoutDashboard, MessageSquare, Smartphone, Shield, Activity, Settings, Bell } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView, lastClassification }) {

  const navItems = [
    { id: 'dashboard', label: 'Panel de Comando', icon: LayoutDashboard },
    { id: 'chat', label: 'Simulador Chatbot', icon: MessageSquare },
    { id: 'mobile', label: 'App Móvil', icon: Smartphone },
    { id: 'reports', label: 'Reportes (Próximamente)', icon: Activity, disabled: true },
    { id: 'settings', label: 'Configuración', icon: Settings, disabled: true },
  ];

  return (
    <div className="sidebar">
      <div className="brand">
        <Shield color="var(--accent)" size={28} />
        Safe<span>District</span>
      </div>

      {lastClassification && currentView !== 'dashboard' && (
        <div className="sidebar-alert" onClick={() => setCurrentView('dashboard')}>
          <Bell size={14} />
          <span>Nuevo incidente clasificado</span>
        </div>
      )}

      <ul className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <li
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => !item.disabled && setCurrentView(item.id)}
              style={item.disabled ? { opacity: 0.5, cursor: 'default' } : {}}
            >
              <Icon size={20} />
              <span>{item.label}</span>
              {isActive && lastClassification && item.id === 'dashboard' && (
                <span className="nav-badge">1</span>
              )}
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        <div className="sidebar-status">
          <span className="status-dot" />
          Sistema activo
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          v2.0 · Comas, Lima
        </div>
      </div>
    </div>
  );
}
