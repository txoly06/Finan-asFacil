import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, AlertCircle, CreditCard, Calendar } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/format';
import { cn } from '../../utils/cn';

interface TooltipPayload {
    name: string;
    value: number;
    color?: string;
    fill?: string;
    payload: unknown;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
    privacyMode: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, privacyMode }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-900 p-4 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md z-50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{label || payload[0].name}</p>
                <div className="space-y-1">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">{entry.name}:</span>
                            </div>
                            <span className="text-sm font-black text-gray-900 dark:text-white">
                                {privacyMode ? 'R$ ••••' : formatCurrency(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

export const Dashboard: React.FC = () => {
    const {
        transactions,
        loans,
        metrics,
        privacyMode
    } = useFinancial();

    const maskValue = (val: string) => privacyMode ? 'R$ ••••' : val;

    const summaryCards = [
        {
            title: 'Saldo Atual',
            value: formatCurrency(metrics.saldo),
            icon: Wallet,
            color: 'blue',
            detail: `Projetado: ${formatCurrency(metrics.saldoProjetado)}`,
            detailIcon: AlertCircle
        },
        {
            title: 'Receitas (Mês)',
            value: formatCurrency(metrics.receitas),
            icon: TrendingUp,
            color: 'teal',
            detail: `Pendentes: ${formatCurrency(metrics.receitasPendentes)}`,
            detailIcon: CreditCard
        },
        {
            title: 'Despesas (Mês)',
            value: formatCurrency(metrics.despesas),
            icon: TrendingDown,
            color: 'rose',
            detail: `Pendentes: ${formatCurrency(metrics.despesasPendentes)}`,
            detailIcon: Calendar
        }
    ];

    const getCashFlowData = () => {
        const last6Months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return {
                month: d.getMonth(),
                year: d.getFullYear(),
                label: d.toLocaleString('pt-BR', { month: 'short' })
            };
        }).reverse();

        return last6Months.map(m => {
            const monthTxs = transactions.filter(t => {
                const d = new Date(t.date);
                return d.getMonth() === m.month && d.getFullYear() === m.year && t.status === 'pago';
            });

            return {
                name: m.label,
                receitas: monthTxs.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0),
                despesas: monthTxs.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0),
            };
        });
    };

    const getExpensesByCategory = () => {
        const categories = transactions
            .filter(t => t.type === 'despesa')
            .reduce((acc: Record<string, number>, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});

        return Object.entries(categories).map(([name, value]) => ({
            name,
            value: value
        })).sort((a, b) => b.value - a.value);
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#6366f1', '#ec4899'];

    // Insight logic: Comparison with previous month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const prevMonthTxs = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    });

    const currentTotal = currentMonthTxs.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const prevTotal = prevMonthTxs.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const incomeGrowth = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header with quick insight */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black bg-gradient-to-r from-gray-800 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                        Seu Painel
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aqui está o resumo das suas finanças.</p>
                </div>
                {incomeGrowth !== 0 && (
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border",
                        incomeGrowth > 0
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20"
                            : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/20"
                    )}>
                        {incomeGrowth > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(incomeGrowth).toFixed(1)}% {incomeGrowth > 0 ? 'mais' : 'menos'} receitas que mês passado
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryCards.map((card, index) => (
                    <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-none bg-white dark:bg-slate-900 ring-1 ring-gray-100 dark:ring-slate-800 overflow-hidden relative">
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700",
                            card.color === 'blue' ? 'bg-blue-600' : card.color === 'teal' ? 'bg-teal-600' : 'bg-rose-600'
                        )} />

                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className={cn(
                                "p-3 rounded-2xl",
                                card.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                    card.color === 'teal' ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' :
                                        'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                            )}>
                                <card.icon size={24} />
                            </div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{card.title}</p>
                            <h3 className="text-3xl font-black text-gray-800 dark:text-white mb-3">
                                {maskValue(card.value)}
                            </h3>

                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 border-t border-gray-50 dark:border-slate-800 pt-3">
                                <card.detailIcon size={12} className="opacity-50" />
                                {maskValue(card.detail)}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Fluxo de Caixa">
                    <div className="h-[300px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={getCashFlowData()}>
                                <defs>
                                    <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip privacyMode={privacyMode} />} />
                                <Area name="Receitas" type="monotone" dataKey="receitas" stroke="#3b82f6" fillOpacity={1} fill="url(#colorReceitas)" strokeWidth={3} />
                                <Area name="Despesas" type="monotone" dataKey="despesas" stroke="#f43f5e" fillOpacity={0} strokeWidth={3} strokeDasharray="5 5" />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Despesas por Categoria">
                    <div className="h-[300px] mt-4 flex flex-col md:flex-row items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={getExpensesByCategory()}
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {getExpensesByCategory().map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip privacyMode={privacyMode} />} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 md:pb-0">
                <Card title="Próximos Vencimentos">
                    <div className="space-y-4 mt-4">
                        {transactions.filter(t => t.status === 'pendente').slice(0, 5).map(tx => (
                            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <div>
                                        <p className="text-sm font-bold text-gray-800 dark:text-white">{tx.description}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">{tx.category}</p>
                                    </div>
                                </div>
                                <span className="text-sm font-black text-gray-800 dark:text-white">{maskValue(formatCurrency(tx.amount))}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Empréstimos Ativos">
                    <div className="space-y-4 mt-4">
                        {loans.filter(l => l.status === 'ativo').map(loan => (
                            <div key={loan.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-slate-800">
                                <div>
                                    <p className="text-sm font-bold text-gray-800 dark:text-white">{loan.entity}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{loan.type === 'emprestado' ? 'Você Emprestou' : 'Você Recebeu'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-blue-600 dark:text-blue-400">{maskValue(formatCurrency(loan.amount))}</p>
                                    <p className="text-[10px] text-gray-400">Vencimento: {loan.dueDate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};
