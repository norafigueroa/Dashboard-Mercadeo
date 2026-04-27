import { useState, useEffect } from 'react';
import { getFases } from '../../services/entrevistasService';
import './CronogramaFases.css';

const CronogramaFases = () => {
  const [fases, setFases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFases = async () => {
      try {
        setLoading(true);
        const data = await getFases();
        setFases(data);
      } catch (error) {
        console.error('Error fetching fases:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFases();
  }, []);

  if (loading) return <div className="loading">Cargando Cronograma...</div>;

  return (
    <div className="cronograma-container">
      <h3>Cronograma de Fases y Metas</h3>
      <div className="table-responsive">
        <table className="fases-table">
          <thead>
            <tr>
              <th>Fase</th>
              <th>Semana</th>
              <th>Período</th>
              <th>Meta</th>
              <th>Acumulado</th>
            </tr>
          </thead>
          <tbody>
            {fases.map(fase => (
              <tr key={fase.id}>
                <td>Fase {fase.fase}</td>
                <td>Semana {fase.semana}</td>
                <td>{fase.periodo}</td>
                <td className="text-right">{fase.meta}</td>
                <td className="text-right font-bold text-blue">{fase.acumulado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CronogramaFases;
