import { Trash2 } from 'lucide-react';
import type { Expense } from '../../types/expense';
import { formatCurrency, formatTime } from '../../utils/formatters';

interface ExpenseItemProps {
  expense: Expense;
  onDelete?: (id: string) => void;
  showTime?: boolean;
  compact?: boolean;
}

export function ExpenseItem({
  expense,
  onDelete,
  showTime = true,
  compact = false,
}: ExpenseItemProps) {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(expense.id);
    }
  };

  if (compact) {
    return (
      <div className="flex justify-between items-center py-1 text-sm">
        <span className="text-gray-300 truncate flex-1">{expense.name}</span>
        <span className="font-medium text-gray-200 ml-2">{formatCurrency(expense.amount)}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-800 border-b border-gray-700 last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-100">
            {formatCurrency(expense.amount)}
          </span>
          <span className="text-gray-300 truncate">{expense.name}</span>
        </div>
        {showTime && expense.createdAt && (
          <span className="text-xs text-gray-500 mt-0.5 block">
            {formatTime(expense.createdAt.toDate())}
          </span>
        )}
      </div>

      {onDelete && (
        <button
          onClick={handleDelete}
          className="p-2 text-gray-500 hover:text-red-400 transition-colors ml-2"
          aria-label="Delete expense"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
