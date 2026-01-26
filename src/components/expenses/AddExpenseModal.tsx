import { useState, useRef, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import type { ExpenseInput } from '../../types/expense';
import { parseToCents } from '../../utils/formatters';
import { useTags } from '../../hooks/useTags';
import { getTagHexColor } from '../../services/tagService';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expense: ExpenseInput) => Promise<void>;
}

export function AddExpenseModal({ isOpen, onClose, onSubmit }: AddExpenseModalProps) {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const amountInputRef = useRef<HTMLInputElement>(null);
  const newTagInputRef = useRef<HTMLInputElement>(null);

  const { tags, addTag } = useTags();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setName('');
      setError('');
      setSelectedTagIds([]);
      setIsAddingTag(false);
      setNewTagName('');
      // Focus amount input after a short delay for animation
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Focus new tag input when adding
  useEffect(() => {
    if (isAddingTag) {
      setTimeout(() => {
        newTagInputRef.current?.focus();
      }, 50);
    }
  }, [isAddingTag]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      const newTagId = await addTag(newTagName.trim());
      setSelectedTagIds(prev => [...prev, newTagId]);
      setNewTagName('');
      setIsAddingTag(false);
    } catch (err) {
      console.error('Failed to create tag:', err);
      setError('Failed to create tag. Check Firestore rules.');
      setIsAddingTag(false);
      setNewTagName('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cents = parseToCents(amount);
    if (cents <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!name.trim()) {
      setError('Please enter an expense name');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: cents,
        name: name.trim(),
        tagIds: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });
      onClose();
    } catch {
      setError('Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-800 rounded-t-2xl p-6 pb-safe animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Add Expense</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                $
              </span>
              <input
                ref={amountInputRef}
                type="text"
                id="amount"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 text-lg bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Name Input */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Coffee, groceries, etc."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Tags Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                const hexColor = getTagHexColor(tag.color);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-offset-gray-800'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: `${hexColor}20`,
                      color: hexColor,
                      borderColor: hexColor,
                      ...(isSelected ? { ringColor: hexColor } : {}),
                    }}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {tag.name}
                  </button>
                );
              })}

              {/* Add Tag Button / Input */}
              {isAddingTag ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={newTagInputRef}
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      } else if (e.key === 'Escape') {
                        setIsAddingTag(false);
                        setNewTagName('');
                      }
                    }}
                    placeholder="Tag name"
                    className="w-24 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!newTagName.trim()}
                    className="px-2 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:text-gray-400"
                  >
                    Add
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddingTag(true)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-800 disabled:text-gray-400 transition-colors"
          >
            {isSubmitting ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
