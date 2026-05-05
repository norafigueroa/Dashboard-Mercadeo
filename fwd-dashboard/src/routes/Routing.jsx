import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard1 from '../pages/Dashboard1';
import Dashboard2 from '../pages/Dashboard2';
import Dashboard3 from '../pages/Dashboard3';
import Login from '../components/Login/Login';
import { isAuthenticated } from '../services/authService';

const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

const Routing = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Navigate to="/dashboard1" replace /></PrivateRoute>} />
      <Route path="/dashboard1" element={<PrivateRoute><Dashboard1 /></PrivateRoute>} />
      <Route path="/dashboard2" element={<PrivateRoute><Dashboard2 /></PrivateRoute>} />
      <Route path="/dashboard3" element={<PrivateRoute><Dashboard3 /></PrivateRoute>} />
    </Routes>
  );
};

export default Routing;
