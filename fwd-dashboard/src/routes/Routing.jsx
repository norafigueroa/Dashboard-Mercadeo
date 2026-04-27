import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard1 from '../pages/Dashboard1';
import Dashboard2 from '../pages/Dashboard2';
import Dashboard3 from '../pages/Dashboard3';

const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard1" replace />} />
      <Route path="/dashboard1" element={<Dashboard1 />} />
      <Route path="/dashboard2" element={<Dashboard2 />} />
      <Route path="/dashboard3" element={<Dashboard3 />} />
    </Routes>
  );
};

export default Routing;
