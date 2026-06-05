<script setup lang="ts">
interface Props {
  expensePercentage: number;
  totalExpenses: number;
  budgetLimit: number;
}

defineProps<Props>();
</script>

<template>
  <div class="bg-white p-5 rounded-lg shadow mb-6">
    <div class="flex justify-between mb-3">
      <div>
        <span class="font-semibold">Budget Usage</span>
        <p class="text-sm text-gray-600">${{ totalExpenses.toFixed(2) }} / ${{ budgetLimit }}</p>
      </div>
      <span class="font-bold text-lg">{{ expensePercentage.toFixed(0) }}%</span>
    </div>

    <div class="w-full bg-gray-200 rounded-full h-5 overflow-hidden">
      <div
        class="bg-gradient-to-r from-green-500 to-red-500 h-5 rounded-full transition-all duration-300"
        :style="{ width: expensePercentage + '%' }"
      ></div>
    </div>
  </div>
</template>
