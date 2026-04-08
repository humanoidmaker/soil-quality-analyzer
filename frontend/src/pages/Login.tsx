import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Leaf, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf size={40} className="text-accent" />
            <h1 className="text-3xl font-bold text-white">SoilSense</h1>
          </div>
          <p className="text-primary-400 text-lg">Soil Quality Analyzer</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-primary-800 rounded-xl p-8 space-y-6 border border-primary-700">
          <h2 className="text-2xl font-bold text-white text-center">Sign In</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">{error}</div>
          )}

          <div>
            <label htmlFor="email" className="block text-primary-300 mb-2">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:border-accent focus:ring-2 focus:ring-accent/50" required />
          </div>

          <div>
            <label htmlFor="password" className="block text-primary-300 mb-2">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:border-accent focus:ring-2 focus:ring-accent/50" required />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent-700 disabled:opacity-50 text-white py-3 rounded-lg text-lg font-semibold flex items-center justify-center gap-2 transition-colors">
            <LogIn size={20} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-primary-400">
            No account? <Link to="/register" className="text-accent hover:underline">Register</Link>
          </p>
        </form>
        <p className="text-center text-primary-500 text-sm mt-6">Humanoid Maker - www.humanoidmaker.com</p>
      </div>
    </div>
  );
}
