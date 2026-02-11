import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useExpenseActions } from '../hooks/useExpenses';
import { useTags } from '../hooks/useTags';
import { useAuth } from '../contexts/AuthContext';

export function QuickAddPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { add } = useExpenseActions();
  const { tags, loading: tagsLoading } = useTags();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const amount = searchParams.get('amount');
  const name = searchParams.get('name');
  const tagName = searchParams.get('tag');

  useEffect(() => {
    if (authLoading || tagsLoading) return;

    if (!user) {
      setStatus('error');
      setMessage('Please sign in first');
      return;
    }

    if (!amount || !name) {
      setStatus('error');
      setMessage('Missing required parameters: amount and name');
      return;
    }

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      setStatus('error');
      setMessage('Invalid amount');
      return;
    }

    // Find tag by name if provided
    let tagIds: string[] | undefined;
    if (tagName) {
      const matchingTag = tags.find(
        (t) => t.name.toLowerCase() === tagName.toLowerCase()
      );
      if (matchingTag) {
        tagIds = [matchingTag.id];
      }
    }

    // Create the expense
    add({
      amount: amountCents,
      name: name,
      tagIds,
    })
      .then(() => {
        setStatus('success');
        setMessage(`Added: ${name} - $${amount}`);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Failed to add expense');
      });
  }, [user, authLoading, tagsLoading, amount, name, tagName, tags, add]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-sm w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Adding expense...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-green-400 font-medium mb-4">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Go to app
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-red-400 font-medium mb-4">{message}</p>
            <button
              onClick={() => navigate('/')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Go to app
            </button>
          </>
        )}
      </div>
    </div>
  );
}
