import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { DAY_NAMES } from '../types/settings';
import type { UserSettings } from '../types/settings';

export function SettingsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const [weeklyBudgetDollars, setWeeklyBudgetDollars] = useState(
    (settings.weeklyBudget / 100).toFixed(2)
  );
  const [weekStartDay, setWeekStartDay] = useState<UserSettings['weekStartDay']>(
    settings.weekStartDay
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    const budgetCents = Math.round(parseFloat(weeklyBudgetDollars) * 100);
    if (isNaN(budgetCents) || budgetCents <= 0) {
      return;
    }

    setIsSaving(true);
    try {
      await updateSettings({
        weeklyBudget: budgetCents,
        weekStartDay,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const currentBudgetCents = Math.round(parseFloat(weeklyBudgetDollars) * 100) || 0;
  const hasChanges =
    currentBudgetCents !== settings.weeklyBudget ||
    weekStartDay !== settings.weekStartDay;

  return (
    <div className="min-h-screen bg-gray-900 pt-14 pb-8">
      <div className="sticky top-14 bg-gray-900 border-b border-gray-700 z-40">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-100">Settings</h1>
        </div>
      </div>

      <main className="p-4 space-y-6">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Weekly Budget
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={weeklyBudgetDollars}
              onChange={(e) => setWeeklyBudgetDollars(e.target.value)}
              className="w-full pl-7 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="250.00"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Your target spending limit per week
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Week Starts On
          </label>
          <select
            value={weekStartDay}
            onChange={(e) =>
              setWeekStartDay(
                parseInt(e.target.value) as UserSettings['weekStartDay']
              )
            }
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {DAY_NAMES.map((day, index) => (
              <option key={day} value={index}>
                {day}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-gray-500">
            Choose which day your week begins
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
            hasChanges
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {showSuccess ? (
            <>
              <Check className="w-5 h-5" />
              Saved
            </>
          ) : isSaving ? (
            'Saving...'
          ) : (
            'Save Changes'
          )}
        </button>
      </main>
    </div>
  );
}
