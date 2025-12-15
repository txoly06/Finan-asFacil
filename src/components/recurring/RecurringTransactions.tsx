import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { useFinancial } from '../../context/FinancialContext';
import { Plus, Trash2, RefreshCw, Save, X } from 'lucide-react';
import type { RecurringTransaction } from '../../types';
import { cn } from '../../utils/cn';

export const RecurringTransactions: React.FC = () => {
    const { recurringTransactions, categories, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction } = useFinancial();
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [newRecurring, setNewRecurring] = useState<Omit<RecurringTransaction, 'id' | 'lastGenerated'>>({
        description: '',
        amount: 0,
        category: '',
        type: 'despesa',
        dayOfMonth: 1,
        active: true
    });

    const [startEditForm, setEditForm] = useState<Partial<RecurringTransaction>>({});

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addRecurringTransaction(newRecurring);
            setIsAdding(false);
            setNewRecurring({ description: '', amount: 0, category: '', type: 'despesa', dayOfMonth: 1, active: true });
        } catch (error) {
            console.error(error);
            alert('Erro ao criar transação recorrente');
        }
    };

    const handleEdit = (rec: RecurringTransaction) => {
        setEditingId(rec.id);
        setEditForm(rec);
    };

    const saveEdit = async () => {
        if (editingId && startEditForm) {
            await updateRecurringTransaction(editingId, startEditForm);
            setEditingId(null);
            setEditForm({});
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Tem certeza? Isso parará a geração automática desta transação.')) {
            await deleteRecurringTransaction(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Transações Recorrentes
                </h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus size={20} />
                    Nova Recorrência
                </button>
            </div>

            {isAdding && (
                <Card className="p-6 animate-in slide-in-from-top-4">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    value={newRecurring.description}
                                    onChange={e => setNewRecurring({ ...newRecurring, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Valor</label>
                                <input
                                    type="number"
                                    required
                                    value={newRecurring.amount}
                                    onChange={e => setNewRecurring({ ...newRecurring, amount: parseFloat(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Tipo</label>
                                <select
                                    value={newRecurring.type}
                                    onChange={e => setNewRecurring({ ...newRecurring, type: e.target.value as 'receita' | 'despesa', category: '' })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="despesa">Despesa</option>
                                    <option value="receita">Receita</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Categoria</label>
                                <select
                                    required
                                    value={newRecurring.category}
                                    onChange={e => setNewRecurring({ ...newRecurring, category: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value="">Selecione...</option>
                                    {categories.filter(c => c.type === newRecurring.type).map(c => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Dia do Mês (1-31)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    required
                                    value={newRecurring.dayOfMonth}
                                    onChange={e => setNewRecurring({ ...newRecurring, dayOfMonth: parseInt(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </Card>
            )}

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Dia</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Descrição</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Valor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Tipo/Cat</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Ativo</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {recurringTransactions.map((rec) => (
                                <tr key={rec.id} className="hover:bg-white/5 transition-colors">
                                    {editingId === rec.id ? (
                                        <>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    min="1" max="31"
                                                    value={startEditForm.dayOfMonth}
                                                    onChange={e => setEditForm({ ...startEditForm, dayOfMonth: parseInt(e.target.value) })}
                                                    className="w-16 bg-white/5 border rounded p-1"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={startEditForm.description}
                                                    onChange={e => setEditForm({ ...startEditForm, description: e.target.value })}
                                                    className="w-full bg-white/5 border rounded p-1"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={startEditForm.amount}
                                                    onChange={e => setEditForm({ ...startEditForm, amount: parseFloat(e.target.value) })}
                                                    className="w-24 bg-white/5 border rounded p-1"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <select
                                                        value={startEditForm.type}
                                                        onChange={e => setEditForm({ ...startEditForm, type: e.target.value as 'receita' | 'despesa', category: '' })}
                                                        className="bg-white/5 border rounded p-1 text-sm"
                                                    >
                                                        <option value="receita">Receita</option>
                                                        <option value="despesa">Despesa</option>
                                                    </select>
                                                    <select
                                                        value={startEditForm.category}
                                                        onChange={e => setEditForm({ ...startEditForm, category: e.target.value })}
                                                        className="bg-white/5 border rounded p-1 text-sm"
                                                    >
                                                        {categories.filter(c => c.type === startEditForm.type).map(c => (
                                                            <option key={c.id} value={c.name}>{c.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={startEditForm.active}
                                                    onChange={e => setEditForm({ ...startEditForm, active: e.target.checked })}
                                                    className="rounded bg-white/5 border-gray-600"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={saveEdit} className="text-green-400 hover:text-green-300"><Save size={18} /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-300"><X size={18} /></button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 text-sm">Dia {rec.dayOfMonth}</td>
                                            <td className="px-6 py-4 font-medium">{rec.description}</td>
                                            <td className="px-6 py-4 font-bold text-gray-200">
                                                {rec.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <span className={cn("text-xs px-2 py-0.5 rounded", rec.type === 'receita' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                                                        {rec.type}
                                                    </span>
                                                    <div className="text-gray-400 mt-1">{rec.category}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn("flex items-center gap-1 text-sm", rec.active ? "text-green-400" : "text-gray-500")}>
                                                    <RefreshCw size={14} className={cn(rec.active && "animate-spin-slow")} />
                                                    {rec.active ? "Ativo" : "Inativo"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleEdit(rec)} className="text-blue-400 hover:text-blue-300"><RefreshCw size={18} /></button>
                                                    <button onClick={() => handleDelete(rec.id)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {recurringTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Nenhuma transação recorrente configurada
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
