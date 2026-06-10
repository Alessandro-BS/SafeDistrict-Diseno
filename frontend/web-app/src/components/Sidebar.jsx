import { LayoutDashboard, MessageSquare, Smartphone, Activity, Settings, Bell, HelpCircle, FileText } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ currentView, setCurrentView, lastClassification }) {
  const { theme, toggle } = useTheme();

  const navItems = [
    { id: 'dashboard', label: 'Panel de Comando', icon: 'dashboard' },
    { id: 'chat', label: 'Simulador Chatbot', icon: 'forum' },
    { id: 'mobile', label: 'App Móvil', icon: 'smartphone' },
    { id: 'reports', label: 'Reportes del Cuidador', icon: 'assignment_late' },
    { id: 'settings', label: 'Configuración', icon: 'settings', disabled: true },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-sidebar-width border-r border-outline-variant bg-surface-container flex flex-col justify-between py-6 z-50">
      <div>
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl shadow-sm">
            <span className="material-symbols-outlined text-on-primary text-[24px]" style={{ fontVariationSettings: '"FILL" 1' }}>security</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-[20px] font-extrabold text-primary">Safe District</span>
            <span className="text-[10px] text-outline font-bold tracking-widest uppercase">Municipal Control</span>
          </div>
        </div>

        <div className="px-6 mb-6">
          <div className="bg-green-100 border border-green-200 rounded-lg p-2 flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-[12px] font-bold text-green-800">SISTEMA ACTIVO</span>
          </div>
        </div>

        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (!item.disabled) setCurrentView(item.id);
                }}
                className={`${isActive ? 'active-tab' : 'text-on-surface-variant hover:bg-surface-container-highest'} rounded-lg px-4 py-3 flex items-center gap-3 transition-all ${item.disabled ? 'opacity-50 cursor-default' : ''}`}
              >
                <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: '"FILL" 1' } : {}}>{item.icon}</span>
                <span className="font-label-bold text-label-bold">{item.label}</span>
                {isActive && lastClassification && item.id === 'dashboard' && (
                  <span className="ml-auto bg-error text-on-error px-2 py-0.5 rounded-full text-[10px] font-bold">1</span>
                )}
              </a>
            );
          })}
        </nav>
      </div>

      <div className="px-6 space-y-4">
        <div className="flex items-center gap-3 text-on-surface-variant hover:text-primary cursor-pointer transition-colors px-2 py-1 rounded-lg">
          <span className="material-symbols-outlined text-[20px]">help</span>
          <span className="font-label-bold text-label-sm">Ayuda</span>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant hover:text-primary cursor-pointer transition-colors px-2 py-1 rounded-lg">
          <span className="material-symbols-outlined text-[20px]">description</span>
          <span className="font-label-bold text-label-sm">Documentación</span>
        </div>
        
        {/* Toggle Theme if still needed, but hiding for fidelity to the new design which is forced light mode */}
        {/*
        <div className="flex items-center gap-3 text-on-surface-variant hover:text-primary cursor-pointer transition-colors px-2 py-1 rounded-lg" onClick={toggle}>
          <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          <span className="font-label-bold text-label-sm">{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </div>
        */}

        <div className="pt-4 border-t border-outline-variant">
          <p className="font-label-bold text-[10px] text-outline">v2.1 - Comas, Lima</p>
        </div>
      </div>
    </aside>
  );
}
