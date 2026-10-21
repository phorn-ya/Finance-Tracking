import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'
import {
  getBudgetStatus as readBudgetStatus,
  getBudgets as readBudgets,
  removeBudget,
  saveBudget as writeBudget,
} from '../services/financeService'

export interface Budget {
  id: string
  user_id: string
  category: string
  amount_limit: number
  period: string
  created_at: string
}

export interface BudgetStatusItem {
  category: string
  limit: number
  spent: number
  remaining: number
  percentage: number
  isOverBudget: boolean
}

export const useBudgetStore = defineStore('budget', () => {
  const authStore = useAuthStore()
  const budgets = ref<Budget[]>([])
  const budgetStatus = ref<BudgetStatusItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const notifications = computed(() => {
    const list: string[] = []
    budgetStatus.value.forEach((budget) => {
      if (budget.isOverBudget) {
        list.push(
          `🚨 Budget Exceeded: You have spent $${budget.spent.toFixed(2)} of your $${budget.limit.toFixed(2)} limit for '${budget.category}'`,
        )
      } else if (budget.percentage >= 80) {
        list.push(
          `⚠️ Budget Warning: Spent ${budget.percentage.toFixed(0)}% of your $${budget.limit.toFixed(2)} limit for '${budget.category}'`,
        )
      }
    })
    return list
  })

  async function fetchBudgets() {
    const uid = authStore.user?.id
    if (!uid) {
      budgets.value = []
      return
    }
    loading.value = true
    error.value = null
    try {
      budgets.value = await readBudgets(uid)
    } catch (err) {
      error.value = 'Failed to fetch budgets.'
      console.error('Failed to fetch Firebase budgets:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchBudgetStatus(month?: string) {
    const uid = authStore.user?.id
    if (!uid) {
      budgetStatus.value = []
      return
    }
    loading.value = true
    error.value = null
    try {
      budgetStatus.value = await readBudgetStatus(uid, month)
    } catch (err) {
      error.value = 'Failed to fetch budget status.'
      console.error('Failed to fetch Firebase budget status:', err)
    } finally {
      loading.value = false
    }
  }

  async function saveBudget(category: string, limit: number) {
    const uid = authStore.user?.id
    if (!uid) {
      error.value = 'Sign in to save a budget.'
      return false
    }
    loading.value = true
    error.value = null
    try {
      await writeBudget(uid, category, limit)
      await Promise.all([fetchBudgets(), fetchBudgetStatus()])
      return true
    } catch (err) {
      error.value = 'Failed to save budget.'
      console.error('Failed to save Firebase budget:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteBudget(category: string) {
    const uid = authStore.user?.id
    if (!uid) {
      error.value = 'Sign in to delete a budget.'
      return false
    }
    loading.value = true
    error.value = null
    try {
      await removeBudget(uid, category)
      await Promise.all([fetchBudgets(), fetchBudgetStatus()])
      return true
    } catch (err) {
      error.value = 'Failed to delete budget.'
      console.error('Failed to delete Firebase budget:', err)
      return false
    } finally {
      loading.value = false
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
  }
})
