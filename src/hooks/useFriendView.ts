import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFriends } from './useFriends';

export function useFriendView() {
  const [searchParams] = useSearchParams();
  const friendUid = searchParams.get('friend');
  const { friends } = useFriends();

  const friend = useMemo(() => {
    if (!friendUid) return null;
    return friends.find(f => f.uid === friendUid) || null;
  }, [friendUid, friends]);

  return {
    friendUid: friendUid || undefined,
    friendName: friend?.displayName || null,
    friendPhotoURL: friend?.photoURL || null,
    isViewingFriend: !!friendUid,
  };
}
