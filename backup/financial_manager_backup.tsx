import React, { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, CreditCard, Calendar, Trash2, Edit2, Save, X, AlertCircle, PieChart, BarChart3, Target, Wallet } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';

const FinancialManager = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [newTransaction, setNewTransaction] = useState({
    type: 'receita',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pendente'
  });

  const [newLoan, setNewLoan] = useState({
    type: 'emprestado',
    entity: '',
    amount: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'ativo'
  });

  const [newInvestment, setNewInvestment] = useState({
    name: '',
    initialAmount: '',
    currentAmount: '',
    targetReturn: '30',
    startDate: new Date().toISOString().split('T')[0],
    category: 'ações',
    status: 'ativo'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const txResult = await window.storage.get('transactions');
      const loanResult = await window.storage.get('loans');
      const invResult = await window.storage.get('investments');

      if (txResult?.value) setTransactions(JSON.parse(txResult.value));
      if (loanResult?.value) setLoans(JSON.parse(loanResult.value));
      if (invResult?.value) setInvestments(JSON.parse(invResult.value));
    } catch (error) {
      console.log('Iniciando com dados vazios');
    }
  };

  const saveTransactions = async (data) => {
    try {
      await window.storage.set('transactions', JSON.stringify(data));
      setTransactions(data);
    } catch (error) {
      alert('Erro ao salvar transação');
    }
  };

  const saveLoans = async (data) => {
    try {
      await window.storage.set('loans', JSON.stringify(data));
      setLoans(data);
    } catch (error) {
      alert('Erro ao salvar empréstimo');
    }
  };

  const saveInvestments = async (data) => {
    try {
      await window.storage.set('investments', JSON.stringify(data));
      setInvestments(data);
    } catch (error) {
      alert('Erro ao salvar investimento');
    }
  };

  const addTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const transaction = {
      ...newTransaction,
      id: Date.now(),
      amount: parseFloat(newTransaction.amount)
    };

    saveTransactions([...transactions, transaction]);
    setNewTransaction({
      type: 'receita',
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pendente'
    });
  };

  const addLoan = () => {
    if (!newLoan.entity || !newLoan.amount || !newLoan.dueDate) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const loan = {
      ...newLoan,
      id: Date.now(),
      amount: parseFloat(newLoan.amount),
      interestRate: parseFloat(newLoan.interestRate) || 0
    };

    saveLoans([...loans, loan]);
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

  const addInvestment = () => {
    if (!newInvestment.name || !newInvestment.initialAmount || !newInvestment.currentAmount) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const investment = {
      ...newInvestment,
      id: Date.now(),
      initialAmount: parseFloat(newInvestment.initialAmount),
      currentAmount: parseFloat(newInvestment.currentAmount),
      targetReturn: parseFloat(newInvestment.targetReturn)
    };

    saveInvestments([...investments, investment]);
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

  const deleteTransaction = (id) => {
    if (confirm('Deseja realmente excluir esta transação?')) {
      saveTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const deleteLoan = (id) => {
    if (confirm('Deseja realmente excluir este empréstimo?')) {
      saveLoans(loans.filter(l => l.id !== id));
    }
  };

  const deleteInvestment = (id) => {
    if (confirm('Deseja realmente excluir este investimento?')) {
      saveInvestments(investments.filter(i => i.id !== id));
    }
  };

  const startEdit = (item, type) => {
    setEditingId(item.id);
    setEditForm({ ...item, editType: type });
  };

  const saveEdit = () => {
    if (editForm.editType === 'transaction') {
      const updated = transactions.map(t =>
        t.id === editingId ? { ...editForm, amount: parseFloat(editForm.amount) } : t
      );
      saveTransactions(updated);
    } else if (editForm.editType === 'loan') {
      const updated = loans.map(l =>
        l.id === editingId ? {
          ...editForm,
          amount: parseFloat(editForm.amount),
          interestRate: parseFloat(editForm.interestRate) || 0
        } : l
      );
      saveLoans(updated);
    } else if (editForm.editType === 'investment') {
      const updated = investments.map(i =>
        i.id === editingId ? {
          ...editForm,
          initialAmount: parseFloat(editForm.initialAmount),
          currentAmount: parseFloat(editForm.currentAmount),
          targetReturn: parseFloat(editForm.targetReturn)
        } : i
      );
      saveInvestments(updated);
    }
    setEditingId(null);
    setEditForm({});
  };

  const calculateMetrics = () => {
    const receitas = transactions
      .filter(t => t.type === 'receita' && t.status === 'pago')
      .reduce((sum, t) => sum + t.amount, 0);

    const despesas = transactions
      .filter(t => t.type === 'despesa' && t.status === 'pago')
      .reduce((sum, t) => sum + t.amount, 0);

    const receitasPendentes = transactions
      .filter(t => t.type === 'receita' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.amount, 0);

    const despesasPendentes = transactions
      .filter(t => t.type === 'despesa' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.amount, 0);

    const emprestimosAtivos = loans
      .filter(l => l.type === 'emprestado' && l.status === 'ativo')
      .reduce((sum, l) => sum + l.amount * (1 + l.interestRate / 100), 0);

    const emprestimosRecebidos = loans
      .filter(l => l.type === 'recebido' && l.status === 'ativo')
      .reduce((sum, l) => sum + l.amount * (1 + l.interestRate / 100), 0);

    const totalInvested = investments
      .filter(i => i.status === 'ativo')
      .reduce((sum, i) => sum + i.initialAmount, 0);

    const totalCurrentInvestments = investments
      .filter(i => i.status === 'ativo')
      .reduce((sum, i) => sum + i.currentAmount, 0);

    const investmentReturn = totalInvested > 0
      ? ((totalCurrentInvestments - totalInvested) / totalInvested) * 100
      : 0;

    return {
      saldo: receitas - despesas,
      receitas,
      despesas,
      receitasPendentes,
      despesasPendentes,
      emprestimosAtivos,
      emprestimosRecebidos,
      saldoProjetado: receitas - despesas + receitasPendentes - despesasPendentes,
      totalInvested,
      totalCurrentInvestments,
      investmentReturn
    };
  };

  const metrics = calculateMetrics();

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getCashFlowData = () => {
    const last6Months = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = date.toLocaleDateString('pt-BR', { month: 'short' });

      const monthReceitas = transactions
        .filter(t => {
          const txDate = new Date(t.date);
          return t.type === 'receita' &&
            t.status === 'pago' &&
            txDate.getMonth() === date.getMonth() &&
            txDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const monthDespesas = transactions
        .filter(t => {
          const txDate = new Date(t.date);
          return t.type === 'despesa' &&
            t.status === 'pago' &&
            txDate.getMonth() === date.getMonth() &&
            txDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

      last6Months.push({
        month,
        receitas: monthReceitas,
        despesas: monthDespesas,
        saldo: monthReceitas - despesas
      });
    }

    return last6Months;
  };

  const getExpensesByCategory = () => {
    const categories = {};
    transactions
      .filter(t => t.type === 'despesa' && t.status === 'pago')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  const renderDashboard = () => {
    const cashFlowData = getCashFlowData();
    const expensesData = getExpensesByCategory();

    return (
      <div className="space-y-6">
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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Fluxo de Caixa (6 meses)</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} fill="url(#colorReceitas)" />
                <Area type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} fill="url(#colorDespesas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Despesas por Categoria</h3>
            </div>
            {expensesData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RePieChart>
                  <Pie
                    data={expensesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <PieChart className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma despesa registrada</p>
                </div>
              </div>
            )}
          </div>
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
              <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">A Receber</span>
                </div>
                <span className="text-xl font-bold text-green-600">{formatCurrency(metrics.receitasPendentes)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-red-200">
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
              <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Você Emprestou</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{formatCurrency(metrics.emprestimosAtivos)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-orange-200">
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

  const renderInvestments = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Novo Investimento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Nome do Investimento"
            value={newInvestment.name}
            onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <select
            value={newInvestment.category}
            onChange={(e) => setNewInvestment({ ...newInvestment, category: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <input
            type="number"
            placeholder="Valor Atual (R$)"
            value={newInvestment.currentAmount}
            onChange={(e) => setNewInvestment({ ...newInvestment, currentAmount: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <input
            type="number"
            placeholder="Meta de Retorno (%)"
            value={newInvestment.targetReturn}
            onChange={(e) => setNewInvestment({ ...newInvestment, targetReturn: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <input
            type="date"
            value={newInvestment.startDate}
            onChange={(e) => setNewInvestment({ ...newInvestment, startDate: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <select
            value={newInvestment.status}
            onChange={(e) => setNewInvestment({ ...newInvestment, status: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="ativo">Ativo</option>
            <option value="encerrado">Encerrado</option>
          </select>
        </div>
        <button
          onClick={addInvestment}
          className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Adicionar Investimento
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {investments.filter(inv => inv.status === 'ativo').map((inv) => {
          const returnValue = inv.currentAmount - inv.initialAmount;
          const returnPercent = ((returnValue / inv.initialAmount) * 100);
          const targetDiff = returnPercent - inv.targetReturn;
          const isPositive = returnValue >= 0;
          const reachedTarget = returnPercent >= inv.targetReturn;

          return (
            <div key={inv.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg">{inv.name}</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-1 inline-block">
                    {inv.category}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(inv, 'investment')}
                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteInvestment(inv.id)}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Investido</span>
                  <span className="font-semibold text-gray-800">{formatCurrency(inv.currentAmount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Retorno</span>
                  <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(returnValue)}
                  </span>
                </div>
              </div>

              <div className="relative pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Rentabilidade</span>
                  <span className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{returnPercent.toFixed(2)}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all ${reachedTarget ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                    style={{ width: `${Math.min(Math.abs(returnPercent / inv.targetReturn * 100), 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">Meta: {inv.targetReturn}%</span>
                  <span className={`text-xs font-medium ${reachedTarget ? 'text-green-600' : 'text-gray-600'}`}>
                    {reachedTarget ? '✓ Meta atingida!' : `Faltam ${Math.abs(targetDiff).toFixed(1)}%`}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500">
                Desde {new Date(inv.startDate).toLocaleDateString('pt-BR')}
              </div>
            </div>
          );
        })}
      </div>

      {investments.filter(inv => inv.status === 'ativo').length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-gray-100">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum investimento cadastrado</h3>
          <p className="text-gray-500">Adicione seu primeiro investimento e acompanhe sua rentabilidade!</p>
        </div>
      )}
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Nova Transação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <select
            value={newTransaction.type}
            onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>

          <input
            type="text"
            placeholder="Categoria"
            value={newTransaction.category}
            onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <input
            type="text"
            placeholder="Descrição"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <input
            type="number"
            placeholder="Valor"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <input
            type="date"
            value={newTransaction.date}
            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <select
            value={newTransaction.status}
            onChange={(e) => setNewTransaction({ ...newTransaction, status: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
          </select>
        </div>
        <button
          onClick={addTransaction}
          className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Adicionar Transação
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
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
                          onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                          className="border rounded-lg px-2 py-1 text-sm"
                        >
                          <option value="receita">Receita</option>
                          <option value="despesa">Despesa</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="border rounded-lg px-2 py-1 text-sm w-full"
                        />
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
                          onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
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
                          onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                          className="border rounded-lg px-2 py-1 text-sm"
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
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${tx.type === 'receita' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                          {tx.type === 'receita' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{tx.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{tx.description}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800">{formatCurrency(tx.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${tx.status === 'pago' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                          {tx.status === 'pago' ? 'Pago' : 'Pendente'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(tx, 'transaction')}
                            className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTransaction(tx.id)}
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLoans = () => (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Novo Empréstimo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <select
            value={newLoan.type}
            onChange={(e) => setNewLoan({ ...newLoan, type: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="emprestado">Você Emprestou</option>
            <option value="recebido">Você Recebeu</option>
          </select>

          <input
            type="text"
            placeholder="Pessoa/Empresa"
            value={newLoan.entity}
            onChange={(e) => setNewLoan({ ...newLoan, entity: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <input
            type="number"
            placeholder="Valor"
            value={newLoan.amount}
            onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <input
            type="number"
            placeholder="Taxa de Juros (%)"
            value={newLoan.interestRate}
            onChange={(e) => setNewLoan({ ...newLoan, interestRate: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <input
            type="date"
            value={newLoan.startDate}
            onChange={(e) => setNewLoan({ ...newLoan, startDate: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <input
            type="date"
            placeholder="Data Vencimento"
            value={newLoan.dueDate}
            onChange={(e) => setNewLoan({ ...newLoan, dueDate: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />

          <select
            value={newLoan.status}
            onChange={(e) => setNewLoan({ ...newLoan, status: e.target.value })}
            className="border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="ativo">Ativo</option>
            <option value="quitado">Quitado</option>
          </select>
        </div>
        <button
          onClick={addLoan}
          className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Adicionar Empréstimo
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
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
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                            className="border rounded-lg px-2 py-1 text-sm"
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
                            onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                            className="border rounded-lg px-2 py-1 text-sm w-full"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editForm.interestRate}
                            onChange={(e) => setEditForm({ ...editForm, interestRate: e.target.value })}
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
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                            className="border rounded-lg px-2 py-1 text-sm"
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
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${loan.type === 'emprestado' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {loan.type === 'emprestado' ? 'Emprestado' : 'Recebido'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{loan.entity}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-800">{formatCurrency(loan.amount)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{loan.interestRate}%</td>
                        <td className="px-6 py-4 text-sm font-bold text-blue-600">{formatCurrency(totalAmount)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(loan.dueDate).toLocaleDateString('pt-BR')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${loan.status === 'quitado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                            {loan.status === 'quitado' ? 'Quitado' : 'Ativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(loan, 'loan')}
                              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteLoan(loan.id)}
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Sistema de Gestão Financeira</h1>
          <p className="text-blue-100">Controle inteligente e completo das suas finanças</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl mb-6 border border-white/20">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-8 py-4 font-semibold whitespace-nowrap transition-all ${activeTab === 'dashboard'
                ? 'border-b-3 border-blue-500 text-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
                }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-8 py-4 font-semibold whitespace-nowrap transition-all ${activeTab === 'transactions'
                ? 'border-b-3 border-blue-500 text-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
                }`}
            >
              Receitas & Despesas
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`px-8 py-4 font-semibold whitespace-nowrap transition-all ${activeTab === 'loans'
                ? 'border-b-3 border-blue-500 text-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
                }`}
            >
              Empréstimos
            </button>
            <button
              onClick={() => setActiveTab('investments')}
              className={`px-8 py-4 font-semibold whitespace-nowrap transition-all ${activeTab === 'investments'
                ? 'border-b-3 border-blue-500 text-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50/50'
                }`}
            >
              Investimentos
            </button>
          </div>
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'loans' && renderLoans()}
        {activeTab === 'investments' && renderInvestments()}
      </div>
    </div>
  );
};

export default FinancialManager;old text - gray - 800">{formatCurrency(inv.initialAmount)}</span>
                </div >
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-600">Valor Atual</span>
    <span className="font-semib