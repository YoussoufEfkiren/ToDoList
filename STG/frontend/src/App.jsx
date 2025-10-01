import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Tasks from './pages/Tasks';
import EditTask from './pages/EditTask';
import Notifications from './pages/Notifications'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/:id/edit" element={<EditTask />} />
        <Route path="/notifications" element={<Notifications />} /> 
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;