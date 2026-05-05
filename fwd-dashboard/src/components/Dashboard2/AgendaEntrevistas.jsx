import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { getEntrevistas, createEntrevista, updateEntrevista, deleteEntrevista } from '../../services/entrevistasService';
import FormularioEntrevista from './FormularioEntrevista';
import Swal from 'sweetalert2';
import './AgendaEntrevistas.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658'];

const AgendaEntrevistas = () => {
  const [entrevistas, setEntrevistas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // CRUD State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  
  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroSede, setFiltroSede] = useState('Todas');
  const [filtroEstado, setFiltroEstado] = useState('Todas');

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
      Swal.fire('Éxito', 'Entrevista agregada exitosamente.', 'success');
    } catch (error) {
      console.error('Error saving entrevista:', error);
      Swal.fire('Error', 'Ocurrió un error al guardar la entrevista.', 'error');
    }
  };

  const handleEditClick = (entrevista) => {
    setEditingId(entrevista.id);
    setEditForm(entrevista);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    try {
      await updateEntrevista(editingId, editForm);
      setEditingId(null);
      fetchEntrevistas();
      Swal.fire('¡Actualizado!', 'La entrevista ha sido actualizada correctamente.', 'success');
    } catch (error) {
      console.error('Error al actualizar:', error);
      Swal.fire('Error', 'No se pudo actualizar el registro.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡Esta acción no se puede deshacer!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteEntrevista(id);
        fetchEntrevistas();
        Swal.fire('Eliminado', 'La entrevista ha sido eliminada.', 'success');
      } catch (error) {
        console.error('Error al eliminar:', error);
        Swal.fire('Error', 'Ocurrió un error al intentar eliminar el registro.', 'error');
      }
    }
  };

  const syncGoogleSheets = async () => {
    try {
      setLoading(true);
      const urlBase = "https://docs.google.com/spreadsheets/d/1NCUo0H5VG5xTR7gIEK4tOWzwwXyQdOb103hNmXplnCk/gviz/tq?tqx=out:json";
      const sheets = ["Puntarenas", "Desamparados"];
      let nuevosRegistros = [];

      for (const sheet of sheets) {
        console.log(`Intentando sincronizar pestaña: ${sheet}`);
        const response = await fetch(`${urlBase}&sheet=${sheet}&t=${new Date().getTime()}`);
        const text = await response.text();
        
        // Extraer JSON de la respuesta de Google
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) {
          console.error(`Respuesta inválida de Google en pestaña ${sheet}:`, text);
          continue;
        }
        
        const jsonString = text.substring(start, end + 1);
        const data = JSON.parse(jsonString);

        if (data.status === 'error') {
          console.error(`Error de Google Sheets en pestaña ${sheet}:`, data.errors);
          continue;
        }

        const rows = data.table.rows;
        console.log(`Pestaña ${sheet}: ${rows.length} filas encontradas.`);

        rows.forEach((row, index) => {
          const c = row.c;
          if (!c || c.length < 5) return; // Fila vacía o demasiado corta

          // Col 4: Nombre
          const nombreCompleto = c[4]?.v;
          if (!nombreCompleto || String(nombreCompleto).trim() === "" || String(nombreCompleto).toLowerCase().includes('nombre')) {
            return; // Ignorar si no hay nombre o es la cabecera
          }

          const hora = c[1]?.f || c[1]?.v || "";
          const fecha = c[2]?.f || c[2]?.v || "";
          const semana = c[3]?.v || "";
          const telefono = c[5]?.v ? String(c[5].v) : "";
          const correo = c[6]?.v || "";
          const sede = c[7]?.v || sheet;
          const comoSeEntero = c[8]?.v || "Otro";
          const estado = c[9]?.v || "Agendada";
          const enviarCorreo = c[10]?.v || "No";
          const correoEnviado = c[11]?.v || "No";
          const decisionFinal = c[12]?.v || "Pendiente";

          // Limpiar el número de semana (Ej: "Semana 2" -> 2)
          let numSemana = null;
          if (semana) {
            const match = String(semana).match(/\d+/);
            numSemana = match ? parseInt(match[0]) : null;
          }

          nuevosRegistros.push({
            nombre: String(nombreCompleto).trim(),
            hora: String(hora).trim(),
            fecha: String(fecha).trim(),
            semana: numSemana,
            telefono: String(telefono).trim(),
            correo: String(correo).trim(),
            sede: String(sede).trim(),
            como_se_entero: String(comoSeEntero).trim(),
            estado: String(estado).trim(),
            enviar_correo: String(enviarCorreo).trim(),
            correo_enviado: String(correoEnviado).trim(),
            decision_final: String(decisionFinal).trim()
          });
        });
      }

      console.log("Registros procesados listos para subir:", nuevosRegistros.length);

      let agregados = 0;
      let actualizados = 0;

      for (const reg of nuevosRegistros) {
        const existente = entrevistas.find(e => 
          (e.nombre || '').trim().toLowerCase() === reg.nombre.toLowerCase()
        );

        if (!existente) {
          try {
            await createEntrevista(reg);
            agregados++;
          } catch (err) {
            console.error(`Error al insertar a ${reg.nombre}:`, err);
          }
        } else {
          // Compare relevant status fields to decide if update is needed
          const estadoExcel = reg.estado;
          const estadoDB = (existente.estado || "").trim();
          const decisionExcel = reg.decision_final;
          const decisionDB = (existente.decision_final || existente.decisionFinal || "").trim();

          if (estadoExcel.toLowerCase() !== estadoDB.toLowerCase() || 
              decisionExcel.toLowerCase() !== decisionDB.toLowerCase()) {
            
            const updatePayload = {
              ...existente,
              estado: estadoExcel,
              decision_final: decisionExcel
            };
            await updateEntrevista(existente.id, updatePayload);
            actualizados++;
          }
        }
      }

      if (agregados > 0 || actualizados > 0) {
        await fetchEntrevistas();
        Swal.fire({
          icon: 'success',
          title: 'Sincronización exitosa',
          html: `✅ <b>${agregados}</b> entrevistas nuevas.<br>🔄 <b>${actualizados}</b> estados actualizados.`
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Sin cambios',
          text: 'Las entrevistas en el Dashboard ya coinciden con el Excel.'
        });
      }

    } catch (error) {
      console.error('Error syncing Google Sheets:', error);
      Swal.fire('Error', 'Ocurrió un error al intentar sincronizar con Google Sheets.', 'error');
    } finally {
      setLoading(false);
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

  // Filtrado de entrevistas para la tabla
  const entrevistasFiltradas = useMemo(() => {
    return entrevistas.filter(e => {
      const matchBusqueda = (e.nombre || '').toLowerCase().includes(busqueda.toLowerCase());
      const matchSede = filtroSede === 'Todas' || e.sede === filtroSede;
      const matchEstado = filtroEstado === 'Todas' || e.estado === filtroEstado;
      return matchBusqueda && matchSede && matchEstado;
    });
  }, [entrevistas, busqueda, filtroSede, filtroEstado]);

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

  if (loading) return <div className="loading">Cargando Agenda...</div>;

  return (
    <div className="agenda-container">
      <div className="header-actions">
        <h2>Agenda de Entrevistas</h2>
        <div>
          <button className="btn-agregar" onClick={syncGoogleSheets} style={{ marginRight: '10px', backgroundColor: '#3b82f6' }}>
            🔄 Refrescar desde Google Sheets
          </button>
          <button className="btn-agregar" onClick={() => setIsModalOpen(true)}>
            + Agregar entrevista
          </button>
        </div>
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

      <div className="table-container" style={{ marginTop: '30px' }}>
        <div className="table-header-with-filters">
          <h3>Detalle de Entrevistas</h3>
          <div className="filter-bar">
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="filter-input"
            />
            <select value={filtroSede} onChange={(e) => setFiltroSede(e.target.value)} className="filter-select">
              <option value="Todas">Sede: Todas</option>
              <option value="Puntarenas">Puntarenas</option>
              <option value="Desamparados">Desamparados</option>
            </select>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="filter-select">
              <option value="Todas">Estado: Todos</option>
              <option value="Agendada">Agendada</option>
              <option value="Realizada">Realizada</option>
              <option value="No asistió">No asistió</option>
              <option value="Reprogramada">Reprogramada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="contacto-table">
            <thead>
              <tr>
                <th>Semana</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Nombre</th>
                <th>Sede</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Origen</th>
                <th>Estado</th>
                <th>Decisión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {entrevistasFiltradas.length > 0 ? (
                entrevistasFiltradas.map((e) => (
                  editingId === e.id ? (
                    <tr key={e.id} className="row-editing">
                      <td>
                        <input
                          type="number"
                          className="edit-input"
                          value={editForm.semana || ''}
                          onChange={(v) => setEditForm({...editForm, semana: v.target.value})}
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.fecha || ''}
                          onChange={(v) => setEditForm({...editForm, fecha: v.target.value})}
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.hora || ''}
                          onChange={(v) => setEditForm({...editForm, hora: v.target.value})}
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.nombre || ''}
                          onChange={(v) => setEditForm({...editForm, nombre: v.target.value})}
                        />
                      </td>
                      <td>
                        <select
                          className="edit-select"
                          value={editForm.sede || ''}
                          onChange={(v) => setEditForm({...editForm, sede: v.target.value})}
                        >
                          <option value="Puntarenas">Puntarenas</option>
                          <option value="Desamparados">Desamparados</option>
                        </select>
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.telefono || ''}
                          onChange={(v) => setEditForm({...editForm, telefono: v.target.value})}
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.correo || ''}
                          onChange={(v) => setEditForm({...editForm, correo: v.target.value})}
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.como_se_entero || editForm.comoSeEntero || ''}
                          onChange={(v) => setEditForm({...editForm, como_se_entero: v.target.value})}
                        />
                      </td>
                      <td>
                        <select
                          className="edit-select"
                          value={editForm.estado || ''}
                          onChange={(v) => setEditForm({...editForm, estado: v.target.value})}
                        >
                          <option value="Agendada">Agendada</option>
                          <option value="Realizada">Realizada</option>
                          <option value="No asistió">No asistió</option>
                          <option value="Reprogramada">Reprogramada</option>
                          <option value="Cancelada">Cancelada</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className="edit-select"
                          value={editForm.decision_final || editForm.decisionFinal || ''}
                          onChange={(v) => setEditForm({...editForm, decision_final: v.target.value})}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="Aceptado">Aceptado</option>
                          <option value="Rechazado">Rechazado</option>
                          <option value="Lista de espera">Lista de espera</option>
                        </select>
                      </td>
                      <td className="action-buttons">
                        <button className="btn-save-edit" onClick={handleSaveEdit} title="Guardar">✓</button>
                        <button className="btn-cancel-edit" onClick={handleCancelEdit} title="Cancelar">✕</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={e.id}>
                      <td>{e.semana}</td>
                      <td>{e.fecha}</td>
                      <td>{e.hora}</td>
                      <td><strong>{e.nombre}</strong></td>
                      <td>{e.sede}</td>
                      <td>{e.telefono}</td>
                      <td>{e.correo}</td>
                      <td>{e.como_se_entero || e.comoSeEntero}</td>
                      <td>
                        <span className={`badge-estado ${(e.estado || '').toLowerCase().replace(/\s+/g, '-')}`}>
                          {e.estado}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-decision ${(e.decision_final || e.decisionFinal || 'pendiente').toLowerCase().replace(/\s+/g, '-')}`}>
                          {e.decision_final || e.decisionFinal || 'Pendiente'}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button className="btn-edit" onClick={() => handleEditClick(e)} title="Editar">✏️</button>
                        <button className="btn-delete" onClick={() => handleDelete(e.id)} title="Eliminar">🗑️</button>
                      </td>
                    </tr>
                  )
                ))
              ) : (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>No se encontraron entrevistas con los filtros seleccionados.</td>
                </tr>
              )}
            </tbody>
          </table>
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
