import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useSettings } from '../../contexts/SettingsContext';
import { getTagHexColor } from '../../services/tagService';
import type { Expense, Tag } from '../../types/expense';

interface TagTotal {
  tagId: string | null;
  name: string;
  color: string;
  total: number;
}

interface BudgetIndicatorProps {
  spent: number;
  budget?: number;
  label?: string;
  expenses?: Expense[];
  tags?: Tag[];
  showTagBreakdown?: boolean;
}

export function BudgetIndicator({
  spent,
  budget: budgetProp,
  label = 'Week Budget',
  expenses = [],
  tags = [],
  showTagBreakdown = false,
}: BudgetIndicatorProps) {
  const { settings } = useSettings();
  const budget = budgetProp ?? settings.weeklyBudget;
  const [isExpanded, setIsExpanded] = useState(false);

  const percentage = Math.min((spent / budget) * 100, 100);
  const remaining = budget - spent;
  const isOver = spent > budget;

  let barColor = 'bg-green-500';
  let textColor = 'text-green-400';
  if (percentage >= 100) {
    barColor = 'bg-red-500';
    textColor = 'text-red-400';
  } else if (percentage >= 75) {
    barColor = 'bg-yellow-500';
    textColor = 'text-yellow-400';
  }

  const tagTotals = useMemo((): TagTotal[] => {
    if (!showTagBreakdown || expenses.length === 0) return [];

    const tagsMap = new Map(tags.map(t => [t.id, t]));
    const totals = new Map<string | null, number>();

    expenses.forEach(expense => {
      if (expense.tagIds && expense.tagIds.length > 0) {
        const amountPerTag = expense.amount / expense.tagIds.length;
        expense.tagIds.forEach(tagId => {
          totals.set(tagId, (totals.get(tagId) || 0) + amountPerTag);
        });
      } else {
        totals.set(null, (totals.get(null) || 0) + expense.amount);
      }
    });

    const result: TagTotal[] = [];
    totals.forEach((total, tagId) => {
      if (tagId === null) {
        result.push({
          tagId: null,
          name: 'No Tag',
          color: 'gray-500',
          total: Math.round(total),
        });
      } else {
        const tag = tagsMap.get(tagId);
        if (tag) {
          result.push({
            tagId,
            name: tag.name,
            color: tag.color,
            total: Math.round(total),
          });
        }
      }
    });

    result.sort((a, b) => b.total - a.total);
    return result;
  }, [expenses, tags, showTagBreakdown]);

  const segments = useMemo(() => {
    if (!isExpanded || tagTotals.length === 0) return [];

    const totalSpent = tagTotals.reduce((sum, t) => sum + t.total, 0);
    if (totalSpent === 0) return [];

    return tagTotals.map(tagTotal => ({
      ...tagTotal,
      widthPercent: (tagTotal.total / budget) * 100,
    }));
  }, [tagTotals, budget, isExpanded]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-200">
          {formatCurrency(spent)} / {formatCurrency(budget)}
        </span>
      </div>

      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        {isExpanded && segments.length > 0 ? (
          <div className="h-full flex">
            {segments.map((segment, index) => (
              <div
                key={segment.tagId ?? 'notag'}
                className="h-full transition-all duration-300"
                style={{
                  width: `${Math.min(segment.widthPercent, 100 - segments.slice(0, index).reduce((sum, s) => sum + Math.min(s.widthPercent, 100), 0))}%`,
                  backgroundColor: getTagHexColor(segment.color),
                }}
              />
            ))}
          </div>
        ) : (
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

      {showTagBreakdown && tags.length > 0 && (
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
            View by tag
          </button>

          {isExpanded && tagTotals.length > 0 && (
            <div className="mt-3 space-y-2">
              {tagTotals.map((tagTotal) => (
                <div
                  key={tagTotal.tagId ?? 'notag'}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getTagHexColor(tagTotal.color) }}
                    />
                    <span className="text-sm text-gray-300">{tagTotal.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-200">
                    {formatCurrency(tagTotal.total)}
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
