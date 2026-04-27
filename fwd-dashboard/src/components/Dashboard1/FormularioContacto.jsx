import { useState, useEffect } from 'react';
import './FormularioContacto.css';

const estados = [
  'Por contactar',
  'Espera de respuesta',
  'No contestó',
  'Confirmó asistencia',
  'Confirmó no asistencia',
  'Asistió al Campus Day',
  'Pasó a entrevista'
];

const FormularioContacto = ({ isOpen, onClose, onSave, contactoAEditar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    provincia: '',
    movil: '',
    sede: 'Puntarenas',
    estado: 'Por contactar',
    fechaContacto: ''
  });

  useEffect(() => {
    if (contactoAEditar) {
      setFormData(contactoAEditar);
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        provincia: '',
        movil: '',
        sede: 'Puntarenas',
        estado: 'Por contactar',
        fechaContacto: ''
      });
    }
  }, [contactoAEditar, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{contactoAEditar ? 'Editar Candidato' : 'Agregar Candidato'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre:</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Apellido:</label>
            <input type="text" name="apellido" value={formData.apellido} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Provincia:</label>
            <input type="text" name="provincia" value={formData.provincia} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Móvil:</label>
            <input type="text" name="movil" value={formData.movil} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Sede:</label>
            <select name="sede" value={formData.sede} onChange={handleChange}>
              <option value="Puntarenas">Puntarenas</option>
              <option value="Desamparados">Desamparados</option>
            </select>
          </div>

          <div className="form-group">
            <label>Estado:</label>
            <select name="estado" value={formData.estado} onChange={handleChange}>
              {estados.map(est => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fecha de contacto:</label>
            <input type="date" name="fechaContacto" value={formData.fechaContacto} onChange={handleChange} required />
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

export default FormularioContacto;
