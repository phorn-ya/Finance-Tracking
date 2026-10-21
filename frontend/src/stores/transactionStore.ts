import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import {
  getTransactions,
  removeTransaction,
  saveTransaction,
  type TransactionData,
} from '../services/financeService'

export interface Transaction {
  id: string
  user_id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: string
  created_at: string
}

export interface SummaryData {
  totalIncome: number
  totalExpenses: number
  balance: number
}

export interface TransactionFilters {
  type?: string
  category?: string
  startDate?: string
  endDate?: string
}

export const useTransactionStore = defineStore('transaction', () => {
  const authStore = useAuthStore()
  const transactions = ref<Transaction[]>([])
  const summary = ref<SummaryData>({ totalIncome: 0, totalExpenses: 0, balance: 0 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const recentTransactions = computed(() => transactions.value.slice(0, 5))

  async function fetchTransactions(filters: TransactionFilters = {}) {
    const uid = authStore.user?.id
    if (!uid) {
      transactions.value = []
      summary.value = { totalIncome: 0, totalExpenses: 0, balance: 0 }
      return
    }
    loading.value = true
    error.value = null
    try {
      transactions.value = await getTransactions(uid, filters)
    } catch (err) {
      error.value = 'Failed to fetch transactions.'
      console.error('Failed to fetch Firebase transactions:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchSummary() {
    const uid = authStore.user?.id
    if (!uid) {
      summary.value = { totalIncome: 0, totalExpenses: 0, balance: 0 }
      return
    }
    try {
      const allTransactions = await getTransactions(uid)
      const totalIncome = allTransactions
        .filter((transaction) => transaction.type === 'income')
        .reduce((total, transaction) => total + transaction.amount, 0)
      const totalExpenses = allTransactions
        .filter((transaction) => transaction.type === 'expense')
        .reduce((total, transaction) => total + transaction.amount, 0)
      summary.value = { totalIncome, totalExpenses, balance: totalIncome - totalExpenses }
    } catch (err) {
      error.value = 'Failed to fetch transaction summary.'
      console.error('Failed to fetch Firebase transaction summary:', err)
    }
  }

  async function addTransaction(data: TransactionData): Promise<boolean> {
    const uid = authStore.user?.id
    if (!uid) {
      error.value = 'Sign in to add a transaction.'
      return false
    }
    loading.value = true
    error.value = null
    try {
      const transaction = await saveTransaction(uid, data)
      transactions.value.unshift(transaction)
      await fetchSummary()
      return true
    } catch (err) {
      error.value = 'Failed to create transaction.'
      console.error('Failed to create Firebase transaction:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateTransaction(id: string, data: TransactionData): Promise<boolean> {
    const uid = authStore.user?.id
    if (!uid) {
      error.value = 'Sign in to update a transaction.'
      return false
    }
    loading.value = true
    error.value = null
    try {
      const transaction = await saveTransaction(uid, data, id)
      const index = transactions.value.findIndex((item) => item.id === id)
      if (index !== -1) transactions.value[index] = transaction
      await fetchSummary()
      return true
    } catch (err) {
      error.value = 'Failed to update transaction.'
      console.error('Failed to update Firebase transaction:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteTransaction(id: string): Promise<boolean> {
    const uid = authStore.user?.id
    if (!uid) {
      error.value = 'Sign in to delete a transaction.'
      return false
    }
    loading.value = true
    error.value = null
    try {
      await removeTransaction(uid, id)
      transactions.value = transactions.value.filter((item) => item.id !== id)
      await fetchSummary()
      return true
    } catch (err) {
      error.value = 'Failed to delete transaction.'
      console.error('Failed to delete Firebase transaction:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    transactions,
    summary,
    loading,
    error,
    recentTransactions,
    fetchTransactions,
    fetchSummary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }
})
