import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getContactos, createContacto, updateContacto, deleteContacto } from '../../services/contactoService';
import { getCampusDays } from '../../services/entrevistasService';
import FormularioContacto from './FormularioContacto';
import Swal from 'sweetalert2';
import './ContactoInicial.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#d0ed57'];

const ContactoInicial = () => {
  const [contactos, setContactos] = useState([]);
  const [campusDays, setCampusDays] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // CRUD State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Campaign State
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignMessage, setCampaignMessage] = useState('Hola [Nombre], te saludamos de FWD. Notamos que aún no has respondido a nuestra convocatoria. ¡No te pierdas la oportunidad! Te invitamos a nuestro próximo Campus Day el 8 de mayo. ¿Te gustaría asistir?');
  const [pendingContacts, setPendingContacts] = useState([]);

  const fetchContactos = async () => {
    try {
      setLoading(true);
      const data = await getContactos();
      setContactos(data);
      const days = await getCampusDays();
      setCampusDays(days);
    } catch (error) {
      console.error('Error fetching contactos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactos();
  }, []);

  const handleSave = async (formData) => {
    try {
      await createContacto(formData);
      await fetchContactos();
      setIsModalOpen(false);
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Candidato agregado exitosamente.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error saving contacto:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar el candidato.'
      });
    }
  };

  const handleEditClick = (contacto) => {
    setEditingId(contacto.id);
    setEditForm(contacto);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    try {
      await updateContacto(editingId, editForm);
      setEditingId(null);
      fetchContactos();
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'Registro actualizado exitosamente.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error al actualizar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al actualizar el registro.'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteContacto(id);
        fetchContactos();
        Swal.fire(
          'Eliminado',
          'El registro ha sido eliminado.',
          'success'
        );
      } catch (error) {
        console.error('Error al eliminar:', error);
        Swal.fire(
          'Error',
          'Ocurrió un error al intentar eliminar el registro.',
          'error'
        );
      }
    }
  };

  const syncGoogleSheets = async () => {
    try {
      setLoading(true);
      const urlBase = "https://docs.google.com/spreadsheets/d/14q2Z3569zs6ZfBNmTzcXRSam7Ew8surXSUODCevkOMQ/gviz/tq?tqx=out:json";
      const sheets = ["Puntarenas", "Desamparados"];
      let nuevosRegistros = [];

      for (const sheet of sheets) {
        // Añadimos un timestamp para evitar el caché de Google
        const response = await fetch(`${urlBase}&sheet=${sheet}&t=${new Date().getTime()}`);
        const text = await response.text();
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);

        const cols = data.table.cols;
        const rows = data.table.rows;

        // Mapeo dinámico de columnas por nombre
        const colIdx = {
          estado: cols.findIndex(col => col.label?.toLowerCase().includes('estado')),
          nombre: cols.findIndex(col => col.label?.toLowerCase().includes('nombre')),
          apellido: cols.findIndex(col => col.label?.toLowerCase().includes('apellido')),
          provincia: cols.findIndex(col => col.label?.toLowerCase().includes('provincia')),
          movil: cols.findIndex(col => col.label?.toLowerCase().includes('movil') || col.label?.toLowerCase().includes('teléfono')),
          sede: cols.findIndex(col => col.label?.toLowerCase().includes('sede')),
          fecha: cols.findIndex(col => col.label?.toLowerCase().includes('fecha'))
        };

        // Fallback si no hay labels en las columnas (usar índices fijos)
        if (colIdx.nombre === -1) {
          colIdx.estado = 0; colIdx.nombre = 1; colIdx.apellido = 2; colIdx.provincia = 3; 
          colIdx.movil = 4; colIdx.sede = 5; colIdx.fecha = 6;
        }

        console.log(`Columnas detectadas en ${sheet}:`, colIdx);
        
        rows.forEach((row, index) => {
          const c = row.c;
          if (!c || (!c[colIdx.nombre]?.v && !c[colIdx.apellido]?.v)) return;
          
          // Tomamos el estado tal cual viene del Excel para que se refleje de inmediato
          const estado = (c[colIdx.estado]?.v || "Pendiente").trim();
          const nombre = c[colIdx.nombre]?.v || "";
          const apellido = c[colIdx.apellido]?.v || "";
          const provincia = c[colIdx.provincia]?.v || "";
          const movil = c[colIdx.movil]?.v ? String(c[colIdx.movil].v) : "";
          const sede = c[colIdx.sede]?.v || sheet;
          
          let fechaContacto = "";
          const rawFecha = c[colIdx.fecha]?.v;
          if (rawFecha) {
            if (typeof rawFecha === 'string' && rawFecha.startsWith('Date')) {
              // Parsear formato Date(2026,3,24) -> El mes en JS/Google es 0-indexed
              const match = rawFecha.match(/Date\((\d+),(\d+),(\d+)/);
              if (match) {
                fechaContacto = `${match[3]}/${parseInt(match[2]) + 1}/${match[1]}`;
              }
            } else {
              fechaContacto = c[colIdx.fecha]?.f || String(rawFecha);
            }
          }

          nuevosRegistros.push({
            nombre: String(nombre).trim(),
            apellido: String(apellido).trim(),
            provincia: String(provincia).trim(),
            movil: String(movil).trim(),
            sede: String(sede).trim(),
            estado: estado,
            fechaContacto: String(fechaContacto).trim()
          });
        });
      }

      let agregados = 0;
      let actualizados = 0;

      for (const reg of nuevosRegistros) {
        const existente = contactos.find(c => 
          c.nombre.trim().toLowerCase() === reg.nombre.trim().toLowerCase() && 
          c.apellido.trim().toLowerCase() === reg.apellido.trim().toLowerCase()
        );

        if (!existente) {
          // Si no existe, lo creamos
          await createContacto(reg);
          agregados++;
        } else {
          // Comparación robusta de estados
          const estadoExcel = reg.estado.trim();
          const estadoDB = (existente.estado || "").trim();

          if (estadoExcel.toLowerCase() !== estadoDB.toLowerCase()) {
            console.log(`Actualizando estado de ${existente.nombre}: "${estadoDB}" -> "${estadoExcel}"`);
            // Preparamos el objeto para actualizar asegurando que enviamos fechaContacto
            const updatePayload = {
              ...existente,
              estado: estadoExcel
            };
            await updateContacto(existente.id, updatePayload);
            actualizados++;
          }
        }
      }

      if (agregados > 0 || actualizados > 0) {
        await fetchContactos();
        Swal.fire({
          icon: 'success',
          title: 'Sincronización exitosa',
          html: `✅ <b>${agregados}</b> registros nuevos.<br>🔄 <b>${actualizados}</b> estados actualizados.`
        });
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Sin cambios',
          text: 'No se detectaron cambios. Los estados en el Dashboard ya coinciden con los del Excel.'
        });
      }

    } catch (error) {
      console.error('Error syncing Google Sheets:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error de sincronización',
        text: 'Ocurrió un error al intentar sincronizar con Google Sheets.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMassiveWhatsApp = () => {
    if (contactosFiltrados.length === 0) {
      Swal.fire('Lista vacía', 'No hay contactos filtrados para enviar el mensaje.', 'info');
      return;
    }

    // Paso 1: Editar el mensaje
    Swal.fire({
      title: `Difusión masiva (${contactosFiltrados.length} contactos)`,
      input: 'textarea',
      inputLabel: 'Edita el mensaje antes de continuar:',
      inputValue: 'Hola, te saludamos de FWD. Notamos que aún no has respondido a nuestra convocatoria. ¡No te pierdas la oportunidad! Te invitamos a nuestro próximo Campus Day el 8 de mayo. ¿Te gustaría asistir?',
      inputAttributes: { rows: 6 },
      showCancelButton: true,
      confirmButtonColor: '#25d366',
      confirmButtonText: 'Siguiente →',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => { if (!value) return 'El mensaje no puede estar vacío'; }
    }).then((result) => {
      if (!result.isConfirmed) return;

      const mensaje = result.value;

      // Extraer números formateados
      const numeros = contactosFiltrados
        .map(c => {
          const num = (c.movil || "").replace(/\D/g, '');
          if (!num) return null;
          return num.startsWith('506') ? `+${num}` : `+506${num}`;
        })
        .filter(Boolean);

      const listaNumeros = numeros.join('\n');

      // Paso 2: Mostrar números y opciones
      Swal.fire({
        title: `${numeros.length} números listos`,
        html: `
          <div style="text-align:left; margin-bottom:15px;">
            <p style="font-weight:600; margin-bottom:8px;">📋 Mensaje a enviar:</p>
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px; font-size:13px; max-height:80px; overflow-y:auto; white-space:pre-wrap;">${mensaje}</div>
          </div>
          <div style="text-align:left; margin-bottom:15px;">
            <p style="font-weight:600; margin-bottom:8px;">📱 Números (clic para copiar todos):</p>
            <textarea id="swal-numeros" readonly style="width:100%; height:120px; font-size:13px; border:1px solid #e2e8f0; border-radius:8px; padding:8px; resize:none;">${listaNumeros}</textarea>
          </div>
          <div style="text-align:left; background:#fffbeb; border-left:4px solid #f59e0b; padding:10px; border-radius:4px; font-size:12px; color:#92400e;">
            <b>¿Cómo crear la difusión?</b><br>
            1. Copia los números con el botón de abajo<br>
            2. Abre WhatsApp → Menú → Nueva difusión<br>
            3. Agrega los contactos y pega el mensaje
          </div>
        `,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: '📋 Copiar números',
        denyButtonText: '📝 Copiar mensaje',
        cancelButtonText: 'Cerrar',
        confirmButtonColor: '#25d366',
        denyButtonColor: '#3b82f6',
      }).then((action) => {
        if (action.isConfirmed) {
          navigator.clipboard.writeText(listaNumeros);
          Swal.fire({ icon: 'success', title: '¡Números copiados!', text: `${numeros.length} números en tu portapapeles. Ahora pégalos en tu lista de difusión de WhatsApp.`, timer: 3000 });
        } else if (action.isDenied) {
          navigator.clipboard.writeText(mensaje);
          Swal.fire({ icon: 'success', title: '¡Mensaje copiado!', text: 'Pégalo en tu difusión de WhatsApp.', timer: 2500 });
        }
      });
    });
  };

  // Filters State
  const [filtroSede, setFiltroSede] = useState('Todas');
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [filtroProvincia, setFiltroProvincia] = useState('Todas');
  const [filtroCampusDay, setFiltroCampusDay] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  // Filter options dinámicas basadas en lo que realmente hay en los datos
  const opcionesEstado = useMemo(() => {
    const states = new Set(contactos.map(c => (c.estado || "").trim()).filter(Boolean));
    return ['Todas', ...Array.from(states).sort()];
  }, [contactos]);

  const opcionesProvincia = useMemo(() => {
    const provs = new Set(contactos.map(c => c.provincia).filter(Boolean));
    return ['Todas', ...Array.from(provs)];
  }, [contactos]);

  // Filtered Contacts (Debe definirse antes que las stats)
  const contactosFiltrados = useMemo(() => {
    return contactos.filter(contacto => {
      const matchSede = filtroSede === 'Todas' || (contacto.sede || '').toLowerCase().includes(filtroSede.toLowerCase());
      
      // Filtro de estado robusto (ignora espacios y mayúsculas)
      const estadoLimpio = (contacto.estado || "").trim().toLowerCase();
      const filtroLimpio = filtroEstado.trim().toLowerCase();
      const matchEstado = filtroEstado === 'Todas' || estadoLimpio === filtroLimpio;
      
      const matchProvincia = filtroProvincia === 'Todas' || contacto.provincia === filtroProvincia;
      const matchCampusDay = filtroCampusDay === 'Todas' || contacto.campus_day_id === parseInt(filtroCampusDay);
      const matchBusqueda = busqueda === '' || 
        (contacto.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) || 
        (contacto.apellido || '').toLowerCase().includes(busqueda.toLowerCase());
      
      return matchSede && matchEstado && matchProvincia && matchCampusDay && matchBusqueda;
    }).sort((a, b) => {
      // Función para parsear fecha DD/MM/YYYY a objeto Date
      const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0);
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      };
      
      return parseDate(b.fechaContacto) - parseDate(a.fechaContacto);
    });
  }, [contactos, filtroSede, filtroEstado, filtroProvincia, filtroCampusDay, busqueda]);

  // Stats (Calculadas sobre los contactos filtrados para que sean dinámicas)
  const totalPostulantes = contactosFiltrados.length;
  const totalPuntarenas = contactosFiltrados.filter(c => (c.sede || '').toLowerCase().includes('puntarenas')).length;
  const totalDesamparados = contactosFiltrados.filter(c => (c.sede || '').toLowerCase().includes('desamparados')).length;

  // Estados reales extraídos dinámicamente de los datos
  const estadosReales = useMemo(() => {
    const states = new Set(contactosFiltrados.map(c => (c.estado || "").trim()).filter(Boolean));
    return Array.from(states).sort();
  }, [contactosFiltrados]);

  // Chart Data: Funnel de Conversión (estados dinámicos) 
  const dataFunnel = useMemo(() => {
    const counts = contactosFiltrados.reduce((acc, curr) => {
      const estado = (curr.estado || "").trim();
      if (estado) acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    return estadosReales.map(status => ({
      name: status,
      cantidad: counts[status] || 0
    }));
  }, [contactosFiltrados, estadosReales]);

  // Chart Data: Comparativa de Sedes por Estado (Stacked Bar, dinámico)
  const dataSedeEstado = useMemo(() => {
    const sedes = ['Puntarenas', 'Desamparados'];
    
    return sedes.map(sede => {
      const data = { name: sede };
      estadosReales.forEach(estado => {
        data[estado] = contactosFiltrados.filter(c => 
          (c.sede || '').toLowerCase().includes(sede.toLowerCase()) && 
          (c.estado || '').trim() === estado
        ).length;
      });
      return data;
    });
  }, [contactosFiltrados, estadosReales]);

  // Chart Data: Distribución por Sede (Doughnut)
  const dataSedesPie = useMemo(() => [
    { name: 'Puntarenas', value: totalPuntarenas },
    { name: 'Desamparados', value: totalDesamparados }
  ], [totalPuntarenas, totalDesamparados]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="contacto-inicial">
      <div className="header-actions">
        <h2>Dashboard de Contacto Inicial</h2>
        <div>
          <button className="btn-agregar" onClick={syncGoogleSheets} style={{ marginRight: '10px', backgroundColor: '#3b82f6' }}>
            🔄 Refrescar desde Google Sheets
          </button>
          <button className="btn-agregar" onClick={() => setIsModalOpen(true)}>
            + Agregar candidato
          </button>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <h3>Total de Postulantes</h3>
          <p className="stat-value">{totalPostulantes}</p>
        </div>
        <div className="stat-card">
          <h3>Sede Puntarenas</h3>
          <p className="stat-value">{totalPuntarenas}</p>
        </div>
        <div className="stat-card">
          <h3>Sede Desamparados</h3>
          <p className="stat-value">{totalDesamparados}</p>
        </div>
      </div>

      <div className="charts-container">
        <div className="chart-box">
          <h3>Funnel de Conversión</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataFunnel} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="cantidad" fill="#3b82f6" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#666' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Comparativa de Sedes por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataSedeEstado}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {estadosReales.map((estado, idx) => (
                <Bar key={estado} dataKey={estado} stackId="a" fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Distribución por Sede</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataSedesPie}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#0088FE" />
                <Cell fill="#FF8042" />
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-container">
        <div className="table-header-with-filters">
          <h3>Lista de Registros</h3>
          <div className="filter-bar">
            <input 
              type="text" 
              placeholder="Buscar por nombre/apellido..." 
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
              {opcionesEstado.map(op => (
                <option key={op} value={op}>{op === 'Todas' ? 'Estado: Todos' : op}</option>
              ))}
            </select>
            <select value={filtroProvincia} onChange={(e) => setFiltroProvincia(e.target.value)} className="filter-select">
              {opcionesProvincia.map(op => (
                <option key={op} value={op}>{op === 'Todas' ? 'Provincia: Todas' : op}</option>
              ))}
            </select>
            <select value={filtroCampusDay} onChange={(e) => setFiltroCampusDay(e.target.value)} className="filter-select">
              <option value="Todas">Evento: Todos</option>
              {campusDays.map(day => (
                <option key={day.id} value={day.id}>{day.nombre} ({day.fecha})</option>
              ))}
            </select>
            <button className="btn-agregar" onClick={handleMassiveWhatsApp} style={{ marginLeft: 'auto', backgroundColor: '#25d366' }}>
              🚀 Enviar WhatsApp Masivo
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="contacto-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Provincia</th>
                <th>Móvil</th>
                <th>Sede</th>
                <th>Estado</th>
                <th>Fecha de Contacto</th>
                <th>Evento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contactosFiltrados.length > 0 ? (
                contactosFiltrados.map((contacto) => (
                  editingId === contacto.id ? (
                    // ── MODO EDICIÓN ──
                    <tr key={contacto.id} className="row-editing">
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.nombre || ''}
                          onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.apellido || ''}
                          onChange={(e) => setEditForm({...editForm, apellido: e.target.value})}
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.provincia || ''}
                          onChange={(e) => setEditForm({...editForm, provincia: e.target.value})}
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.movil || ''}
                          onChange={(e) => setEditForm({...editForm, movil: e.target.value})}
                        />
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.sede || ''}
                          onChange={(e) => setEditForm({...editForm, sede: e.target.value})}
                        />
                      </td>
                      <td>
                        <select
                          className="edit-select"
                          value={editForm.estado || ''}
                          onChange={(e) => setEditForm({...editForm, estado: e.target.value})}
                        >
                          {opcionesEstado.filter(op => op !== 'Todas').map(op => (
                            <option key={op} value={op}>{op}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="edit-input"
                          value={editForm.fechaContacto || ''}
                          onChange={(e) => setEditForm({...editForm, fechaContacto: e.target.value})}
                        />
                      </td>
                      <td>
                        <select
                          className="edit-select"
                          value={editForm.campus_day_id || ''}
                          onChange={(e) => setEditForm({...editForm, campus_day_id: e.target.value})}
                        >
                          <option value="">Sin evento</option>
                          {campusDays.map(day => (
                            <option key={day.id} value={day.id}>{day.nombre}</option>
                          ))}
                        </select>
                      </td>
                      <td className="action-buttons">
                        <button className="btn-save-edit" onClick={handleSaveEdit} title="Guardar">✓</button>
                        <button className="btn-cancel-edit" onClick={handleCancelEdit} title="Cancelar">✕</button>
                      </td>
                    </tr>
                  ) : (
                    // ── MODO LECTURA ──
                    <tr key={contacto.id || Math.random()}>
                      <td>{contacto.nombre}</td>
                      <td>{contacto.apellido}</td>
                      <td>{contacto.provincia}</td>
                      <td>{contacto.movil}</td>
                      <td>
                        <span className={`badge-sede ${(contacto.sede || '').toLowerCase().replace(/\s+/g, '-')}`}>
                          {contacto.sede}
                        </span>
                      </td>
                      <td>{contacto.estado}</td>
                      <td>{contacto.fechaContacto}</td>
                      <td>
                        {campusDays.find(d => d.id === contacto.campus_day_id)?.nombre || '-'}
                      </td>
                      <td className="action-buttons">
                        <button className="btn-whatsapp" onClick={() => {
                          const num = (contacto.movil || "").replace(/\D/g, '');
                          if (!num) return;
                          const phone = num.startsWith('506') ? num : `506${num}`;
                          const msg = encodeURIComponent("Hola, te saludamos de FWD. Notamos que aún no has respondido a nuestra convocatoria. ¡No te pierdas la oportunidad! Te invitamos a nuestro próximo Campus Day el 8 de mayo. ¿Te gustaría asistir?");
                          window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
                        }} title="Enviar WhatsApp"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></button>
                        <button className="btn-edit" onClick={() => handleEditClick(contacto)} title="Editar">✏️</button>
                        <button className="btn-delete" onClick={() => handleDelete(contacto.id)} title="Eliminar">🗑️</button>
                      </td>
                    </tr>
                  )
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center">No hay registros que coincidan con los filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FormularioContacto 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
      />
    </div>
  );
};

export default ContactoInicial;
