import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Expense, ExpenseInput } from '../types/expense';
import {
  subscribeToDateExpenses,
  subscribeToWeekExpenses,
  subscribeToMonthExpenses,
  subscribeToDateRangeExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  calculateTotal,
} from '../services/expenseService';
import { getDateString, getWeekKey, getMonthKey } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for today's expenses
 */
export function useTodayExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const today = getDateString(new Date());
    const unsubscribe = subscribeToDateExpenses(user.uid, today, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const total = calculateTotal(expenses);

  return { expenses, loading, total };
}

/**
 * Hook for expenses on a specific date
 */
export function useDateExpenses(date: Date) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const dateString = useMemo(() => getDateString(date), [date.getTime()]);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToDateExpenses(user.uid, dateString, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, dateString]);

  const total = calculateTotal(expenses);

  return { expenses, loading, total };
}

/**
 * Hook for current week's expenses
 */
export function useCurrentWeekExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const weekKey = getWeekKey(new Date());
    const unsubscribe = subscribeToWeekExpenses(user.uid, weekKey, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const total = calculateTotal(expenses);

  return { expenses, loading, total };
}

/**
 * Hook for a specific week's expenses
 */
export function useWeekExpenses(weekStart: Date) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const weekKey = useMemo(() => getWeekKey(weekStart), [weekStart.getTime()]);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToWeekExpenses(user.uid, weekKey, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, weekKey]);

  const total = calculateTotal(expenses);

  // Group expenses by date
  const groupedByDate = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      const dateStr = expense.dateString;
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);
  }, [expenses]);

  return { expenses, loading, total, groupedByDate };
}

/**
 * Hook for current month's expenses
 */
export function useCurrentMonthExpenses() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const monthKey = getMonthKey(new Date());
    const unsubscribe = subscribeToMonthExpenses(user.uid, monthKey, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const total = calculateTotal(expenses);

  return { expenses, loading, total };
}

/**
 * Hook for a specific month's expenses
 */
export function useMonthExpenses(monthStart: Date) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const monthKey = useMemo(() => getMonthKey(monthStart), [monthStart.getTime()]);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToMonthExpenses(user.uid, monthKey, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [user, monthKey]);

  const total = calculateTotal(expenses);

  // Group expenses by date
  const groupedByDate = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      const dateStr = expense.dateString;
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }
      acc[dateStr].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);
  }, [expenses]);

  return { expenses, loading, total, groupedByDate };
}

/**
 * Hook for expense actions (add, delete)
 */
export function useExpenseActions() {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(async (input: ExpenseInput) => {
    if (!user) {
      throw new Error('Must be logged in to add expenses');
    }
    setIsAdding(true);
    setError(null);
    try {
      await addExpense(user.uid, input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
      throw err;
    } finally {
      setIsAdding(false);
    }
  }, [user]);

  const update = useCallback(async (id: string, input: Partial<ExpenseInput>) => {
    if (!user) {
      throw new Error('Must be logged in to update expenses');
    }
    setError(null);
    try {
      await updateExpense(user.uid, id, input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expense');
      throw err;
    }
  }, [user]);

  const remove = useCallback(async (id: string) => {
    if (!user) {
      throw new Error('Must be logged in to delete expenses');
    }
    setError(null);
    try {
      await deleteExpense(user.uid, id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      throw err;
    }
  }, [user]);

  return { add, update, remove, isAdding, error };
}

/**
 * Hook for expenses within a date range
 */
export function useDateRangeExpenses(startDate: Date, endDate: Date) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const startDateString = useMemo(() => getDateString(startDate), [startDate.getTime()]);
  const endDateString = useMemo(() => getDateString(endDate), [endDate.getTime()]);

  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToDateRangeExpenses(
      user.uid,
      startDateString,
      endDateString,
      (data) => {
        setExpenses(data);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user, startDateString, endDateString]);

  const total = calculateTotal(expenses);

  return { expenses, loading, total };
}
