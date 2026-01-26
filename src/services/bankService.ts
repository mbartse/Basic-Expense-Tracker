import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Bank } from '../types/expense';

// Keep Firestore collection as 'tags' to avoid data migration
const BANKS_COLLECTION = 'tags';

// Color palette for banks (legible on dark theme)
const BANK_COLORS = [
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

/**
 * Get a random color from the palette
 */
function getRandomColor(): string {
  return BANK_COLORS[Math.floor(Math.random() * BANK_COLORS.length)];
}

/**
 * Add a new bank
 */
export async function addBank(name: string): Promise<string> {
  const bankData = {
    name: name.trim(),
    color: getRandomColor(),
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, BANKS_COLLECTION), bankData);
  return docRef.id;
}

/**
 * Delete a bank
 */
export async function deleteBank(id: string): Promise<void> {
  await deleteDoc(doc(db, BANKS_COLLECTION, id));
}

/**
 * Subscribe to all banks
 */
export function subscribeToBanks(callback: (banks: Bank[]) => void): () => void {
  return onSnapshot(collection(db, BANKS_COLLECTION), (snapshot) => {
    const banks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Bank[];
    // Sort alphabetically by name
    banks.sort((a, b) => a.name.localeCompare(b.name));
    callback(banks);
  });
}

/**
 * Get color class for bank background (with opacity)
 */
export function getBankBgClass(color: string): string {
  return `bg-${color}/20`;
}

/**
 * Get color class for bank text
 */
export function getBankTextClass(color: string): string {
  return `text-${color}`;
}

/**
 * Get color class for bank border
 */
export function getBankBorderClass(color: string): string {
  return `border-${color}`;
}

/**
 * Get hex color for progress bar segments
 */
export function getBankHexColor(color: string): string {
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
