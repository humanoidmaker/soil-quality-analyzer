import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import api from '../lib/api';

interface CropEntry {
  soil_type: string;
  ph_range: string;
  organic_matter: string;
  suitable_crops: string[];
  recommendations: string[];
  fertilizer: string;
}

export default function CropGuide() {
  const [guide, setGuide] = useState<CropEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/analyze/crop-guide');
        setGuide(res.data.guide);
      } catch (err) {
        console.error('Failed to load crop guide', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-8">
        <BookOpen size={32} className="text-accent" />
        Crop Guide
      </h1>

      {/* Compatibility Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-primary-800">
              <th className="px-4 py-3 text-left text-accent border border-primary-700">Soil Type</th>
              <th className="px-4 py-3 text-left text-accent border border-primary-700">pH Range</th>
              <th className="px-4 py-3 text-left text-accent border border-primary-700">Organic Matter</th>
              <th className="px-4 py-3 text-left text-accent border border-primary-700">Suitable Crops</th>
              <th className="px-4 py-3 text-left text-accent border border-primary-700">Fertilizer</th>
            </tr>
          </thead>
          <tbody>
            {guide.map((entry) => (
              <tr key={entry.soil_type}
                className={`cursor-pointer transition-colors ${selected === entry.soil_type ? 'bg-accent/20' : 'bg-primary-800/50 hover:bg-primary-700/50'}`}
                onClick={() => setSelected(selected === entry.soil_type ? null : entry.soil_type)}>
                <td className="px-4 py-3 text-white font-semibold border border-primary-700">{entry.soil_type}</td>
                <td className="px-4 py-3 text-primary-300 border border-primary-700">{entry.ph_range}</td>
                <td className="px-4 py-3 text-primary-300 border border-primary-700">{entry.organic_matter}</td>
                <td className="px-4 py-3 border border-primary-700">
                  <div className="flex flex-wrap gap-1">
                    {entry.suitable_crops.map((crop, i) => (
                      <span key={i} className="bg-green-900/30 text-green-300 px-2 py-0.5 rounded text-sm">{crop}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-primary-300 border border-primary-700 text-sm">{entry.fertilizer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded detail */}
      {selected && (() => {
        const entry = guide.find((g) => g.soil_type === selected);
        if (!entry) return null;
        return (
          <div className="mt-6 bg-primary-800 rounded-xl p-6 border border-accent/30">
            <h2 className="text-2xl font-bold text-accent mb-4">{entry.soil_type} Soil - Detailed Recommendations</h2>
            <ul className="space-y-2">
              {entry.recommendations.map((rec, i) => (
                <li key={i} className="text-primary-300 flex items-start gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        );
      })()}
    </div>
  );
}
