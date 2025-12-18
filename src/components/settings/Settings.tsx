import React from 'react';
import { Card } from '../ui/Card';
import { useFinancial } from '../../context/FinancialContext';
import { Moon, Sun, EyeOff, Eye, LogOut, Shield, Palette, Trash2, Landmark } from 'lucide-react';

export const Settings: React.FC = () => {
    const {
        user,
        darkMode,
        setDarkMode,
        privacyMode,
        setPrivacyMode,
        logout
    } = useFinancial();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Configurações
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie seu perfil e as preferências do aplicativo.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Perfil */}
                <Card>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <span className="text-2xl font-bold uppercase">{user?.email?.[0]}</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">Seu Perfil</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors font-medium"
                    >
                        <LogOut size={20} />
                        Sair da Conta
                    </button>
                </Card>

                {/* Personalização */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <Palette className="text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Aparência</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                {darkMode ? <Moon className="text-blue-400" /> : <Sun className="text-amber-500" />}
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">Modo Escuro</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Alterne entre tema claro e escuro</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Privacidade */}
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Segurança e Dados</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                {privacyMode ? <EyeOff className="text-blue-400" /> : <Eye className="text-gray-400" />}
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white">Modo Privacidade</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Ocultar valores monetários na tela</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setPrivacyMode(!privacyMode)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${privacyMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${privacyMode ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <button
                            className="w-full flex items-center gap-3 text-red-600 dark:text-red-400 p-4 border border-red-100 dark:border-red-900/20 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            onClick={() => alert('Para limpar seus dados permanentemente, entre em contato com o suporte ou use as ferramentas do Supabase.')}
                        >
                            <Trash2 size={20} />
                            <div className="text-left">
                                <p className="font-medium">Limpar Dados Locais</p>
                                <p className="text-xs opacity-70">Remove caches e sessões antigas</p>
                            </div>
                        </button>
                    </div>
                </Card>

                {/* Info */}
                <Card className="flex flex-col justify-center items-center text-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200 dark:shadow-none">
                        <Landmark size={24} />
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white">Finanças Fácil</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Versão 2.1.0 (Produção Beta)</p>
                    <p className="text-xs text-gray-400 mt-4">© 2025 WebMind Tecnologias</p>
                </Card>
            </div>
        </div>
    );
};
