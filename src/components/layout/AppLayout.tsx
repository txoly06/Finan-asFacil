import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Receipt, Landmark, TrendingUp, Tag, RefreshCw, Settings, Plus } from 'lucide-react';
import { cn } from '../../utils/cn';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
            isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-gray-600 hover:bg-white hover:text-blue-600 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
        )}
    >
        {icon}
        <span>{label}</span>
    </NavLink>
);

export const AppLayout: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-gray-100 dark:border-slate-800 flex-shrink-0 hidden lg:block shadow-xl z-20 p-6">
                <div className="mb-10">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Finance Manager
                    </h1>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Smart Dash</p>
                </div>

                <nav className="space-y-2">
                    <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavItem to="/transactions" icon={<Receipt size={20} />} label="Transações" />
                    <NavItem to="/categories" icon={<Tag size={20} />} label="Categorias" />
                    <NavItem to="/recurring" icon={<RefreshCw size={20} />} label="Recorrência" />
                    <NavItem to="/loans" icon={<Landmark size={20} />} label="Empréstimos" />
                    <NavItem to="/investments" icon={<TrendingUp size={20} />} label="Investimentos" />
                    <NavItem to="/settings" icon={<Settings size={20} />} label="Configurações" />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto relative">
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <h1 className="text-xl font-bold text-blue-600">Finance Manager</h1>
                    </div>

                    <Outlet />
                </div>

                {/* Quick Add FAB */}
                <button
                    onClick={() => navigate('/transactions?add=true')}
                    className="fixed bottom-24 md:bottom-8 right-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40 group"
                    title="Novo Lançamento"
                >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-800 px-6 py-3 flex gap-8 items-center rounded-3xl shadow-2xl z-50">
                <NavLink to="/" className={({ isActive }) => cn("p-2 transition-all", isActive ? "text-blue-600 scale-125" : "text-gray-400")}><LayoutDashboard size={20} /></NavLink>
                <NavLink to="/transactions" className={({ isActive }) => cn("p-2 transition-all", isActive ? "text-blue-600 scale-125" : "text-gray-400")}><Receipt size={20} /></NavLink>
                <NavLink to="/loans" className={({ isActive }) => cn("p-2 transition-all", isActive ? "text-blue-600 scale-125" : "text-gray-400")}><Landmark size={20} /></NavLink>
                <NavLink to="/settings" className={({ isActive }) => cn("p-2 transition-all", isActive ? "text-blue-600 scale-125" : "text-gray-400")}><Settings size={20} /></NavLink>
            </nav>
        </div>
    );
};
