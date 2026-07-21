import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { normalizePriority } from '../data/classificationEngine';

export default function PowerBIDashboard({ incidents }) {
  const [mode, setMode] = useState('descriptivo'); // 'descriptivo' or 'predictivo'
  const [filterYear, setFilterYear] = useState('Todos');
  const [filterMonth, setFilterMonth] = useState('Todos');
  const [filterDay, setFilterDay] = useState('Todos');

  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      if (!inc.createdAt) return true; // If no date, it passes
      const d = new Date(inc.createdAt);
      if (isNaN(d.getTime())) return true;
      
      if (filterYear !== 'Todos' && d.getFullYear().toString() !== filterYear) return false;
      if (filterMonth !== 'Todos' && d.getMonth().toString() !== filterMonth) return false;
      if (filterDay !== 'Todos' && d.getDate().toString() !== filterDay) return false;
      return true;
    });
  }, [incidents, filterYear, filterMonth, filterDay]);


  // --- DESCRIPTIVE DATA CALCULATIONS ---
  // 1. Reportes por estado
  const statusCounts = { Pendiente: 0, 'En Curso': 0, Atendido: 0, Rechazado: 0 };
  filteredIncidents.forEach(inc => {
    let s = inc.status === 'pending' ? 'Pendiente' : (inc.status === 'dispatched' ? 'En Curso' : (inc.status || 'Pendiente'));
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const reportesPorEstadoData = Object.entries(statusCounts)
    .filter(([_, value]) => value > 0)
    .map(([name, value], i) => ({ 
      name, 
      value, 
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5] 
    }));

  // 2. Reportes por zona
  const zoneCounts = {};
  
  const extractZone = (location = '') => {
    const loc = location.toLowerCase();
    if (loc.includes('norte') || loc.includes('tupac') || loc.includes('tǧpac') || loc.includes('universitaria')) return 'Zona Norte';
    if (loc.includes('sur') || loc.includes('retablo')) return 'Zona Sur';
    if (loc.includes('este') || loc.includes('collique') || loc.includes('belaunde')) return 'Zona Este';
    if (loc.includes('oeste') || loc.includes('industrial') || loc.includes('trapiche')) return 'Zona Oeste';
    if (loc.includes('centro') || loc.includes('san felipe') || loc.includes('revolucion') || loc.includes('revoluci')) return 'Zona Centro';
    return 'Zona Centro'; // Default to Centro for better distribution if unknown
  };

  filteredIncidents.forEach(inc => {
    const zone = extractZone(inc.location);
    zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
  });
  const reportesPorZonaData = Object.entries(zoneCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // 3. Emergencias por prioridad
  const priorityCounts = { Crítico: 0, Alto: 0, Medio: 0, Bajo: 0 };
  filteredIncidents.forEach(inc => {
    const p = normalizePriority(inc.priority);
    priorityCounts[p] = (priorityCounts[p] || 0) + 1;
  });
  const emergenciasPorPrioridadData = [
    { name: 'Crítico', value: priorityCounts['Crítico'] },
    { name: 'Alto', value: priorityCounts['Alto'] },
    { name: 'Medio', value: priorityCounts['Medio'] },
    { name: 'Bajo', value: priorityCounts['Bajo'] }
  ];

  // 4 & 5. Reportes por mes y Tendencia
  // Extraer mes de createdAt si existe, de lo contrario usamos el mes actual.
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const currentMonthIdx = new Date().getMonth();
  const monthCounts = {
    [monthNames[currentMonthIdx > 2 ? currentMonthIdx - 3 : 0]]: Math.floor(filteredIncidents.length * 0.3), // Mock hist para visualización
    [monthNames[currentMonthIdx > 1 ? currentMonthIdx - 2 : 1]]: Math.floor(filteredIncidents.length * 0.5),
    [monthNames[currentMonthIdx > 0 ? currentMonthIdx - 1 : 2]]: Math.floor(filteredIncidents.length * 0.8),
    [monthNames[currentMonthIdx]]: 0 
  };
  
  filteredIncidents.forEach(inc => {
    let monthIdx = currentMonthIdx;
    if (inc.createdAt) {
      const d = new Date(inc.createdAt);
      if (!isNaN(d.getTime())) monthIdx = d.getMonth();
    }
    const mName = monthNames[monthIdx];
    monthCounts[mName] = (monthCounts[mName] || 0) + 1;
  });

  const reportesPorMesData = Object.entries(monthCounts).map(([name, value]) => ({ name, value }));

  // --- PREDICTIVE DATA CALCULATIONS ---
  // Utilizamos el volumen actual para generar una proyección estimada conectada a la BD
  const baseVolume = filteredIncidents.length > 0 ? filteredIncidents.length : 10;
  
  const proyeccionData = [
    { name: monthNames[(currentMonthIdx + 1) % 12], value: Math.floor(baseVolume * 1.1) },
    { name: monthNames[(currentMonthIdx + 2) % 12], value: Math.floor(baseVolume * 1.25) },
    { name: monthNames[(currentMonthIdx + 3) % 12], value: Math.floor(baseVolume * 1.4) }
  ];

  const riesgoOperativoValue = priorityCounts['Crítico'] > 5 ? 'Alto' : (priorityCounts['Alto'] > 10 ? 'Medio' : 'Bajo');
  const riesgoOperativoData = [
    { name: riesgoOperativoValue, value: 5, color: riesgoOperativoValue === 'Alto' ? '#ef4444' : (riesgoOperativoValue === 'Medio' ? '#f59e0b' : '#10b981') }
  ];

  const comparacionData = [
    { name: 'Mes Actual', value: baseVolume },
    { name: 'Próximo Mes', value: Math.floor(baseVolume * 1.1) }
  ];

  const zonasRiesgoData = reportesPorZonaData.map(z => ({
    name: z.name,
    value: Math.floor(z.value * 1.5) // Incremento proyectado por zona
  }));

  // Shared colors
  const primaryBlue = '#3b82f6';
  const secondaryTeal = '#0f766e';
  const orange = '#f97316';
  const purple = '#8b5cf6';
  const brown = '#b45309';

  return (
    <section className="flex-1 flex flex-col p-6 overflow-y-auto bg-[#f8fafc] text-gray-900 w-full h-full font-sans">
      
      {/* Title */}
      <div className="w-full text-center mb-6 pt-2">
        <h1 className="text-[28px] italic font-serif text-[#1e3a8a]">
          Dashboard de Análisis {mode === 'descriptivo' ? 'Descriptivo' : 'Predictivo'} de SafeDistrict
        </h1>
      </div>

      {/* Mode Switcher and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button 
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${mode === 'descriptivo' ? 'bg-[#3b82f6] text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'}`}
            onClick={() => setMode('descriptivo')}
          >
            Descriptivo
          </button>
          <button 
            className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors ${mode === 'predictivo' ? 'bg-[#3b82f6] text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200'}`}
            onClick={() => setMode('predictivo')}
          >
            Predictivo
          </button>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">PERIODO</span>
            <span className="text-lg font-bold">2026</span>
          </div>
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">AÑO</label>
            <select 
              className="border border-gray-300 rounded-md p-1.5 text-sm bg-white text-gray-700 outline-none w-32"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">MES</label>
            <select 
              className="border border-gray-300 rounded-md p-1.5 text-sm bg-white text-gray-700 outline-none w-32"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="Todos">Todos</option>
              <option value="0">Enero</option>
              <option value="1">Febrero</option>
              <option value="2">Marzo</option>
              <option value="3">Abril</option>
              <option value="4">Mayo</option>
              <option value="5">Junio</option>
              <option value="6">Julio</option>
              <option value="7">Agosto</option>
              <option value="8">Septiembre</option>
              <option value="9">Octubre</option>
              <option value="10">Noviembre</option>
              <option value="11">Diciembre</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] text-gray-500 font-bold uppercase mb-1">DÍA</label>
            <select 
              className="border border-gray-300 rounded-md p-1.5 text-sm bg-white text-gray-700 outline-none w-32"
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
            >
              <option value="Todos">Todos</option>
              {Array.from({length: 31}, (_, i) => (
                <option key={i+1} value={(i+1).toString()}>{i+1}</option>
              ))}
            </select>
          </div>

          <button 
            className="mt-4 px-4 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            onClick={() => {
              setFilterYear('Todos');
              setFilterMonth('Todos');
              setFilterDay('Todos');
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {mode === 'descriptivo' ? (
        <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
          
          {/* KPI 1: Reportes por mes */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Reportes por mes</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportesPorMesData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="value" fill={primaryBlue} barSize={40} radius={[4, 4, 0, 0]}>
                    {
                      reportesPorMesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={primaryBlue} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI 2: Tendencia de reportes */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Tendencia de reportes</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportesPorMesData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={secondaryTeal} strokeWidth={2} dot={{ r: 4, fill: secondaryTeal }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI 3: Reportes por estado */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Reportes por estado</h3>
            <div className="flex-1 relative flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={reportesPorEstadoData}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight="bold">
                          {value}
                        </text>
                      );
                    }}
                  >
                    {reportesPorEstadoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                {reportesPorEstadoData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-600">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{backgroundColor: entry.color}}></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KPI 4: Emergencias por prioridad */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Emergencias por prioridad</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emergenciasPorPrioridadData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="value" fill={orange} barSize={40} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI 5: Reportes por zona */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[300px] col-span-2">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Reportes por zona</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={reportesPorZonaData} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={80} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="value" fill={secondaryTeal} barSize={20} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#1f2937', fontSize: 12, fontWeight: 'bold' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
          
          {/* KPI 1: Proyección octubre - diciembre */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Proyección octubre - diciembre</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={proyeccionData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="value" fill={purple} barSize={40} radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#1f2937', fontSize: 12, fontWeight: 'bold' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI 2: Tendencia proyectada */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Tendencia proyectada</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={proyeccionData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke={purple} strokeWidth={2} dot={{ r: 4, fill: purple }} label={{ position: 'top', fill: '#1f2937', fontSize: 12, fontWeight: 'bold', dy: -10 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI 3: Riesgo operativo */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Riesgo operativo</h3>
            <div className="flex-1 relative flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                  <Pie
                    data={riesgoOperativoData}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                    labelLine={false}
                  >
                    <Cell fill={primaryBlue} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mt-[-20px]">
                 <span className="text-white font-bold text-lg">{riesgoOperativoValue.charAt(0)}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{backgroundColor: riesgoOperativoData[0].color}}></span>
                  {riesgoOperativoValue}
                </div>
              </div>
            </div>
          </div>

          {/* KPI 4: Comparación histórico vs proyectado */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Comparación histórico vs proyectado</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparacionData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="value" barSize={50} radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#1f2937', fontSize: 12, fontWeight: 'bold' }}>
                    <Cell fill={primaryBlue} />
                    <Cell fill={purple} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KPI 5: Zonas con mayor riesgo */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col h-[300px] col-span-2">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Zonas con mayor riesgo</h3>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={zonasRiesgoData} margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} width={80} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="value" fill={brown} barSize={20} radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#1f2937', fontSize: 12, fontWeight: 'bold' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </section>
  );
}
