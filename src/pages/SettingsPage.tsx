import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Pencil, Trash2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useTags } from '../hooks/useTags';
import { DAY_NAMES } from '../types/settings';
import { TAG_COLORS, getTagHexColor } from '../services/tagService';
import type { UserSettings } from '../types/settings';

export function SettingsPage() {
  const navigate = useNavigate();
  const { settings, updateSettings } = useSettings();
  const { tags, updateTag, deleteTag } = useTags();
  const [weeklyBudgetDollars, setWeeklyBudgetDollars] = useState(
    (settings.weeklyBudget / 100).toFixed(2)
  );
  const [weekStartDay, setWeekStartDay] = useState<UserSettings['weekStartDay']>(
    settings.weekStartDay
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Tag editing state
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagName, setEditingTagName] = useState('');
  const [editingTagColor, setEditingTagColor] = useState('');
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

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

  const startEditingTag = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId);
    if (tag) {
      setEditingTagId(tagId);
      setEditingTagName(tag.name);
      setEditingTagColor(tag.color);
    }
  };

  const cancelEditingTag = () => {
    setEditingTagId(null);
    setEditingTagName('');
    setEditingTagColor('');
  };

  const saveTagChanges = async () => {
    if (!editingTagId || !editingTagName.trim()) return;

    try {
      await updateTag(editingTagId, {
        name: editingTagName.trim(),
        color: editingTagColor,
      });
      cancelEditingTag();
    } catch (err) {
      console.error('Failed to update tag:', err);
    }
  };

  const confirmDeleteTag = async () => {
    if (!deletingTagId) return;

    try {
      await deleteTag(deletingTagId);
      setDeletingTagId(null);
    } catch (err) {
      console.error('Failed to delete tag:', err);
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

        {/* Manage Tags Section */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h2 className="text-sm font-medium text-gray-300 mb-3">Manage Tags</h2>

          {tags.length === 0 ? (
            <p className="text-gray-500 text-sm">No tags yet. Create tags when adding expenses.</p>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => {
                const isEditing = editingTagId === tag.id;
                const isDeleting = deletingTagId === tag.id;
                const hexColor = getTagHexColor(tag.color);

                if (isDeleting) {
                  return (
                    <div
                      key={tag.id}
                      className="flex items-center justify-between p-3 bg-red-900/20 border border-red-800 rounded-lg"
                    >
                      <span className="text-sm text-gray-300">Delete "{tag.name}"?</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDeletingTagId(null)}
                          className="px-3 py-1 text-sm text-gray-400 hover:text-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmDeleteTag}
                          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                }

                if (isEditing) {
                  return (
                    <div
                      key={tag.id}
                      className="p-3 bg-gray-700 border border-gray-600 rounded-lg space-y-3"
                    >
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Name</label>
                        <input
                          type="text"
                          value={editingTagName}
                          onChange={(e) => setEditingTagName(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Color</label>
                        <div className="flex flex-wrap gap-2">
                          {TAG_COLORS.map((color) => {
                            const colorHex = getTagHexColor(color);
                            const isSelected = editingTagColor === color;
                            return (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setEditingTagColor(color)}
                                className={`w-8 h-8 rounded-full transition-all ${
                                  isSelected ? 'ring-2 ring-offset-2 ring-offset-gray-700 ring-white' : ''
                                }`}
                                style={{ backgroundColor: colorHex }}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          onClick={cancelEditingTag}
                          className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveTagChanges}
                          disabled={!editingTagName.trim()}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: hexColor }}
                      />
                      <span className="text-sm text-gray-200">{tag.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditingTag(tag.id)}
                        className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
                        title="Edit tag"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingTagId(tag.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete tag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
