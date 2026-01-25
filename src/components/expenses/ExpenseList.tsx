import type { Expense } from '../../types/expense';
import { ExpenseItem } from './ExpenseItem';
import { formatCurrency } from '../../utils/formatters';

interface ExpenseListProps {
  expenses: Expense[];
  total: number;
  onDelete?: (id: string) => void;
  showTotal?: boolean;
  emptyMessage?: string;
}

export function ExpenseList({
  expenses,
  total,
  onDelete,
  showTotal = true,
  emptyMessage = 'No expenses yet',
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p>{emptyMessage}</p>
        <p className="text-sm mt-1">Tap + to add an expense</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {expenses.map((expense) => (
        <ExpenseItem
          key={expense.id}
          expense={expense}
          onDelete={onDelete}
        />
      ))}

      {showTotal && (
        <div className="flex justify-between items-center py-3 px-4 bg-gray-900 border-t border-gray-700">
          <span className="font-medium text-gray-400">Total</span>
          <span className="font-bold text-gray-100">{formatCurrency(total)}</span>
        </div>
      )}
    </div>
  );
}
