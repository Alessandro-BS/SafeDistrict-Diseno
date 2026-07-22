import { useState, useMemo } from 'react';
import { Download, Search, Filter, ShieldCheck, Eye, FileWarning, CheckCircle, X } from 'lucide-react';
import { normalizePriority } from '../data/classificationEngine';

export default function Reports({ incidents = [], updateIncidentStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [selectedIncident, setSelectedIncident] = useState(null);

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      const matchesSearch = inc.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (inc.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'Todos' || normalizePriority(inc.priority) === filterPriority;
      const matchesStatus = filterStatus === 'Todos' || (inc.status || 'Pendiente') === filterStatus;
      
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [incidents, searchTerm, filterPriority, filterStatus]);

  const handleExportCSV = () => {
    if (filteredIncidents.length === 0) return;
    
    // Create CSV Header
    const headers = ['ID', 'Fecha', 'Prioridad', 'Tipo', 'Estado', 'Ubicación', 'Descripción'];
    const csvRows = [headers.join(',')];

    // Format Data
    filteredIncidents.forEach(inc => {
      const row = [
        inc.id,
        inc.createdAt || 'N/A',
        normalizePriority(inc.priority),
        inc.classification?.typeLabel || inc.type || 'N/A',
        inc.status || 'Pendiente',
        `"${(inc.location || '').replace(/"/g, '""')}"`,
        `"${(inc.description || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reportes_safedistrict_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getPriorityColor = (priority) => {
    const p = normalizePriority(priority);
    if (p === 'Crítico') return 'bg-error text-on-error';
    if (p === 'Alto') return 'bg-orange-100 text-orange-800 border-orange-200 border';
    if (p === 'Medio') return 'bg-yellow-100 text-yellow-800 border-yellow-200 border';
    return 'bg-green-100 text-green-800 border-green-200 border';
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-surface-container-low p-6">
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant flex flex-col h-full overflow-hidden">
        
        {/* Header Toolbar */}
        <div className="p-6 border-b border-outline-variant flex flex-wrap gap-4 items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reportes del Ciudadano</h2>
              <p className="text-sm text-gray-500">Historial y gestión de reportes de emergencias</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors shadow-sm"
            >
              <Download size={16} />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-outline-variant bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por ID o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-gray-400" />
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm bg-white outline-none cursor-pointer hover:border-gray-400 transition-colors"
            >
              <option value="Todos">Todas las Prioridades</option>
              <option value="Crítico">Crítico</option>
              <option value="Alto">Alto</option>
              <option value="Medio">Medio</option>
              <option value="Bajo">Bajo</option>
            </select>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-sm bg-white outline-none cursor-pointer hover:border-gray-400 transition-colors"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En Curso">En Curso</option>
              <option value="Atendido">Atendido</option>
              <option value="Rechazado">Falso / Rechazado</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="py-3 px-4 font-bold text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">ID Reporte</th>
                <th className="py-3 px-4 font-bold text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">Fecha / Hora</th>
                <th className="py-3 px-4 font-bold text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">Prioridad</th>
                <th className="py-3 px-4 font-bold text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">Tipo</th>
                <th className="py-3 px-4 font-bold text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">Estado</th>
                <th className="py-3 px-4 font-bold text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">Ubicación</th>
                <th className="py-3 px-4 font-bold text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p>No se encontraron reportes con estos filtros</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIncidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">{inc.id}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {inc.createdAt ? new Date(inc.createdAt).toLocaleString('es-PE') : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityColor(inc.priority)}`}>
                        {normalizePriority(inc.priority)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-700">
                      {inc.classification?.typeLabel || inc.type || 'Desconocido'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                        <span className={`w-2 h-2 rounded-full ${inc.status === 'Pendiente' ? 'bg-blue-500' : inc.status === 'En Curso' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {inc.status || 'Pendiente'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-[200px] truncate" title={inc.location}>
                      {inc.location || 'No especificada'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setSelectedIncident(inc)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Ver Detalles">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => updateIncidentStatus && updateIncidentStatus(inc.id, 'Atendido')} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Marcar Resuelto">
                          <CheckCircle size={18} />
                        </button>
                        <button onClick={() => updateIncidentStatus && updateIncidentStatus(inc.id, 'Rechazado')} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Marcar Falso">
                          <FileWarning size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-outline-variant bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Mostrando {filteredIncidents.length} de {incidents.length} reportes</span>
        </div>

        {/* Modal Detalles */}
        {selectedIncident && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-primary"/> 
                  Detalles del Reporte: {selectedIncident.id}
                </h3>
                <button onClick={() => setSelectedIncident(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Mensaje del Ciudadano</p>
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg text-sm text-gray-800 italic relative">
                    <span className="absolute -top-2 -left-2 text-primary/20 text-4xl leading-none">"</span>
                    {selectedIncident.description || selectedIncident.text || 'Sin descripción disponible'}
                    <span className="absolute -bottom-4 -right-2 text-primary/20 text-4xl leading-none">"</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Clasificación IA</p>
                    <p className="text-sm font-medium text-gray-900">{selectedIncident.classification?.typeLabel || selectedIncident.type || 'Desconocido'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Nivel de Confianza</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedIncident.classification?.confidence ? `${Math.round(selectedIncident.classification.confidence * 100)}%` : '90% (Estimado)'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Prioridad Asignada</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getPriorityColor(selectedIncident.priority)}`}>
                      {normalizePriority(selectedIncident.priority)}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Ubicación Extraída</p>
                    <p className="text-sm font-medium text-gray-900 break-words">{selectedIncident.location || 'No especificada'}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => setSelectedIncident(null)} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                  Cerrar Detalles
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
