import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FriendExpenseBannerProps {
  friendName: string;
  friendPhotoURL?: string | null;
}

export function FriendExpenseBanner({ friendName, friendPhotoURL }: FriendExpenseBannerProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-blue-900/50 border-b border-blue-700 px-4 py-2 flex items-center gap-3">
      <button
        onClick={() => navigate('/friends')}
        className="text-blue-300 hover:text-blue-100 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      {friendPhotoURL && (
        <img
          src={friendPhotoURL}
          alt=""
          className="w-6 h-6 rounded-full"
        />
      )}
      <span className="text-blue-200 text-sm">
        Viewing <span className="font-medium text-blue-100">{friendName}</span>'s expenses
      </span>
    </div>
  );
}
