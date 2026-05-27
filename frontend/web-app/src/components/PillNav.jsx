import { Smartphone, MessageSquare, LayoutDashboard, Activity } from 'lucide-react';

const tabs = [
  { id: 'mobile', label: 'App Móvil', icon: Smartphone },
  { id: 'chat', label: 'Chatbot', icon: MessageSquare },
  { id: 'reports', label: 'Reportes', icon: Activity },
  { id: 'dashboard', label: 'Panel Admin', icon: LayoutDashboard },
];

export default function PillNav({ currentView, setCurrentView }) {
  return (
    <div className="pill-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            className={`pill-btn ${isActive ? 'active' : ''}`}
            onClick={() => setCurrentView(tab.id)}
          >
            <Icon size={16} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
