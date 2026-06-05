<script setup lang="ts">
interface Props {
  income: number;
  expenses: number;
}

defineProps<Props>();
</script>

<template>
  <div class="bg-white p-5 rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">Category Summary</h2>

    <div class="grid md:grid-cols-2 gap-4">
      <div class="p-4 bg-green-50 rounded border-l-4 border-green-500">
        <p class="text-gray-600 font-medium mb-1">Income</p>
        <p class="text-2xl font-bold text-green-600">${{ income.toFixed(2) }}</p>
      </div>

      <div class="p-4 bg-red-50 rounded border-l-4 border-red-500">
        <p class="text-gray-600 font-medium mb-1">Expenses</p>
        <p class="text-2xl font-bold text-red-600">${{ expenses.toFixed(2) }}</p>
      </div>
    </div>
  </div>
</template>
