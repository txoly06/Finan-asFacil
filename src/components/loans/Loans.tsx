import React, { useState } from 'react';
import { PlusCircle, Edit2, Trash2, Save, X } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { Card } from '../ui/Card';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Loan, LoanType, LoanStatus } from '../../types';
import { cn } from '../../utils/cn';

export const Loans: React.FC = () => {
    const { loans, addLoan, updateLoan, deleteLoan } = useFinancial();
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Loan>>({});

    const [newLoan, setNewLoan] = useState({
        type: 'emprestado' as LoanType,
        entity: '',
        amount: '',
        interestRate: '',
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
            interestRate: '',
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card>
                <h3 className="text-lg font-bold mb-4 text-gray-800">Novo Empréstimo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <select
                        value={newLoan.type}
                        onChange={(e) => setNewLoan({ ...newLoan, type: e.target.value as LoanType })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    >
                        <option value="emprestado">Você Emprestou</option>
                        <option value="recebido">Você Recebeu</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Pessoa/Empresa"
                        value={newLoan.entity}
                        onChange={(e) => setNewLoan({ ...newLoan, entity: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <input
                        type="number"
                        placeholder="Valor"
                        value={newLoan.amount}
                        onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <input
                        type="number"
                        placeholder="Taxa de Juros (%)"
                        value={newLoan.interestRate}
                        onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <input
                        type="date"
                        value={newLoan.startDate}
                        onChange={(e) => setNewLoan({ ...newLoan, startDate: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <input
                        type="date"
                        placeholder="Data Vencimento"
                        value={newLoan.dueDate}
                        onChange={(e) => setNewLoan({ ...newLoan, dueDate: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <select
                        value={newLoan.status}
                        onChange={(e) => setNewLoan({ ...newLoan, status: e.target.value as LoanStatus })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    >
                        <option value="ativo">Ativo</option>
                        <option value="quitado">Quitado</option>
                    </select>
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
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Pessoa/Empresa</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Valor Original</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Taxa (%)</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Valor Total</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Vencimento</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loans.map((loan) => {
                                const totalAmount = loan.amount * (1 + loan.interestRate / 100);
                                return (
                                    <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                                        {editingId === loan.id ? (
                                            <>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={editForm.type}
                                                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value as LoanType })}
                                                        className="border rounded-lg px-2 py-1 text-sm bg-white"
                                                    >
                                                        <option value="emprestado">Você Emprestou</option>
                                                        <option value="recebido">Você Recebeu</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        value={editForm.entity}
                                                        onChange={(e) => setEditForm({ ...editForm, entity: e.target.value })}
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
                                                        type="number"
                                                        value={editForm.interestRate}
                                                        onChange={(e) => setEditForm({ ...editForm, interestRate: parseFloat(e.target.value) })}
                                                        className="border rounded-lg px-2 py-1 text-sm w-full"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-sm">-</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="date"
                                                        value={editForm.dueDate}
                                                        onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                                                        className="border rounded-lg px-2 py-1 text-sm w-full"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={editForm.status}
                                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value as LoanStatus })}
                                                        className="border rounded-lg px-2 py-1 text-sm bg-white"
                                                    >
                                                        <option value="ativo">Ativo</option>
                                                        <option value="quitado">Quitado</option>
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
                                                        loan.type === 'emprestado' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                                                    )}>
                                                        {loan.type === 'emprestado' ? 'Emprestado' : 'Recebido'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-700">{loan.entity}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-800">{formatCurrency(loan.amount)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{loan.interestRate}%</td>
                                                <td className="px-6 py-4 text-sm font-bold text-blue-600">{formatCurrency(totalAmount)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(loan.dueDate)}</td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-3 py-1.5 rounded-full text-xs font-semibold",
                                                        loan.status === 'quitado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                    )}>
                                                        {loan.status === 'quitado' ? 'Quitado' : 'Ativo'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => startEdit(loan)}
                                                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Deseja excluir?')) deleteLoan(loan.id);
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
                                );
                            })}
                            {loans.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-gray-400">Nenhum empréstimo registrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
