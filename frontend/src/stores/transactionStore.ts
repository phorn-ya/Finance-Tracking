import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { transactionApi } from '../api/transactionApi';
import type { TransactionFilters } from '../api/transactionApi';

export interface Transaction {
  id: number;
  user_id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  created_at: string;
}

export interface SummaryData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<Transaction[]>([]);
  const summary = ref<SummaryData>({ totalIncome: 0, totalExpenses: 0, balance: 0 });
  const loading = ref(false);
  const error = ref<string | null>(null);

  const recentTransactions = computed(() => {
    return transactions.value.slice(0, 5);
  });

  async function fetchTransactions(filters: TransactionFilters = {}) {
    loading.value = true;
    error.value = null;
    try {
      const res = await transactionApi.getTransactions(filters);
      transactions.value = res.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch transactions.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchSummary() {
    try {
      const res = await transactionApi.getSummary();
      summary.value = res.data;
    } catch (err) {
      console.error('Failed to fetch transaction summary:', err);
    }
  }

  async function addTransaction(data: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
  }) {
    loading.value = true;
    error.value = null;
    try {
      const res = await transactionApi.createTransaction(data);
      transactions.value.unshift(res.data);
      await fetchSummary(); // Update summary card metrics
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create transaction.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function updateTransaction(
    id: number,
    data: {
      description: string;
      amount: number;
      type: 'income' | 'expense';
      category: string;
      date: string;
    }
  ) {
    loading.value = true;
    error.value = null;
    try {
      const res = await transactionApi.updateTransaction(id, data);
      const idx = transactions.value.findIndex((t) => t.id === id);
      if (idx !== -1) {
        transactions.value[idx] = res.data;
      }
      await fetchSummary();
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update transaction.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deleteTransaction(id: number) {
    loading.value = true;
    error.value = null;
    try {
      await transactionApi.deleteTransaction(id);
      transactions.value = transactions.value.filter((t) => t.id !== id);
      await fetchSummary();
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete transaction.';
      return false;
    } finally {
      loading.value = false;
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
  };
});
