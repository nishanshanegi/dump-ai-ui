import { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, Plus, FileText, ChevronLeft, ChevronRight, ArrowRight, Loader } from 'lucide-react';
import api from '../services/api';
import Uploader from '../components/Uploader';
import ReactMarkdown from 'react-markdown';
// ── Load Font ──
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// ─────────────────────────────────────────
// KPI Card Component
// ─────────────────────────────────────────
const KpiCard = ({ title, value, description, bgColor, textColor }) => (
    <div className={`relative overflow-hidden p-6 rounded-[28px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.05)] flex flex-col justify-between h-32 flex-1 ${bgColor}`}>

        {/* BACKGROUND SHAPES (UNCHANGED) */}
        <div className="absolute" style={{ width: 120, height: 120, borderRadius: '50%', border: '20px solid rgba(255,255,255,0.12)', top: -30, right: -30 }} />
        <div className="absolute" style={{ width: 70, height: 70, borderRadius: '50%', border: '12px solid rgba(255,255,255,0.08)', bottom: -20, left: -20 }} />

        <div className="relative z-10">
            <h3 className={`text-3xl font-black tracking-tighter ${textColor}`}>
                {value}
            </h3>
        </div>

        <div className="relative z-10">
            <p className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-80 ${textColor}`}>
                {title}
            </p>

            {/* ✅ NEW DESCRIPTION */}
            <p className={`text-[10px] font-semibold opacity-70 mt-1 ${textColor}`}>
                {description}
            </p>
        </div>
    </div>
);

// ─────────────────────────────────────────
// Mini Calendar Component
// ─────────────────────────────────────────
// ─────────────────────────────────────────
// COMPONENT: Mini Calendar (WITH ACTIVITY DOTS)
// ─────────────────────────────────────────
const MiniCalendar = ({ data, currentMonth, currentYear, onPrev, onNext }) => {
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

    return (
        <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em]">
                    {monthName}, {currentYear}
                </p>
                <div className="flex space-x-1">
                    <button onClick={onPrev} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><ChevronLeft size={14} /></button>
                    <button onClick={onNext} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-500"><ChevronRight size={14} /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-y-3 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={i} className="text-[10px] font-bold text-slate-500">{d}</div>
                ))}
                {blanks.map(b => <div key={`b-${b}`} />)}
                {days.map(d => {
                    // 1. Construct the date string to check against our data
                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

                    // 2. Determine the status of the day
                    const hasActivity = data && data[dateStr] > 0;
                    const isToday = isCurrentMonth && d === today.getDate();

                    return (
                        <div key={d} className="relative py-1 flex items-center justify-center">
                            <div
                                className={`text-[11px] h-7 w-7 flex items-center justify-center rounded-full transition-all
                    ${isToday
                                        ? 'bg-[#F0AA67] text-white font-bold shadow-sm' // CASE: Today (Solid Orange)
                                        : hasActivity
                                            ? 'border-2 border-green-400 text-green-500 font-bold' // CASE: Activity (Red Ring, No BG)
                                            : 'text-slate-600' // CASE: Default
                                    }`}
                            >
                                {d}
                            </div>


                        </div>
                    );
                })}
            </div>
        </div>
    );
};
export default function Dashboard({ user, onNavigate }) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [currentChat, setCurrentChat] = useState(null);
    const [calendarData, setCalendarData] = useState({}); // <--- ADD THIS
    const [activities, setActivities] = useState([]);
    const [stats, setStats] = useState({ user_files: 0, user_chunks: 0, avg_latency: 0 });

    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(new Date().getFullYear());

    const fetchAllData = useCallback(async () => {
        try {
            const [sRes, aRes, cRes] = await Promise.all([
                api.get('/stats'),
                api.get('/activity'),
                api.get('/activity-calendar')
            ]);
            setStats(sRes.data);
            setActivities(aRes.data.slice(0, 2));
            setCalendarData(cRes.data); // <--- Make sure this matches the state name above
        } catch (err) { console.error("Sync error", err); }
    }, []);

    useEffect(() => {
        fetchAllData();
        const interval = setInterval(fetchAllData, 10000);
        return () => clearInterval(interval);
    }, [fetchAllData]);

    const handleAsk = async (text) => {
        const searchText = text || query;
        if (!searchText.trim() || loading) return;

        setLoading(true);
        setCurrentChat(null);

        try {
            const res = await api.get(`/ask?q=${encodeURIComponent(searchText)}`);
            setCurrentChat({
                q: searchText,
                a: res.data.answer,
                sources: res.data.sources,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            setQuery('');
        } catch (err) {
            console.error("AI Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden" style={{ fontFamily: 'Nunito, sans-serif' }}>

            {/* ── LEFT COLUMN ── */}
            <div className="w-[300px] bg-[#fcfcfc] p-6 overflow-y-auto scrollbar-hide border-r border-slate-200 flex-shrink-0 flex flex-col">
                <header className="mb-6">
                    <h2 className="text-3xl font-black text-slate-800 leading-tight">Happy<br />{new Date().toLocaleDateString('en-US', { weekday: 'long' })} 👋</h2>
                    <p className="text-slate-600 text-[10px] font-bold uppercase mt-1">
                        {new Date().toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </p>

                </header>

                <div className="flex flex-col gap-2 mb-8">
                    <button onClick={() => setShowUpload(true)} className="w-full bg-[#F0AA67] text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-sm flex items-center justify-center gap-2 transition-all hover:brightness-95">
                        <Plus size={14} strokeWidth={4} /> Dump Knowledge
                    </button>
                    <button onClick={() => onNavigate('library')} className="w-full bg-white text-[#F0AA67] border-2 border-orange-200 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-orange-50 transition-all text-center">
                        Go to your Dump
                    </button>
                </div>

                <div className="mb-6">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Latest Vault</h3>
                    <div className="space-y-3">
                        {activities.map(act => (
                            <div key={act.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${act.status === 'ready' ? 'bg-[#F0AA67]' : 'bg-amber-300 animate-pulse'}`} />
                                    <p className="text-[11px] font-bold text-slate-500 truncate w-28">{act.title}</p>
                                </div>
                                <FileText size={12} className="text-slate-200" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="-mt-6">
                    <MiniCalendar
                        data={calendarData} // <--- Pass the real state here
                        currentMonth={calMonth}
                        currentYear={calYear}
                        onPrev={() => calMonth === 0 ? (setCalMonth(11), setCalYear(calYear - 1)) : setCalMonth(calMonth - 1)}
                        onNext={() => calMonth === 11 ? (setCalMonth(0), setCalYear(calYear + 1)) : setCalMonth(calMonth + 1)}
                    />
                </div>
            </div>

            {/* ── RIGHT COLUMN ── */}
            <div className="flex-1 p-8 overflow-y-auto bg-white scrollbar-hide flex flex-col">
                {/* KPIs with new Shadow */}
                <div className="flex gap-4 mb-6">
                    <KpiCard
                        title="Your Vault"
                        value={stats.user_files}
                        description="Total files stored"
                        bgColor="bg-[#f87271]"
                        textColor="text-white"
                    />

                    <KpiCard
                        title="Semantic Density"
                        value={stats.user_chunks}
                        description="Chunks processed for AI"
                        bgColor="bg-[#608164]"
                        textColor="text-white"
                    />
                    <KpiCard
                        title="Recall Velocity"
                        value={`${stats.avg_latency}s`}
                        description="Avg response time"
                        bgColor="bg-[#5bb6e6]"
                        textColor="text-white"
                    />
                </div>

                {/* SEARCH SECTION (Reduced Margin Bottom) */}
                <div className="bg-[#fcf8f4] rounded-[32px] p-5 mb-4 border border-orange-200">
                    <h2 className="text-lg font-black text-slate-800 mb-3 tracking-tight">What do you want to recall?</h2>
                    <div className="flex items-center bg-white rounded-2xl shadow-sm px-4 py-1.5 gap-3 border border-orange-100/50 focus-within:ring-4 focus-within:ring-[#F0AA67]/10 transition-all w-full">
                        <Search size={18} className="text-[#F0AA67]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                            placeholder="Ask anything from your vault..."
                            className="flex-1 text-sm font-semibold text-slate-600 bg-transparent outline-none py-2"
                        />
                        <button
                            onClick={() => handleAsk()}
                            disabled={!query.trim() || loading}
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all shadow-sm"
                            style={{ background: query.trim() ? '#F0AA67' : '#f7c79a' }}
                        >
                            {loading ? <Loader size={14} className="animate-spin" /> : <ArrowRight size={16} strokeWidth={3} />}
                        </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Try:</span>
                        {["Electricity bill?", "Project items?"].map(s => (
                            <button key={s} onClick={() => handleAsk(s)} className="text-[9px] font-bold text-[#c97940] bg-white border border-orange-100 px-2.5 py-0.5 rounded-full hover:bg-[#F0AA67] hover:text-white transition-all">{s}</button>
                        ))}
                    </div>
                </div>

                {/* CHAT HISTORY / INTERACTION ZONE (Height Preserved, Margin Bottom Removed) */}
                <div className="flex-1 min-h-0">
                    <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-300 h-[300px] overflow-y-auto scrollbar-hide relative flex flex-col shadow-inner">

                        {/* 1. THE EMPTY STATE */}
                        {/* 3. THE SINGLE ANSWER (RE-ADDED & CLEANED) */}
                        {currentChat && !loading && (
                            <div className="p-8 animate-in fade-in zoom-in-95 duration-500 w-full">

                                {/* Header: What was searched */}
                                <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F0AA67] mb-1">Knowledge Retrieval</span>
                                        <p className="text-xs font-bold text-slate-400 italic">"{currentChat.q}"</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-300 bg-slate-50 px-2 py-1 rounded-lg">
                                        {currentChat.time}
                                    </span>
                                </div>

                                {/* The Core Content: No Sparkles, Just Clean Typography */}
                                <div className="flex flex-col">
                                    <div className="prose prose-slate max-w-none text-slate-700 font-medium leading-relaxed mb-8">
                                        <ReactMarkdown
                                            components={{
                                                // Style code blocks specifically
                                                code: ({ node, ...props }) => (
                                                    <span className="bg-slate-900 text-emerald-400 px-2 py-1 rounded-md font-mono text-xs" {...props} />
                                                ),
                                                // Style lists
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-6 space-y-2 mt-4" {...props} />,
                                                li: ({ node, ...props }) => <li className="text-sm font-bold text-slate-600" {...props} />,
                                                // Style bold text
                                                strong: ({ node, ...props }) => <span className="font-black text-[#F0AA67]" {...props} />,
                                            }}
                                        >
                                            {currentChat.a}
                                        </ReactMarkdown>
                                    </div>

                                    {/* Evidence Section */}
                                    {currentChat.sources?.length > 0 && (
                                        <div className="pt-6 border-t border-slate-50">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">
                                                Verified Sources
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {currentChat.sources.map((s, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-2 bg-[#fcf8f4] px-3 py-1.5 rounded-full border border-orange-50 transition-all hover:border-[#F0AA67]"
                                                    >
                                                        <div className="w-1 h-1 rounded-full bg-[#F0AA67]" />
                                                        <span className="text-[10px] font-bold text-slate-500 truncate max-w-[150px]">
                                                            {s.title}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 2. THE LOADING STATE */}
                        {loading && (
                            <div className="flex flex-col items-center justify-center h-full">
                                <div className="flex gap-2 mb-3">
                                    <div className="w-2 h-2 bg-[#F0AA67] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-[#F0AA67] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-[#F0AA67] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <p className="text-[9px] font-black text-[#F0AA67] uppercase tracking-widest animate-pulse">AI is retrieving memory...</p>
                            </div>
                        )}

                        {/* 3. THE SINGLE ANSWER */}
                        {/* 1. THE EMPTY STATE (Neural Standby Theme) */}
                        {!loading && !currentChat && (
                            <div className="flex flex-col items-center justify-center h-full px-12 text-center animate-in fade-in duration-700">

                                {/* Animated AI Pulse Icon */}
                                <div className="relative mb-8">
                                    <div className="absolute inset-0 bg-[#F0AA67]/20 rounded-full animate-ping scale-150 opacity-20" />

                                </div>

                                {/* Intelligence Status Text */}
                                <div className="space-y-2">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#F0AA67]">
                                        Neural Standby
                                    </h3>

                                    <p className="text-sm font-black text-slate-800 tracking-tight">
                                        Vault Synchronized & Ready
                                    </p>

                                    <p className="text-xs font-semibold text-slate-400 leading-relaxed max-w-[280px] mx-auto">
                                        Semantic retrieval engine is active. Ask a natural language question to begin knowledge synthesis.
                                    </p>
                                </div>

                                {/* System Details (Tiny labels for high-end feel) */}
                                <div className="mt-10 flex gap-4 opacity-100">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Vector Core Online</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-blue-500" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">RAG Pipeline Ready</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showUpload && <Uploader onClose={() => { setShowUpload(false); fetchAllData(); }} />}
        </div>
    );
}
