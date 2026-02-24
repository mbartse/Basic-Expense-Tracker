import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tag as TagIcon } from 'lucide-react';
import { formatDateFull } from '../utils/formatters';
import { BudgetIndicator } from '../components/summaries/BudgetIndicator';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { AddExpenseButton } from '../components/expenses/AddExpenseButton';
import { DateNavigator } from '../components/navigation/DateNavigator';
import { WeekSummary } from '../components/summaries/WeekSummary';
import { MonthSummary } from '../components/summaries/MonthSummary';
import {
  useDateExpenses,
  useDateRangeExpenses,
  useMonthExpenses,
  useExpenseActions,
} from '../hooks/useExpenses';
import { useTags } from '../hooks/useTags';
import { useSettings } from '../contexts/SettingsContext';
import {
  parseISO,
  getWeekStart,
  getWeekEnd,
  getMonthStart,
  getPreviousDay,
  getNextDay,
  getDateString,
  isToday,
} from '../utils/dateUtils';
import type { Expense, ExpenseInput } from '../types/expense';

interface DailyViewProps {
  friendUid?: string;
  isViewingFriend: boolean;
}

export function DailyView({ friendUid, isViewingFriend }: DailyViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();

  const { settings } = useSettings();

  const currentDate = useMemo(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      try {
        return parseISO(dateParam);
      } catch {
        return new Date();
      }
    }
    return new Date();
  }, [searchParams]);

  const weekStart = useMemo(() => getWeekStart(currentDate, settings.weekStartDay), [currentDate, settings.weekStartDay]);
  const weekEnd = useMemo(() => getWeekEnd(currentDate, settings.weekStartDay), [currentDate, settings.weekStartDay]);
  const monthStart = useMemo(() => getMonthStart(currentDate), [currentDate]);

  const { expenses: dayExpenses, total: dayTotal, loading: dayLoading } = useDateExpenses(currentDate, friendUid);
  const { total: weekTotal } = useDateRangeExpenses(weekStart, weekEnd, friendUid);
  const { total: monthTotal } = useMonthExpenses(monthStart, friendUid);
  const { add, update, remove } = useExpenseActions();
  const { tags } = useTags(friendUid);

  const isTodayDate = isToday(currentDate);

  const setCurrentDate = useCallback((date: Date) => {
    const params = new URLSearchParams(searchParams);
    if (!isToday(date)) {
      params.set('date', getDateString(date));
    } else {
      params.delete('date');
    }
    setSearchParams(params);
  }, [setSearchParams, searchParams]);

  const handlePrevious = () => setCurrentDate(getPreviousDay(currentDate));
  const handleNext = () => setCurrentDate(getNextDay(currentDate));
  const handleToday = () => setCurrentDate(new Date());

  const handleAdd = useCallback(async (input: ExpenseInput) => {
    await add({
      ...input,
      date: currentDate,
    });
  }, [add, currentDate]);

  const handleUpdate = useCallback(async (id: string, input: Partial<ExpenseInput>) => {
    await update(id, input);
  }, [update]);

  const handleEdit = useCallback((expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingExpense(undefined);
  }, []);

  return (
    <>
      <DateNavigator
        label={formatDateFull(currentDate)}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
      />

      <main className="p-4 space-y-4">
        <BudgetIndicator spent={weekTotal} />

        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium text-gray-100">
              {isTodayDate ? "Today's Expenses" : 'Expenses'}
            </h2>
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
          </div>
          {dayLoading ? (
            <div className="py-12 text-center text-gray-400">Loading...</div>
          ) : (
            <ExpenseList
              expenses={dayExpenses}
              total={dayTotal}
              onDelete={isViewingFriend ? undefined : remove}
              onEdit={isViewingFriend ? undefined : handleEdit}
              showTags={showTags}
              tags={tags}
              emptyMessage={isTodayDate ? 'No expenses today' : 'No expenses on this day'}
            />
          )}
        </section>

        <section className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <WeekSummary total={weekTotal} compact />
          <div className="border-t border-gray-700 my-2" />
          <MonthSummary total={monthTotal} compact />
        </section>
      </main>

      {!isViewingFriend && (
        <>
          <AddExpenseButton onClick={() => setIsModalOpen(true)} />

          <AddExpenseModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleAdd}
            editingExpense={editingExpense}
            onUpdate={handleUpdate}
          />
        </>
      )}
    </>
  );
}
