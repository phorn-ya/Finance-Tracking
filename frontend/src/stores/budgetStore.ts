import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { budgetApi } from '../api/budgetApi';

export interface Budget {
  id: number;
  user_id: number;
  category: string;
  amount_limit: number;
  period: string;
  created_at: string;
}

export interface BudgetStatusItem {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

export const useBudgetStore = defineStore('budget', () => {
  const budgets = ref<Budget[]>([]);
  const budgetStatus = ref<BudgetStatusItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const notifications = computed(() => {
    const list: string[] = [];
    budgetStatus.value.forEach((b) => {
      if (b.isOverBudget) {
        list.push(`🚨 Budget Exceeded: You have spent $${b.spent.toFixed(2)} of your $${b.limit.toFixed(2)} limit for '${b.category}'`);
      } else if (b.percentage >= 80) {
        list.push(`⚠️ Budget Warning: Spent ${b.percentage.toFixed(0)}% of your $${b.limit.toFixed(2)} limit for '${b.category}'`);
      }
    });
    return list;
  });

  async function fetchBudgets() {
    loading.value = true;
    error.value = null;
    try {
      const res = await budgetApi.getBudgets();
      budgets.value = res.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch budgets.';
    } finally {
      loading.value = false;
    }
  }

  async function fetchBudgetStatus(month?: string) {
    loading.value = true;
    error.value = null;
    try {
      const res = await budgetApi.getBudgetStatus(month);
      budgetStatus.value = res.data;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch budget status.';
    } finally {
      loading.value = false;
    }
  }

  async function saveBudget(category: string, limit: number) {
    loading.value = true;
    error.value = null;
    try {
      await budgetApi.setBudget(category, limit);
      await fetchBudgets();
      await fetchBudgetStatus();
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to save budget.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function deleteBudget(category: string) {
    loading.value = true;
    error.value = null;
    try {
      await budgetApi.deleteBudget(category);
      await fetchBudgets();
      await fetchBudgetStatus();
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete budget.';
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    budgets,
    budgetStatus,
    loading,
    error,
    notifications,
    fetchBudgets,
    fetchBudgetStatus,
    saveBudget,
    deleteBudget,
  };
});
