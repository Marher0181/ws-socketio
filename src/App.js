import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';  // Componente de Login
import OrganizationList from './components/Organization';  // Componente de organización
import TaskList from './components/TaskList'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/organizations" element={<OrganizationList />} />
        <Route path="/task" element={<TaskList />} />
        {/* Otras rutas que puedas tener */}
      </Routes>
    </Router>
  );
}

export default App;
