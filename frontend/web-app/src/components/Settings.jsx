import { useState } from 'react';
import { User, Bell, Shield, Sliders, Save, Cpu } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('perfil');

  return (
    <div className="flex flex-1 w-full h-full bg-surface-container-low p-6">
      <div className="flex flex-1 w-full h-full bg-surface rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
        
        {/* Settings Sidebar */}
        <div className="w-64 border-r border-outline-variant bg-gray-50 flex flex-col p-4 gap-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-2">Configuración</h2>
          
          <button 
            onClick={() => setActiveTab('perfil')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'perfil' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-200/50'}`}
          >
            <User size={18} /> Perfil del Operador
          </button>
          
          <button 
            onClick={() => setActiveTab('sistema')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'sistema' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-200/50'}`}
          >
            <Sliders size={18} /> Preferencias
          </button>
          
          <button 
            onClick={() => setActiveTab('alertas')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'alertas' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-200/50'}`}
          >
            <Bell size={18} /> Alertas y Sonidos
          </button>
          
          <button 
            onClick={() => setActiveTab('ia')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'ia' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-200/50'}`}
          >
            <Cpu size={18} /> Motor de IA
          </button>
          
          <button 
            onClick={() => setActiveTab('seguridad')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'seguridad' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-200/50'}`}
          >
            <Shield size={18} /> Seguridad
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white flex flex-col h-full overflow-y-auto">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur z-10">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 capitalize">
                {activeTab === 'ia' ? 'Motor de Inteligencia Artificial' : activeTab}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Ajusta las preferencias de SafeDistrict para tu turno
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium text-sm transition-colors shadow-sm">
              <Save size={18} /> Guardar Cambios
            </button>
          </div>

          <div className="p-8 max-w-2xl">
            {activeTab === 'perfil' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Correo Electrónico (Institucional)</label>
                    <input type="email" defaultValue="operador01@safedistrict.gob.pe" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none" disabled />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-sm font-semibold text-gray-700">Sector Asignado</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary outline-none">
                      <option>Todos (Central)</option>
                      <option>Zona Norte</option>
                      <option>Zona Sur</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sistema' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Interfaz de Usuario</h4>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h5 className="font-semibold text-gray-800 text-sm">Tema Oscuro</h5>
                      <p className="text-xs text-gray-500 mt-1">Activar modo oscuro para turnos nocturnos</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div>
                      <h5 className="font-semibold text-gray-800 text-sm">Vista Compacta</h5>
                      <p className="text-xs text-gray-500 mt-1">Reducir el tamaño de las tarjetas de incidentes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="font-bold text-gray-900 border-b border-gray-100 pb-2">Comportamiento del Sistema</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Auto-refresco del panel (segundos)</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary outline-none">
                      <option>En tiempo real (WebSockets)</option>
                      <option>10 segundos</option>
                      <option>30 segundos</option>
                      <option>1 minuto</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ia' && (
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-blue-800">
                  <Cpu className="shrink-0" />
                  <p className="text-sm font-medium">El motor de clasificación AI procesa los textos entrantes para predecir el tipo de emergencia y su prioridad. Ajusta estos parámetros con cuidado.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-gray-700">Umbral de Confianza (Confidence Threshold)</label>
                      <span className="text-sm font-bold text-primary">85%</span>
                    </div>
                    <input type="range" min="50" max="99" defaultValue="85" className="w-full accent-primary" />
                    <p className="text-xs text-gray-500">Si la IA tiene menos del 85% de certeza, el incidente se marcará para revisión humana obligatoria.</p>
                  </div>
                  
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <label className="text-sm font-semibold text-gray-700">Sensibilidad de Detección de "Riesgo Crítico"</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary outline-none">
                      <option>Baja (Solo amenazas explícitas)</option>
                      <option>Media (Recomendado)</option>
                      <option>Alta (Elevar prioridad por prevención)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {['alertas', 'seguridad'].includes(activeTab) && (
              <div className="py-12 text-center text-gray-400">
                <Shield size={48} className="mx-auto mb-4 opacity-20" />
                <h4 className="text-lg font-bold text-gray-700">Sección en Construcción</h4>
                <p className="text-sm mt-2">Esta funcionalidad estará disponible en la próxima actualización.</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
