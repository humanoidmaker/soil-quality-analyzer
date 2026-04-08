import { useState, useEffect } from 'react';
import { Clock, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../lib/api';

export default function History() {
  const [records, setRecords] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/analyze/history?page=${p}&limit=10`);
      setRecords(res.data.records);
      setTotalPages(res.data.pages);
      setPage(res.data.page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(1); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    try {
      await api.delete(`/analyze/history/${id}`);
      setRecords(records.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-8">
        <Clock size={32} className="text-accent" />
        Analysis History
      </h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 text-primary-400 text-xl">No analyses yet.</div>
      ) : (
        <div className="space-y-4">
          {records.map((r) => (
            <div key={r._id} className="bg-primary-800 rounded-xl p-6 border border-primary-700">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-bold text-white">{r.soil_type} Soil</span>
                    <span className="text-accent text-sm">{r.confidence}% confidence</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-sm">Moisture: {r.moisture}</span>
                    <span className="bg-green-900/30 text-green-300 px-2 py-1 rounded text-sm">pH: {r.estimated_ph}</span>
                    {r.location && <span className="bg-primary-700 text-primary-300 px-2 py-1 rounded text-sm">{r.location}</span>}
                  </div>
                  <p className="text-primary-400 text-sm mt-2">
                    {new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </p>
                </div>
                <button onClick={() => handleDelete(r._id)} className="text-primary-500 hover:text-red-400 p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button onClick={() => fetchHistory(page - 1)} disabled={page <= 1}
                className="p-2 bg-primary-700 rounded-lg disabled:opacity-50 text-white hover:bg-primary-600">
                <ChevronLeft size={20} />
              </button>
              <span className="text-primary-300">Page {page} of {totalPages}</span>
              <button onClick={() => fetchHistory(page + 1)} disabled={page >= totalPages}
                className="p-2 bg-primary-700 rounded-lg disabled:opacity-50 text-white hover:bg-primary-600">
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
