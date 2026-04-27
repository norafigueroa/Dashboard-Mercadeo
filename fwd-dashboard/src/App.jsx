import { BrowserRouter, Link } from 'react-router-dom';
import Routing from './routes/Routing';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="sidebar">
          <h2>FWD Dashboard</h2>
          <ul>
            <li><Link to="/dashboard1">Contacto Inicial</Link></li>
            <li><Link to="/dashboard2">Entrevistas y Eventos</Link></li>
            <li><Link to="/dashboard3">Estadísticas Académicas</Link></li>
          </ul>
        </nav>
        <main className="main-content">
          <Routing />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
