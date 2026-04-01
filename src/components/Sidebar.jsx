import { Home, Database, LogOut } from 'lucide-react';
// --- ADD THIS AT THE TOP ---
if (!document.getElementById('logo-font')) {
    const link = document.createElement('link');
    link.id = 'logo-font';
    link.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
}
// ---------------------------
const NavItem = ({ icon: Icon, label, active = false, onClick }) => (
    <div
        onClick={onClick}
        className={`flex items-center space-x-3 p-3 rounded-2xl cursor-pointer transition-all duration-200
        ${active
                ? 'bg-[#F0AA67] text-white shadow-md shadow-orange-100' // High contrast active state
                : 'text-slate-500 hover:bg-orange-50 hover:text-[#F0AA67]'
            }`}
    >
        <Icon size={18} strokeWidth={active ? 3 : 2} />
        <span className="font-bold text-sm tracking-tight">{label}</span>
    </div>
);

export default function Sidebar({ user, onLogout, onNavigate, activeView }) {
    return (
        <aside className="w-64 h-screen bg-slate-150 border-r border-slate-200 p-6 flex flex-col sticky top-0 z-20">
            {/* Logo Section */}
            {/* REPLACE the Logo Section with this */}
            <div className="flex items-center space-x-3 mb-12 px-2">
                {/* Logo Mark */}


                {/* Styled Logo Text */}
                <h1
                    className="text-2xl font-black text-slate-800 tracking-tighter"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                    DumpAI
                </h1>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-4 px-2">
                    Main Menu
                </p>

                <NavItem
                    icon={Home}
                    label="Dashboard"
                    active={activeView === 'dashboard'}
                    onClick={() => onNavigate('dashboard')}
                />

                <NavItem
                    icon={Database}
                    label="My Vault"
                    active={activeView === 'library'}
                    onClick={() => onNavigate('library')}
                />
            </nav>
            {/* --- PRO TIP / INSIGHT BOX --- */}
            <div className="mx-2 mt-8 p-5 bg-orange-50/40 rounded-3xl border border-orange-100/50 relative overflow-hidden group">
                {/* Background Decorative Shape */}
                <div className="absolute -right-4 -top-4 w-12 h-12 bg-[#F0AA67]/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />

                <div className="relative z-10">
                    <div className="flex items-center space-x-2 text-[#F0AA67] mb-3">
                        {/* <Sparkles size={14} fill="currentColor" className="opacity-80" /> */}
                        <span className="text-[10px] font-black uppercase tracking-[0.15em]">Semantic Tip</span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                        Stop using keywords. Ask DumpAI full questions like <span className="text-[#F0AA67]">"When was my last dentist visit?"</span>
                    </p>

                    <div className="mt-4 pt-3 border-t border-orange-100/50">
                        <p className="text-[9px] text-slate-400 font-medium italic">
                            AI searches your data by <b>meaning</b>, not just words.
                        </p>
                    </div>
                </div>
            </div>
            {/* --- USER & LOGOUT (Matching Handwritten Sketch) --- */}
            <div className="mt-auto pt-6 border-t border-slate-50 space-y-4">

                {/* 2. PRO Profile Card */}
                {/* --- SIMPLE USER SECTION --- */}
                <div className="mt-auto pt-6 border-t border-slate-100">
                    <div className="flex items-center space-x-3 px-2 mb-6">
                        {/* Simple Circle Avatar */}
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[#F0AA67] font-bold text-lg">
                            {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        {/* Name and Role */}
                        <div className="flex flex-col">
                            <p className="text-sm font-bold text-slate-800 leading-tight">
                                {user?.username || 'User Account'}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                                Vault Member
                            </p>
                        </div>
                    </div>

                    {/* Logout Button below it */}

                </div>

                {/* Logout Button */}
                <button
                    onClick={onLogout}
                    className="flex items-center space-x-3 w-full p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
                >
                    <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-xs uppercase tracking-widest text-[10px]">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}