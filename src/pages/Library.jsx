import { useEffect, useState } from 'react';
import api from '../services/api';
import { FileText, Image as ImageIcon, Trash2, CheckCircle, Clock, Database, Sparkles } from 'lucide-react';

export default function Library({ user }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- LOGIC: FETCH ITEMS (Functionality Unchanged) ---
    const fetchItems = async () => {
        try {
            const res = await api.get('/items');
            setItems(res.data);
        } catch (err) {
            console.error("Failed to load vault", err);
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC: AUTO-POLLING (Functionality Unchanged) ---
    useEffect(() => {
        fetchItems();
        const interval = setInterval(() => {
            const stillProcessing = items.some(item => !item.is_processed);
            if (stillProcessing || items.length === 0) {
                fetchItems();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [items.length]);

    // --- LOGIC: DELETE ITEM (Functionality Unchanged) ---
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this from your vault?")) return;
        try {
            await api.delete(`/items/${id}`);
            setItems(items.filter(item => item.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    return (
        <div className="flex-1 h-screen overflow-y-auto bg-white p-8 scrollbar-hide" style={{ fontFamily: 'Nunito, sans-serif' }}>

            {/* HEADER SECTION - Matches Dashboard Typography */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Your Knowledge Vault</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Manage and monitor your dumped data chunks</p>
                </div>
                <div className="bg-[#fcf8f4] px-4 py-2 rounded-2xl border border-orange-100 flex items-center gap-2 shadow-sm">
                    <Database size={14} className="text-[#F0AA67]" strokeWidth={3} />
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">{items.length} Items Saved</span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-6 h-6 border-4 border-orange-100 border-t-[#F0AA67] rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-5 rounded-[28px] border-2 border-slate-50 shadow-sm hover:border-orange-100 hover:shadow-md transition-all group animate-in fade-in zoom-in duration-300"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl transition-colors ${item.content_type.includes('pdf')
                                    ? 'bg-[#fef2f2] text-[#f87271]'
                                    : 'bg-[#fcf8f4] text-[#F0AA67]'
                                    }`}>
                                    {item.content_type.includes('pdf') ? <FileText size={20} strokeWidth={2.5} /> : <ImageIcon size={20} strokeWidth={2.5} />}
                                </div>

                                {item.is_processed ? (
                                    <div className="flex items-center text-[#608164] text-[8px] font-black bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 tracking-widest uppercase">
                                        <CheckCircle size={10} className="mr-1" strokeWidth={3} /> Ready
                                    </div>
                                ) : (
                                    <div className="flex items-center text-amber-600 text-[8px] font-black bg-amber-50 px-2 py-1 rounded-full border border-amber-100 tracking-widest uppercase animate-pulse">
                                        <Clock size={10} className="mr-1" strokeWidth={3} /> Processing
                                    </div>
                                )}
                            </div>

                            <h3 className="font-extrabold text-slate-700 text-sm truncate mb-0.5 group-hover:text-[#F0AA67] transition-colors">
                                {item.title || "Untitled Dump"}
                            </h3>
                            <p className="text-slate-400 text-[10px] font-bold mb-4">
                                {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center space-x-2">
                                    <span className="text-[8px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-slate-200">
                                        {item.content_type.split('/')[1] || 'FILE'}
                                    </span>
                                </div>

                                {user.username !== 'hr_guest' && (
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="text-slate-300 hover:text-red-400 transition-colors p-1"
                                    >
                                        <Trash2 size={16} strokeWidth={2.5} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EMPTY STATE - Matches Interaction Zone Style */}
            {!loading && items.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200 opacity-60 mx-auto max-w-2xl">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <Sparkles size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Vault is Empty</h3>
                    <p className="text-[11px] font-bold text-slate-300 mt-2">Go to the Dashboard to dump your knowledge</p>
                </div>
            )}
        </div>
    );
}