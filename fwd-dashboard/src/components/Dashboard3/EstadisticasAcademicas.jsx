import { useState, useEffect } from 'react';
import { getGeneraciones, updateGeneracion } from '../../services/academicaService';
import SelectorGeneracion from './SelectorGeneracion';
import './EstadisticasAcademicas.css';

const EstadisticasAcademicas = () => {
  const [generaciones, setGeneraciones] = useState([
    {
      id: 'gen-muestra',
      nombre: 'Generación II 2026 (Muestra)',
      becasTotal: 60,
      becasPuntarenas: 30,
      becasDesamparados: 30,
      ingresaronSemanaPrueba: 60,
      permanentes: 52,
      abandonaronPrueba: 8,
      completaronFrontend: 45,
      completaronBackend: 40,
      graduadosFullStack: 38,
      inicioInscripciones: '15 de Febrero 2026',
      cierreInscripciones: '31 de Marzo 2026',
      semanaPrueba: '13 al 17 de Abril 2026',
      inicioOficial: '20 de Abril 2026',
      graduacion: '15 de Diciembre 2026'
    }
  ]);
  const [selectedId, setSelectedId] = useState('gen-muestra');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    becasTotal: 60,
    becasPuntarenas: 30,
    becasDesamparados: 30,
    ingresaronSemanaPrueba: 60,
    permanentes: 52,
    abandonaronPrueba: 8,
    completaronFrontend: 45,
    completaronBackend: 40,
    graduadosFullStack: 38
  });

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

  const handleSave = () => {
    // Simulación de guardado para la demo
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      Swal.fire('¡Éxito!', 'Los datos (demo) se han actualizado visualmente.', 'success');
    }, 500);
  };

  const genData = generaciones.find(g => g.id === selectedId);

  if (!genData) return <div className="loading">Cargando datos de muestra...</div>;

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
            <label>Completaron Frontend (Pasan a Backend)</label>
            <div className="modulo-inputs">
              <div className="sede-mini-input">
                <span className="label-punta">Puntarenas:</span>
                <input type="number" value={22} readOnly title="Dato de muestra" />
              </div>
              <div className="sede-mini-input">
                <span className="label-desam">Desamparados:</span>
                <input type="number" value={23} readOnly title="Dato de muestra" />
              </div>
            </div>
            <span className="total-badge">Total: 45 estudiantes</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill bg-frontend" style={{width: `${Math.min(100, progFront)}%`}}>
              {progFront}%
            </div>
          </div>
        </div>

        <div className="modulo-row">
          <div className="modulo-info">
            <label>Completaron Backend (Fase Final)</label>
            <div className="modulo-inputs">
              <div className="sede-mini-input">
                <span className="label-punta">Puntarenas:</span>
                <input type="number" value={19} readOnly title="Dato de muestra" />
              </div>
              <div className="sede-mini-input">
                <span className="label-desam">Desamparados:</span>
                <input type="number" value={21} readOnly title="Dato de muestra" />
              </div>
            </div>
            <span className="total-badge">Total: 40 estudiantes</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill bg-backend" style={{width: `${Math.min(100, progBack)}%`}}>
              {progBack}%
            </div>
          </div>
        </div>

        <div className="modulo-row">
          <div className="modulo-info">
            <label>Graduados Full Stack (Meta Final)</label>
            <div className="modulo-inputs">
              <div className="sede-mini-input">
                <span className="label-punta">Puntarenas:</span>
                <input type="number" value={18} readOnly title="Dato de muestra" />
              </div>
              <div className="sede-mini-input">
                <span className="label-desam">Desamparados:</span>
                <input type="number" value={20} readOnly title="Dato de muestra" />
              </div>
            </div>
            <span className="total-badge gradient">Total: 38 graduados</span>
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
