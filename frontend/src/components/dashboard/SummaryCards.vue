<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Balance Card -->
    <div class="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl shadow-slate-900/10 border border-slate-800 flex flex-col justify-between min-h-[140px] group hover:scale-[1.02] transition-all duration-300">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-slate-400 text-xs font-semibold tracking-wider uppercase">Total Balance</p>
          <h3 class="text-3xl font-extrabold mt-2 tracking-tight" :class="{ 'text-rose-400': balance < 0 }">
            ${{ balance.toFixed(2) }}
          </h3>
        </div>
        <div class="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition duration-300">
          <Wallet class="w-6 h-6" />
        </div>
      </div>
      <p class="text-slate-400 text-[11px] font-semibold mt-4 flex items-center gap-1">
        <span :class="balance >= 0 ? 'text-emerald-400' : 'text-rose-400'">
          {{ balance >= 0 ? '✓ Net Positive' : '⚠ Overdrawn' }}
        </span>
        compared to spending limits
      </p>
    </div>

    <!-- Income Card -->
    <div class="bg-white rounded-3xl p-6 shadow-lg shadow-slate-100/80 border border-slate-100 flex flex-col justify-between min-h-[140px] group hover:scale-[1.02] transition-all duration-300">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-slate-400 text-xs font-semibold tracking-wider uppercase">Total Income</p>
          <h3 class="text-3xl font-extrabold mt-2 text-slate-800 tracking-tight">
            ${{ totalIncome.toFixed(2) }}
          </h3>
        </div>
        <div class="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition duration-300">
          <TrendingUp class="w-6 h-6" />
        </div>
      </div>
      <p class="text-slate-400 text-[11px] font-semibold mt-4">
        <span class="text-emerald-500 font-bold">Total earnings</span> recorded this month
      </p>
    </div>

    <!-- Expenses Card -->
    <div class="bg-white rounded-3xl p-6 shadow-lg shadow-slate-100/80 border border-slate-100 flex flex-col justify-between min-h-[140px] group hover:scale-[1.02] transition-all duration-300">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-slate-400 text-xs font-semibold tracking-wider uppercase">Total Expenses</p>
          <h3 class="text-3xl font-extrabold mt-2 text-slate-800 tracking-tight">
            ${{ totalExpenses.toFixed(2) }}
          </h3>
        </div>
        <div class="p-3 bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition duration-300">
          <TrendingDown class="w-6 h-6" />
        </div>
      </div>
      <p class="text-slate-400 text-[11px] font-semibold mt-4">
        <span class="text-rose-500 font-bold">Total expenses</span> charged to account
      </p>
    </div>

    <!-- Budget Status Card -->
    <div 
      class="rounded-3xl p-6 shadow-lg border flex flex-col justify-between min-h-[140px] group hover:scale-[1.02] transition-all duration-300 text-white"
      :class="isOverBudget 
        ? 'bg-gradient-to-br from-rose-600 to-rose-700 border-rose-500/10 shadow-rose-600/10' 
        : 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500/10 shadow-indigo-600/10'"
    >
      <div class="flex justify-between items-start">
        <div>
          <p class="text-indigo-200 text-xs font-semibold tracking-wider uppercase">Budget Status</p>
          <h3 class="text-xl font-bold mt-3 leading-tight tracking-tight">
            {{ isOverBudget ? 'Exceeded' : 'Within limits' }}
          </h3>
        </div>
        <div class="p-3 bg-white/10 rounded-2xl text-white">
          <component :is="isOverBudget ? AlertCircle : ShieldCheck" class="w-6 h-6" />
        </div>
      </div>
      <p class="text-indigo-200 text-[11px] font-semibold mt-4">
        {{ isOverBudget ? '🚨 Action required: Reduce expenses!' : '✓ Good job keeping expenses low!' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Wallet, TrendingUp, TrendingDown, ShieldCheck, AlertCircle } from 'lucide-vue-next';

defineProps<{
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  isOverBudget: boolean;
}>();
</script>
