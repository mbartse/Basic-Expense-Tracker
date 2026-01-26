import { useState, useMemo } from 'react';
import { Building2, ArrowUpDown } from 'lucide-react';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { AddExpenseModal } from '../components/expenses/AddExpenseModal';
import { AddExpenseButton } from '../components/expenses/AddExpenseButton';
import { useDateRangeExpenses, useExpenseActions } from '../hooks/useExpenses';
import { useBanks } from '../hooks/useBanks';
import { formatCurrency } from '../utils/formatters';
import { getBankHexColor } from '../services/bankService';
import { getDateString } from '../utils/dateUtils';

export function BankView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  // Default to current month range
  const today = new Date();
  const defaultStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const defaultEndDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const { banks, loading: banksLoading } = useBanks();
  const { expenses: allExpenses, loading: expensesLoading, total: allTotal } = useDateRangeExpenses(startDate, endDate);
  const { add, remove } = useExpenseActions();

  // Filter and sort expenses by selected bank
  const filteredExpenses = useMemo(() => {
    let expenses = allExpenses;
    if (selectedBankId) {
      expenses = allExpenses.filter(
        (expense) => expense.bankIds && expense.bankIds.includes(selectedBankId)
      );
    }
    // Sort by date
    return [...expenses].sort((a, b) => {
      const dateCompare = a.dateString.localeCompare(b.dateString);
      return sortNewestFirst ? -dateCompare : dateCompare;
    });
  }, [allExpenses, selectedBankId, sortNewestFirst]);

  // Calculate total for filtered expenses
  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const selectedBank = useMemo(() => {
    return banks.find((b) => b.id === selectedBankId);
  }, [banks, selectedBankId]);

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

  const loading = banksLoading || expensesLoading;

  return (
    <div className="min-h-screen bg-gray-900 pt-20 pb-8">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          <h1 className="text-xl font-semibold text-gray-100">Bank View</h1>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Bank Selector */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Bank
          </label>
          <select
            value={selectedBankId || ''}
            onChange={(e) => setSelectedBankId(e.target.value || null)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">All Banks</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name}
              </option>
            ))}
          </select>
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
            <div className="flex items-center gap-2">
              {selectedBank ? (
                <>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getBankHexColor(selectedBank.color) }}
                  />
                  <span className="text-gray-400">{selectedBank.name} Total</span>
                </>
              ) : (
                <span className="text-gray-400">All Banks Total</span>
              )}
            </div>
            <span className="text-2xl font-bold text-gray-100">
              {formatCurrency(selectedBankId ? filteredTotal : allTotal)}
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
              showDate
              emptyMessage={
                selectedBankId
                  ? 'No expenses for this bank in the selected date range'
                  : 'No expenses in the selected date range'
              }
            />
          )}
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
