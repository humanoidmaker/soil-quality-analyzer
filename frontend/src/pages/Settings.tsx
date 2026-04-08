import { useState } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';

export default function Settings() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    try {
      await api.put('/auth/profile', { name });
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.name = name;
      localStorage.setItem('user', JSON.stringify(stored));
      setSuccess('Profile updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-8">
        <SettingsIcon size={32} className="text-accent" /> Settings
      </h1>

      <div className="bg-primary-800 rounded-xl p-8 border border-primary-700 space-y-6">
        {success && <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg">{success}</div>}

        <div>
          <label htmlFor="name" className="block text-primary-300 mb-2">Display Name</label>
          <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-primary-700 border border-primary-600 rounded-lg text-white focus:border-accent" />
        </div>

        <div>
          <label className="block text-primary-300 mb-2">Email</label>
          <input type="email" value={user?.email || ''} disabled
            className="w-full px-4 py-3 bg-primary-700/50 border border-primary-600 rounded-lg text-primary-400 cursor-not-allowed" />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-accent hover:bg-accent-700 disabled:opacity-50 text-white py-3 rounded-lg text-lg font-semibold flex items-center justify-center gap-2">
          <Save size={20} /> {saving ? 'Saving...' : 'Save Profile'}
        </button>

        <hr className="border-primary-700" />

        <button onClick={logout}
          className="w-full bg-red-600/20 hover:bg-red-600/40 border border-red-600 text-red-400 py-3 rounded-lg font-semibold transition-colors">
          Log Out
        </button>
      </div>
    </div>
  );
}
