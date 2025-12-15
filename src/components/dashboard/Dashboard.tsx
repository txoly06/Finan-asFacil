import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Target, BarChart3, PieChart as PieChartIcon, AlertCircle, CreditCard, DollarSign } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/format';
import type { Transaction } from '../../types';

export const Dashboard: React.FC = () => {
    const { metrics, transactions } = useFinancial();
    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

    const getCashFlowData = () => {
        const last6Months = [];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const month = date.toLocaleDateString('pt-BR', { month: 'short' });

            const monthReceitas = transactions
                .filter((t: Transaction) => {
                    const txDate = new Date(t.date);
                    return t.type === 'receita' &&
                        t.status === 'pago' &&
                        txDate.getMonth() === date.getMonth() &&
                        txDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            const monthDespesas = transactions
                .filter((t: Transaction) => {
                    const txDate = new Date(t.date);
                    return t.type === 'despesa' &&
                        t.status === 'pago' &&
                        txDate.getMonth() === date.getMonth() &&
                        txDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

            last6Months.push({
                month,
                receitas: monthReceitas,
                despesas: monthDespesas,
                saldo: monthReceitas - monthDespesas
            });
        }
        return last6Months;
    };

    const getExpensesByCategory = () => {
        const categories: Record<string, number> = {};
        transactions
            .filter((t: Transaction) => t.type === 'despesa' && t.status === 'pago')
            .forEach((t: Transaction) => {
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            });

        return Object.entries(categories).map(([name, value]) => ({ name, value }));
    };

    const cashFlowData = getCashFlowData();
    const expensesData = getExpensesByCategory();

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div className="text-right text-emerald-100 text-xs font-medium">ATUAL</div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{formatCurrency(metrics.saldo)}</div>
                    <div className="text-emerald-100 text-sm">Saldo em Caixa</div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div className="text-right text-blue-100 text-xs font-medium">RECEITAS</div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{formatCurrency(metrics.receitas)}</div>
                    <div className="text-blue-100 text-sm">Total Recebido</div>
                </div>

                <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <div className="text-right text-rose-100 text-xs font-medium">DESPESAS</div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{formatCurrency(metrics.despesas)}</div>
                    <div className="text-rose-100 text-sm">Total Gasto</div>
                </div>

                <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Target className="w-6 h-6" />
                        </div>
                        <div className="text-right text-violet-100 text-xs font-medium">INVESTIMENTOS</div>
                    </div>
                    <div className="text-3xl font-bold mb-1">{metrics.investmentReturn.toFixed(1)}%</div>
                    <div className="text-violet-100 text-sm">Retorno Médio</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Fluxo de Caixa (6 meses)</h3>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cashFlowData}>
                                <defs>
                                    <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => [formatCurrency(Number(value)), '']}
                                />
                                <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2} fill="url(#colorReceitas)" />
                                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} fill="url(#colorDespesas)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <PieChartIcon className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Despesas por Categoria</h3>
                    </div>
                    {expensesData.length > 0 ? (
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expensesData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expensesData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                {expensesData.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        {entry.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            <div className="text-center">
                                <PieChartIcon className="w-16 h-16 mx-auto mb-3 opacity-30" />
                                <p>Nenhuma despesa registrada</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-xl p-6 border border-orange-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Contas Pendentes</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-green-200 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">A Receber</span>
                            </div>
                            <span className="text-xl font-bold text-green-600">{formatCurrency(metrics.receitasPendentes)}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-red-200 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <TrendingDown className="w-5 h-5 text-red-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">A Pagar</span>
                            </div>
                            <span className="text-xl font-bold text-red-600">{formatCurrency(metrics.despesasPendentes)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Empréstimos Ativos</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-blue-200 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">Você Emprestou</span>
                            </div>
                            <span className="text-xl font-bold text-blue-600">{formatCurrency(metrics.emprestimosAtivos)}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-white/60 rounded-xl border border-orange-200 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-orange-600" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">Você Deve</span>
                            </div>
                            <span className="text-xl font-bold text-orange-600">{formatCurrency(metrics.emprestimosRecebidos)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
