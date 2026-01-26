import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Expense, ExpenseInput } from '../types/expense';
import {
  subscribeToDateExpenses,
  subscribeToWeekExpenses,
  subscribeToMonthExpenses,
  subscribeToDateRangeExpenses,
  addExpense,
  deleteExpense,
  calculateTotal,
} from '../services/expenseService';
import { getDateString, getWeekKey, getMonthKey } from '../utils/dateUtils';

/**
 * Hook for today's expenses
 */
export function useTodayExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = getDateString(new Date());
    const unsubscribe = subscribeToDateExpenses(today, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const total = calculateTotal(expenses);

  return { expenses, loading, total };
}

/**
 * Hook for expenses on a specific date
 */
export function useDateExpenses(date: Date) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const dateString = useMemo(() => getDateString(date), [date.getTime()]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToDateExpenses(dateString, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [dateString]);

  const total = calculateTotal(expenses);

  return { expenses, loading, total };
}

/**
 * Hook for current week's expenses
 */
export function useCurrentWeekExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const weekKey = getWeekKey(new Date());
    const unsubscribe = subscribeToWeekExpenses(weekKey, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const total = calculateTotal(expenses);

  return { expenses, loading, total };
}

/**
 * Hook for a specific week's expenses
 */
export function useWeekExpenses(weekStart: Date) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const weekKey = useMemo(() => getWeekKey(weekStart), [weekStart.getTime()]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToWeekExpenses(weekKey, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [weekKey]);

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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const monthKey = getMonthKey(new Date());
    const unsubscribe = subscribeToMonthExpenses(monthKey, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const total = calculateTotal(expenses);

  return { expenses, loading, total };
}

/**
 * Hook for a specific month's expenses
 */
export function useMonthExpenses(monthStart: Date) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const monthKey = useMemo(() => getMonthKey(monthStart), [monthStart.getTime()]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToMonthExpenses(monthKey, (data) => {
      setExpenses(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [monthKey]);

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
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = useCallback(async (input: ExpenseInput) => {
    setIsAdding(true);
    setError(null);
    try {
      await addExpense(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense');
      throw err;
    } finally {
      setIsAdding(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setError(null);
    try {
      await deleteExpense(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      throw err;
    }
  }, []);

  return { add, remove, isAdding, error };
}

/**
 * Hook for expenses within a date range
 */
export function useDateRangeExpenses(startDate: Date, endDate: Date) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const startDateString = useMemo(() => getDateString(startDate), [startDate.getTime()]);
  const endDateString = useMemo(() => getDateString(endDate), [endDate.getTime()]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToDateRangeExpenses(
      startDateString,
      endDateString,
      (data) => {
        setExpenses(data);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [startDateString, endDateString]);

  const total = calculateTotal(expenses);

  return { expenses, loading, total };
}
