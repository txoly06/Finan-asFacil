import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Receipt, Landmark, TrendingUp, Tag, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
            isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "text-gray-600 hover:bg-white hover:text-blue-600"
        )}
    >
        {icon}
        <span>{label}</span>
    </NavLink>
);

export const AppLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
            {/* Sidebar */}
            <aside className="w-72 bg-white/80 backdrop-blur-md border-r border-gray-100 flex-shrink-0 hidden lg:block shadow-xl z-10 p-6">
                <div className="mb-10">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Finance Manager
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Gestão Inteligente</p>
                </div>

                <nav className="space-y-2">
                    <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                    <NavItem to="/transactions" icon={<Receipt size={20} />} label="Transações" />
                    <NavItem to="/categories" icon={<Tag size={20} />} label="Categorias" />
                    <NavItem to="/recurring" icon={<RefreshCw size={20} />} label="Recorrência" />
                    <NavItem to="/loans" icon={<Landmark size={20} />} label="Empréstimos" />
                    <NavItem to="/investments" icon={<TrendingUp size={20} />} label="Investimentos" />
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-4 lg:p-8">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between mb-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm">
                        <h1 className="text-xl font-bold text-blue-600">Finance Manager</h1>
                    </div>

                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around z-50 pb-safe">
                <NavLink to="/" className={({ isActive }) => cn("p-2 rounded-lg text-gray-500", isActive && "text-blue-600 bg-blue-50")}><LayoutDashboard size={24} /></NavLink>
                <NavLink to="/transactions" className={({ isActive }) => cn("p-2 rounded-lg text-gray-500", isActive && "text-blue-600 bg-blue-50")}><Receipt size={24} /></NavLink>
                <NavLink to="/categories" className={({ isActive }) => cn("p-2 rounded-lg text-gray-500", isActive && "text-blue-600 bg-blue-50")}><Tag size={24} /></NavLink>
                <NavLink to="/recurring" className={({ isActive }) => cn("p-2 rounded-lg text-gray-500", isActive && "text-blue-600 bg-blue-50")}><RefreshCw size={24} /></NavLink>
                <NavLink to="/loans" className={({ isActive }) => cn("p-2 rounded-lg text-gray-500", isActive && "text-blue-600 bg-blue-50")}><Landmark size={24} /></NavLink>
                <NavLink to="/investments" className={({ isActive }) => cn("p-2 rounded-lg text-gray-500", isActive && "text-blue-600 bg-blue-50")}><TrendingUp size={24} /></NavLink>
            </nav>
        </div>
    );
};
