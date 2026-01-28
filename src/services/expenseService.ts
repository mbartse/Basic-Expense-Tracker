import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Expense, ExpenseInput } from '../types/expense';
import { getDateString, getWeekKey, getMonthKey } from '../utils/dateUtils';

function getUserExpensesCollection(userId: string) {
  return collection(db, 'users', userId, 'expenses');
}

function mapDocToExpense(doc: { id: string; data: () => Record<string, unknown> }): Expense {
  const data = doc.data();
  return {
    id: doc.id,
    amount: data.amount as number,
    name: data.name as string,
    date: data.date as import('firebase/firestore').Timestamp,
    dateString: data.dateString as string,
    weekKey: data.weekKey as string,
    monthKey: data.monthKey as string,
    createdAt: data.createdAt as import('firebase/firestore').Timestamp,
    tagIds: data.tagIds as string[] | undefined,
  };
}

/**
 * Add a new expense
 */
export async function addExpense(userId: string, input: ExpenseInput): Promise<string> {
  const date = input.date || new Date();
  const now = Timestamp.now();

  const expenseData: Record<string, unknown> = {
    amount: input.amount,
    name: input.name.trim(),
    date: Timestamp.fromDate(date),
    dateString: getDateString(date),
    weekKey: getWeekKey(date),
    monthKey: getMonthKey(date),
    createdAt: now,
  };

  if (input.tagIds && input.tagIds.length > 0) {
    expenseData.tagIds = input.tagIds;
  }

  const docRef = await addDoc(getUserExpensesCollection(userId), expenseData);
  return docRef.id;
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  userId: string,
  id: string,
  input: Partial<ExpenseInput>
): Promise<void> {
  const docRef = doc(db, 'users', userId, 'expenses', id);
  const updates: Record<string, unknown> = {};

  if (input.amount !== undefined) {
    updates.amount = input.amount;
  }
  if (input.name !== undefined) {
    updates.name = input.name.trim();
  }
  if (input.date !== undefined) {
    updates.date = Timestamp.fromDate(input.date);
    updates.dateString = getDateString(input.date);
    updates.weekKey = getWeekKey(input.date);
    updates.monthKey = getMonthKey(input.date);
  }
  if (input.tagIds !== undefined) {
    updates.tagIds = input.tagIds.length > 0 ? input.tagIds : [];
  }

  await updateDoc(docRef, updates);
}

/**
 * Delete an expense
 */
export async function deleteExpense(userId: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'expenses', id));
}

/**
 * Subscribe to expenses for a specific date
 */
export function subscribeToDateExpenses(
  userId: string,
  dateString: string,
  callback: (expenses: Expense[]) => void
): () => void {
  const q = query(
    getUserExpensesCollection(userId),
    where('dateString', '==', dateString)
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(mapDocToExpense);
    // Sort client-side to avoid composite index requirement
    expenses.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    callback(expenses);
  });
}

/**
 * Subscribe to expenses for a specific week
 */
export function subscribeToWeekExpenses(
  userId: string,
  weekKey: string,
  callback: (expenses: Expense[]) => void
): () => void {
  const q = query(
    getUserExpensesCollection(userId),
    where('weekKey', '==', weekKey)
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(mapDocToExpense);
    // Sort client-side
    expenses.sort((a, b) => {
      if (a.dateString !== b.dateString) {
        return a.dateString.localeCompare(b.dateString);
      }
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
    callback(expenses);
  });
}

/**
 * Subscribe to expenses for a specific month
 */
export function subscribeToMonthExpenses(
  userId: string,
  monthKey: string,
  callback: (expenses: Expense[]) => void
): () => void {
  const q = query(
    getUserExpensesCollection(userId),
    where('monthKey', '==', monthKey)
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(mapDocToExpense);
    // Sort client-side
    expenses.sort((a, b) => {
      if (a.dateString !== b.dateString) {
        return a.dateString.localeCompare(b.dateString);
      }
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
    callback(expenses);
  });
}

/**
 * Subscribe to expenses within a date range
 */
export function subscribeToDateRangeExpenses(
  userId: string,
  startDateString: string,
  endDateString: string,
  callback: (expenses: Expense[]) => void
): () => void {
  const q = query(
    getUserExpensesCollection(userId),
    where('dateString', '>=', startDateString),
    where('dateString', '<=', endDateString)
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map(mapDocToExpense);
    // Sort client-side
    expenses.sort((a, b) => {
      if (a.dateString !== b.dateString) {
        return a.dateString.localeCompare(b.dateString);
      }
      return b.createdAt.toMillis() - a.createdAt.toMillis();
    });
    callback(expenses);
  });
}

/**
 * Calculate total from expenses (in cents)
 */
export function calculateTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}
