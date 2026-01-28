import { Trash2 } from 'lucide-react';
import type { Expense, Tag } from '../../types/expense';
import { formatCurrency, formatTime, formatDateShort } from '../../utils/formatters';
import { getTagHexColor } from '../../services/tagService';

interface ExpenseItemProps {
  expense: Expense;
  onDelete?: (id: string) => void;
  onEdit?: (expense: Expense) => void;
  showTime?: boolean;
  showDate?: boolean;
  showTags?: boolean;
  tags?: Tag[];
  compact?: boolean;
}

export function ExpenseItem({
  expense,
  onDelete,
  onEdit,
  showTime = true,
  showDate = false,
  showTags = false,
  tags = [],
  compact = false,
}: ExpenseItemProps) {
  const handleDelete = () => {
    if (onDelete) {
      onDelete(expense.id);
    }
  };

  const expenseTags = showTags && expense.tagIds
    ? tags.filter(t => expense.tagIds?.includes(t.id))
    : [];

  if (compact) {
    return (
      <div
        className={`py-1 text-sm${onEdit ? ' cursor-pointer hover:bg-gray-700/50 rounded' : ''}`}
        onClick={onEdit ? () => onEdit(expense) : undefined}
      >
        <div className="flex justify-between items-center">
          <span className="text-gray-300 truncate flex-1">{expense.name}</span>
          <span className="font-medium text-gray-200 ml-2">{formatCurrency(expense.amount)}</span>
        </div>
        {expenseTags.length > 0 && (
          <div className="flex gap-1 mt-0.5">
            {expenseTags.map(tag => (
              <span
                key={tag.id}
                className="text-[10px] px-1 py-0.5 rounded"
                style={{
                  backgroundColor: `${getTagHexColor(tag.color)}20`,
                  color: getTagHexColor(tag.color),
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-between py-3 px-4 bg-gray-800 border-b border-gray-700 last:border-b-0${onEdit ? ' cursor-pointer hover:bg-gray-700/50' : ''}`}
      onClick={onEdit ? () => onEdit(expense) : undefined}
    >
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
          {expenseTags.length > 0 && (
            <div className="flex gap-1">
              {expenseTags.map(tag => (
                <span
                  key={tag.id}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${getTagHexColor(tag.color)}20`,
                    color: getTagHexColor(tag.color),
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {onDelete && (
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(); }}
          className="p-2 text-gray-500 hover:text-red-400 transition-colors ml-2"
          aria-label="Delete expense"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
