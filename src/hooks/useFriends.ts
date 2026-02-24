import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  lookupUserByEmail,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend as removeFriendService,
  subscribeToIncomingRequests,
  subscribeToOutgoingRequests,
  subscribeToFriendships,
} from '../services/friendService';
import type { FriendRequest, Friendship, Friend } from '../types/friend';

export function useFriends() {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIncomingRequests([]);
      setOutgoingRequests([]);
      setFriendships([]);
      setLoading(false);
      return;
    }

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount >= 3) setLoading(false);
    };

    const unsub1 = subscribeToIncomingRequests(user.uid, (data) => {
      setIncomingRequests(data);
      checkLoaded();
    });
    const unsub2 = subscribeToOutgoingRequests(user.uid, (data) => {
      setOutgoingRequests(data);
      checkLoaded();
    });
    const unsub3 = subscribeToFriendships(user.uid, (data) => {
      setFriendships(data);
      checkLoaded();
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [user]);

  const friends: Friend[] = useMemo(() => {
    if (!user) return [];
    return friendships.map((f) => {
      const friendUid = f.userIds.find((id) => id !== user.uid)!;
      const friendData = f.users[friendUid];
      return {
        uid: friendUid,
        displayName: friendData?.displayName || 'Unknown',
        email: friendData?.email || '',
        photoURL: friendData?.photoURL || null,
        friendshipId: f.id,
      };
    });
  }, [friendships, user]);

  const sendRequest = useCallback(async (email: string) => {
    if (!user) throw new Error('Must be logged in');
    if (email.toLowerCase() === user.email?.toLowerCase()) {
      throw new Error("You can't add yourself as a friend");
    }

    const targetUser = await lookupUserByEmail(email);
    if (!targetUser) {
      throw new Error('No user found with that email. They need to sign in to the app first.');
    }

    await sendFriendRequest(
      {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email || 'Unknown',
        photoURL: user.photoURL || null,
      },
      { uid: targetUser.uid, email: targetUser.email }
    );
  }, [user]);

  const acceptRequest = useCallback(async (request: FriendRequest) => {
    if (!user) throw new Error('Must be logged in');
    await acceptFriendRequest(request, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email || 'Unknown',
      photoURL: user.photoURL || null,
    });
  }, [user]);

  const declineRequest = useCallback(async (requestId: string) => {
    await declineFriendRequest(requestId);
  }, []);

  const removeFriend = useCallback(async (friendshipId: string) => {
    await removeFriendService(friendshipId);
  }, []);

  return {
    friends,
    incomingRequests,
    outgoingRequests,
    loading,
    sendRequest,
    acceptRequest,
    declineRequest,
    removeFriend,
  };
}
