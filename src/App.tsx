import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DailyView } from './pages/DailyView';
import { WeeklyView } from './pages/WeeklyView';
import { MonthlyView } from './pages/MonthlyView';
import { TransactionsView } from './pages/TransactionsView';
import { LoginPage } from './pages/LoginPage';
import { BottomNav } from './components/navigation/BottomNav';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<DailyView />} />
          <Route path="/weekly" element={<WeeklyView />} />
          <Route path="/monthly" element={<MonthlyView />} />
          <Route path="/transactions" element={<TransactionsView />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
