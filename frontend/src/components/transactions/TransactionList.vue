<template>
  <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
    <!-- Filters Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h3 class="text-base font-bold text-slate-800">Transactions History</h3>
        <p class="text-slate-400 text-xs mt-1">Audit log of your financial movement</p>
      </div>

      <!-- Filters -->
      <div class="flex items-center gap-3">
        <select
          v-model="localType"
          class="bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
          @change="onFilterChange"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          v-model="localCategory"
          class="bg-slate-50 border border-slate-200 text-slate-600 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold capitalize"
          @change="onFilterChange"
        >
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="transactions.length === 0" class="py-12 text-center">
      <p class="text-slate-400 text-sm font-medium">No transactions match your search filter.</p>
    </div>

    <!-- Transactions Table -->
    <div v-else class="overflow-x-auto -mx-6">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-y border-slate-100">
            <th class="px-6 py-3.5">Date</th>
            <th class="px-6 py-3.5">Description</th>
            <th class="px-6 py-3.5">Category</th>
            <th class="px-6 py-3.5 text-right">Amount</th>
            <th class="px-6 py-3.5 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-xs">
          <tr 
            v-for="tx in transactions" 
            :key="tx.id"
            class="hover:bg-slate-50/60 transition group font-medium"
          >
            <!-- Date -->
            <td class="px-6 py-4 text-slate-400 font-semibold whitespace-nowrap">
              {{ formatDate(tx.date) }}
            </td>
            <!-- Description -->
            <td class="px-6 py-4 text-slate-800 font-bold">
              {{ tx.description }}
            </td>
            <!-- Category -->
            <td class="px-6 py-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize bg-slate-100 text-slate-600">
                {{ tx.category }}
              </span>
            </td>
            <!-- Amount -->
            <td class="px-6 py-4 text-right font-extrabold" :class="tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'">
              {{ tx.type === 'income' ? '+' : '-' }}${{ tx.amount.toFixed(2) }}
            </td>
            <!-- Actions -->
            <td class="px-6 py-4 text-center whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <button 
                  @click="openEditModal(tx)"
                  class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <Edit class="w-4 h-4" />
                </button>
                <button 
                  @click="confirmDelete(tx.id)"
                  class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal Overlay -->
    <div 
      v-if="isEditModalOpen" 
      class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 transform transition-all scale-100">
        <div class="flex justify-between items-center mb-5">
          <h3 class="font-bold text-slate-800 text-lg">Modify Transaction</h3>
          <button @click="closeEditModal" class="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleEditSubmit" class="space-y-4">
          <!-- Description -->
          <div>
            <label for="edit-desc" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
            <input
              id="edit-desc"
              v-model="editForm.description"
              type="text"
              required
              class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Amount -->
          <div>
            <label for="edit-amount" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Amount ($)</label>
            <input
              id="edit-amount"
              v-model.number="editForm.amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Type -->
          <div>
            <label for="edit-type" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Type</label>
            <select
              id="edit-type"
              v-model="editForm.type"
              class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <!-- Category -->
          <div>
            <label for="edit-category" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
            <select
              id="edit-category"
              v-model="editForm.category"
              class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <!-- Date -->
          <div>
            <label for="edit-date" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Date</label>
            <input
              id="edit-date"
              v-model="editForm.date"
              type="date"
              required
              class="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- Submit buttons -->
          <div class="flex gap-3 pt-3">
            <button
              type="button"
              @click="closeEditModal"
              class="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm rounded-xl py-2.5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl py-2.5 shadow-md shadow-indigo-600/10 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Edit, Trash2, X } from 'lucide-vue-next';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  created_at: string;
}

const props = defineProps<{
  transactions: Transaction[];
}>();

const emit = defineEmits<{
  filter: [filters: { type: string; category: string }];
  delete: [id: string];
  edit: [id: string, data: { description: string; amount: number; type: 'income' | 'expense'; category: string; date: string }];
}>();

const localType = ref('all');
const localCategory = ref('');

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

function onFilterChange() {
  emit('filter', {
    type: localType.value,
    category: localCategory.value,
  });
}

function formatDate(dateStr: string) {
  // Format: YYYY-MM-DD
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (err) {
    return dateStr;
  }
}

function confirmDelete(id: string) {
  if (window.confirm('Are you sure you want to delete this transaction record?')) {
    emit('delete', id);
  }
}

// Edit Modal Logic
const isEditModalOpen = ref(false);
const activeEditId = ref<string | null>(null);
const editForm = ref({
  description: '',
  amount: 0,
  type: 'expense' as 'income' | 'expense',
  category: 'food',
  date: '',
});

function openEditModal(tx: Transaction) {
  activeEditId.value = tx.id;
  editForm.value = {
    description: tx.description,
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
    date: tx.date,
  };
  isEditModalOpen.value = true;
}

function closeEditModal() {
  isEditModalOpen.value = false;
  activeEditId.value = null;
}

function handleEditSubmit() {
  if (activeEditId.value === null) return;
  
  emit('edit', activeEditId.value, {
    description: editForm.value.description.trim(),
    amount: Number(editForm.value.amount),
    type: editForm.value.type,
    category: editForm.value.category,
    date: editForm.value.date,
  });
  
  closeEditModal();
}
</script>
