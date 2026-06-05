<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  description: string;
  amount: string;
  type: string;
}

const emit = defineEmits<{
  submit: [description: string, amount: string, type: string];
}>();

const props = defineProps({
  description: {
    type: String,
    default: ''
  },
  amount: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'income'
  }
});

const desc = ref(props.description);
const amount = ref(props.amount);
const type = ref(props.type);

function handleSubmit() {
  if (!desc.value.trim() || !amount.value) return;

  emit('submit', desc.value, amount.value, type.value);

  desc.value = '';
  amount.value = '';
  type.value = 'income';
}
</script>

<template>
  <div class="bg-white p-5 rounded-lg shadow mb-6">
    <div class="grid md:grid-cols-4 gap-4">
      <input
        v-model="desc"
        placeholder="Description"
        class="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        v-model="amount"
        type="number"
        placeholder="Amount"
        class="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <select
        v-model="type"
        class="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="income">Income</option>
        <option value="expense">Expense</option>
      </select>

      <button
        @click="handleSubmit"
        class="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition duration-200 font-medium"
      >
        Add Transaction
      </button>
    </div>
  </div>
</template>
