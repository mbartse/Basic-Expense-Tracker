import { formatCurrency } from '../../utils/formatters';

interface WeekSummaryProps {
  total: number;
  compact?: boolean;
}

export function WeekSummary({ total, compact = false }: WeekSummaryProps) {
  if (compact) {
    return (
      <div className="flex justify-between items-center py-2">
        <span className="text-sm text-gray-400">This Week</span>
        <span className="font-medium text-gray-100">{formatCurrency(total)}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Week Total</span>
        <span className="text-2xl font-bold text-gray-100">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
