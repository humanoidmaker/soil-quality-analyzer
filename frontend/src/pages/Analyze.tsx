import { useState, useRef, useCallback } from 'react';
import { Upload, Leaf, Loader2, Droplets, Thermometer, Sprout, FlaskConical } from 'lucide-react';
import api from '../lib/api';

interface AnalysisResult {
  id: string;
  soil_type: string;
  confidence: number;
  moisture: string;
  estimated_ph: string;
  organic_matter: string;
  suitable_crops: string[];
  recommendations: string[];
  fertilizer_suggestion: string;
}

const SOIL_COLORS: Record<string, string> = {
  Clay: 'bg-red-800',
  Sandy: 'bg-yellow-600',
  Loamy: 'bg-amber-800',
  Silt: 'bg-stone-500',
  Peaty: 'bg-stone-900',
  Chalky: 'bg-gray-300',
  Saline: 'bg-gray-500',
};

export default function Analyze() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [location, setLocation] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setError('');
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith('image/')) handleFile(dropped);
  }, [handleFile]);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (location) formData.append('location', location);
      const res = await api.post('/analyze/soil', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Leaf size={32} className="text-accent" />
          Analyze Soil
        </h1>
        <p className="text-primary-400 mt-2">Upload a soil photo for AI-powered quality analysis</p>
      </header>

      <div className="border-4 border-dashed border-primary-600 rounded-2xl p-12 text-center hover:border-accent transition-colors cursor-pointer bg-primary-800/50"
        onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileInputRef.current?.click()}>
        {preview ? (
          <img src={preview} alt="Soil sample preview" className="max-h-72 mx-auto rounded-lg" />
        ) : (
          <div className="space-y-4">
            <Upload size={56} className="mx-auto text-primary-400" />
            <p className="text-xl text-primary-300">Drop a soil photo here or click to upload</p>
            <p className="text-primary-500">Supports JPG, PNG, WebP up to 10MB</p>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      <div className="mt-4">
        <label htmlFor="location" className="block text-primary-300 mb-2">Location (optional)</label>
        <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Farm 12, Pune, Maharashtra"
          className="w-full px-4 py-3 bg-primary-800 border border-primary-600 rounded-lg text-white focus:border-accent" />
      </div>

      <button onClick={handleAnalyze} disabled={!file || loading}
        className="w-full mt-4 bg-accent hover:bg-accent-700 disabled:opacity-50 text-white py-4 rounded-xl text-xl font-semibold flex items-center justify-center gap-3 transition-colors">
        {loading ? <Loader2 size={24} className="animate-spin" /> : <Leaf size={24} />}
        {loading ? 'Analyzing...' : 'Analyze Soil'}
      </button>

      {error && <div className="mt-4 bg-red-500/20 border border-red-500 text-red-300 px-6 py-4 rounded-xl">{error}</div>}

      {result && (
        <div className="mt-8 space-y-6">
          {/* Soil Type Card */}
          <div className="bg-primary-800 rounded-xl p-8 border border-primary-700">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full ${SOIL_COLORS[result.soil_type] || 'bg-gray-600'}`}></div>
              <div>
                <h2 className="text-3xl font-bold text-white">{result.soil_type} Soil</h2>
                <p className="text-primary-400">Confidence: {result.confidence}%</p>
              </div>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
              <Droplets size={28} className="text-blue-400 mb-3" />
              <p className="text-primary-400 text-sm">Moisture Level</p>
              <p className="text-white text-xl font-semibold">{result.moisture}</p>
            </div>
            <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
              <Thermometer size={28} className="text-green-400 mb-3" />
              <p className="text-primary-400 text-sm">Estimated pH</p>
              <p className="text-white text-xl font-semibold">{result.estimated_ph}</p>
              {/* pH Scale Visual */}
              <div className="mt-3 h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 to-blue-500 relative">
                {(() => {
                  const phMid = parseFloat(result.estimated_ph.split('-')[0]) || 7;
                  const pct = ((phMid - 3) / 11) * 100;
                  return <div className="absolute top-0 w-3 h-3 bg-white rounded-full border-2 border-primary-900" style={{ left: `${Math.min(Math.max(pct, 0), 100)}%` }}></div>;
                })()}
              </div>
              <div className="flex justify-between text-xs text-primary-500 mt-1">
                <span>3 Acidic</span>
                <span>7 Neutral</span>
                <span>14 Alkaline</span>
              </div>
            </div>
            <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
              <FlaskConical size={28} className="text-amber-400 mb-3" />
              <p className="text-primary-400 text-sm">Organic Matter</p>
              <p className="text-white text-xl font-semibold">{result.organic_matter}</p>
            </div>
          </div>

          {/* Crop Recommendations */}
          <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
              <Sprout size={22} className="text-green-400" />
              Suitable Crops
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {result.suitable_crops.map((crop, i) => (
                <div key={i} className="bg-green-900/30 border border-green-700/50 text-green-300 px-4 py-3 rounded-lg text-center font-medium">
                  {crop}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-primary-800 rounded-xl p-6 border border-primary-700">
            <h3 className="text-xl font-semibold text-white mb-4">Recommendations</h3>
            <ul className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="text-primary-300 flex items-start gap-2">
                  <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Fertilizer */}
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-accent mb-2">Fertilizer Suggestion</h3>
            <p className="text-white text-lg">{result.fertilizer_suggestion}</p>
          </div>
        </div>
      )}
    </div>
  );
}
