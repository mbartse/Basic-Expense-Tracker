import { formatCurrency } from '../../utils/formatters';

interface MonthSummaryProps {
  total: number;
  compact?: boolean;
}

export function MonthSummary({ total, compact = false }: MonthSummaryProps) {
  if (compact) {
    return (
      <div className="flex justify-between items-center py-2">
        <span className="text-sm text-gray-400">This Month</span>
        <span className="font-medium text-gray-100">{formatCurrency(total)}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-center">
        <span className="text-gray-400">Month Total</span>
        <span className="text-2xl font-bold text-gray-100">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
