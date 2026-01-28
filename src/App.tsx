import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DailyView } from './pages/DailyView';
import { WeeklyView } from './pages/WeeklyView';
import { MonthlyView } from './pages/MonthlyView';
import { TransactionsView } from './pages/TransactionsView';
import { BottomNav } from './components/navigation/BottomNav';

function App() {
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

export default App;
