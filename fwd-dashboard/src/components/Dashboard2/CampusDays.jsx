import { useState, useEffect } from 'react';
import { getCampusDays, updateCampusDay } from '../../services/entrevistasService';
import Swal from 'sweetalert2';
import './CampusDays.css';

const CampusDays = () => {
  const [campusDays, setCampusDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ asistentes: '', pasaron_a_entrevista: '' });

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
      pasaron_a_entrevista: campus.pasaron_a_entrevista || campus.pasaronAEntrevista || ''
    });
  };

  const handleSaveClick = async (id) => {
    try {
      await updateCampusDay(id, {
        asistentes: Number(editForm.asistentes),
        pasaron_a_entrevista: Number(editForm.pasaron_a_entrevista)
      });
      setEditingId(null);
      fetchCampusDays();
      Swal.fire('¡Éxito!', 'Resultados actualizados exitosamente.', 'success');
    } catch (error) {
      console.error('Error updating campus day:', error);
      Swal.fire('Error', 'Error al actualizar los resultados.', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  if (loading) return <div className="loading">Cargando Campus Days...</div>;

  const puntarenasDays = campusDays.filter(c => c.sede === 'Puntarenas');
  const desamparadosDays = campusDays.filter(c => c.sede === 'Desamparados');

  const renderCampusCard = (campus) => (
    <div key={campus.id} className={`campus-card ${campus.estado}`}>
      <h4>{campus.fecha}</h4>
      <p><strong>Evento:</strong> {campus.nombre}</p>
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
                <input type="number" name="pasaron_a_entrevista" value={editForm.pasaron_a_entrevista} onChange={handleChange} />
              </label>
              <div className="edit-actions">
                <button className="btn-save-small" onClick={() => handleSaveClick(campus.id)}>Guardar</button>
                <button className="btn-cancel-small" onClick={() => setEditingId(null)}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="view-mode">
              <p>Asistentes: <strong>{campus.asistentes ?? '-'}</strong></p>
              <p>Pasaron a entrevista: <strong>{campus.pasaron_a_entrevista || campus.pasaronAEntrevista || '-'}</strong></p>
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
  );

  return (
    <div className="campus-days-container">
      <h3 className="section-title">Seguimiento de Campus Days</h3>
      
      <div className="sede-section">
        <h4 className="sede-title sede-puntarenas">📍 Sede Puntarenas</h4>
        <div className="campus-grid">
          {puntarenasDays.length > 0 ? (
            puntarenasDays.map(renderCampusCard)
          ) : (
            <p className="no-data">No hay Campus Days registrados para esta sede.</p>
          )}
        </div>
      </div>

      <div className="sede-section" style={{ marginTop: '40px' }}>
        <h4 className="sede-title sede-desamparados">📍 Sede Desamparados</h4>
        <div className="campus-grid">
          {desamparadosDays.length > 0 ? (
            desamparadosDays.map(renderCampusCard)
          ) : (
            <p className="no-data">No hay Campus Days registrados para esta sede.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampusDays;
