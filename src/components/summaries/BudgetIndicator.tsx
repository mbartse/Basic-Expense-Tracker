import { formatCurrency } from '../../utils/formatters';
import { WEEKLY_BUDGET } from '../../constants/config';

interface BudgetIndicatorProps {
  spent: number; // in cents
  budget?: number; // in cents, defaults to weekly budget
  label?: string;
}

export function BudgetIndicator({
  spent,
  budget = WEEKLY_BUDGET,
  label = 'Week Budget',
}: BudgetIndicatorProps) {
  const percentage = Math.min((spent / budget) * 100, 100);
  const remaining = budget - spent;
  const isOver = spent > budget;

  // Color based on percentage
  let barColor = 'bg-green-500';
  let textColor = 'text-green-400';
  if (percentage >= 100) {
    barColor = 'bg-red-500';
    textColor = 'text-red-400';
  } else if (percentage >= 75) {
    barColor = 'bg-yellow-500';
    textColor = 'text-yellow-400';
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-200">
          {formatCurrency(spent)} / {formatCurrency(budget)}
        </span>
      </div>

      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className={`mt-2 text-sm font-medium ${textColor}`}>
        {isOver ? (
          <span>Over by {formatCurrency(Math.abs(remaining))}</span>
        ) : (
          <span>{formatCurrency(remaining)} remaining</span>
        )}
      </div>
    </div>
  );
}
