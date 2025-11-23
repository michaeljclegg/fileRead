<template>
  <div>
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm font-medium text-sky-300">
        {{ isProcessing ? 'Processing...' : 'Ready to Process' }}
      </span>
      <span class="text-sm font-medium text-slate-400">
        {{ processedFiles }} / {{ totalFiles }} Files
      </span>
    </div>
    <div class="w-full bg-slate-700 rounded-full h-2.5">
      <div
        class="h-2.5 rounded-full transition-all duration-500 ease-out"
        :class="isProcessing ? 'bg-sky-500' : 'bg-green-600'"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  progress: number;
  isProcessing: boolean;
  processedFiles: number;
  totalFiles: number;
}>();
</script>
