import { useState, useEffect } from 'react';
import { getGeneraciones, updateGeneracion } from '../../services/academicaService';
import SelectorGeneracion from './SelectorGeneracion';
import './EstadisticasAcademicas.css';

const EstadisticasAcademicas = () => {
  const [generaciones, setGeneraciones] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    becasTotal: 0,
    becasPuntarenas: 0,
    becasDesamparados: 0,
    ingresaronSemanaPrueba: 0,
    permanentes: 0,
    abandonaronPrueba: 0,
    completaronFrontend: 0,
    completaronBackend: 0,
    graduadosFullStack: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getGeneraciones();
      setGeneraciones(data);
      
      if (data.length > 0) {
        const idToSelect = selectedId || data[0].id;
        if (!selectedId) setSelectedId(data[0].id);
        
        const selectedGen = data.find(g => g.id === idToSelect);
        if (selectedGen) {
          setFormData({
            becasTotal: selectedGen.becasTotal || 0,
            becasPuntarenas: selectedGen.becasPuntarenas || 0,
            becasDesamparados: selectedGen.becasDesamparados || 0,
            ingresaronSemanaPrueba: selectedGen.ingresaronSemanaPrueba || 0,
            permanentes: selectedGen.permanentes || 0,
            abandonaronPrueba: selectedGen.abandonaronPrueba || 0,
            completaronFrontend: selectedGen.completaronFrontend || 0,
            completaronBackend: selectedGen.completaronBackend || 0,
            graduadosFullStack: selectedGen.graduadosFullStack || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching generaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (generaciones.length > 0 && selectedId) {
      const selectedGen = generaciones.find(g => g.id === selectedId);
      if (selectedGen) {
        setFormData({
          becasTotal: selectedGen.becasTotal || 0,
          becasPuntarenas: selectedGen.becasPuntarenas || 0,
          becasDesamparados: selectedGen.becasDesamparados || 0,
          ingresaronSemanaPrueba: selectedGen.ingresaronSemanaPrueba || 0,
          permanentes: selectedGen.permanentes || 0,
          abandonaronPrueba: selectedGen.abandonaronPrueba || 0,
          completaronFrontend: selectedGen.completaronFrontend || 0,
          completaronBackend: selectedGen.completaronBackend || 0,
          graduadosFullStack: selectedGen.graduadosFullStack || 0
        });
      }
    }
  }, [selectedId, generaciones]);

  const handleSelectChange = (id) => {
    setSelectedId(id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateGeneracion(selectedId, formData);
      await fetchData();
      alert('Datos guardados exitosamente');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error al guardar datos');
    } finally {
      setIsSaving(false);
    }
  };

  const genData = generaciones.find(g => g.id === selectedId);

  if (loading) return <div className="loading">Cargando Estadísticas Académicas...</div>;
  if (!genData) return <div>No hay datos de generación disponibles.</div>;

  // Cálculos automáticos
  const ingresaron = formData.ingresaronSemanaPrueba || 0;
  const permanentes = formData.permanentes || 0;
  const retencion = ingresaron > 0 ? Math.round((permanentes / ingresaron) * 100) : 0;
  
  // Asumiendo que las barras de progreso se miden contra "permanentes"
  const baseEstudiantes = permanentes > 0 ? permanentes : 1; // evitar division por cero
  const progFront = Math.round(((formData.completaronFrontend || 0) / baseEstudiantes) * 100);
  const progBack = Math.round(((formData.completaronBackend || 0) / baseEstudiantes) * 100);
  const progFull = Math.round(((formData.graduadosFullStack || 0) / baseEstudiantes) * 100);

  return (
    <div className="academica-container">
      <SelectorGeneracion 
        generaciones={generaciones} 
        selectedId={selectedId} 
        onChange={handleSelectChange} 
      />

      <div className="header-flex">
        <h2>Estadísticas Académicas: {genData.nombre}</h2>
        <button className="btn-guardar" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="fechas-claves-card">
        <h3>Fechas Clave del Programa</h3>
        <div className="fechas-grid">
          <div className="fecha-item">
            <span className="fecha-label">Inicio Inscripciones</span>
            <span className="fecha-value">{genData.inicioInscripciones}</span>
          </div>
          <div className="fecha-item">
            <span className="fecha-label">Cierre Inscripciones</span>
            <span className="fecha-value">{genData.cierreInscripciones}</span>
          </div>
          <div className="fecha-item">
            <span className="fecha-label">Semana de Prueba</span>
            <span className="fecha-value highlight">{genData.semanaPrueba}</span>
          </div>
          <div className="fecha-item">
            <span className="fecha-label">Inicio Oficial</span>
            <span className="fecha-value">{genData.inicioOficial}</span>
          </div>
          <div className="fecha-item">
            <span className="fecha-label">Graduación</span>
            <span className="fecha-value">{genData.graduacion}</span>
          </div>
        </div>
      </div>

      <div className="stats-cards-grid">
        <div className="stat-card editable-card">
          <h4>Becas Totales</h4>
          <input type="number" name="becasTotal" value={formData.becasTotal} onChange={handleInputChange} />
        </div>
        <div className="stat-card editable-card puntarenas">
          <h4>Becas Puntarenas</h4>
          <input type="number" name="becasPuntarenas" value={formData.becasPuntarenas} onChange={handleInputChange} />
        </div>
        <div className="stat-card editable-card desamparados">
          <h4>Becas Desamparados</h4>
          <input type="number" name="becasDesamparados" value={formData.becasDesamparados} onChange={handleInputChange} />
        </div>
      </div>

      <div className="prueba-section">
        <h3>Semana de Prueba & Retención</h3>
        <div className="prueba-grid">
          <div className="prueba-item">
            <label>Ingresaron</label>
            <input type="number" name="ingresaronSemanaPrueba" value={formData.ingresaronSemanaPrueba} onChange={handleInputChange} />
          </div>
          <div className="prueba-item">
            <label>No Continuaron</label>
            <input type="number" name="abandonaronPrueba" value={formData.abandonaronPrueba} onChange={handleInputChange} />
          </div>
          <div className="prueba-item">
            <label>Permanentes</label>
            <input type="number" name="permanentes" value={formData.permanentes} onChange={handleInputChange} />
          </div>
          <div className="retencion-circle">
            <div className="circle-inner">
              <span className="ret-value">{retencion}%</span>
              <span className="ret-label">Retención</span>
            </div>
          </div>
        </div>
      </div>

      <div className="modulos-section">
        <h3>Progreso por Módulos (Base: {permanentes} Estudiantes)</h3>
        
        <div className="modulo-row">
          <div className="modulo-info">
            <label>Módulo Frontend</label>
            <input type="number" name="completaronFrontend" value={formData.completaronFrontend} onChange={handleInputChange} />
            <span>completaron</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill bg-frontend" style={{width: `${Math.min(100, progFront)}%`}}>
              {progFront}%
            </div>
          </div>
        </div>

        <div className="modulo-row">
          <div className="modulo-info">
            <label>Módulo Backend</label>
            <input type="number" name="completaronBackend" value={formData.completaronBackend} onChange={handleInputChange} />
            <span>completaron</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill bg-backend" style={{width: `${Math.min(100, progBack)}%`}}>
              {progBack}%
            </div>
          </div>
        </div>

        <div className="modulo-row">
          <div className="modulo-info">
            <label>Graduados Full Stack</label>
            <input type="number" name="graduadosFullStack" value={formData.graduadosFullStack} onChange={handleInputChange} />
            <span>graduados</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill bg-fullstack" style={{width: `${Math.min(100, progFull)}%`}}>
              {progFull}%
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default EstadisticasAcademicas;
