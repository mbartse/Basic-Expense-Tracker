import { useState, useMemo, useCallback } from 'react';
import { Receipt, ArrowUpDown, Check, X } from 'lucide-react';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { AddExpenseButton } from '../components/expenses/AddExpenseButton';
import { useDateRangeExpenses, useExpenseActions } from '../hooks/useExpenses';
import { useTags } from '../hooks/useTags';
import { formatCurrency } from '../utils/formatters';
import { getTagHexColor } from '../services/tagService';
import { getDateString } from '../utils/dateUtils';
import type { Expense, ExpenseInput } from '../types/expense';

export function TransactionsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();

  const today = new Date();
  const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const { tags, loading: tagsLoading } = useTags();
  const { expenses: allExpenses, loading: expensesLoading, total: allTotal } = useDateRangeExpenses(startDate, endDate);
  const { add, update, remove } = useExpenseActions();

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearTags = () => setSelectedTagIds([]);

  const filteredExpenses = useMemo(() => {
    let expenses = allExpenses;
    if (selectedTagIds.length > 0) {
      expenses = allExpenses.filter(
        (expense) => expense.tagIds && expense.tagIds.some(id => selectedTagIds.includes(id))
      );
    }
    return [...expenses].sort((a, b) => {
      const dateCompare = a.dateString.localeCompare(b.dateString);
      return sortNewestFirst ? -dateCompare : dateCompare;
    });
  }, [allExpenses, selectedTagIds, sortNewestFirst]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setStartDate(new Date(value + 'T00:00:00'));
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setEndDate(new Date(value + 'T00:00:00'));
    }
  };

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

  const loading = tagsLoading || expensesLoading;

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-8">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-semibold text-gray-100">Transactions</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Tag Filter */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Filter by Tags
            </label>
            {selectedTagIds.length > 0 && (
              <button
                onClick={clearTags}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              const hexColor = getTagHexColor(tag.color);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'ring-2 ring-offset-1 ring-offset-gray-800'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: `${hexColor}20`,
                    color: hexColor,
                    borderColor: hexColor,
                    ...(isSelected ? { ringColor: hexColor } : {}),
                  }}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  {tag.name}
                </button>
              );
            })}
            {tags.length === 0 && !tagsLoading && (
              <span className="text-sm text-gray-500">No tags created yet</span>
            )}
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date Range
          </label>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">From</label>
              <input
                type="date"
                value={getDateString(startDate)}
                onChange={handleStartDateChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">To</label>
              <input
                type="date"
                value={getDateString(endDate)}
                onChange={handleEndDateChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Total Card */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">
              {selectedTagIds.length > 0 ? 'Filtered Total' : 'Total'}
            </span>
            <span className="text-2xl font-bold text-gray-100">
              {formatCurrency(selectedTagIds.length > 0 ? filteredTotal : allTotal)}
            </span>
          </div>
        </div>

        {/* Expense List */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium text-gray-100">
              Expenses ({filteredExpenses.length})
            </h2>
            <button
              onClick={() => setSortNewestFirst(!sortNewestFirst)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 bg-gray-800 border border-gray-700 rounded-lg transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortNewestFirst ? 'Newest first' : 'Oldest first'}
            </button>
          </div>
          {loading ? (
            <div className="py-12 text-center text-gray-400">Loading...</div>
          ) : (
            <ExpenseList
              expenses={filteredExpenses}
              total={filteredTotal}
              onDelete={remove}
              onEdit={handleEdit}
              showDate
              showTags
              tags={tags}
              emptyMessage={
                selectedTagIds.length > 0
                  ? 'No expenses matching selected tags in this date range'
                  : 'No expenses in the selected date range'
              }
            />
          )}
        </section>
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
