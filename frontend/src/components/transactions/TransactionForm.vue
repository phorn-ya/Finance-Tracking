<template>
  <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-8">
    <h3 class="text-base font-bold text-slate-800 mb-5">Quick Transaction Entry</h3>
    
    <form @submit.prevent="handleSubmit" class="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
      <!-- Description -->
      <div class="md:col-span-1">
        <label for="desc" class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
        <input
          id="desc"
          v-model="description"
          type="text"
          required
          placeholder="e.g. Grocery"
          class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
        />
      </div>

      <!-- Amount -->
      <div>
        <label for="amount" class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Amount ($)</label>
        <input
          id="amount"
          v-model.number="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="0.00"
          class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
        />
      </div>

      <!-- Type -->
      <div>
        <label for="type" class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Type</label>
        <select
          id="type"
          v-model="type"
          class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <!-- Category -->
      <div>
        <label for="category" class="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
        <select
          id="category"
          v-model="category"
          class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 capitalize"
        >
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl py-2.5 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Plus class="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Plus } from 'lucide-vue-next';

defineProps<{
  loading: boolean;
}>();

const emit = defineEmits<{
  submit: [data: { description: string; amount: number; type: 'income' | 'expense'; category: string; date: string }];
}>();

const description = ref('');
const amount = ref<number | ''>('');
const type = ref<'income' | 'expense'>('expense');
const category = ref('food');

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
];

function handleSubmit() {
  if (!description.value.trim() || !amount.value || amount.value <= 0) return;

  emit('submit', {
    description: description.value.trim(),
    amount: Number(amount.value),
    type: type.value,
    category: category.value,
    date: new Date().toISOString().split('T')[0] || '', // Today's date
  });

  // Reset fields
  description.value = '';
  amount.value = '';
}
</script>
