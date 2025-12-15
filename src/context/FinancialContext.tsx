import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';
import type { Transaction, Loan, Investment, DashboardMetrics, Category, RecurringTransaction } from '../types';

type DBTransaction = Database['public']['Tables']['transactions']['Row'];
type DBLoan = Database['public']['Tables']['loans']['Row'];
type DBInvestment = Database['public']['Tables']['investments']['Row'];
type DBCategory = Database['public']['Tables']['categories']['Row'];
type DBRecurring = Database['public']['Tables']['recurring_transactions']['Row'];

interface FinancialContextType {
    user: User | null;
    loading: boolean;
    transactions: Transaction[];
    loans: Loan[];
    investments: Investment[];
    categories: Category[];
    recurringTransactions: RecurringTransaction[];

    addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
    updateTransaction: (id: number, tx: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: number) => Promise<void>;

    addLoan: (loan: Omit<Loan, 'id'>) => Promise<void>;
    updateLoan: (id: number, loan: Partial<Loan>) => Promise<void>;
    deleteLoan: (id: number) => Promise<void>;

    addInvestment: (inv: Omit<Investment, 'id'>) => Promise<void>;
    updateInvestment: (id: number, inv: Partial<Investment>) => Promise<void>;
    deleteInvestment: (id: number) => Promise<void>;

    addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
    deleteCategory: (id: number) => Promise<void>;

    addRecurringTransaction: (rec: Omit<RecurringTransaction, 'id'>) => Promise<void>;
    updateRecurringTransaction: (id: number, rec: Partial<RecurringTransaction>) => Promise<void>;
    deleteRecurringTransaction: (id: number) => Promise<void>;

    metrics: DashboardMetrics;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);


// Mappers
const mapTransaction = (db: DBTransaction): Transaction => ({
    id: db.id,
    type: db.type as Transaction['type'],
    category: db.category,
    description: db.description,
    amount: Number(db.amount),
    date: db.date,
    status: db.status as Transaction['status']
});

const mapLoan = (db: DBLoan): Loan => ({
    id: db.id,
    type: db.type as Loan['type'],
    entity: db.entity,
    amount: Number(db.amount),
    interestRate: Number(db.interest_rate),
    startDate: db.start_date,
    dueDate: db.due_date,
    status: db.status as Loan['status']
});

const mapInvestment = (db: DBInvestment): Investment => ({
    id: db.id,
    name: db.name,
    category: db.category as Investment['category'],
    initialAmount: Number(db.initial_amount),
    currentAmount: Number(db.current_amount),
    targetReturn: Number(db.target_return),
    startDate: db.start_date,
    status: db.status as Investment['status']
});

const mapCategory = (db: DBCategory): Category => ({
    id: db.id,
    name: db.name,
    color: db.color,
    type: db.type as Category['type']
});

const mapRecurring = (db: DBRecurring): RecurringTransaction => ({
    id: db.id,
    description: db.description,
    amount: Number(db.amount),
    category: db.category,
    type: db.type as RecurringTransaction['type'],
    dayOfMonth: db.day_of_month,
    lastGenerated: db.last_generated || undefined,
    active: db.active ?? true
});


export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);

    const checkRecurringTransactions = async (recurring: RecurringTransaction[], userId: string) => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const currentDay = today.getDate();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: PromiseLike<any>[] = [];
        const newTransactions: Database['public']['Tables']['transactions']['Insert'][] = [];

        for (const rec of recurring) {
            if (!rec.active) continue;

            let shouldGenerate = false;
            if (!rec.lastGenerated) {
                // Never generated. If today >= dayOfMonth, generate.
                if (currentDay >= rec.dayOfMonth) shouldGenerate = true;
            } else {
                const lastGenDate = new Date(rec.lastGenerated);
                const lastGenMonth = lastGenDate.getMonth();
                const lastGenYear = lastGenDate.getFullYear();

                // If generated in previous month (or earlier) AND today >= dayOfMonth
                if ((lastGenYear < currentYear || lastGenMonth < currentMonth) && currentDay >= rec.dayOfMonth) {
                    shouldGenerate = true;
                }
            }

            if (shouldGenerate) {
                const dateStr = today.toISOString().split('T')[0];
                newTransactions.push({
                    user_id: userId,
                    type: rec.type,
                    category: rec.category,
                    description: rec.description,
                    amount: rec.amount,
                    date: dateStr,
                    status: 'pendente' // Recurring are usually pending until confirmed/paid
                });

                // Convert PostgrestBuilder to PromiseLike
                updates.push(supabase.from('recurring_transactions').update({ last_generated: dateStr }).eq('id', rec.id).then());
            }
        }

        if (newTransactions.length > 0) {
            await supabase.from('transactions').insert(newTransactions);
            await Promise.all(updates);
            // We don't verify success here to avoid blocking UI, assume success.
            // A refresh would show them.
        }
    };

    const fetchData = React.useCallback(async (userId: string) => {
        try {
            setLoading(true);
            const [txRes, lnRes, invRes, catRes, recRes] = await Promise.all([
                supabase.from('transactions').select('*').order('date', { ascending: false }),
                supabase.from('loans').select('*'),
                supabase.from('investments').select('*'),
                supabase.from('categories').select('*'),
                supabase.from('recurring_transactions').select('*')
            ]);

            if (txRes.error) throw txRes.error;
            if (lnRes.error) throw lnRes.error;
            if (invRes.error) throw invRes.error;
            if (catRes.error) throw catRes.error;
            if (recRes.error) throw recRes.error;

            if (txRes.data.length === 0 && lnRes.data.length === 0 && invRes.data.length === 0) {
                checkForLocalDataAndMigrate(userId);
            } else {
                setTransactions(txRes.data.map(mapTransaction));
                setLoans(lnRes.data.map(mapLoan));
                setInvestments(invRes.data.map(mapInvestment));
                setCategories(catRes.data.map(mapCategory));

                const recurring = recRes.data.map(mapRecurring);
                setRecurringTransactions(recurring);
                checkRecurringTransactions(recurring, userId);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkForLocalDataAndMigrate = async (userId: string) => {
        try {
            const localTx = JSON.parse(localStorage.getItem('transactions') || '[]');
            const localLn = JSON.parse(localStorage.getItem('loans') || '[]');
            const localInv = JSON.parse(localStorage.getItem('investments') || '[]');

            if (localTx.length > 0 || localLn.length > 0 || localInv.length > 0) {
                if (window.confirm('Encontramos dados locais no seu dispositivo. Deseja importá-los para sua conta na nuvem?')) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
                    const cleanTx = localTx.map(({ id, ...rest }: any) => ({ ...rest, user_id: userId }));

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
                    const cleanLn = localLn.map(({ id, ...rest }: any) => ({
                        user_id: userId,
                        type: rest.type,
                        entity: rest.entity,
                        amount: rest.amount,
                        interest_rate: rest.interestRate,
                        start_date: rest.startDate,
                        due_date: rest.dueDate,
                        status: rest.status
                    }));

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
                    const cleanInv = localInv.map(({ id, ...rest }: any) => ({
                        user_id: userId,
                        name: rest.name,
                        category: rest.category,
                        initial_amount: rest.initialAmount,
                        current_amount: rest.currentAmount,
                        target_return: rest.targetReturn,
                        start_date: rest.startDate,
                        status: rest.status
                    }));

                    await Promise.all([
                        cleanTx.length > 0 ? supabase.from('transactions').insert(cleanTx) : Promise.resolve(),
                        cleanLn.length > 0 ? supabase.from('loans').insert(cleanLn) : Promise.resolve(),
                        cleanInv.length > 0 ? supabase.from('investments').insert(cleanInv) : Promise.resolve(),
                    ]);

                    alert('Dados migrados com sucesso!');
                    localStorage.removeItem('transactions');
                    localStorage.removeItem('loans');
                    localStorage.removeItem('investments');
                    fetchData(userId);
                } else {
                    setTransactions([]);
                    setLoans([]);
                    setInvestments([]);
                    setCategories([]);
                    setRecurringTransactions([]);
                }
            } else {
                setTransactions([]);
                setLoans([]);
                setInvestments([]);
                setCategories([]);
                setRecurringTransactions([]);
            }
        } catch (e) {
            console.error('Migration failed:', e);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchData(session.user.id);
            } else {
                setLoading(false);
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchData(session.user.id);
            } else {
                setTransactions([]);
                setLoans([]);
                setInvestments([]);
                setCategories([]);
                setRecurringTransactions([]);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [fetchData]);

    const addTransaction = async (tx: Omit<Transaction, 'id'>) => {
        if (!user) return;
        const { data, error } = await supabase.from('transactions').insert([{ ...tx, user_id: user.id }]).select().single();
        if (error) {
            console.error(error);
            return;
        }
        setTransactions(prev => [mapTransaction(data), ...prev]);
    };

    const updateTransaction = async (id: number, tx: Partial<Transaction>) => {
        const { error } = await supabase.from('transactions').update(tx).eq('id', id);
        if (error) {
            console.error(error);
            return;
        }
        setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...tx } : t)));
    };

    const deleteTransaction = async (id: number) => {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) {
            console.error(error);
            return;
        }
        setTransactions(prev => prev.filter(t => t.id !== id));
    };

    const addLoan = async (loan: Omit<Loan, 'id'>) => {
        if (!user) return;
        const dbLoan = {
            user_id: user.id,
            type: loan.type,
            entity: loan.entity,
            amount: loan.amount,
            interest_rate: loan.interestRate,
            start_date: loan.startDate,
            due_date: loan.dueDate,
            status: loan.status
        };
        const { data, error } = await supabase.from('loans').insert([dbLoan]).select().single();
        if (error) {
            console.error(error);
            return;
        }
        setLoans(prev => [mapLoan(data), ...prev]);
    };

    const updateLoan = async (id: number, loan: Partial<Loan>) => {
        const dbLoan: Database['public']['Tables']['loans']['Update'] = {};
        if (loan.type) dbLoan.type = loan.type;
        if (loan.entity) dbLoan.entity = loan.entity;
        if (loan.amount) dbLoan.amount = loan.amount;
        if (loan.interestRate) dbLoan.interest_rate = loan.interestRate;
        if (loan.startDate) dbLoan.start_date = loan.startDate;
        if (loan.dueDate) dbLoan.due_date = loan.dueDate;
        if (loan.status) dbLoan.status = loan.status;

        const { error } = await supabase.from('loans').update(dbLoan).eq('id', id);
        if (error) {
            console.error(error);
            return;
        }
        setLoans(prev => prev.map(l => (l.id === id ? { ...l, ...loan } : l)));
    };

    const deleteLoan = async (id: number) => {
        const { error } = await supabase.from('loans').delete().eq('id', id);
        if (error) {
            console.error(error);
            return;
        }
        setLoans(prev => prev.filter(l => l.id !== id));
    };

    const addInvestment = async (inv: Omit<Investment, 'id'>) => {
        if (!user) return;
        const dbInv = {
            user_id: user.id,
            name: inv.name,
            category: inv.category,
            initial_amount: inv.initialAmount,
            current_amount: inv.currentAmount,
            target_return: inv.targetReturn,
            start_date: inv.startDate,
            status: inv.status
        };
        const { data, error } = await supabase.from('investments').insert([dbInv]).select().single();
        if (error) {
            console.error(error);
            return;
        }
        setInvestments(prev => [mapInvestment(data), ...prev]);
    };

    const updateInvestment = async (id: number, inv: Partial<Investment>) => {
        const dbInv: Database['public']['Tables']['investments']['Update'] = {};
        if (inv.name) dbInv.name = inv.name;
        if (inv.category) dbInv.category = inv.category;
        if (inv.initialAmount) dbInv.initial_amount = inv.initialAmount;
        if (inv.currentAmount) dbInv.current_amount = inv.currentAmount;
        if (inv.targetReturn) dbInv.target_return = inv.targetReturn;
        if (inv.startDate) dbInv.start_date = inv.startDate;
        if (inv.status) dbInv.status = inv.status;

        const { error } = await supabase.from('investments').update(dbInv).eq('id', id);
        if (error) {
            console.error(error);
            return;
        }
        setInvestments(prev => prev.map(i => (i.id === id ? { ...i, ...inv } : i)));
    };

    const deleteInvestment = async (id: number) => {
        const { error } = await supabase.from('investments').delete().eq('id', id);
        if (error) {
            console.error(error);
            return;
        }
        setInvestments(prev => prev.filter(i => i.id !== id));
    };

    const addCategory = async (cat: Omit<Category, 'id'>) => {
        if (!user) return;
        const { data, error } = await supabase.from('categories').insert([{ ...cat, user_id: user.id }]).select().single();
        if (error) {
            console.error(error);
            return;
        }
        setCategories(prev => [...prev, mapCategory(data)]);
    };

    const deleteCategory = async (id: number) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
            console.error(error);
            return;
        }
        setCategories(prev => prev.filter(c => c.id !== id));
    };

    const addRecurringTransaction = async (rec: Omit<RecurringTransaction, 'id'>) => {
        if (!user) return;
        const dbRec = {
            user_id: user.id,
            description: rec.description,
            amount: rec.amount,
            category: rec.category,
            type: rec.type,
            day_of_month: rec.dayOfMonth,
            active: rec.active
        };
        const { data, error } = await supabase.from('recurring_transactions').insert([dbRec]).select().single();
        if (error) {
            console.error(error);
            return;
        }
        setRecurringTransactions(prev => [...prev, mapRecurring(data)]);
    };

    const updateRecurringTransaction = async (id: number, rec: Partial<RecurringTransaction>) => {
        const dbRec: Database['public']['Tables']['recurring_transactions']['Update'] = {};
        if (rec.description) dbRec.description = rec.description;
        if (rec.amount) dbRec.amount = rec.amount;
        if (rec.category) dbRec.category = rec.category;
        if (rec.type) dbRec.type = rec.type;
        if (rec.dayOfMonth) dbRec.day_of_month = rec.dayOfMonth;
        if (rec.active !== undefined) dbRec.active = rec.active;
        if (rec.lastGenerated) dbRec.last_generated = rec.lastGenerated;

        const { error } = await supabase.from('recurring_transactions').update(dbRec).eq('id', id);
        if (error) {
            console.error(error);
            return;
        }
        setRecurringTransactions(prev => prev.map(r => (r.id === id ? { ...r, ...rec } : r)));
    };

    const deleteRecurringTransaction = async (id: number) => {
        const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
        if (error) {
            console.error(error);
            return;
        }
        setRecurringTransactions(prev => prev.filter(r => r.id !== id));
    };

    // Calculate Metrics (Keep existing logic)
    const calculateMetrics = (): DashboardMetrics => {
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

    return (
        <FinancialContext.Provider value={{
            user, loading,
            transactions, loans, investments, categories, recurringTransactions,
            addTransaction, updateTransaction, deleteTransaction,
            addLoan, updateLoan, deleteLoan,
            addInvestment, updateInvestment, deleteInvestment,
            addCategory, deleteCategory,
            addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction,
            metrics: calculateMetrics()
        }}>
            {children}
        </FinancialContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFinancial = () => {
    const context = useContext(FinancialContext);
    if (!context) {
        throw new Error('useFinancial must be used within a FinancialProvider');
    }
    return context;
};
