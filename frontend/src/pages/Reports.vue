<template>
  <div class="space-y-8">
    <!-- Header with export actions -->
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <div>
        <h3 class="text-base font-bold text-slate-800">Financial Reports & Insights</h3>
        <p class="text-slate-400 text-xs mt-1">Aggregated statistics of your incomes, expenditures, and categories</p>
      </div>
      <div>
        <button
          @click="handleExportCsv"
          class="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10 transition"
        >
          <Download class="w-4 h-4" />
          <span>Export Transactions (.CSV)</span>
        </button>
      </div>
    </div>

    <!-- Charts Split Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Monthly Trends (Income vs Expense) -->
      <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div class="mb-4">
          <h4 class="text-sm font-bold text-slate-800">Monthly Trend analysis</h4>
          <p class="text-slate-400 text-xs mt-0.5">Comparison of monthly income and expenses</p>
        </div>

        <div v-if="trendData.labels.length === 0" class="py-16 text-center text-slate-400 text-xs">
          No monthly trend data available. Add transactions to generate.
        </div>
        <div v-else class="h-64">
          <BarChart :data="trendData" :options="trendChartOptions" />
        </div>
      </div>

      <!-- Expense Categories breakdown -->
      <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h4 class="text-sm font-bold text-slate-800">Expense Breakdown</h4>
            <p class="text-slate-400 text-xs mt-0.5">Spending distribution by category</p>
          </div>
          <select
            v-model="breakdownType"
            class="bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-2.5 py-1.5 text-[10px] focus:outline-none font-semibold uppercase"
            @change="fetchBreakdown"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div v-if="breakdownData.labels.length === 0" class="py-16 text-center text-slate-400 text-xs">
          No category records available for this type.
        </div>
        <div v-else class="h-64">
          <DoughnutChart :data="breakdownData" />
        </div>
      </div>
    </div>

    <!-- Category Table breakdown list -->
    <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
      <h3 class="text-base font-bold text-slate-800 mb-5">Category Spending Breakdown</h3>
      
      <div v-if="categoryItems.length === 0" class="py-6 text-center text-slate-400 text-xs">
        No breakdown data available.
      </div>
      <div v-else class="overflow-x-auto -mx-6">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase border-y border-slate-100">
              <th class="px-6 py-3">Category</th>
              <th class="px-6 py-3 text-right">Total Amount</th>
              <th class="px-6 py-3 text-right">Proportion</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs font-semibold">
            <tr v-for="item in categoryItems" :key="item.name" class="hover:bg-slate-50/60 transition">
              <td class="px-6 py-4 text-slate-700 capitalize font-bold">{{ item.name }}</td>
              <td class="px-6 py-4 text-right text-slate-800">${{ item.value.toFixed(2) }}</td>
              <td class="px-6 py-4 text-right text-slate-400">
                {{ ((item.value / totalBreakdownSum) * 100).toFixed(1) }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Download } from 'lucide-vue-next';
import reportApi from '../api/reportApi';

// Components
import BarChart from '../components/charts/BarChart.vue';
import DoughnutChart from '../components/charts/DoughnutChart.vue';

const breakdownType = ref<'income' | 'expense'>('expense');
const categoryItems = ref<{ name: string; value: number }[]>([]);
const monthlyTrends = ref<{ month: string; income: number; expenses: number }[]>([]);

const totalBreakdownSum = computed(() => {
  return categoryItems.value.reduce((sum, item) => sum + item.value, 0);
});

// Doughnut chart parameters mapping
const breakdownData = computed(() => {
  const labels = categoryItems.value.map((item) => item.name);
  const data = categoryItems.value.map((item) => item.value);
  
  // Custom colors for categories
  const colorPalette = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#14b8a6', // Teal
    '#64748b', // Slate
  ];

  return {
    labels,
    datasets: [
      {
        label: 'Category Total ($)',
        data,
        backgroundColor: colorPalette.slice(0, labels.length),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };
});

// Bar chart parameters mapping
const trendData = computed(() => {
  const labels = monthlyTrends.value.map((t) => {
    // Convert YYYY-MM to readable (e.g. 2026-06 -> Jun 26)
    try {
      const parts = t.month.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    } catch (err) {
      return t.month;
    }
  });
  
  const incomeList = monthlyTrends.value.map((t) => t.income);
  const expenseList = monthlyTrends.value.map((t) => t.expenses);

  return {
    labels,
    datasets: [
      {
        label: 'Income ($)',
        data: incomeList,
        backgroundColor: '#10b981', // Emerald
      },
      {
        label: 'Expenses ($)',
        data: expenseList,
        backgroundColor: '#ef4444', // Red
      },
    ],
  };
});

const trendChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: { font: { family: 'Inter', size: 11 } },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: { border: { dash: [4, 4] }, grid: { color: '#e2e8f0' } },
  },
};

onMounted(() => {
  fetchBreakdown();
  fetchTrend();
});

async function fetchBreakdown() {
  try {
    const res = await reportApi.getCategoryBreakdown(breakdownType.value);
    categoryItems.value = res.data;
  } catch (err) {
    console.error('Failed to fetch breakdown:', err);
  }
}

async function fetchTrend() {
  try {
    const res = await reportApi.getMonthlyTrend();
    monthlyTrends.value = res.data;
  } catch (err) {
    console.error('Failed to fetch trends:', err);
  }
}

async function handleExportCsv() {
  try {
    const res = await reportApi.exportCsv();
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to export CSV:', err);
  }
}
</script>
