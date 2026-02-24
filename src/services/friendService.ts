import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { FriendRequest, Friendship, UserProfile } from '../types/friend';

export function getFriendshipId(uid1: string, uid2: string): string {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

export async function lookupUserByEmail(email: string): Promise<UserProfile | null> {
  const q = query(
    collection(db, 'userProfiles'),
    where('email', '==', email.toLowerCase())
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as UserProfile;
}

export async function sendFriendRequest(
  fromUser: { uid: string; email: string; displayName: string; photoURL: string | null },
  toUser: { uid: string; email: string }
) {
  // Check for existing pending request in either direction
  const q1 = query(
    collection(db, 'friendRequests'),
    where('fromUserId', '==', fromUser.uid),
    where('toUserId', '==', toUser.uid),
    where('status', '==', 'pending')
  );
  const q2 = query(
    collection(db, 'friendRequests'),
    where('fromUserId', '==', toUser.uid),
    where('toUserId', '==', fromUser.uid),
    where('status', '==', 'pending')
  );

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  if (!snap1.empty || !snap2.empty) {
    throw new Error('A friend request already exists between you and this user');
  }

  // Check if already friends
  const existingFriendship = await getDocs(
    query(collection(db, 'friendships'), where('userIds', 'array-contains', fromUser.uid))
  );
  const alreadyFriends = existingFriendship.docs.some(
    d => (d.data() as Friendship).userIds.includes(toUser.uid)
  );
  if (alreadyFriends) {
    throw new Error('You are already friends with this user');
  }

  const requestRef = doc(collection(db, 'friendRequests'));
  await setDoc(requestRef, {
    fromUserId: fromUser.uid,
    fromEmail: fromUser.email,
    fromDisplayName: fromUser.displayName,
    fromPhotoURL: fromUser.photoURL || null,
    toUserId: toUser.uid,
    toEmail: toUser.email,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function acceptFriendRequest(
  request: FriendRequest,
  currentUser: { uid: string; email: string; displayName: string; photoURL: string | null }
) {
  const batch = writeBatch(db);

  // Update request status
  const requestRef = doc(db, 'friendRequests', request.id);
  batch.update(requestRef, {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  });

  // Create friendship doc with deterministic ID
  const friendshipId = getFriendshipId(request.fromUserId, currentUser.uid);
  const friendshipRef = doc(db, 'friendships', friendshipId);
  batch.set(friendshipRef, {
    userIds: [request.fromUserId, currentUser.uid],
    users: {
      [request.fromUserId]: {
        displayName: request.fromDisplayName,
        email: request.fromEmail,
        photoURL: request.fromPhotoURL || null,
      },
      [currentUser.uid]: {
        displayName: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL || null,
      },
    },
    createdAt: serverTimestamp(),
  });

  await batch.commit();
}

export async function declineFriendRequest(requestId: string) {
  const requestRef = doc(db, 'friendRequests', requestId);
  await setDoc(requestRef, {
    status: 'declined',
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function removeFriend(friendshipId: string) {
  await deleteDoc(doc(db, 'friendships', friendshipId));
}

export function subscribeToIncomingRequests(
  userId: string,
  callback: (requests: FriendRequest[]) => void
) {
  const q = query(
    collection(db, 'friendRequests'),
    where('toUserId', '==', userId),
    where('status', '==', 'pending')
  );
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as FriendRequest[];
    callback(requests);
  });
}

export function subscribeToOutgoingRequests(
  userId: string,
  callback: (requests: FriendRequest[]) => void
) {
  const q = query(
    collection(db, 'friendRequests'),
    where('fromUserId', '==', userId),
    where('status', '==', 'pending')
  );
  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as FriendRequest[];
    callback(requests);
  });
}

export function subscribeToFriendships(
  userId: string,
  callback: (friendships: Friendship[]) => void
) {
  const q = query(
    collection(db, 'friendships'),
    where('userIds', 'array-contains', userId)
  );
  return onSnapshot(q, (snapshot) => {
    const friendships = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data(),
    })) as Friendship[];
    callback(friendships);
  });
}
