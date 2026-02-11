import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag as TagIcon } from 'lucide-react';
import { DateNavigator } from '../components/navigation/DateNavigator';
import { BudgetIndicator } from '../components/summaries/BudgetIndicator';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { AddExpenseButton } from '../components/expenses/AddExpenseButton';
import { ExpenseItem } from '../components/expenses/ExpenseItem';
import { useDateRangeExpenses, useExpenseActions } from '../hooks/useExpenses';
import { useTags } from '../hooks/useTags';
import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency } from '../utils/formatters';
import {
  getWeekStart,
  getWeekEnd,
  getDaysInWeek,
  getPreviousWeek,
  getNextWeek,
  formatWeekRange,
  getDateString,
  getDayName,
  getDayNumber,
  isToday,
} from '../utils/dateUtils';
import { calculateTotal } from '../services/expenseService';
import type { Expense, ExpenseInput } from '../types/expense';


export function WeeklyView() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();

  const { settings } = useSettings();
  const weekStart = useMemo(() => getWeekStart(currentDate, settings.weekStartDay), [currentDate, settings.weekStartDay]);
  const weekEnd = useMemo(() => getWeekEnd(currentDate, settings.weekStartDay), [currentDate, settings.weekStartDay]);
  const { expenses, total, loading } = useDateRangeExpenses(weekStart, weekEnd);
  const { add, update, remove } = useExpenseActions();
  const { tags } = useTags();

  const days = useMemo(() => getDaysInWeek(weekStart, settings.weekStartDay), [weekStart, settings.weekStartDay]);

  const groupedByDate = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      const dateStr = expense.dateString;
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);
  }, [expenses]);

  const handlePrevious = () => setCurrentDate(prev => getPreviousWeek(prev));
  const handleNext = () => setCurrentDate(prev => getNextWeek(prev));
  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = useCallback((date: Date) => {
    navigate(`/?date=${getDateString(date)}`);
  }, [navigate]);

  const handleEdit = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingExpense(undefined);
  }, []);

  const handleUpdate = useCallback(async (id: string, input: Partial<ExpenseInput>) => {
    await update(id, input);
  }, [update]);

  return (
    <div className="min-h-screen bg-gray-900 pt-14 pb-8">
      <DateNavigator
        label={formatWeekRange(weekStart, settings.weekStartDay)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

      <main className="p-4 space-y-4">
        <BudgetIndicator
          spent={total}
          expenses={expenses}
          tags={tags}
          showTagBreakdown
        />

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Week Total</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowTags(!showTags)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                  showTags
                    ? 'text-blue-400 bg-blue-900/30 border-blue-700'
                    : 'text-gray-400 hover:text-gray-200 bg-gray-800 border-gray-700'
                }`}
              >
                <TagIcon className="w-4 h-4" />
                Tags
              </button>
              <span className="text-2xl font-bold text-gray-100">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="flex min-w-max">
                {days.map((day) => {
                  const dateString = getDateString(day);
                  const dayExpenses = groupedByDate[dateString] || [];
                  const dayTotal = calculateTotal(dayExpenses);
                  const isTodayDate = isToday(day);

                  return (
                    <div
                      key={dateString}
                      className={`flex-1 min-w-[120px] border-r border-gray-700 last:border-r-0 ${
                        isTodayDate ? 'bg-blue-900/30' : ''
                      }`}
                    >
                      <div
                        className={`px-2 py-3 text-center border-b border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                          isTodayDate ? 'bg-blue-900/50' : 'bg-gray-800'
                        }`}
                        onClick={() => handleDayClick(day)}
                      >
                        <div className="text-xs text-gray-400 uppercase">
                          {getDayName(day)}
                        </div>
                        <div
                          className={`text-lg font-medium ${
                            isTodayDate ? 'text-blue-400' : 'text-gray-100'
                          }`}
                        >
                          {getDayNumber(day)}
                        </div>
                      </div>

                      <div className="px-2 py-2 bg-gray-800/50 border-b border-gray-700">
                        <div className="text-center font-medium text-sm text-gray-300">
                          {dayTotal > 0 ? formatCurrency(dayTotal) : '-'}
                        </div>
                      </div>

                      <div className="p-2 min-h-[100px]">
                        {dayExpenses.length === 0 ? (
                          <div className="text-center text-gray-500 text-xs py-4">
                            No expenses
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {dayExpenses.map((expense) => (
                              <ExpenseItem
                                key={expense.id}
                                expense={expense}
                                compact
                                onDelete={remove}
                                onEdit={handleEdit}
                                showTags={showTags}
                                tags={tags}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <AddExpenseButton onClick={() => setIsModalOpen(true)} />

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={add}
        editingExpense={editingExpense}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
