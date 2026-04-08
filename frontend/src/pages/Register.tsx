import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Leaf, UserPlus } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
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
        </div>
        <form onSubmit={handleSubmit} className="bg-primary-800 rounded-xl p-8 space-y-5 border border-primary-700">
          <h2 className="text-2xl font-bold text-white text-center">Register</h2>
          {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">{error}</div>}
          <div>
            <label htmlFor="name" className="block text-primary-300 mb-2">Full Name</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:border-accent" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-primary-300 mb-2">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:border-accent" required />
          </div>
          <div>
            <label htmlFor="password" className="block text-primary-300 mb-2">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:border-accent" required />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-primary-300 mb-2">Confirm Password</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:border-accent" required />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-accent hover:bg-accent-700 disabled:opacity-50 text-white py-3 rounded-lg text-lg font-semibold flex items-center justify-center gap-2">
            <UserPlus size={20} /> {loading ? 'Creating...' : 'Create Account'}
          </button>
          <p className="text-center text-primary-400">
            Have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
