import { formatCurrency } from '../../utils/formatters';

interface DaySummaryProps {
  total: number;
  label?: string;
}

export function DaySummary({ total, label = "Today's Total" }: DaySummaryProps) {
  return (
    <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
      <span className="text-gray-600">{label}</span>
      <span className="text-xl font-bold text-gray-900">{formatCurrency(total)}</span>
    </div>
  );
}
