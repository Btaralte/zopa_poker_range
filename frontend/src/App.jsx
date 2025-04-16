import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateRange from './pages/CreateRange';
import ViewRange from './pages/ViewRange';

function App() {
  const token = useSelector((state) => state.auth.token);
  return (
    <Routes>
      <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/create_range" element={<CreateRange />} />
      <Route path="/view_range/:rangeId" element={<ViewRange />} />
    </Routes>
  );
}

export default App;