import './SelectorGeneracion.css';

const SelectorGeneracion = ({ generaciones, selectedId, onChange }) => {
  return (
    <div className="selector-container">
      <label htmlFor="generacion-select">Seleccione una Generación:</label>
      <select 
        id="generacion-select" 
        value={selectedId} 
        onChange={(e) => onChange(e.target.value)}
        className="generacion-select"
      >
        {generaciones.map(gen => (
          <option key={gen.id} value={gen.id}>
            {gen.nombre} ({gen.estado === 'en_curso' ? 'En Curso' : 'Finalizada'})
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectorGeneracion;
