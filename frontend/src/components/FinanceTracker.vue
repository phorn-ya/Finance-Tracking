<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import TransactionForm from './TransactionForm.vue';
import SummaryCards from './SummaryCards.vue';
import BudgetProgressBar from './BudgetProgressBar.vue';
import TransactionList from './TransactionList.vue';
import CategorySummary from './CategorySummary.vue';
import NotificationLog from './NotificationLog.vue';

interface Transaction {
  id: number;
  desc: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

// State
const transactions = ref<Transaction[]>(
  JSON.parse(localStorage.getItem('transactions') || '[]')
);
const filterType = ref<string>('all');
const budgetLimit = ref<number>(1000);
const notificationLog = ref<string[]>([]);

// Methods
function addTransaction(desc: string, amount: string, type: string) {
  transactions.value.push({
    id: Date.now(),
    desc,
    amount: Number(amount),
    type: type as 'income' | 'expense',
    date: new Date().toLocaleDateString(),
  });
}

function deleteTransaction(id: number) {
  transactions.value = transactions.value.filter((item) => item.id !== id);
}

function clearAll() {
  if (window.confirm('Are you sure you want to clear all transactions?')) {
    transactions.value = [];
    notificationLog.value = [];
  }
}

// Computed Properties
const filteredTransactions = computed(() => {
  if (filterType.value === 'all') {
    return transactions.value;
  }
  return transactions.value.filter((item) => item.type === filterType.value);
});

const totalIncome = computed(() =>
  transactions.value
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0)
);

const totalExpenses = computed(() =>
  transactions.value
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0)
);

const balance = computed(() => totalIncome.value - totalExpenses.value);

const isOverBudget = computed(() => totalExpenses.value > budgetLimit.value);

const expensePercentage = computed(() =>
  Math.min((totalExpenses.value / budgetLimit.value) * 100, 100)
);

// Watchers
watch(
  transactions,
  (newValue) => {
    localStorage.setItem('transactions', JSON.stringify(newValue));
  },
  { deep: true }
);

watch(balance, (newBalance) => {
  if (newBalance < 0) {
    notificationLog.value.push(
      `⚠️ Warning! Balance is negative: $${newBalance.toFixed(2)} at ${new Date().toLocaleTimeString()}`
    );
  }
});

watch(isOverBudget, (status) => {
  if (status) {
    notificationLog.value.push(
      `💰 Budget exceeded on ${new Date().toLocaleTimeString()}`
    );
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-100 p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-gray-800 mb-2">
          Personal Finance Tracker
        </h1>
        <p class="text-gray-500">
          Vue 3 + Tailwind CSS + Composition API
        </p>
      </div>

      <!-- Transaction Form -->
      <TransactionForm @submit="addTransaction" />

      <!-- Summary Cards -->
      <SummaryCards
        :total-income="totalIncome"
        :total-expenses="totalExpenses"
        :balance="balance"
        :is-over-budget="isOverBudget"
      />

      <!-- Budget Progress -->
      <BudgetProgressBar
        :expense-percentage="expensePercentage"
        :total-expenses="totalExpenses"
        :budget-limit="budgetLimit"
      />

      <!-- Filter -->
      <div class="mb-4">
        <label class="block text-sm font-semibold mb-2">Filter Transactions</label>
        <select
          v-model="filterType"
          class="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <!-- Transaction List -->
      <TransactionList
        :transactions="filteredTransactions"
        :filter-type="filterType"
        @delete="deleteTransaction"
      />

      <!-- Category Summary -->
      <div class="mt-6">
        <CategorySummary :income="totalIncome" :expenses="totalExpenses" />
      </div>

      <!-- Notification Log -->
      <div class="mt-6">
        <NotificationLog :notifications="notificationLog" />
      </div>

      <!-- Clear All Button -->
      <button
        @click="clearAll"
        class="mt-6 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
      >
        Clear All Transactions
      </button>
    </div>
  </div>
</template>
