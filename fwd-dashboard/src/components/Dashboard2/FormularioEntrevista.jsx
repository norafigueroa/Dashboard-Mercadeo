import { useState, useEffect } from 'react';
import './FormularioEntrevista.css';

const origenOpciones = ['Redes sociales', 'Referido', 'Campus Day', 'Sitio web', 'Visita al site', 'Otro'];
const estadoOpciones = ['Agendada', 'Realizada', 'No asistió', 'Reprogramada', 'Cancelada'];
const decisionOpciones = ['Aceptado', 'Rechazado', 'Lista de espera', 'Pendiente'];

const FormularioEntrevista = ({ isOpen, onClose, onSave, entrevistaAEditar }) => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefono: '',
    correo: '',
    sede: 'Puntarenas',
    comoSeEntero: 'Redes sociales',
    estado: 'Agendada',
    hora: '',
    fecha: '',
    semana: '',
    enviarCorreo: 'Sí',
    correoEnviado: 'No',
    formularioCompleto: 'No',
    decisionFinal: 'Pendiente'
  });

  useEffect(() => {
    if (entrevistaAEditar) {
      setFormData(entrevistaAEditar);
    } else {
      setFormData({
        nombreCompleto: '',
        telefono: '',
        correo: '',
        sede: 'Puntarenas',
        comoSeEntero: 'Redes sociales',
        estado: 'Agendada',
        hora: '',
        fecha: '',
        semana: '',
        enviarCorreo: 'Sí',
        correoEnviado: 'No',
        formularioCompleto: 'No',
        decisionFinal: 'Pendiente'
      });
    }
  }, [entrevistaAEditar, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content entrevista-modal">
        <h2>{entrevistaAEditar ? 'Editar Entrevista' : 'Agregar Entrevista'}</h2>
        <form onSubmit={handleSubmit} className="entrevista-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre completo:</label>
              <input type="text" name="nombreCompleto" value={formData.nombreCompleto} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Teléfono:</label>
              <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Correo electrónico:</label>
              <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Sede:</label>
              <select name="sede" value={formData.sede} onChange={handleChange}>
                <option value="Puntarenas">Puntarenas</option>
                <option value="Desamparados">Desamparados</option>
              </select>
            </div>

            <div className="form-group">
              <label>¿Cómo se enteró?</label>
              <select name="comoSeEntero" value={formData.comoSeEntero} onChange={handleChange}>
                {origenOpciones.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Estado:</label>
              <select name="estado" value={formData.estado} onChange={handleChange}>
                {estadoOpciones.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Hora:</label>
              <input type="time" name="hora" value={formData.hora} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Fecha:</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Semana:</label>
              <input type="number" name="semana" value={formData.semana} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>¿Enviar correo?</label>
              <select name="enviarCorreo" value={formData.enviarCorreo} onChange={handleChange}>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label>¿Correo enviado?</label>
              <select name="correoEnviado" value={formData.correoEnviado} onChange={handleChange}>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label>¿Formulario completo?</label>
              <select name="formularioCompleto" value={formData.formularioCompleto} onChange={handleChange}>
                <option value="Sí">Sí</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label>Decisión Final:</label>
              <select name="decisionFinal" value={formData.decisionFinal} onChange={handleChange}>
                {decisionOpciones.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-save">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioEntrevista;
