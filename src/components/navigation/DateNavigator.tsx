import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateNavigatorProps {
  label: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export function DateNavigator({
  label,
  onPrevious,
  onNext,
  onToday,
}: DateNavigatorProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
      <button
        onClick={onPrevious}
        className="p-2 rounded-full hover:bg-gray-700 active:bg-gray-600 transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="w-6 h-6 text-gray-300" />
      </button>

      <button
        onClick={onToday}
        className="text-lg font-medium text-gray-100 hover:text-blue-400 transition-colors"
      >
        {label}
      </button>

      <button
        onClick={onNext}
        className="p-2 rounded-full hover:bg-gray-700 active:bg-gray-600 transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="w-6 h-6 text-gray-300" />
      </button>
    </div>
  );
}
