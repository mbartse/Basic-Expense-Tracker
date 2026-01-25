import { useState } from 'react';
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

export function DailyView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { expenses: todayExpenses, total: todayTotal, loading: todayLoading } = useTodayExpenses();
  const { total: weekTotal } = useCurrentWeekExpenses();
  const { total: monthTotal } = useCurrentMonthExpenses();
  const { add, remove } = useExpenseActions();

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
          <h2 className="text-lg font-medium text-gray-100 mb-3">
            Today's Expenses
          </h2>
          {todayLoading ? (
            <div className="py-12 text-center text-gray-400">Loading...</div>
          ) : (
            <ExpenseList
              expenses={todayExpenses}
              total={todayTotal}
              onDelete={remove}
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
