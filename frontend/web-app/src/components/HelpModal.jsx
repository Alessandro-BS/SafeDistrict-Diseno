import { useState } from 'react';
import { X, Command, MessageCircleQuestion, Phone, FileText } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-[slideIn_0.2s_ease-out]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
          <div className="flex items-center gap-3">
            <MessageCircleQuestion size={24} />
            <h2 className="text-xl font-bold">Ayuda y Soporte al Operador</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* FAQs */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary" /> Preguntas Frecuentes
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="font-semibold text-gray-800 text-sm mb-1">¿Cómo reasigno la prioridad de un reporte?</h4>
                <p className="text-sm text-gray-600">Al hacer clic en "Clasificar" en cualquier tarjeta del Panel de Comando, podrás editar tanto la prioridad detectada por la IA como el tipo de emergencia antes de despachar.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="font-semibold text-gray-800 text-sm mb-1">¿Qué pasa si la conexión al servidor falla?</h4>
                <p className="text-sm text-gray-600">El sistema cambiará automáticamente al modo sin conexión y cargará los últimos datos cacheados o un conjunto de prueba para que la interfaz no colapse. Deberás contactar a TI municipal.</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <h4 className="font-semibold text-gray-800 text-sm mb-1">¿Cómo descargo los reportes para auditoría?</h4>
                <p className="text-sm text-gray-600">Ve a la sección "Reportes del Ciudadano", filtra los datos que necesitas y haz clic en el botón superior derecho "Exportar CSV".</p>
              </div>
            </div>
          </section>

          {/* Atajos de teclado */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Command size={18} className="text-primary" /> Atajos de Teclado
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-700">Buscar Reporte</span>
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono font-bold text-gray-500 shadow-sm">Ctrl + F</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-700">Ir al Panel</span>
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono font-bold text-gray-500 shadow-sm">Alt + 1</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-700">Ver Analíticas</span>
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono font-bold text-gray-500 shadow-sm">Alt + 2</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-700">Modo Oscuro</span>
                <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono font-bold text-gray-500 shadow-sm">Alt + D</kbd>
              </div>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={16} /> <span>Soporte TI: Anexo 4402</span>
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium text-sm transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
