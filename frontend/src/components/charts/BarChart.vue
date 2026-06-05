<template>
  <div class="relative w-full h-full min-h-[260px] flex items-center justify-center">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | CanvasGradient;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  }[];
}

const props = defineProps<{
  data: ChartData;
  options?: any;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

function renderChart() {
  if (!canvasRef.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = canvasRef.value.getContext('2d');
  if (!ctx) return;

  // Generate a beautiful subtle gradient for backdrops if none specified
  let bgGradient = props.data.datasets[0]?.backgroundColor;
  if (!bgGradient) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, '#6366f1'); // Indigo 500
    gradient.addColorStop(1, '#a855f7'); // Purple 500
    bgGradient = gradient;
  }

  const updatedDatasets = props.data.datasets.map((ds) => ({
    ...ds,
    backgroundColor: ds.backgroundColor || bgGradient,
    borderRadius: ds.borderRadius ?? 8,
    borderWidth: ds.borderWidth ?? 0,
  }));

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.data.labels,
      datasets: updatedDatasets as any,
    },
    options: props.options || {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: { family: 'Inter, system-ui', size: 11, weight: '500' },
            color: '#64748b',
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: '#94a3b8',
            font: { family: 'Inter, system-ui', size: 10 },
          },
        },
        y: {
          border: { dash: [4, 4] },
          grid: { color: '#e2e8f0' },
          ticks: {
            color: '#94a3b8',
            font: { family: 'Inter, system-ui', size: 10 },
          },
        },
      },
    },
  });
}

watch(
  () => props.data,
  () => {
    renderChart();
  },
  { deep: true }
);

onMounted(() => {
  renderChart();
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
  }
});
</script>
