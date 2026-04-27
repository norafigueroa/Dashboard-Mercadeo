import { useState, useEffect } from 'react';
import { getCampusDays, updateCampusDay } from '../../services/entrevistasService';
import './CampusDays.css';

const CampusDays = () => {
  const [campusDays, setCampusDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ asistentes: '', pasaronAEntrevista: '' });

  const fetchCampusDays = async () => {
    try {
      setLoading(true);
      const data = await getCampusDays();
      setCampusDays(data);
    } catch (error) {
      console.error('Error fetching campus days:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampusDays();
  }, []);

  const handleEditClick = (campus) => {
    setEditingId(campus.id);
    setEditForm({
      asistentes: campus.asistentes || '',
      pasaronAEntrevista: campus.pasaronAEntrevista || ''
    });
  };

  const handleSaveClick = async (id) => {
    try {
      await updateCampusDay(id, {
        asistentes: Number(editForm.asistentes),
        pasaronAEntrevista: Number(editForm.pasaronAEntrevista)
      });
      setEditingId(null);
      fetchCampusDays();
      alert('Resultados actualizados exitosamente.');
    } catch (error) {
      console.error('Error updating campus day:', error);
      alert('Error al actualizar los resultados.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="loading">Cargando Campus Days...</div>;

  return (
    <div className="campus-days-container">
      <h3>Seguimiento de Campus Days</h3>
      <div className="campus-grid">
        {campusDays.map(campus => (
          <div key={campus.id} className={`campus-card ${campus.estado}`}>
            <h4>{campus.nombre}</h4>
            <p><strong>Fecha:</strong> {campus.fecha}</p>
            <p><strong>Sede:</strong> {campus.sede}</p>
            <div className="campus-status">
              <span className={`badge ${campus.estado}`}>{campus.estado.toUpperCase()}</span>
            </div>

            {campus.estado === 'realizado' ? (
              <div className="campus-editable">
                {editingId === campus.id ? (
                  <div className="edit-mode">
                    <label>
                      Asistentes: 
                      <input type="number" name="asistentes" value={editForm.asistentes} onChange={handleChange} />
                    </label>
                    <label>
                      A entrevista: 
                      <input type="number" name="pasaronAEntrevista" value={editForm.pasaronAEntrevista} onChange={handleChange} />
                    </label>
                    <button className="btn-save-small" onClick={() => handleSaveClick(campus.id)}>Guardar</button>
                    <button className="btn-cancel-small" onClick={() => setEditingId(null)}>Cancelar</button>
                  </div>
                ) : (
                  <div className="view-mode">
                    <p>Asistentes: <strong>{campus.asistentes ?? '-'}</strong></p>
                    <p>Pasaron a entrevista: <strong>{campus.pasaronAEntrevista ?? '-'}</strong></p>
                    <button className="btn-edit-small" onClick={() => handleEditClick(campus)}>Editar resultados</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="campus-pending">
                <p><em>Pendiente de realizar</em></p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampusDays;
