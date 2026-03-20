import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import CycleTracker from './pages/CycleTracker';
import Profile from './pages/Profile';
import Setup from './pages/Setup';
import AdminDashboard from './pages/AdminDashboard';
import Reports from './pages/Reports';
import Exercises from './pages/Exercises';
import { useAuth } from './context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const AppContent = () => {
    const { user, checkSetupRequired, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        const verifySetup = async () => {
            if (!loading) {
                const setupRequired = await checkSetupRequired();
                if (setupRequired && location.pathname !== '/setup') {
                    navigate('/setup');
                } else if (!setupRequired && location.pathname === '/setup') {
                    navigate('/login');
                }
            }
        };
        verifySetup();
    }, [location.pathname, loading, checkSetupRequired, navigate]);

    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/" element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Dashboard />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/cycle" element={<CycleTracker />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/exercises" element={<Exercises />} />
                    <Route path="/setup" element={<Setup />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
            </main>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
