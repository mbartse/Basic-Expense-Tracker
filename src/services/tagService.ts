import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Tag } from '../types/expense';

const TAGS_COLLECTION = 'tags';

const TAG_COLORS = [
  'teal-400',
  'purple-400',
  'pink-400',
  'orange-400',
  'cyan-400',
  'lime-400',
  'amber-400',
  'rose-400',
  'indigo-400',
  'emerald-400',
  'fuchsia-400',
  'sky-400',
];

function getRandomColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
}

export async function addTag(name: string): Promise<string> {
  const tagData = {
    name: name.trim(),
    color: getRandomColor(),
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, TAGS_COLLECTION), tagData);
  return docRef.id;
}

export async function deleteTag(id: string): Promise<void> {
  await deleteDoc(doc(db, TAGS_COLLECTION, id));
}

export function subscribeToTags(callback: (tags: Tag[]) => void): () => void {
  return onSnapshot(collection(db, TAGS_COLLECTION), (snapshot) => {
    const tags = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Tag[];
    tags.sort((a, b) => a.name.localeCompare(b.name));
    callback(tags);
  });
}

export function getTagHexColor(color: string): string {
  const colorMap: Record<string, string> = {
    'teal-400': '#2dd4bf',
    'purple-400': '#c084fc',
    'pink-400': '#f472b6',
    'orange-400': '#fb923c',
    'cyan-400': '#22d3ee',
    'lime-400': '#a3e635',
    'amber-400': '#fbbf24',
    'rose-400': '#fb7185',
    'indigo-400': '#818cf8',
    'emerald-400': '#34d399',
    'fuchsia-400': '#e879f9',
    'sky-400': '#38bdf8',
    'gray-500': '#6b7280',
  };
  return colorMap[color] || '#6b7280';
}
