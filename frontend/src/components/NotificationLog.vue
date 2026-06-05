<script setup lang="ts">
interface Props {
  notifications: string[];
}

defineProps<Props>();
</script>

<template>
  <div class="bg-white p-5 rounded-lg shadow">
    <h2 class="text-xl font-bold mb-4">Notification Log</h2>

    <ul v-if="notifications.length > 0" class="space-y-2">
      <li
        v-for="(log, index) in notifications"
        :key="index"
        class="flex items-center gap-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500"
      >
        <span class="text-blue-600">ℹ</span>
        <span class="text-gray-700">{{ log }}</span>
      </li>
    </ul>

    <div v-else class="text-gray-500 text-center py-4">
      No notifications yet
    </div>
  </div>
</template>
