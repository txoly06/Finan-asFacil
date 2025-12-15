import React, { useState } from 'react';
import { PlusCircle, Trash2, Target, Edit2, Save, X } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { Card } from '../ui/Card';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Investment, InvestmentCategory, InvestmentStatus } from '../../types';
import { cn } from '../../utils/cn';

export const Investments: React.FC = () => {
    const { investments, addInvestment, updateInvestment, deleteInvestment } = useFinancial();
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card>
                <h3 className="text-lg font-bold mb-4 text-gray-800">Novo Investimento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Nome do Investimento"
                        value={newInvestment.name}
                        onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <select
                        value={newInvestment.category}
                        onChange={(e) => setNewInvestment({ ...newInvestment, category: e.target.value as InvestmentCategory })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
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
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <input
                        type="number"
                        placeholder="Valor Atual (R$)"
                        value={newInvestment.currentAmount}
                        onChange={(e) => setNewInvestment({ ...newInvestment, currentAmount: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <input
                        type="number"
                        placeholder="Meta de Retorno (%)"
                        value={newInvestment.targetReturn}
                        onChange={(e) => setNewInvestment({ ...newInvestment, targetReturn: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <input
                        type="date"
                        value={newInvestment.startDate}
                        onChange={(e) => setNewInvestment({ ...newInvestment, startDate: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />

                    <select
                        value={newInvestment.status}
                        onChange={(e) => setNewInvestment({ ...newInvestment, status: e.target.value as InvestmentStatus })}
                        className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    >
                        <option value="ativo">Ativo</option>
                        <option value="encerrado">Encerrado</option>
                    </select>
                </div>
                <button
                    onClick={handleAdd}
                    className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    <PlusCircle className="w-5 h-5" />
                    Adicionar Investimento
                </button>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {investments.filter(inv => inv.status === 'ativo').map((inv) => {
                    const returnValue = inv.currentAmount - inv.initialAmount;
                    const returnPercent = ((returnValue / inv.initialAmount) * 100);
                    const targetDiff = returnPercent - inv.targetReturn;
                    const isPositive = returnValue >= 0;
                    const reachedTarget = returnPercent >= inv.targetReturn;

                    if (editingId === inv.id) {
                        return (
                            <Card key={inv.id} className="shadow-2xl border-blue-200 ring-2 ring-blue-100">
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full border rounded-lg px-3 py-2 font-bold"
                                        placeholder="Nome"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <select
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value as InvestmentCategory })}
                                            className="border rounded-lg px-3 py-2 text-sm"
                                        >
                                            <option value="ações">Ações</option>
                                            <option value="fundos">Fundos</option>
                                            <option value="criptomoedas">Criptomoedas</option>
                                            <option value="renda-fixa">Renda Fixa</option>
                                            <option value="imoveis">Imóveis</option>
                                            <option value="outros">Outros</option>
                                        </select>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value as InvestmentStatus })}
                                            className="border rounded-lg px-3 py-2 text-sm"
                                        >
                                            <option value="ativo">Ativo</option>
                                            <option value="encerrado">Encerrado</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-xs text-gray-500">Inicial</label>
                                            <input
                                                type="number"
                                                value={editForm.initialAmount}
                                                onChange={(e) => setEditForm({ ...editForm, initialAmount: parseFloat(e.target.value) })}
                                                className="w-full border rounded-lg px-3 py-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Atual</label>
                                            <input
                                                type="number"
                                                value={editForm.currentAmount}
                                                onChange={(e) => setEditForm({ ...editForm, currentAmount: parseFloat(e.target.value) })}
                                                className="w-full border rounded-lg px-3 py-2"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Meta (%)</label>
                                        <input
                                            type="number"
                                            value={editForm.targetReturn}
                                            onChange={(e) => setEditForm({ ...editForm, targetReturn: parseFloat(e.target.value) })}
                                            className="w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Data Início</label>
                                        <input
                                            type="date"
                                            value={editForm.startDate}
                                            onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                            className="w-full border rounded-lg px-3 py-2"
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end pt-2">
                                        <button onClick={saveEdit} className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100">
                                            <Save size={16} /> Salvar
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="flex items-center gap-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100">
                                            <X size={16} /> Cancelar
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        );
                    }

                    return (
                        <Card key={inv.id} className="hover:shadow-2xl transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">{inv.name}</h4>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-1 inline-block uppercase">
                                        {inv.category}
                                    </span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => startEdit(inv)}
                                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Deseja excluir?')) deleteInvestment(inv.id);
                                        }}
                                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"
                                        title="Excluir"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Investido</span>
                                    <span className="font-semibold text-gray-800">{formatCurrency(inv.initialAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Atual</span>
                                    <span className="font-semibold text-gray-800">{formatCurrency(inv.currentAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Retorno</span>
                                    <span className={cn("font-bold", isPositive ? 'text-green-600' : 'text-red-600')}>
                                        {isPositive ? '+' : ''}{formatCurrency(returnValue)}
                                    </span>
                                </div>
                            </div>

                            <div className="relative pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium text-gray-700">Rentabilidade</span>
                                    <span className={cn("text-2xl font-bold", isPositive ? 'text-green-600' : 'text-red-600')}>
                                        {isPositive ? '+' : ''}{returnPercent.toFixed(2)}%
                                    </span>
                                </div>

                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-3 rounded-full transition-all",
                                            reachedTarget ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                                        )}
                                        style={{ width: `${Math.min(Math.abs(returnPercent / inv.targetReturn * 100), 100)}%` }}
                                    />
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-500">Meta: {inv.targetReturn}%</span>
                                    <span className={cn("text-xs font-medium", reachedTarget ? 'text-green-600' : 'text-gray-600')}>
                                        {reachedTarget ? '✓ Meta atingida!' : `Faltam ${Math.abs(targetDiff).toFixed(1)}%`}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-gray-500">
                                Desde {formatDate(inv.startDate)}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {investments.filter(inv => inv.status === 'ativo').length === 0 && (
                <Card className="p-12 text-center">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum investimento cadastrado</h3>
                    <p className="text-gray-500">Adicione seu primeiro investimento e acompanhe sua rentabilidade!</p>
                </Card>
            )}
        </div>
    );
};
