import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import Users from './pages/Users';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>

      {/* public route */}
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />

      {/* Protected Routes (Wrapped in the Layout Sidebar) */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/users" element={<Users/>} />
      </Route>

    </Routes>
  );
}

export default App;