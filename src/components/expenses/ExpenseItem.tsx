import { Trash2 } from 'lucide-react';
import type { Expense, Bank } from '../../types/expense';
import { formatCurrency, formatTime, formatDateShort } from '../../utils/formatters';
import { getBankHexColor } from '../../services/bankService';

interface ExpenseItemProps {
  expense: Expense;
  onDelete?: (id: string) => void;
  showTime?: boolean;
  showDate?: boolean;
  showBanks?: boolean;
  banks?: Bank[];
  compact?: boolean;
}

export function ExpenseItem({
  expense,
  onDelete,
  showTime = true,
  showDate = false,
  showBanks = false,
  banks = [],
  compact = false,
}: ExpenseItemProps) {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(expense.id);
    }
  };

  // Get bank objects for this expense
  const expenseBanks = showBanks && expense.bankIds
    ? banks.filter(b => expense.bankIds?.includes(b.id))
    : [];

  if (compact) {
    return (
      <div className="py-1 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-300 truncate flex-1">{expense.name}</span>
          <span className="font-medium text-gray-200 ml-2">{formatCurrency(expense.amount)}</span>
        </div>
        {expenseBanks.length > 0 && (
          <div className="flex gap-1 mt-0.5">
            {expenseBanks.map(bank => (
              <span
                key={bank.id}
                className="text-[10px] px-1 py-0.5 rounded"
                style={{
                  backgroundColor: `${getBankHexColor(bank.color)}20`,
                  color: getBankHexColor(bank.color),
                }}
              >
                {bank.name}
              </span>
            ))}
          </div>
        )}
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
        <div className="flex items-center gap-2 mt-0.5">
          {(showTime || showDate) && expense.date && (
            <span className="text-xs text-gray-500">
              {showDate ? formatDateShort(expense.date.toDate()) : formatTime(expense.date.toDate())}
            </span>
          )}
          {expenseBanks.length > 0 && (
            <div className="flex gap-1">
              {expenseBanks.map(bank => (
                <span
                  key={bank.id}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${getBankHexColor(bank.color)}20`,
                    color: getBankHexColor(bank.color),
                  }}
                >
                  {bank.name}
                </span>
              ))}
            </div>
          )}
        </div>
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
