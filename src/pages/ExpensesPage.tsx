import { useSearchParams } from 'react-router-dom';
import { FriendExpenseBanner } from '../components/friends/FriendExpenseBanner';
import { useFriendView } from '../hooks/useFriendView';
import { DailyView } from './DailyView';
import { WeeklyView } from './WeeklyView';
import { MonthlyView } from './MonthlyView';
import { TransactionsView } from './TransactionsView';

const subTabs = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'all', label: 'All' },
] as const;

type ViewKey = (typeof subTabs)[number]['key'];

export function ExpensesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { friendUid, friendName, friendPhotoURL, isViewingFriend } = useFriendView();

  const currentView = (searchParams.get('view') as ViewKey) || 'daily';

  const handleTabSwitch = (view: ViewKey) => {
    const params = new URLSearchParams(searchParams);
    if (view === 'daily') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gray-900 pt-14 pb-8">
      {isViewingFriend && friendName && (
        <FriendExpenseBanner friendName={friendName} friendPhotoURL={friendPhotoURL} />
      )}

      <div className="flex border-b border-gray-700 bg-gray-800">
        {subTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleTabSwitch(key)}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              currentView === key
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {currentView === 'daily' && <DailyView friendUid={friendUid} isViewingFriend={isViewingFriend} />}
      {currentView === 'weekly' && <WeeklyView friendUid={friendUid} isViewingFriend={isViewingFriend} />}
      {currentView === 'monthly' && <MonthlyView friendUid={friendUid} isViewingFriend={isViewingFriend} />}
      {currentView === 'all' && <TransactionsView friendUid={friendUid} isViewingFriend={isViewingFriend} />}
    </div>
  );
}
