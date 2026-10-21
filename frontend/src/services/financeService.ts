import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore'
import { firestore } from '../firebase'
import type { TransactionFilters } from '../stores/transactionStore'
import type { Transaction } from '../stores/transactionStore'
import type { Budget, BudgetStatusItem } from '../stores/budgetStore'

export type TransactionData = Pick<
  Transaction,
  'description' | 'amount' | 'type' | 'category' | 'date'
>

function userCollection(uid: string, name: 'transactions' | 'budgets') {
  return collection(firestore, 'users', uid, name)
}

function toTransaction(id: string, data: Record<string, unknown>, uid: string): Transaction {
  const createdAt = data.created_at
  return {
    id,
    user_id: uid,
    description: String(data.description ?? ''),
    amount: Number(data.amount ?? 0),
    type: data.type === 'income' ? 'income' : 'expense',
    category: String(data.category ?? ''),
    date: String(data.date ?? ''),
    created_at: createdAt instanceof Timestamp ? createdAt.toDate().toISOString() : String(createdAt ?? ''),
  }
}

export async function getTransactions(
  uid: string,
  filters: TransactionFilters = {},
): Promise<Transaction[]> {
  const snapshot = await getDocs(
    query(userCollection(uid, 'transactions'), orderBy('date', 'desc')),
  )
  return snapshot.docs
    .map((item) => toTransaction(item.id, item.data(), uid))
    .filter((transaction) => {
      if (filters.type && filters.type !== 'all' && transaction.type !== filters.type) return false
      if (filters.category && transaction.category !== filters.category) return false
      if (filters.startDate && transaction.date < filters.startDate) return false
      if (filters.endDate && transaction.date > filters.endDate) return false
      return true
    })
}

export async function saveTransaction(
  uid: string,
  data: TransactionData,
  id?: string,
): Promise<Transaction> {
  const transactionRef = id
    ? doc(firestore, 'users', uid, 'transactions', id)
    : doc(userCollection(uid, 'transactions'))
  if (id) {
    await updateDoc(transactionRef, data)
  } else {
    await setDoc(transactionRef, { ...data, created_at: serverTimestamp() })
  }
  return toTransaction(id ?? transactionRef.id, { ...data, created_at: new Date().toISOString() }, uid)
}

export async function removeTransaction(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(firestore, 'users', uid, 'transactions', id))
}

export async function getBudgets(uid: string): Promise<Budget[]> {
  const snapshot = await getDocs(userCollection(uid, 'budgets'))
  return snapshot.docs.map((item) => {
    const data = item.data()
    const createdAt = data.created_at
    return {
      id: item.id,
      user_id: uid,
      category: String(data.category ?? item.id),
      amount_limit: Number(data.amount_limit ?? 0),
      period: String(data.period ?? 'monthly'),
      created_at: createdAt instanceof Timestamp ? createdAt.toDate().toISOString() : '',
    }
  })
}

export async function saveBudget(uid: string, category: string, limit: number): Promise<void> {
  await setDoc(doc(firestore, 'users', uid, 'budgets', category), {
    category,
    amount_limit: limit,
    period: 'monthly',
    created_at: serverTimestamp(),
  })
}

export async function removeBudget(uid: string, category: string): Promise<void> {
  await deleteDoc(doc(firestore, 'users', uid, 'budgets', category))
}

export async function getBudgetStatus(
  uid: string,
  month = new Date().toISOString().slice(0, 7),
): Promise<BudgetStatusItem[]> {
  const [budgets, transactions] = await Promise.all([
    getBudgets(uid),
    getTransactions(uid, { type: 'expense', startDate: `${month}-01`, endDate: `${month}-31` }),
  ])
  return budgets.map((budget) => {
    const spent = transactions
      .filter((transaction) => transaction.category === budget.category)
      .reduce((total, transaction) => total + transaction.amount, 0)
    const percentage = budget.amount_limit > 0 ? (spent / budget.amount_limit) * 100 : 0
    return {
      category: budget.category,
      limit: budget.amount_limit,
      spent,
      remaining: budget.amount_limit - spent,
      percentage,
      isOverBudget: spent > budget.amount_limit,
    }
  })
}

export async function getCategoryBreakdown(
  uid: string,
  type: 'income' | 'expense',
): Promise<{ name: string; value: number }[]> {
  const transactions = await getTransactions(uid, { type })
  const totals = new Map<string, number>()
  for (const transaction of transactions) {
    totals.set(transaction.category, (totals.get(transaction.category) ?? 0) + transaction.amount)
  }
  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export async function getMonthlyTrend(
  uid: string,
): Promise<{ month: string; income: number; expenses: number }[]> {
  const transactions = await getTransactions(uid)
  const totals = new Map<string, { month: string; income: number; expenses: number }>()
  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7)
    const total = totals.get(month) ?? { month, income: 0, expenses: 0 }
    if (transaction.type === 'income') total.income += transaction.amount
    else total.expenses += transaction.amount
    totals.set(month, total)
  }
  return [...totals.values()].sort((a, b) => a.month.localeCompare(b.month))
}

export function toCsv(transactions: Transaction[]): string {
  const escape = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
  return [
    ['Date', 'Description', 'Type', 'Category', 'Amount'].map(escape).join(','),
    ...transactions.map((transaction) =>
      [
        transaction.date,
        transaction.description,
        transaction.type,
        transaction.category,
        transaction.amount.toFixed(2),
      ]
        .map(escape)
        .join(','),
    ),
  ].join('\r\n')
}
