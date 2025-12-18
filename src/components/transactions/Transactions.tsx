import React, { useState } from 'react';
import { PlusCircle, Search, Trash2, Edit2, FileDown, Table, Filter, X, Save } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { exportToPDF, exportToExcel } from '../../utils/export';
import { Card } from '../ui/Card';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Transaction, TransactionType, TransactionStatus } from '../../types';
import { cn } from '../../utils/cn';

export const Transactions: React.FC = () => {
    const {
        transactions,
        categories,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        privacyMode
    } = useFinancial();

    const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Transaction>>({});

    const [newTransaction, setNewTransaction] = useState({
        type: 'receita' as TransactionType,
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'pendente' as TransactionStatus
    });

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMonth = filterMonth ? t.date.startsWith(filterMonth) : true;
        const matchesCategory = filterCategory === 'all' ? true : t.category === filterCategory;

        return matchesSearch && matchesMonth && matchesCategory;
    });

    const maskValue = (val: string) => privacyMode ? 'R$ ••••' : val;

    const filteredCategories = categories.filter(c => c.type === newTransaction.type);

    const handleAdd = () => {
        if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        addTransaction({
            ...newTransaction,
            amount: parseFloat(newTransaction.amount)
        });

        setNewTransaction({
            type: 'receita',
            category: '',
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            status: 'pendente'
        });
    };

    const startEdit = (tx: Transaction) => {
        setEditingId(tx.id);
        setEditForm(tx);
    };

    const saveEdit = () => {
        if (editingId && editForm) {
            updateTransaction(editingId, {
                ...editForm,
                amount: typeof editForm.amount === 'string' ? parseFloat(editForm.amount) : editForm.amount
            });
            setEditingId(null);
            setEditForm({});
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Transações
                </h2>
            </header>

            <Card>
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Nova Transação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <select
                        value={newTransaction.type}
                        onChange={(e) => {
                            const newType = e.target.value as TransactionType;
                            setNewTransaction({ ...newTransaction, type: newType, category: '' });
                        }}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                    </select>

                    <select
                        value={newTransaction.category}
                        onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                        <option value="">Selecione uma categoria</option>
                        {filteredCategories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>

                    <input
                        type="text"
                        placeholder="Descrição"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />

                    <input
                        type="number"
                        placeholder="Valor"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />

                    <input
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />

                    <select
                        value={newTransaction.status}
                        onChange={(e) => setNewTransaction({ ...newTransaction, status: e.target.value as TransactionStatus })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                        <option value="pendente">Pendente</option>
                        <option value="pago">Pago</option>
                    </select>
                </div>
                <button
                    onClick={handleAdd}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    <PlusCircle className="w-5 h-5" />
                    Adicionar Transação
                </button>
            </Card>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar transações..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="text-gray-400 w-5 h-5" />
                        <input
                            type="month"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        />
                    </div>

                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-3 border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                    >
                        <option value="all">Todas Categorias</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>

                    {(filterMonth || filterCategory !== 'all' || searchTerm) && (
                        <button
                            onClick={() => {
                                setFilterMonth('');
                                setFilterCategory('all');
                                setSearchTerm('');
                            }}
                            className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                            title="Limpar filtros"
                        >
                            <X size={20} />
                        </button>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => exportToPDF(filteredTransactions, 'Relatório de Transações')}
                            className="p-3 text-blue-600 hover:bg-blue-50 dark:border-slate-800 dark:hover:bg-blue-900/10 rounded-xl transition-all border border-gray-100 dark:border-slate-800"
                            title="Exportar PDF"
                        >
                            <FileDown className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => exportToExcel(filteredTransactions)}
                            className="p-3 text-green-600 hover:bg-green-50 dark:border-slate-800 dark:hover:bg-green-900/10 rounded-xl transition-all border border-gray-100 dark:border-slate-800"
                            title="Exportar Excel"
                        >
                            <Table className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </Card>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Detalhes</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                            {filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                    {editingId === tx.id ? (
                                        <td colSpan={5} className="p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                                <input
                                                    type="text"
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    className="border dark:bg-slate-900 border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1 text-sm bg-white"
                                                />
                                                <input
                                                    type="number"
                                                    value={editForm.amount}
                                                    onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                                                    className="border dark:bg-slate-900 border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1 text-sm bg-white"
                                                />
                                                <input
                                                    type="date"
                                                    value={editForm.date}
                                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                    className="border dark:bg-slate-900 border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1 text-sm bg-white"
                                                />
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TransactionStatus })}
                                                    className="border dark:bg-slate-900 border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1 text-sm bg-white"
                                                >
                                                    <option value="pendente">Pendente</option>
                                                    <option value="pago">Pago</option>
                                                </select>
                                                <div className="flex gap-2">
                                                    <button onClick={saveEdit} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><Save size={16} /></button>
                                                    <button onClick={() => setEditingId(null)} className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"><X size={16} /></button>
                                                </div>
                                            </div>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                {formatDate(tx.date)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-800 dark:text-white">{tx.description}</div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-tighter">{tx.category}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "font-bold text-lg",
                                                    tx.type === 'receita' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                                )}>
                                                    {tx.type === 'receita' ? '+' : '-'}{maskValue(formatCurrency(tx.amount))}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                                                    tx.status === 'pago' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                )}>
                                                    {tx.status === 'pago' ? 'Pago' : 'Pendente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => startEdit(tx)}
                                                        className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Deseja excluir?')) deleteTransaction(tx.id);
                                                        }}
                                                        className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
