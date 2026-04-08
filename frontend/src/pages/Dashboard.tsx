import { useState, useEffect } from 'react';
import { BarChart3, Leaf, Droplets, Sprout } from 'lucide-react';
import api from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, topSoil: 'N/A', avgConfidence: 0, uniqueLocations: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/analyze/history?page=1&limit=10');
        const records = res.data.records;
        setRecent(records.slice(0, 5));

        const soilCounts: Record<string, number> = {};
        const locations = new Set<string>();
        let confSum = 0;
        records.forEach((r: any) => {
          soilCounts[r.soil_type] = (soilCounts[r.soil_type] || 0) + 1;
          if (r.location) locations.add(r.location);
          confSum += r.confidence;
        });
        const topSoil = Object.entries(soilCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        setStats({
          total: res.data.total,
          topSoil,
          avgConfidence: records.length ? Math.round(confSum / records.length) : 0,
          uniqueLocations: locations.size,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <div className="p-8 flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div></div>;
  }

  const cards = [
    { label: 'Total Analyses', value: stats.total, icon: Leaf, color: 'text-accent' },
    { label: 'Top Soil Type', value: stats.topSoil, icon: Sprout, color: 'text-green-400' },
    { label: 'Avg Confidence', value: `${stats.avgConfidence}%`, icon: BarChart3, color: 'text-blue-400' },
    { label: 'Locations', value: stats.uniqueLocations, icon: Droplets, color: 'text-cyan-400' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-8">
        <BarChart3 size={32} className="text-accent" /> Dashboard
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-primary-800 rounded-xl p-6 border border-primary-700">
            <c.icon size={28} className={c.color} />
            <p className="text-3xl font-bold text-white mt-3">{c.value}</p>
            <p className="text-primary-400 mt-1">{c.label}</p>
          </div>
        ))}
      </div>
      <h2 className="text-xl font-semibold text-white mb-4">Recent Analyses</h2>
      <div className="space-y-3">
        {recent.length === 0 ? (
          <p className="text-primary-400">No analyses yet.</p>
        ) : recent.map((r: any) => (
          <div key={r._id} className="bg-primary-800 rounded-lg p-4 border border-primary-700 flex items-center justify-between">
            <div>
              <span className="text-white font-medium">{r.soil_type} Soil</span>
              <span className="text-primary-400 text-sm ml-3">
                {new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </span>
            </div>
            <span className="text-accent font-semibold">{r.confidence}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
