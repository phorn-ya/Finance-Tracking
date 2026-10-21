<template>
  <div class="mx-auto max-w-5xl space-y-8">
    <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div class="mb-6">
        <h3 class="text-lg font-bold text-slate-800">Monthly Budgets</h3>
        <p class="mt-1 text-xs text-slate-400">
          Set a monthly spending limit for each expense category.
        </p>
      </div>

      <div
        v-if="feedback"
        class="mb-5 rounded-xl border px-4 py-3 text-sm"
        :class="feedback.type === 'error'
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'"
        role="status"
      >
        {{ feedback.message }}
      </div>

      <form
        class="grid grid-cols-1 items-end gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3"
        @submit.prevent="saveBudget"
      >
        <div>
          <label for="budget-category" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Category
          </label>
          <select
            id="budget-category"
            v-model="category"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm capitalize text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>

        <div>
          <label for="budget-limit" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Monthly limit ($)
          </label>
          <input
            id="budget-limit"
            v-model.number="limit"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="e.g. 500"
            class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          type="submit"
          :disabled="budgetStore.loading || !canSave"
          class="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ budgetStore.loading ? 'Saving...' : existingBudget ? 'Update Budget' : 'Add Budget' }}
        </button>
      </form>

      <p v-if="existingBudget" class="mt-3 text-xs text-slate-500">
        A budget already exists for {{ category }}. Saving will update its monthly limit.
      </p>
    </section>

    <section class="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div class="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-slate-800">Category spending</h3>
          <p class="mt-1 text-xs text-slate-400">Progress for the current calendar month.</p>
        </div>
        <span class="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
          {{ budgetStatus.length }} {{ budgetStatus.length === 1 ? 'budget' : 'budgets' }}
        </span>
      </div>

      <p
        v-if="budgetStore.error"
        class="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        role="alert"
      >
        {{ budgetStore.error }}
      </p>

      <div v-if="budgetStore.loading && budgets.length === 0" class="py-10 text-center text-sm text-slate-400">
        Loading budgets...
      </div>
      <div v-else-if="budgets.length === 0" class="py-10 text-center">
        <p class="text-sm font-medium text-slate-500">No budgets yet.</p>
        <p class="mt-1 text-xs text-slate-400">Choose a category and monthly limit above to get started.</p>
      </div>

      <div v-else class="space-y-5">
        <article
          v-for="budget in budgets"
          :key="budget.id"
          class="rounded-2xl border border-slate-100 p-4"
        >
          <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 class="font-bold capitalize text-slate-800">{{ budget.category }}</h4>
              <p class="mt-1 text-xs text-slate-500">
                ${{ statusFor(budget.category).spent.toFixed(2) }} spent of ${{ budget.amount_limit.toFixed(2) }}
              </p>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right">
                <p
                  class="text-sm font-bold"
                  :class="statusFor(budget.category).percentage >= 100
                    ? 'text-rose-600'
                    : statusFor(budget.category).percentage >= 80
                      ? 'text-amber-600'
                      : 'text-indigo-600'"
                >
                  {{ statusFor(budget.category).percentage.toFixed(0) }}%
                </p>
                <p class="text-xs text-slate-400">
                  ${{ Math.max(statusFor(budget.category).remaining, 0).toFixed(2) }} left
                </p>
              </div>
              <button
                type="button"
                :disabled="budgetStore.loading"
                class="rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                @click="deleteBudget(budget.category)"
              >
                Remove
              </button>
            </div>
          </div>

          <div
            class="h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            :aria-label="`${budget.category} budget used`"
            :aria-valuenow="Math.min(statusFor(budget.category).percentage, 100)"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="h-full rounded-full transition-all"
              :class="statusFor(budget.category).percentage >= 100
                ? 'bg-rose-500'
                : statusFor(budget.category).percentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'"
              :style="{ width: `${Math.min(statusFor(budget.category).percentage, 100)}%` }"
            ></div>
          </div>
          <p v-if="statusFor(budget.category).isOverBudget" class="mt-2 text-xs font-medium text-rose-600">
            This category is over budget by ${{ Math.abs(statusFor(budget.category).remaining).toFixed(2) }}.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useBudgetStore } from '../stores/budgetStore'

const budgetStore = useBudgetStore()
const budgets = computed(() => budgetStore.budgets)
const budgetStatus = computed(() => budgetStore.budgetStatus)
const category = ref('food')
const limit = ref<number | null>(null)
const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null)
let feedbackTimeout: ReturnType<typeof setTimeout> | undefined
const canSave = computed(
  () => limit.value !== null && Number.isFinite(limit.value) && limit.value > 0,
)

const categories = [
  'food',
  'rent',
  'utilities',
  'salaries',
  'investments',
  'leisure',
  'shopping',
  'transport',
  'other',
]

const existingBudget = computed(() => budgets.value.find((budget) => budget.category === category.value))

watch(category, (selected) => {
  limit.value = budgets.value.find((budget) => budget.category === selected)?.amount_limit ?? null
})

onMounted(async () => {
  await Promise.all([budgetStore.fetchBudgets(), budgetStore.fetchBudgetStatus()])
  limit.value = existingBudget.value?.amount_limit ?? null
})

function showFeedback(type: 'success' | 'error', message: string) {
  feedback.value = { type, message }
  if (feedbackTimeout) clearTimeout(feedbackTimeout)
  feedbackTimeout = setTimeout(() => {
    feedback.value = null
  }, 4000)
}

function statusFor(selectedCategory: string) {
  return budgetStatus.value.find((item) => item.category === selectedCategory) ?? {
    category: selectedCategory,
    limit: 0,
    spent: 0,
    remaining: 0,
    percentage: 0,
    isOverBudget: false,
  }
}

async function saveBudget() {
  if (limit.value === null || !Number.isFinite(limit.value) || limit.value <= 0) {
    showFeedback('error', 'Enter a monthly limit greater than zero.')
    return
  }

  const wasUpdate = Boolean(existingBudget.value)
  const success = await budgetStore.saveBudget(category.value, limit.value)
  if (success) {
    showFeedback('success', `${category.value} budget ${wasUpdate ? 'updated' : 'added'}.`)
  } else {
    showFeedback('error', budgetStore.error || 'Could not save the budget.')
  }
}

async function deleteBudget(selectedCategory: string) {
  if (!window.confirm(`Remove the ${selectedCategory} budget?`)) return
  const success = await budgetStore.deleteBudget(selectedCategory)
  if (success) {
    showFeedback('success', `${selectedCategory} budget removed.`)
    if (category.value === selectedCategory) limit.value = null
  } else {
    showFeedback('error', budgetStore.error || 'Could not remove the budget.')
  }
}
</script>
