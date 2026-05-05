import { BrowserRouter, Link, useLocation } from 'react-router-dom';
import Routing from './routes/Routing';
import logo from './assets/logo.png';
import { isAuthenticated, logout } from './services/authService';
import './App.css';

const Layout = () => {
  const isAuth = isAuthenticated();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (!isAuth || isLoginPage) {
    return <Routing />;
  }

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="FWD Logo" className="sidebar-logo" />
          <h2>FWD Dashboard</h2>
        </div>
        <ul>
          <li><Link to="/dashboard1">Contacto Inicial</Link></li>
          <li><Link to="/dashboard2">Entrevistas y Eventos</Link></li>
          <li><Link to="/dashboard3">Estadísticas Académicas</Link></li>
        </ul>
        <div className="sidebar-footer">
          <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </nav>
      <main className="main-content">
        <Routing />
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
