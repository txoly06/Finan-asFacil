import React, { useState } from 'react';
import { PlusCircle, Edit2, Trash2, Save, X, FileText, FileSpreadsheet } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { exportToPDF, exportToExcel } from '../../utils/export';
import { Card } from '../ui/Card';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Transaction, TransactionType, TransactionStatus } from '../../types';
import { cn } from '../../utils/cn';

export const Transactions: React.FC = () => {
    const { transactions, categories, addTransaction, updateTransaction, deleteTransaction } = useFinancial();
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
            category: '', // Reset category
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
            <Card>
                <h3 className="text-lg font-bold mb-4 text-gray-800">Nova Transação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <select
                        value={newTransaction.type}
                        onChange={(e) => {
                            const newType = e.target.value as TransactionType;
                            setNewTransaction({ ...newTransaction, type: newType, category: '' });
                        }}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    >
                        <option value="receita">Receita</option>
                        <option value="despesa">Despesa</option>
                    </select>

                    <select
                        value={newTransaction.category}
                        onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
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
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <input
                        type="number"
                        placeholder="Valor"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <input
                        type="date"
                        value={newTransaction.date}
                        onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <select
                        value={newTransaction.status}
                        onChange={(e) => setNewTransaction({ ...newTransaction, status: e.target.value as TransactionStatus })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
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

            <div className="flex justify-end gap-3">
                <button
                    onClick={() => exportToPDF(transactions)}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <FileText size={18} />
                    PDF
                </button>
                <button
                    onClick={() => exportToExcel(transactions)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <FileSpreadsheet size={18} />
                    Excel
                </button>
            </div>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Descrição</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Data</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                    {editingId === tx.id ? (
                                        <>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={editForm.type}
                                                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as TransactionType })}
                                                    className="border rounded-lg px-2 py-1 text-sm bg-white"
                                                >
                                                    <option value="receita">Receita</option>
                                                    <option value="despesa">Despesa</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={editForm.category}
                                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                                    className="border rounded-lg px-2 py-1 text-sm bg-white w-full"
                                                >
                                                    <option value="">Selecione</option>
                                                    {categories
                                                        .filter(c => c.type === editForm.type)
                                                        .map(cat => (
                                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                        ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    className="border rounded-lg px-2 py-1 text-sm w-full"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={editForm.amount}
                                                    onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                                                    className="border rounded-lg px-2 py-1 text-sm w-full"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="date"
                                                    value={editForm.date}
                                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                    className="border rounded-lg px-2 py-1 text-sm w-full"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TransactionStatus })}
                                                    className="border rounded-lg px-2 py-1 text-sm bg-white"
                                                >
                                                    <option value="pendente">Pendente</option>
                                                    <option value="pago">Pago</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button onClick={saveEdit} className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded-lg transition-all">
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-50 rounded-lg transition-all">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-semibold",
                                                    tx.type === 'receita' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                                                )}>
                                                    {tx.type === 'receita' ? 'Receita' : 'Despesa'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-700">{tx.category}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{tx.description}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-800">{formatCurrency(tx.amount)}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{formatDate(tx.date)}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-semibold",
                                                    tx.status === 'pago' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                                                )}>
                                                    {tx.status === 'pago' ? 'Pago' : 'Pendente'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => startEdit(tx)}
                                                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Deseja excluir?')) deleteTransaction(tx.id);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-gray-400">Nenhuma transação registrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
