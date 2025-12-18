import React, { useState } from 'react';
import { PlusCircle, Trash2, Target, Edit2, Save, X, TrendingUp } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/format';
import type { Investment, InvestmentCategory, InvestmentStatus } from '../../types';
import { cn } from '../../utils/cn';

export const Investments: React.FC = () => {
    const {
        investments,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        privacyMode
    } = useFinancial();

    const maskValue = (val: string) => privacyMode ? 'R$ ••••' : val;
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Investment>>({});

    const [newInvestment, setNewInvestment] = useState({
        name: '',
        initialAmount: '',
        currentAmount: '',
        targetReturn: '30',
        startDate: new Date().toISOString().split('T')[0],
        category: 'ações' as InvestmentCategory,
        status: 'ativo' as InvestmentStatus
    });

    const handleAdd = () => {
        if (!newInvestment.name || !newInvestment.initialAmount || !newInvestment.currentAmount) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        addInvestment({
            ...newInvestment,
            initialAmount: parseFloat(newInvestment.initialAmount),
            currentAmount: parseFloat(newInvestment.currentAmount),
            targetReturn: parseFloat(newInvestment.targetReturn)
        });

        setNewInvestment({
            name: '',
            initialAmount: '',
            currentAmount: '',
            targetReturn: '30',
            startDate: new Date().toISOString().split('T')[0],
            category: 'ações',
            status: 'ativo'
        });
    };

    const startEdit = (inv: Investment) => {
        setEditingId(inv.id);
        setEditForm(inv);
    };

    const saveEdit = async () => {
        if (editingId && editForm) {
            await updateInvestment(editingId, {
                ...editForm,
                initialAmount: typeof editForm.initialAmount === 'string' ? parseFloat(editForm.initialAmount) : editForm.initialAmount,
                currentAmount: typeof editForm.currentAmount === 'string' ? parseFloat(editForm.currentAmount) : editForm.currentAmount,
                targetReturn: typeof editForm.targetReturn === 'string' ? parseFloat(editForm.targetReturn) : editForm.targetReturn
            });
            setEditingId(null);
            setEditForm({});
        }
    };

    const totalInvested = investments.reduce((sum, i) => sum + i.initialAmount, 0);
    const currentTotal = investments.reduce((sum, i) => sum + i.currentAmount, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Investimentos
                </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-blue-100 uppercase font-bold tracking-wider">Total Investido</p>
                            <h3 className="text-2xl font-bold">{maskValue(formatCurrency(totalInvested))}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Target className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-emerald-100 uppercase font-bold tracking-wider">Patrimônio Atual</p>
                            <h3 className="text-2xl font-bold">{maskValue(formatCurrency(currentTotal))}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-none shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-purple-100 uppercase font-bold tracking-wider">Lucro/Prejuízo</p>
                            <h3 className="text-2xl font-bold">
                                {maskValue(formatCurrency(currentTotal - totalInvested))}
                            </h3>
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Novo Investimento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Nome do Investimento"
                        value={newInvestment.name}
                        onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />

                    <select
                        value={newInvestment.category}
                        onChange={(e) => setNewInvestment({ ...newInvestment, category: e.target.value as InvestmentCategory })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                        <option value="ações">Ações</option>
                        <option value="fundos">Fundos</option>
                        <option value="criptomoedas">Criptomoedas</option>
                        <option value="renda-fixa">Renda Fixa</option>
                        <option value="imoveis">Imóveis</option>
                        <option value="outros">Outros</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Valor Inicial (R$)"
                        value={newInvestment.initialAmount}
                        onChange={(e) => setNewInvestment({ ...newInvestment, initialAmount: e.target.value })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />

                    <input
                        type="number"
                        placeholder="Valor Atual (R$)"
                        value={newInvestment.currentAmount}
                        onChange={(e) => setNewInvestment({ ...newInvestment, currentAmount: e.target.value })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    <PlusCircle className="w-5 h-5" />
                    Adicionar Investimento
                </button>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {investments.map((inv) => {
                    const returnValue = inv.currentAmount - inv.initialAmount;
                    const returnPercent = ((returnValue / inv.initialAmount) * 100);
                    const isPositive = returnValue >= 0;
                    const reachedTarget = returnPercent >= inv.targetReturn;

                    return (
                        <Card key={inv.id} className="relative group hover:shadow-xl transition-all">
                            {editingId === inv.id ? (
                                <div className="space-y-4 p-4 border-2 border-blue-500 rounded-2xl bg-blue-50/10">
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full border dark:border-slate-800 dark:bg-slate-900 rounded-lg px-3 py-2 font-bold"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="number"
                                            value={editForm.initialAmount}
                                            onChange={(e) => setEditForm({ ...editForm, initialAmount: parseFloat(e.target.value) })}
                                            className="border dark:border-slate-800 dark:bg-slate-900 rounded-lg px-3 py-2"
                                            placeholder="Inicial"
                                        />
                                        <input
                                            type="number"
                                            value={editForm.currentAmount}
                                            onChange={(e) => setEditForm({ ...editForm, currentAmount: parseFloat(e.target.value) })}
                                            className="border dark:border-slate-800 dark:bg-slate-900 rounded-lg px-3 py-2"
                                            placeholder="Atual"
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={saveEdit} className="p-2 bg-green-500 text-white rounded-lg"><Save size={18} /></button>
                                        <button onClick={() => setEditingId(null)} className="p-2 bg-gray-500 text-white rounded-lg"><X size={18} /></button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-800 dark:text-white">{inv.name}</h4>
                                            <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-slate-800 text-gray-500 px-3 py-1 rounded-full mt-1 inline-block">
                                                {inv.category}
                                            </span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(inv)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"><Edit2 size={16} /></button>
                                            <button onClick={() => deleteInvestment(inv.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 size={16} /></button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Investido</p>
                                            <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{maskValue(formatCurrency(inv.initialAmount))}</p>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Atual</p>
                                            <p className="text-lg font-bold text-gray-700 dark:text-gray-200">{maskValue(formatCurrency(inv.currentAmount))}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-medium text-gray-500">Rendimento</span>
                                            <span className={cn("text-2xl font-black", isPositive ? 'text-green-600' : 'text-red-600')}>
                                                {isPositive ? '+' : ''}{returnPercent.toFixed(2)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-1000", reachedTarget ? 'bg-green-500' : 'bg-blue-500')}
                                                style={{ width: `${Math.min(Math.max(returnPercent, 0), 100)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                                            <span className="text-gray-400">Objetivo: {inv.targetReturn}%</span>
                                            <span className={reachedTarget ? 'text-green-600' : 'text-gray-400'}>
                                                {reachedTarget ? 'Meta Atingida!' : `Faltam ${(inv.targetReturn - returnPercent).toFixed(1)}%`}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card>
                    );
                })}
            </div>

            {investments.length === 0 && (
                <Card className="p-12 text-center text-gray-400 dark:text-gray-600">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Nenhum investimento registrado.</p>
                </Card>
            )}
        </div>
    );
};
