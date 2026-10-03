import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import ChangePassword from './pages/ChangePassword'
import Profile from './pages/profile'
import './App.css'

function App() {
    return (
        <Router>

            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
        </Router>
    )
}

export default App