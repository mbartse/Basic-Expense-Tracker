import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { User } from 'firebase/auth';

export async function upsertUserProfile(user: User) {
  const ref = doc(db, 'userProfiles', user.uid);
  await setDoc(ref, {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email || 'Unknown',
    photoURL: user.photoURL || null,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
