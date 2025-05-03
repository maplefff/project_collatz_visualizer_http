<script setup>
import { computed, ref } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale, // X 軸
  LinearScale,   // Y 軸
  PointElement,  // 點
  LineElement,   // 線
  Title,         // 標題
  Tooltip,       // 提示框
  Legend         // 圖例
} from 'chart.js';

// 註冊 Chart.js 需要的元件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 定義接收的 props
const props = defineProps({
  sequenceData: {
    type: Array,
    required: true,
    default: () => [] // 默認空陣列
  },
  isDarkMode: {
      type: Boolean,
      required: false,
      default: false
  }
});

// --- Color Definitions ---
const lightModeColors = {
    grid: 'rgba(0, 0, 0, 0.1)',
    ticks: '#666',
    title: '#333',
    legend: '#333',
    line: '#f87979'
};

const darkModeColors = {
    grid: 'rgba(255, 255, 255, 0.1)',
    ticks: '#ccc',
    title: '#eee',
    legend: '#eee',
    line: '#ff8a8a' // Slightly brighter line for dark mode
};
// -----------------------

// Use computed properties for reactive data and options
const chartData = computed(() => {
    const colors = props.isDarkMode ? darkModeColors : lightModeColors;
    console.log('Computing chartData. Dark mode:', props.isDarkMode);
    return {
        labels: props.sequenceData.map((_, index) => `Step ${index + 1}`),
        datasets: [
            {
                label: 'Collatz Sequence',
                backgroundColor: colors.line,
                borderColor: colors.line,
                data: props.sequenceData,
                fill: false,
                tension: 0.1,
                pointBackgroundColor: colors.line,
                pointBorderColor: colors.line
            }
        ]
    };
});

const chartOptions = computed(() => {
    const colors = props.isDarkMode ? darkModeColors : lightModeColors;
    console.log('Computing chartOptions. Dark mode:', props.isDarkMode);
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: colors.legend
                }
            },
            title: {
                display: true,
                text: 'Collatz Sequence Visualization',
                color: colors.title
            },
            tooltip: {},
            chartArea: {
                backgroundColor: props.isDarkMode ? '#1e1e1e' : 'white' 
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: colors.ticks
                },
                grid: {
                    color: colors.grid
                }
            },
            x: {
                ticks: {
                    color: colors.ticks
                },
                grid: {
                    color: colors.grid
                }
            }
        }
    };
});

</script>

<template>
  <div :class="{ 'chart-wrapper-dark': isDarkMode }">
    <Line
      v-if="sequenceData && sequenceData.length > 0"
      :data="chartData"     
      :options="chartOptions" 
    />
    <p v-else class="no-data-message">No sequence data to display.</p>
  </div>
</template>

<style scoped>
div {
  height: 400px; /* Or adjust as needed */
  position: relative;
  border: 1px solid #eee; /* Restore border for light mode */
  padding: 10px; /* Restore padding for light mode */
  border-radius: 4px;
  background-color: white; /* Restore default light background */
  transition: background-color 0.3s ease, border-color 0.3s ease, padding 0.3s ease;
}

.chart-wrapper-dark {
    border-color: #444; /* Restore dark border color */
    /* padding: 0; */ /* Remove this override, let it inherit base padding */
    padding: 10px; /* Explicitly restore padding for dark mode too */
    background-color: #2a2a2a; /* Restore explicit dark background */
    /* background-color: transparent; */ /* Remove transparent background */
}

.no-data-message {
    text-align: center;
    padding-top: 50px;
    color: #888; /* Default color for no data message */
}

.chart-wrapper-dark .no-data-message {
    color: #aaa; /* Lighter color for dark mode */
}
</style> 