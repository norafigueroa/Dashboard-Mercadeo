import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { getEntrevistas, createEntrevista } from '../../services/entrevistasService';
import FormularioEntrevista from './FormularioEntrevista';
import './AgendaEntrevistas.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

const AgendaEntrevistas = () => {
  const [entrevistas, setEntrevistas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados para Análisis IA
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState('');

  const metaEntrevistas = 110;

  const fetchEntrevistas = async () => {
    try {
      setLoading(true);
      const data = await getEntrevistas();
      setEntrevistas(data);
    } catch (error) {
      console.error('Error fetching entrevistas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntrevistas();
  }, []);

  const handleSave = async (formData) => {
    try {
      await createEntrevista(formData);
      await fetchEntrevistas();
      setIsModalOpen(false);
      alert('Entrevista agregada exitosamente.');
    } catch (error) {
      console.error('Error saving entrevista:', error);
      alert('Ocurrió un error al guardar la entrevista.');
    }
  };

  // Stats
  const realizadas = entrevistas.filter(e => e.estado === 'Realizada').length;
  const agendadas = entrevistas.filter(e => e.estado === 'Agendada').length;
  const noAsistieron = entrevistas.filter(e => e.estado === 'No asistió').length;
  const aceptados = entrevistas.filter(e => e.decisionFinal === 'Aceptado').length;
  const rechazados = entrevistas.filter(e => e.decisionFinal === 'Rechazado').length;
  const listaEspera = entrevistas.filter(e => e.decisionFinal === 'Lista de espera').length;

  const progresoGeneral = Math.min(100, Math.round(((realizadas + agendadas) / metaEntrevistas) * 100)) || 0;

  const puntarenasTotal = entrevistas.filter(e => e.sede === 'Puntarenas').length;
  const desamparadosTotal = entrevistas.filter(e => e.sede === 'Desamparados').length;
  
  const avancePuntarenas = Math.min(100, Math.round((puntarenasTotal / (metaEntrevistas / 2)) * 100)) || 0;
  const avanceDesamparados = Math.min(100, Math.round((desamparadosTotal / (metaEntrevistas / 2)) * 100)) || 0;

  // Charts Data
  const countsEntero = useMemo(() => {
    return entrevistas.reduce((acc, curr) => {
      acc[curr.comoSeEntero] = (acc[curr.comoSeEntero] || 0) + 1;
      return acc;
    }, {});
  }, [entrevistas]);

  const dataEntero = useMemo(() => {
    return Object.keys(countsEntero).map(key => ({ name: key, value: countsEntero[key] }));
  }, [countsEntero]);

  const dataEstado = useMemo(() => {
    const counts = entrevistas.reduce((acc, curr) => {
      acc[curr.estado] = (acc[curr.estado] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [entrevistas]);

  const dataSemana = useMemo(() => {
    const counts = entrevistas.reduce((acc, curr) => {
      const sem = `Semana ${curr.semana}`;
      acc[sem] = (acc[sem] || 0) + 1;
      return acc;
    }, {});
    const sortedKeys = Object.keys(counts).sort((a, b) => parseInt(a.replace('Semana ', '')) - parseInt(b.replace('Semana ', '')));
    return sortedKeys.map(key => ({ name: key, count: counts[key] }));
  }, [entrevistas]);

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiError('');
    setAiAnalysis('');

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    if (!apiKey) {
      setAiError('No se encontró la clave de API de Gemini (VITE_GEMINI_API_KEY) en el archivo .env.');
      setIsAnalyzing(false);
      return;
    }

    const promptText = `
Genera un resumen ejecutivo breve en español, en tono profesional, analizando el avance del proceso de admisiones de FWD Costa Rica con base en los siguientes datos actuales del dashboard:
- Meta de entrevistas: ${metaEntrevistas}
- Progreso general: ${progresoGeneral}%
- Realizadas: ${realizadas}
- Agendadas: ${agendadas}
- Aceptados: ${aceptados}
- Rechazados: ${rechazados}
- Distribución por sede: Puntarenas (${puntarenasTotal}), Desamparados (${desamparadosTotal})
- Fuentes de atracción principales (Cómo se enteraron): ${JSON.stringify(countsEntero)}

El resumen debe resaltar puntos fuertes, identificar cuellos de botella (si los hay) y concluir con una breve recomendación ejecutiva.
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptText }]
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error de comunicación con la IA');
      }

      const responseData = await response.json();
      const analysisText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!analysisText) {
         throw new Error('Respuesta inesperada de la API de Gemini.');
      }
      
      setAiAnalysis(analysisText);
    } catch (err) {
      setAiError(`Lo sentimos, no pudimos generar el análisis. ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return <div className="loading">Cargando Agenda...</div>;

  return (
    <div className="agenda-container">
      <div className="header-actions">
        <h2>Agenda de Entrevistas</h2>
        <button className="btn-agregar" onClick={() => setIsModalOpen(true)}>
          + Agregar entrevista
        </button>
      </div>

      <div className="progress-section">
        <h3>Progreso hacia la Meta ({metaEntrevistas} Entrevistas)</h3>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progresoGeneral}%` }}>
            {progresoGeneral}%
          </div>
        </div>
        <p className="progress-text">{realizadas + agendadas} de {metaEntrevistas} agendadas/realizadas</p>
      </div>

      {/* PANEL DE ANÁLISIS IA */}
      <div className="ai-panel">
        <div className="ai-header">
          <div className="ai-title">
            <span className="ai-icon">✨</span>
            <h3>Análisis Ejecutivo con IA</h3>
          </div>
          <button 
            className="btn-ai-generate" 
            onClick={generateAIAnalysis}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analizando datos...' : 'Generar Análisis Ejecutivo'}
          </button>
        </div>
        
        {isAnalyzing && (
          <div className="ai-loading">
            <div className="spinner"></div>
            <p>La IA está procesando las métricas, por favor espera...</p>
          </div>
        )}

        {aiError && (
          <div className="ai-error">
            <p>⚠️ {aiError}</p>
          </div>
        )}

        {aiAnalysis && !isAnalyzing && (
          <div className="ai-result">
            <div className="ai-content">
              {/* Renderizar los saltos de linea */}
              {aiAnalysis.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Realizadas</p>
          <p className="stat-number text-green">{realizadas}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Agendadas</p>
          <p className="stat-number text-blue">{agendadas}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">No Asistieron</p>
          <p className="stat-number text-red">{noAsistieron}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Aceptados</p>
          <p className="stat-number text-green">{aceptados}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Rechazados</p>
          <p className="stat-number text-red">{rechazados}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Lista de Espera</p>
          <p className="stat-number text-orange">{listaEspera}</p>
        </div>
      </div>

      <div className="sedes-progress">
        <div className="sede-card">
          <h4>Puntarenas</h4>
          <div className="progress-bar-mini">
            <div className="progress-fill-mini bg-blue" style={{ width: `${avancePuntarenas}%` }}></div>
          </div>
          <p>{avancePuntarenas}% de avance esperado</p>
        </div>
        <div className="sede-card">
          <h4>Desamparados</h4>
          <div className="progress-bar-mini">
            <div className="progress-fill-mini bg-orange" style={{ width: `${avanceDesamparados}%` }}></div>
          </div>
          <p>{avanceDesamparados}% de avance esperado</p>
        </div>
      </div>

      <div className="charts-grid-3">
        <div className="chart-box">
          <h4>¿Cómo se enteraron?</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={dataEntero} cx="50%" cy="50%" innerRadius={50} outerRadius={80} fill="#8884d8" dataKey="value" label>
                {dataEntero.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h4>Estado de Entrevistas</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dataEstado}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h4>Entrevistas por Semana</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dataSemana}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis />
              <RechartsTooltip />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <FormularioEntrevista 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
      />
    </div>
  );
};

export default AgendaEntrevistas;
