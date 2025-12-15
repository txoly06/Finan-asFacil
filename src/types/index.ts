export type TransactionType = 'receita' | 'despesa';
export type TransactionStatus = 'pendente' | 'pago';

export interface Transaction {
    id: number;
    type: TransactionType;
    category: string;
    description: string;
    amount: number;
    date: string;
    status: TransactionStatus;
}

export type LoanType = 'emprestado' | 'recebido';
export type LoanStatus = 'ativo' | 'quitado';

export interface Loan {
    id: number;
    type: LoanType;
    entity: string;
    amount: number;
    interestRate: number;
    startDate: string;
    dueDate: string;
    status: LoanStatus;
}

export type InvestmentCategory = 'ações' | 'fundos' | 'criptomoedas' | 'renda-fixa' | 'imoveis' | 'outros';
export type InvestmentStatus = 'ativo' | 'encerrado';

export interface Investment {
    id: number;
    name: string;
    initialAmount: number;
    currentAmount: number;
    targetReturn: number;
    startDate: string;
    category: InvestmentCategory;
    status: InvestmentStatus;
}

export interface DashboardMetrics {
    saldo: number;
    receitas: number;
    despesas: number;
    receitasPendentes: number;
    despesasPendentes: number;
    emprestimosAtivos: number;
    emprestimosRecebidos: number;
    saldoProjetado: number;
    totalInvested: number;
    totalCurrentInvestments: number;
    investmentReturn: number;
}

export interface Category {
    id: number;
    name: string;
    color: string;
    type: TransactionType;
}

export interface RecurringTransaction {
    id: number;
    description: string;
    amount: number;
    category: string;
    type: TransactionType;
    dayOfMonth: number;
    lastGenerated?: string;
    active: boolean;
}
