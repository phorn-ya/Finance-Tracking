<template>
  <div class="space-y-8">
    <!-- Top summary card row -->
    <SummaryCards
      :total-income="summary.totalIncome"
      :total-expenses="summary.totalExpenses"
      :balance="summary.balance"
      :is-over-budget="isOverallOverBudget"
    />

    <!-- Main split layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left 2 columns: Entry Form, Charts, and Transaction Logs -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Input Form -->
        <TransactionForm :loading="txLoading" @submit="handleCreateTransaction" />

        <!-- Chart visualization -->
        <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div class="mb-4">
            <h3 class="text-base font-bold text-slate-800">Weekly Expense Flow</h3>
            <p class="text-slate-400 text-xs mt-1">Daily expense aggregation for the past 7 days</p>
          </div>
          <BarChart :data="expenseChartData" />
        </div>

        <!-- Transactions history table -->
        <TransactionList
          :transactions="transactions"
          @filter="handleFilterTransactions"
          @delete="handleDeleteTransaction"
          @edit="handleEditTransaction"
        />
      </div>

      <!-- Right 1 column: Budget thresholds & alerts -->
      <div class="space-y-8">
        <BudgetProgress :budget-status="budgetStatus" />

        <!-- Quick Notifications panel -->
        <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <h3 class="text-base font-bold text-slate-800 mb-4">Budget Alert Feed</h3>
          
          <div v-if="notifications.length === 0" class="py-4 text-center">
            <div class="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2.5">
              ✓
            </div>
            <p class="text-slate-400 text-xs font-semibold">Your category limits are secure.</p>
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="(notif, idx) in notifications" 
              :key="idx"
              class="p-3.5 rounded-2xl text-xs font-medium leading-relaxed"
              :class="notif.includes('🚨') 
                ? 'bg-rose-50 border border-rose-100 text-rose-700' 
                : 'bg-amber-50 border border-amber-100 text-amber-700'"
            >
              {{ notif }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useTransactionStore } from '../stores/transactionStore';
import { useBudgetStore } from '../stores/budgetStore';

// Components
import SummaryCards from '../components/dashboard/SummaryCards.vue';
import BudgetProgress from '../components/dashboard/BudgetProgress.vue';
import TransactionForm from '../components/transactions/TransactionForm.vue';
import TransactionList from '../components/transactions/TransactionList.vue';
import BarChart from '../components/charts/BarChart.vue';

const txStore = useTransactionStore();
const budgetStore = useBudgetStore();

const transactions = computed(() => txStore.transactions);
const summary = computed(() => txStore.summary);
const txLoading = computed(() => txStore.loading);

const budgetStatus = computed(() => budgetStore.budgetStatus);
const notifications = computed(() => budgetStore.notifications);

// Identify if overall budget is exceeded
// (For simplicity: if sum of spent in all budgets is over the sum of limits, or if any category budget is exceeded)
const isOverallOverBudget = computed(() => {
  return budgetStatus.value.some((b) => b.isOverBudget);
});

// Dynamic daily expense chart logic (last 7 calendar days)
const expenseChartData = computed(() => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dataMap = new Map<string, number>();

  // Initialize past 7 days with 0
  const datesList: string[] = [];
  const labelsList: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0] || '';
    datesList.push(dateStr);
    labelsList.push(dayNames[d.getDay()] || '');
    dataMap.set(dateStr, 0);
  }

  // Populate dataMap from transaction expenses
  transactions.value.forEach((t) => {
    if (t.type === 'expense' && dataMap.has(t.date)) {
      dataMap.set(t.date, (dataMap.get(t.date) || 0) + t.amount);
    }
  });

  const datasetValues = datesList.map((d) => dataMap.get(d) || 0);

  return {
    labels: labelsList,
    datasets: [
      {
        label: 'Expense ($)',
        data: datasetValues,
      },
    ],
  };
});

onMounted(async () => {
  // Load stores data
  await Promise.all([
    txStore.fetchTransactions(),
    txStore.fetchSummary(),
    budgetStore.fetchBudgetStatus(),
  ]);
});

async function handleCreateTransaction(data: {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}) {
  const ok = await txStore.addTransaction(data);
  if (ok) {
    // Refresh budget progress bars to check if they've changed
    budgetStore.fetchBudgetStatus();
  }
}

function handleFilterTransactions(filters: { type: string; category: string }) {
  txStore.fetchTransactions(filters);
}

async function handleDeleteTransaction(id: number) {
  const ok = await txStore.deleteTransaction(id);
  if (ok) {
    budgetStore.fetchBudgetStatus();
  }
}

async function handleEditTransaction(
  id: number,
  data: { description: string; amount: number; type: 'income' | 'expense'; category: string; date: string }
) {
  const ok = await txStore.updateTransaction(id, data);
  if (ok) {
    txStore.fetchTransactions();
    budgetStore.fetchBudgetStatus();
  }
}
</script>
