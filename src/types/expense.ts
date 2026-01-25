import { Timestamp } from 'firebase/firestore';

export interface Expense {
  id: string;
  amount: number;        // Amount in cents (e.g., $25.50 = 2550)
  name: string;          // Expense description
  date: Timestamp;       // Firestore Timestamp
  dateString: string;    // "YYYY-MM-DD" for querying
  weekKey: string;       // "YYYY-Www" (ISO week format)
  monthKey: string;      // "YYYY-MM" for month queries
  createdAt: Timestamp;
}

export interface ExpenseInput {
  amount: number;        // Amount in cents
  name: string;
  date?: Date;           // Defaults to today
}

export interface DayExpenses {
  date: Date;
  dateString: string;
  expenses: Expense[];
  total: number;
}

export interface WeekData {
  weekKey: string;
  startDate: Date;
  endDate: Date;
  days: DayExpenses[];
  total: number;
}

export interface MonthData {
  monthKey: string;
  startDate: Date;
  endDate: Date;
  weeks: WeekData[];
  total: number;
}
