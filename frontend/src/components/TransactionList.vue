<script setup lang="ts">
interface Transaction {
  id: number;
  desc: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

interface Props {
  transactions: Transaction[];
  filterType: string;
}

const emit = defineEmits<{
  delete: [id: number];
}>();

defineProps<Props>();

const getTypeColor = (type: string) => {
  return type === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold';
};
</script>

<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <table class="w-full">
      <thead class="bg-gray-100 border-b-2 border-gray-300">
        <tr>
          <th class="p-3 text-left font-semibold">Description</th>
          <th class="p-3 text-center font-semibold">Amount</th>
          <th class="p-3 text-center font-semibold">Type</th>
          <th class="p-3 text-center font-semibold">Date</th>
          <th class="p-3 text-center font-semibold">Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="item in transactions" :key="item.id" class="border-t hover:bg-gray-50 transition">
          <td class="p-3">{{ item.desc }}</td>
          <td class="p-3 text-center">${{ item.amount.toFixed(2) }}</td>
          <td class="p-3 text-center" :class="getTypeColor(item.type)">
            {{ item.type.charAt(0).toUpperCase() + item.type.slice(1) }}
          </td>
          <td class="p-3 text-center">{{ item.date }}</td>
          <td class="p-3 text-center">
            <button
              @click="emit('delete', item.id)"
              class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition font-medium text-sm"
            >
              Delete
            </button>
          </td>
        </tr>

        <tr v-if="transactions.length === 0">
          <td colspan="5" class="p-4 text-center text-gray-500">
            No transactions found
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
