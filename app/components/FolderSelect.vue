<template>
  <div class="flex flex-col items-center justify-center p-8 sm:p-12 border-2 border-dashed border-slate-600 rounded-xl text-center transition-colors duration-300 hover:border-sky-500 hover:bg-slate-800/60">
    <FolderIcon class="w-16 h-16 text-slate-500 mb-4" />
    <h2 class="text-xl font-semibold text-slate-200 mb-2">Start by selecting a folder</h2>
    <p class="text-slate-400 mb-6 max-w-sm">
      Click the button below to choose a folder from your device. All files within it will be listed and prepared for processing.
    </p>
    
    <input
      type="file"
      ref="inputRef"
      @change="handleChange"
      class="hidden"
      webkitdirectory
      directory
      multiple
    />

    <button
      @click="handleClick"
      class="bg-sky-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-sky-900/50 hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/50 transform hover:scale-105 transition-all duration-300"
    >
      Select Folder
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FolderIcon from './icons/FolderIcon.vue';

const emit = defineEmits<{
  (e: 'filesSelected', files: FileList): void
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const handleClick = () => {
  inputRef.value?.click();
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    emit('filesSelected', target.files);
  }
};
</script>
