import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import Analyze from './pages/Analyze';
import CropGuide from './pages/CropGuide';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import { Leaf, Home, Clock, BarChart3, BookOpen, Settings as SettingsIcon, LogOut } from 'lucide-react';

function App() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  const navItems = [
    { path: '/', icon: Leaf, label: 'Analyze' },
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/crop-guide', icon: BookOpen, label: 'Crop Guide' },
    { path: '/history', icon: Clock, label: 'History' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-primary-900 flex">
      <nav className="w-64 bg-primary-800 border-r border-primary-700 flex flex-col">
        <div className="p-6 border-b border-primary-700">
          <h1 className="text-xl font-bold text-accent flex items-center gap-2">
            <Leaf size={24} />
            SoilSense
          </h1>
          <p className="text-primary-400 text-sm mt-1">Soil Quality Analyzer</p>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? 'bg-accent text-white'
                  : 'text-primary-300 hover:bg-primary-700 hover:text-white'
              }`}>
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-primary-700">
          <p className="text-primary-400 text-sm mb-2">{user.name}</p>
          <button onClick={logout} className="flex items-center gap-2 text-primary-400 hover:text-red-400 transition-colors w-full px-4 py-2">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Analyze />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/crop-guide" element={<CropGuide />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
