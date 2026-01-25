import { useState, useMemo } from 'react';
import { DateNavigator } from '../components/navigation/DateNavigator';
import { BudgetIndicator } from '../components/summaries/BudgetIndicator';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { AddExpenseButton } from '../components/expenses/AddExpenseButton';
import { ExpenseItem } from '../components/expenses/ExpenseItem';
import { useWeekExpenses, useExpenseActions } from '../hooks/useExpenses';
import { formatCurrency } from '../utils/formatters';
import {
  getWeekStart,
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

export function WeeklyView() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate]);
  const { groupedByDate, total, loading } = useWeekExpenses(weekStart);
  const { add, remove } = useExpenseActions();

  const days = useMemo(() => getDaysInWeek(weekStart), [weekStart]);

  const handlePrevious = () => setCurrentDate(prev => getPreviousWeek(prev));
  const handleNext = () => setCurrentDate(prev => getNextWeek(prev));
  const handleToday = () => setCurrentDate(new Date());

  return (
    <div className="min-h-screen bg-gray-900 pt-14 pb-8">
      {/* Date Navigator */}
      <DateNavigator
        label={formatWeekRange(weekStart)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

      <main className="p-4 space-y-4">
        {/* Budget Indicator */}
        <BudgetIndicator spent={total} />

        {/* Week Total */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Week Total</span>
            <span className="text-2xl font-bold text-gray-100">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Weekly Table */}
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
                      {/* Day Header */}
                      <div
                        className={`px-2 py-3 text-center border-b border-gray-700 ${
                          isTodayDate ? 'bg-blue-900/50' : 'bg-gray-800'
                        }`}
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

                      {/* Day Total */}
                      <div className="px-2 py-2 bg-gray-800/50 border-b border-gray-700">
                        <div className="text-center font-medium text-sm text-gray-300">
                          {dayTotal > 0 ? formatCurrency(dayTotal) : '-'}
                        </div>
                      </div>

                      {/* Expenses */}
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
