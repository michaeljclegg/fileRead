<template>
  <button
    @click="onProcess"
    :disabled="!canProcess"
    class="w-full sm:w-auto bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-sky-900/50 hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/50 transform hover:scale-105 transition-all duration-300 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
  >
    {{ isProcessing ? 'Processing...' : 'Process Files' }}
  </button>
  <button
    @click="onClear"
    :disabled="isProcessing"
    class="w-full sm:w-auto bg-slate-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-slate-500 focus:outline-none focus:ring-4 focus:ring-slate-500/50 transition-colors duration-300 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
  >
    Clear Selection
  </button>
</template>

<script setup lang="ts">
defineProps<{
  onProcess: () => void;
  onClear: () => void;
  canProcess: boolean;
  isProcessing: boolean;
}>();
</script>
