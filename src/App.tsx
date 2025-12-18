import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { Transactions } from './components/transactions/Transactions';
import { Loans } from './components/loans/Loans';
import { Investments } from './components/investments/Investments';
import { Categories } from './components/categories/Categories';
import { RecurringTransactions } from './components/recurring/RecurringTransactions';
import { Settings } from './components/settings/Settings';
import { Auth } from './components/auth/Auth';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useFinancial();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <FinancialProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="categories" element={<Categories />} />
            <Route path="recurring" element={<RecurringTransactions />} />
            <Route path="loans" element={<Loans />} />
            <Route path="investments" element={<Investments />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </FinancialProvider>
  );
}

export default App;
