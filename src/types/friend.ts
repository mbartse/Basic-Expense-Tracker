import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromEmail: string;
  fromDisplayName: string;
  fromPhotoURL: string | null;
  toUserId: string;
  toEmail: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Friendship {
  id: string;
  userIds: string[];
  users: Record<string, { displayName: string; email: string; photoURL: string | null }>;
  createdAt: Timestamp;
}

export interface Friend {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  friendshipId: string;
}
