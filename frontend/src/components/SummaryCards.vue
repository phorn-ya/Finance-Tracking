<script setup lang="ts">
interface Props {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  isOverBudget: boolean;
}

defineProps<Props>();

const getStatusColor = (isOverBudget: boolean) => {
  return isOverBudget ? 'bg-red-700' : 'bg-green-700';
};

const getStatusText = (isOverBudget: boolean) => {
  return isOverBudget ? 'Over Budget ❌' : 'Within Budget ✅';
};
</script>

<template>
  <div class="grid md:grid-cols-4 gap-4 mb-6">
    <div class="bg-green-500 text-white p-5 rounded-lg shadow">
      <h3 class="font-semibold mb-2">Total Income</h3>
      <p class="text-2xl font-bold">${{ totalIncome.toFixed(2) }}</p>
    </div>

    <div class="bg-red-500 text-white p-5 rounded-lg shadow">
      <h3 class="font-semibold mb-2">Total Expenses</h3>
      <p class="text-2xl font-bold">${{ totalExpenses.toFixed(2) }}</p>
    </div>

    <div class="bg-blue-500 text-white p-5 rounded-lg shadow">
      <h3 class="font-semibold mb-2">Balance</h3>
      <p class="text-2xl font-bold" :class="balance < 0 ? 'text-red-300' : ''">
        ${{ balance.toFixed(2) }}
      </p>
    </div>

    <div class="p-5 rounded-lg shadow text-white" :class="getStatusColor(isOverBudget)">
      <h3 class="font-semibold mb-2">Budget Status</h3>
      <p class="font-medium">{{ getStatusText(isOverBudget) }}</p>
    </div>
  </div>
</template>
