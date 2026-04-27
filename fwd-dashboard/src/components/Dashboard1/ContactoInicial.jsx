import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getContactos, createContacto } from '../../services/contactoService';
import FormularioContacto from './FormularioContacto';
import './ContactoInicial.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ffc658', '#d0ed57'];

const ContactoInicial = () => {
  const [contactos, setContactos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchContactos = async () => {
    try {
      setLoading(true);
      const data = await getContactos();
      setContactos(data);
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
      alert('Candidato agregado exitosamente.');
    } catch (error) {
      console.error('Error saving contacto:', error);
      alert('Ocurrió un error al guardar el candidato.');
    }
  };

  // Stats
  const totalPostulantes = contactos.length;
  const totalPuntarenas = contactos.filter(c => c.sede === 'Puntarenas').length;
  const totalDesamparados = contactos.filter(c => c.sede === 'Desamparados').length;

  // Chart Data: Distribución por Estado
  const dataEstado = useMemo(() => {
    const counts = contactos.reduce((acc, curr) => {
      acc[curr.estado] = (acc[curr.estado] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, count: counts[key] }));
  }, [contactos]);

  // Chart Data: Distribución por Provincia
  const dataProvincia = useMemo(() => {
    const counts = contactos.reduce((acc, curr) => {
      const prov = curr.provincia || 'Desconocida';
      acc[prov] = (acc[prov] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [contactos]);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="contacto-inicial">
      <div className="header-actions">
        <h2>Dashboard de Contacto Inicial</h2>
        <button className="btn-agregar" onClick={() => setIsModalOpen(true)}>
          + Agregar candidato
        </button>
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
          <h3>Distribución por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataEstado} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" tick={{fontSize: 12}} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Distribución por Provincia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataProvincia}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {dataProvincia.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-container">
        <h3>Lista de Registros</h3>
        <div className="table-responsive">
          <table className="contacto-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Sede</th>
                <th>Estado</th>
                <th>Fecha de Contacto</th>
              </tr>
            </thead>
            <tbody>
              {contactos.length > 0 ? (
                contactos.map((contacto) => (
                  <tr key={contacto.id || Math.random()}>
                    <td>{contacto.nombre}</td>
                    <td>{contacto.apellido}</td>
                    <td>
                      <span className={`badge-sede ${contacto.sede.toLowerCase()}`}>
                        {contacto.sede}
                      </span>
                    </td>
                    <td>{contacto.estado}</td>
                    <td>{contacto.fechaContacto}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No hay registros disponibles.</td>
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
