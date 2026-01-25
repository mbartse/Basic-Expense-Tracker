import { Plus } from 'lucide-react';

interface AddExpenseButtonProps {
  onClick: () => void;
}

export function AddExpenseButton({ onClick }: AddExpenseButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed right-4 bottom-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center z-40"
      aria-label="Add expense"
    >
      <Plus className="w-8 h-8" />
    </button>
  );
}
