import React, { useState } from 'react';
import { PlusCircle, Edit2, Trash2, Save, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { Card } from '../ui/Card';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Loan, LoanType, LoanStatus } from '../../types';
import { cn } from '../../utils/cn';

export const Loans: React.FC = () => {
    const {
        loans,
        addLoan,
        updateLoan,
        deleteLoan,
        privacyMode
    } = useFinancial();

    const maskValue = (val: string) => privacyMode ? 'R$ ••••' : val;
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Loan>>({});

    const [newLoan, setNewLoan] = useState({
        type: 'emprestado' as LoanType,
        entity: '',
        amount: '',
        interestRate: '0',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: 'ativo' as LoanStatus
    });

    const handleAdd = () => {
        if (!newLoan.entity || !newLoan.amount || !newLoan.dueDate) {
            alert('Preencha todos os campos obrigatórios');
            return;
        }

        addLoan({
            ...newLoan,
            amount: parseFloat(newLoan.amount),
            interestRate: parseFloat(newLoan.interestRate) || 0
        });

        setNewLoan({
            type: 'emprestado',
            entity: '',
            amount: '',
            interestRate: '0',
            startDate: new Date().toISOString().split('T')[0],
            dueDate: '',
            status: 'ativo'
        });
    };

    const startEdit = (loan: Loan) => {
        setEditingId(loan.id);
        setEditForm(loan);
    };

    const saveEdit = () => {
        if (editingId && editForm) {
            updateLoan(editingId, {
                ...editForm,
                amount: typeof editForm.amount === 'string' ? parseFloat(editForm.amount) : editForm.amount,
                interestRate: typeof editForm.interestRate === 'string' ? parseFloat(editForm.interestRate) : editForm.interestRate
            });
            setEditingId(null);
            setEditForm({});
        }
    };

    const totalEmprestado = loans.filter(l => l.type === 'emprestado').reduce((sum, l) => sum + l.amount, 0);
    const totalRecebido = loans.filter(l => l.type === 'recebido').reduce((sum, l) => sum + l.amount, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                    Empréstimos
                </h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <ArrowUpRight className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Você Emprestou</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{maskValue(formatCurrency(totalEmprestado))}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                            <ArrowDownLeft className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Você Recebeu</p>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{maskValue(formatCurrency(totalRecebido))}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Novo Empréstimo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <select
                        value={newLoan.type}
                        onChange={(e) => setNewLoan({ ...newLoan, type: e.target.value as LoanType })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                        <option value="emprestado">Você Emprestou</option>
                        <option value="recebido">Você Recebeu</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Pessoa/Empresa"
                        value={newLoan.entity}
                        onChange={(e) => setNewLoan({ ...newLoan, entity: e.target.value })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />

                    <input
                        type="number"
                        placeholder="Valor"
                        value={newLoan.amount}
                        onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />

                    <input
                        type="date"
                        value={newLoan.startDate}
                        onChange={(e) => setNewLoan({ ...newLoan, startDate: e.target.value })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />

                    <input
                        type="date"
                        placeholder="Vencimento"
                        value={newLoan.dueDate}
                        onChange={(e) => setNewLoan({ ...newLoan, dueDate: e.target.value })}
                        className="border border-gray-200 dark:border-slate-800 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
                <button
                    onClick={handleAdd}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    <PlusCircle className="w-5 h-5" />
                    Adicionar Empréstimo
                </button>
            </Card>

            <Card className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Pessoa/Empresa</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Valor</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Vencimento</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800/50">
                            {loans.map((loan) => (
                                <tr key={loan.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors group text-gray-700 dark:text-gray-300">
                                    {editingId === loan.id ? (
                                        <td colSpan={6} className="p-4">
                                            <div className="flex flex-wrap gap-4 bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                                <input
                                                    type="text"
                                                    value={editForm.entity}
                                                    onChange={(e) => setEditForm({ ...editForm, entity: e.target.value })}
                                                    className="border dark:bg-slate-900 border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1 text-sm bg-white flex-1"
                                                />
                                                <input
                                                    type="number"
                                                    value={editForm.amount}
                                                    onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                                                    className="border dark:bg-slate-900 border-gray-200 dark:border-slate-800 rounded-lg px-2 py-1 text-sm bg-white w-32"
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={saveEdit} className="p-2 bg-green-500 text-white rounded-lg"><Save size={16} /></button>
                                                    <button onClick={() => setEditingId(null)} className="p-2 bg-gray-500 text-white rounded-lg"><X size={16} /></button>
                                                </div>
                                            </div>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                                                    loan.type === 'emprestado' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                                                )}>
                                                    {loan.type === 'emprestado' ? 'Emprestado' : 'Recebido'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-800 dark:text-white">{loan.entity}</td>
                                            <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">
                                                {maskValue(formatCurrency(loan.amount))}
                                            </td>
                                            <td className="px-6 py-4 text-sm">{formatDate(loan.dueDate)}</td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                                                    loan.status === 'quitado' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                )}>
                                                    {loan.status === 'quitado' ? 'Quitado' : 'Ativo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEdit(loan)} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-all"><Edit2 size={16} /></button>
                                                    <button onClick={() => deleteLoan(loan.id)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-all"><Trash2 size={16} /></button>
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
