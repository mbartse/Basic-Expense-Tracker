import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { WEEKLY_BUDGET } from '../../constants/config';
import { getBankHexColor } from '../../services/bankService';
import type { Expense, Bank } from '../../types/expense';

interface BankTotal {
  bankId: string | null; // null for no bank
  name: string;
  color: string;
  total: number;
}

interface BudgetIndicatorProps {
  spent: number; // in cents
  budget?: number; // in cents, defaults to weekly budget
  label?: string;
  expenses?: Expense[];
  banks?: Bank[];
  showBankBreakdown?: boolean;
}

export function BudgetIndicator({
  spent,
  budget = WEEKLY_BUDGET,
  label = 'Week Budget',
  expenses = [],
  banks = [],
  showBankBreakdown = false,
}: BudgetIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  // Calculate bank totals
  const bankTotals = useMemo((): BankTotal[] => {
    if (!showBankBreakdown || expenses.length === 0) return [];

    const banksMap = new Map(banks.map(b => [b.id, b]));
    const totals = new Map<string | null, number>();

    expenses.forEach(expense => {
      if (expense.bankIds && expense.bankIds.length > 0) {
        // Split amount equally among banks if multiple
        const amountPerBank = expense.amount / expense.bankIds.length;
        expense.bankIds.forEach(bankId => {
          totals.set(bankId, (totals.get(bankId) || 0) + amountPerBank);
        });
      } else {
        // No bank
        totals.set(null, (totals.get(null) || 0) + expense.amount);
      }
    });

    const result: BankTotal[] = [];
    totals.forEach((total, bankId) => {
      if (bankId === null) {
        result.push({
          bankId: null,
          name: 'No Bank',
          color: 'gray-500',
          total: Math.round(total),
        });
      } else {
        const bank = banksMap.get(bankId);
        if (bank) {
          result.push({
            bankId,
            name: bank.name,
            color: bank.color,
            total: Math.round(total),
          });
        }
      }
    });

    // Sort by total descending
    result.sort((a, b) => b.total - a.total);
    return result;
  }, [expenses, banks, showBankBreakdown]);

  // Calculate segment widths for multi-color bar
  const segments = useMemo(() => {
    if (!isExpanded || bankTotals.length === 0) return [];

    const totalSpent = bankTotals.reduce((sum, b) => sum + b.total, 0);
    if (totalSpent === 0) return [];

    return bankTotals.map(bankTotal => ({
      ...bankTotal,
      widthPercent: (bankTotal.total / budget) * 100,
    }));
  }, [bankTotals, budget, isExpanded]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-200">
          {formatCurrency(spent)} / {formatCurrency(budget)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        {isExpanded && segments.length > 0 ? (
          // Multi-segment bar
          <div className="h-full flex">
            {segments.map((segment, index) => (
              <div
                key={segment.bankId ?? 'nobank'}
                className="h-full transition-all duration-300"
                style={{
                  width: `${Math.min(segment.widthPercent, 100 - segments.slice(0, index).reduce((sum, s) => sum + Math.min(s.widthPercent, 100), 0))}%`,
                  backgroundColor: getBankHexColor(segment.color),
                }}
              />
            ))}
          </div>
        ) : (
          // Single color bar
          <div
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>

      <div className={`mt-2 text-sm font-medium ${textColor}`}>
        {isOver ? (
          <span>Over by {formatCurrency(Math.abs(remaining))}</span>
        ) : (
          <span>{formatCurrency(remaining)} remaining</span>
        )}
      </div>

      {/* Bank Breakdown Disclosure */}
      {showBankBreakdown && banks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            View by bank
          </button>

          {isExpanded && bankTotals.length > 0 && (
            <div className="mt-3 space-y-2">
              {bankTotals.map((bankTotal) => (
                <div
                  key={bankTotal.bankId ?? 'nobank'}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getBankHexColor(bankTotal.color) }}
                    />
                    <span className="text-sm text-gray-300">{bankTotal.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-200">
                    {formatCurrency(bankTotal.total)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
