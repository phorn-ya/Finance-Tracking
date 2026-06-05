<template>
  <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-base font-bold text-slate-800">Monthly Budget Usage</h3>
        <p class="text-slate-400 text-xs mt-1">Comparing expenditures against category limits</p>
      </div>
      <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">
        {{ budgetStatus.length }} Active Budgets
      </span>
    </div>

    <!-- Empty state -->
    <div v-if="budgetStatus.length === 0" class="py-8 text-center">
      <p class="text-slate-400 text-sm font-medium">No category budget limits configured yet.</p>
      <router-link 
        to="/profile" 
        class="text-indigo-600 hover:underline font-bold text-xs mt-2 inline-block"
      >
        Configure limits in profile →
      </router-link>
    </div>

    <!-- Progress List -->
    <div v-else class="space-y-6">
      <div 
        v-for="item in budgetStatus" 
        :key="item.category" 
        class="group"
      >
        <div class="flex justify-between items-end mb-2">
          <div>
            <span class="text-sm font-bold text-slate-700 capitalize tracking-tight">{{ item.category }}</span>
            <div class="text-[11px] text-slate-400 font-medium mt-0.5">
              ${{ item.spent.toFixed(2) }} spent of ${{ item.limit.toFixed(2) }}
            </div>
          </div>
          <div class="text-right">
            <span 
              class="text-xs font-bold" 
              :class="item.percentage >= 100 
                ? 'text-rose-500' 
                : item.percentage >= 80 
                ? 'text-amber-500' 
                : 'text-indigo-600'"
            >
              {{ item.percentage.toFixed(0) }}%
            </span>
            <div class="text-[10px] font-semibold mt-0.5" :class="item.remaining >= 0 ? 'text-slate-400' : 'text-rose-500'">
              {{ item.remaining >= 0 ? `$${item.remaining.toFixed(2)} left` : `$${Math.abs(item.remaining).toFixed(2)} over` }}
            </div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/20">
          <div
            class="h-full rounded-full transition-all duration-500 ease-out"
            :class="item.percentage >= 100 
              ? 'bg-rose-500' 
              : item.percentage >= 80 
              ? 'bg-amber-500' 
              : 'bg-indigo-600'"
            :style="{ width: `${Math.min(item.percentage, 100)}%` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface BudgetStatusItem {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

defineProps<{
  budgetStatus: BudgetStatusItem[];
}>();
</script>
