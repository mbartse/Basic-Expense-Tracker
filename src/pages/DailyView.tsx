import { useState } from 'react';
import { Tag } from 'lucide-react';
import { formatDateFull } from '../utils/formatters';
import { BudgetIndicator } from '../components/summaries/BudgetIndicator';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { AddExpenseButton } from '../components/expenses/AddExpenseButton';
import { WeekSummary } from '../components/summaries/WeekSummary';
import { MonthSummary } from '../components/summaries/MonthSummary';
import {
  useTodayExpenses,
  useCurrentWeekExpenses,
  useCurrentMonthExpenses,
  useExpenseActions,
} from '../hooks/useExpenses';
import { useBanks } from '../hooks/useBanks';

export function DailyView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBanks, setShowBanks] = useState(false);
  const { expenses: todayExpenses, total: todayTotal, loading: todayLoading } = useTodayExpenses();
  const { total: weekTotal } = useCurrentWeekExpenses();
  const { total: monthTotal } = useCurrentMonthExpenses();
  const { add, remove } = useExpenseActions();
  const { banks } = useBanks();

  const today = new Date();

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-8">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <h1 className="text-xl font-semibold text-gray-100">
          {formatDateFull(today)}
        </h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Budget Indicator */}
        <BudgetIndicator spent={weekTotal} />

        {/* Today's Expenses */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium text-gray-100">
              Today's Expenses
            </h2>
            <button
              onClick={() => setShowBanks(!showBanks)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                showBanks
                  ? 'text-blue-400 bg-blue-900/30 border-blue-700'
                  : 'text-gray-400 hover:text-gray-200 bg-gray-800 border-gray-700'
              }`}
            >
              <Tag className="w-4 h-4" />
              Banks
            </button>
          </div>
          {todayLoading ? (
            <div className="py-12 text-center text-gray-400">Loading...</div>
          ) : (
            <ExpenseList
              expenses={todayExpenses}
              total={todayTotal}
              onDelete={remove}
              showBanks={showBanks}
              banks={banks}
              emptyMessage="No expenses today"
            />
          )}
        </section>

        {/* Summary Section */}
        <section className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <WeekSummary total={weekTotal} compact />
          <div className="border-t border-gray-700 my-2" />
          <MonthSummary total={monthTotal} compact />
        </section>
      </main>

      {/* Add Expense Button */}
      <AddExpenseButton onClick={() => setIsModalOpen(true)} />

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={add}
      />
    </div>
  );
}
