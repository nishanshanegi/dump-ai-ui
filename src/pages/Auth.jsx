import { useState } from 'react';
import api from '../services/api';
import { Lock, User, ArrowRight, Sparkles, ShieldCheck, Database, FileText, Image as ImageIcon, MessageSquare } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleDemoLogin = async () => {
        try {
            const res = await api.get('/auth/demo-login');
            localStorage.setItem('token', res.data.access_token);
            onLoginSuccess();
        } catch (err) {
            alert("Demo account is waking up. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                // Login Logic
                const params = new URLSearchParams();
                params.append('username', username);
                params.append('password', password);

                const res = await api.post('/auth/login', params); // Use 'api' and relative path
                localStorage.setItem('token', res.data.access_token);
                onLoginSuccess();
            } else {
                // Signup Logic (UPDATED for the new Pydantic validation)
                // WHY: We now send data as a JSON object, not in the URL string.
                await api.post('/auth/signup', {
                    username: username,
                    password: password
                });
                setIsLogin(true);
                alert("Vault created! Please login.");
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Authentication failed');
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-['Nunito'] overflow-hidden">

            {/* ── LEFT SIDE: THE ILLUSTRATION (THE VISUAL "DUMP") ── */}
            <div className="hidden lg:flex w-1/2 bg-[#fcf8f4] relative items-center justify-center overflow-hidden border-r border-orange-50">
                {/* Decorative Background Circles */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#F0AA67]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#f87271]/5 rounded-full blur-[100px]" />

                {/* CENTRAL BRAIN/VAULT HUB */}
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-12">
                        {/* The "Brain" Container */}
                        <div className="w-32 h-32 bg-white rounded-[40px] shadow-2xl flex items-center justify-center relative z-20 border border-orange-100">
                            <Database size={56} className="text-[#F0AA67]" fill="#F0AA67" fillOpacity={0.1} />
                        </div>

                        {/* FLOATING ELEMENTS (The "Dumped" Knowledge) */}
                        <div className="absolute top-[-40px] right-[-60px] w-14 h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce text-red-400 border border-red-50" style={{ animationDuration: '3s' }}>
                            <FileText size={24} />
                        </div>
                        <div className="absolute bottom-[-20px] left-[-70px] w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-pulse text-blue-400 border border-blue-50">
                            <ImageIcon size={28} />
                        </div>
                        <div className="absolute top-[20px] left-[-80px] w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-bounce text-emerald-400 border border-emerald-50" style={{ animationDuration: '4s' }}>
                            <MessageSquare size={20} />
                        </div>
                        <div className="absolute bottom-[60px] right-[-80px] w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center animate-pulse text-amber-400 border border-amber-50">
                            <Sparkles size={18} />
                        </div>
                    </div>

                    <div className="text-center px-12">
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">
                            All your knowledge,<br />in one single dump.
                        </h2>
                        <p className="text-slate-400 text-sm font-semibold max-w-sm leading-relaxed">
                            Stop organizing folders. Just dump your PDFs, Images, and Notes. Our AI creates a neural map for instant recall.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── RIGHT SIDE: THE FORM ── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 relative">

                <div className="w-full max-w-md">
                    {/* Brand Header */}
                    <div className="mb-10 lg:hidden flex flex-col items-center">
                        <div className="w-12 h-12 bg-[#F0AA67] rounded-xl flex items-center justify-center text-white mb-4 shadow-md">
                            <Sparkles size={24} fill="currentColor" />
                        </div>
                        <h1 className="text-2xl font-black text-slate-800">DumpAI</h1>
                    </div>

                    <div className="mb-10 text-left">
                        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-2">
                            {isLogin ? 'Welcome Back' : 'Get Started'}
                        </h2>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                            {isLogin ? 'Access your private memory vault' : 'Create your decentralized brain'}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 text-[11px] font-black uppercase tracking-widest p-4 rounded-2xl mb-6 border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="group transition-all">
                            <input
                                type="text" placeholder="Enter Username" required
                                className="w-full bg-slate-100 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold text-slate-600 focus:bg-white focus:border-[#F0AA67]/20 outline-none transition-all"
                                value={username} onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="group transition-all">
                            <input
                                type="password" placeholder="Password" required
                                className="w-full bg-slate-100 border-2 border-transparent rounded-2xl py-4 px-6 text-sm font-bold text-slate-600 focus:bg-white focus:border-[#F0AA67]/20 outline-none transition-all"
                                value={password} onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button className="w-full bg-slate-800 text-white py-4 border-2 border-slate-800 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all duration-200 shadow-xl shadow-slate-200 group hover:bg-white hover:text-slate-800">
                            <span>{isLogin ? "Let's Start" : "Create Account"}</span>
                            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                        </button>
                    </form>

                    {/* Switch Mode */}
                    <p className="text-center mt-8 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                        {isLogin ? "Don't have an account?" : "Already a member?"}{' '}
                        <button onClick={() => setIsLogin(!isLogin)} className="text-[#F0AA67] hover:underline ml-1">
                            {isLogin ? 'Sign up' : 'Login'}
                        </button>
                    </p>

                    {/* ── PROMINENT GUEST ACCESS ── */}
                    <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-200">

                        <button
                            onClick={handleDemoLogin}
                            className="relative w-full py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] 
    flex items-center justify-center gap-3 text-white overflow-hidden
    bg-gradient-to-r from-[#e89a54] to-[#f2b176]
    shadow-[0_10px_25px_rgba(232,154,84,0.4)]
    transition-all duration-300 ease-out
    hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(232,154,84,0.55)]
    active:scale-[0.98] group"
                        >

                            {/* Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#e89a54] to-[#f2b176] opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500" />

                            <ShieldCheck size={20} className="relative z-10" />
                            <span className="relative z-10">Explore as Guest</span>
                        </button>

                        <p className="text-[10px] text-center text-slate-500 mt-4 font-bold uppercase tracking-widest">
                            No credentials required for preview
                        </p>

                    </div>
                </div>
            </div>
        </div>
    );
}