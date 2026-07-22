import { useState } from 'react';
import { X, BookOpen, AlertTriangle, PhoneCall, Radio } from 'lucide-react';

export default function DocsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-[slideIn_0.2s_ease-out]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-800 text-white">
          <div className="flex items-center gap-3">
            <BookOpen size={24} />
            <h2 className="text-xl font-bold">Manual Operativo y Protocolos</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Protocolos */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" /> Protocolos de Actuación
            </h3>
            <div className="space-y-4">
              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <h4 className="font-bold text-orange-950 text-sm mb-2">Código Rojo (Robo a Mano Armada / Secuestro)</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-sm text-orange-800 font-medium">
                  <li>Confirmar veracidad por cámaras si es posible.</li>
                  <li>Notificar inmediatamente al Escuadrón de Emergencia PNP.</li>
                  <li>Desplegar 2 unidades de Serenazgo como perímetro sin intervenir directamente.</li>
                  <li>Registrar en el Dashboard como Prioridad Crítica.</li>
                </ol>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <h4 className="font-bold text-red-950 text-sm mb-2">Código Fuego (Incendios)</h4>
                <ol className="list-decimal list-inside space-y-1.5 text-sm text-red-800 font-medium">
                  <li>Notificar a los Bomberos Voluntarios del Perú (116).</li>
                  <li>Enviar unidades de Serenazgo y Tránsito para desvío vehicular a 2 cuadras a la redonda.</li>
                  <li>Identificar grifos y colegios cercanos en el mapa.</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Directorio Telefónico */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PhoneCall size={18} className="text-blue-500" /> Directorio de Emergencias (Comas)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Comisaría Túpac Amaru</span>
                <span className="text-sm font-mono text-gray-600">(01) 525-1123</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Bomberos Comas 124</span>
                <span className="text-sm font-mono text-gray-600">(01) 525-0116</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-semibold text-gray-700">SAMU (Ambulancias)</span>
                <span className="text-sm font-mono text-gray-600">106</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-semibold text-gray-700">Supervisor de Turno (Serenazgo)</span>
                <span className="text-sm font-mono text-gray-600">987-654-321</span>
              </div>
            </div>
          </section>

          {/* Glosario de Códigos Radiales */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Radio size={18} className="text-gray-600" /> Glosario Códigos Radiales "Clave"
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 border border-gray-100 rounded text-sm"><span className="font-bold">Clave 1:</span> Robo en proceso</div>
              <div className="p-2 border border-gray-100 rounded text-sm"><span className="font-bold">Clave 2:</span> Accidente vehicular</div>
              <div className="p-2 border border-gray-100 rounded text-sm"><span className="font-bold">Clave 3:</span> Alteración del orden público</div>
              <div className="p-2 border border-gray-100 rounded text-sm"><span className="font-bold">Clave 4:</span> Persona sospechosa</div>
              <div className="p-2 border border-gray-100 rounded text-sm"><span className="font-bold">Clave 5:</span> Auxilio médico</div>
              <div className="p-2 border border-gray-100 rounded text-sm"><span className="font-bold">Clave 33:</span> Fin de intervención (todo normal)</div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
