import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { DateNavigator } from '../components/navigation/DateNavigator';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { AddExpenseButton } from '../components/expenses/AddExpenseButton';
import { useMonthExpenses, useExpenseActions } from '../hooks/useExpenses';
import { useTags } from '../hooks/useTags';
import { formatCurrency } from '../utils/formatters';
import { getTagHexColor } from '../services/tagService';
import {
  getMonthStart,
  getDaysInMonth,
  getPreviousMonth,
  getNextMonth,
  formatMonth,
  getDateString,
  getDayNumber,
  isToday,
  getWeekKey,
} from '../utils/dateUtils';
import { calculateTotal } from '../services/expenseService';
import { WEEKLY_BUDGET } from '../constants/config';

export function MonthlyView() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTagBreakdownExpanded, setIsTagBreakdownExpanded] = useState(false);

  const monthStart = useMemo(() => getMonthStart(currentDate), [currentDate]);
  const { groupedByDate, total, loading, expenses } = useMonthExpenses(monthStart);
  const { add } = useExpenseActions();
  const { tags } = useTags();

  const days = useMemo(() => getDaysInMonth(monthStart), [monthStart]);

  const weeklyBreakdown = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      const weekKey = expense.weekKey;
      if (!acc[weekKey]) {
        acc[weekKey] = 0;
      }
      acc[weekKey] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  const weeksInMonth = useMemo(() => {
    return [...new Set(days.map((day) => getWeekKey(day)))];
  }, [days]);

  const tagTotals = useMemo(() => {
    if (expenses.length === 0) return [];

    const tagsMap = new Map(tags.map(t => [t.id, t]));
    const totals = new Map<string | null, number>();

    expenses.forEach(expense => {
      if (expense.tagIds && expense.tagIds.length > 0) {
        const amountPerTag = expense.amount / expense.tagIds.length;
        expense.tagIds.forEach(tagId => {
          totals.set(tagId, (totals.get(tagId) || 0) + amountPerTag);
        });
      } else {
        totals.set(null, (totals.get(null) || 0) + expense.amount);
      }
    });

    const result: { tagId: string | null; name: string; color: string; total: number }[] = [];
    totals.forEach((tagTotal, tagId) => {
      if (tagId === null) {
        result.push({
          tagId: null,
          name: 'No Tag',
          color: 'gray-500',
          total: Math.round(tagTotal),
        });
      } else {
        const tag = tagsMap.get(tagId);
        if (tag) {
          result.push({
            tagId,
            name: tag.name,
            color: tag.color,
            total: Math.round(tagTotal),
          });
        }
      }
    });

    result.sort((a, b) => b.total - a.total);
    return result;
  }, [expenses, tags]);

  const handlePrevious = () => setCurrentDate(prev => getPreviousMonth(prev));
  const handleNext = () => setCurrentDate(prev => getNextMonth(prev));
  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = useCallback((date: Date) => {
    navigate(`/?date=${getDateString(date)}`);
  }, [navigate]);

  const startOffset = useMemo(() => {
    const firstDayOfWeek = monthStart.getDay();
    return firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  }, [monthStart]);

  return (
    <div className="min-h-screen bg-gray-900 pt-14 pb-8">
      <DateNavigator
        label={formatMonth(monthStart)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

      <main className="p-4 space-y-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Month Total</span>
            <span className="text-2xl font-bold text-gray-100">
              {formatCurrency(total)}
            </span>
          </div>

          {tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <button
                onClick={() => setIsTagBreakdownExpanded(!isTagBreakdownExpanded)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                {isTagBreakdownExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                View by tag
              </button>

              {isTagBreakdownExpanded && tagTotals.length > 0 && (
                <>
                  <div className="mt-3 space-y-2">
                    {tagTotals.map((tagTotal) => (
                      <div
                        key={tagTotal.tagId ?? 'notag'}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: getTagHexColor(tagTotal.color) }}
                          />
                          <span className="text-sm text-gray-300">{tagTotal.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-200">
                          {formatCurrency(tagTotal.total)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full flex">
                      {tagTotals.map((tagTotal) => (
                        <div
                          key={tagTotal.tagId ?? 'notag'}
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${(tagTotal.total / total) * 100}%`,
                            backgroundColor: getTagHexColor(tagTotal.color),
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
            <h3 className="font-medium text-gray-100">Weekly Breakdown</h3>
          </div>
          <div className="divide-y divide-gray-700">
            {weeksInMonth.map((weekKey, index) => {
              const weekTotal = weeklyBreakdown[weekKey] || 0;
              const isOverBudget = weekTotal > WEEKLY_BUDGET;
              return (
                <div
                  key={weekKey}
                  className="flex justify-between items-center px-4 py-3"
                >
                  <span className="text-gray-400">Week {index + 1}</span>
                  <span
                    className={`font-medium ${
                      isOverBudget ? 'text-red-400' : 'text-gray-100'
                    }`}
                  >
                    {formatCurrency(weekTotal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
              <h3 className="font-medium text-gray-100">Daily Totals</h3>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-700">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs text-gray-400 py-2 font-medium"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="p-2 min-h-[60px] bg-gray-900/50" />
              ))}

              {days.map((day) => {
                const dateString = getDateString(day);
                const dayExpenses = groupedByDate[dateString] || [];
                const dayTotal = calculateTotal(dayExpenses);
                const isTodayDate = isToday(day);

                return (
                  <div
                    key={dateString}
                    className={`p-2 min-h-[60px] border-t border-r border-gray-700 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                      isTodayDate ? 'bg-blue-900/30' : ''
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div
                      className={`text-sm ${
                        isTodayDate
                          ? 'font-bold text-blue-400'
                          : 'text-gray-300'
                      }`}
                    >
                      {getDayNumber(day)}
                    </div>
                    {dayTotal > 0 && (
                      <div className="text-xs font-medium text-gray-400 mt-1">
                        {formatCurrency(dayTotal)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <AddExpenseButton onClick={() => setIsModalOpen(true)} />

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={add}
      />
    </div>
  );
}
