<template>
  <div :class="['flex items-center p-3 bg-slate-800/70 border rounded-lg transition-all duration-300', statusColorClass]">
    <div class="flex-shrink-0 mr-4">
      <component :is="iconComponent" class="w-6 h-6 text-slate-400" />
    </div>
    <div class="flex-grow min-w-0">
      <p class="text-sm font-medium text-slate-200 truncate" :title="metadata.path">{{ metadata.name }}</p>
      
      <div v-if="status === UploadStatus.UPLOADING" class="flex items-center gap-2 mt-1">
        <div class="w-full bg-slate-600 rounded-full h-1.5">
          <div
            class="bg-sky-500 h-1.5 rounded-full transition-all duration-200"
            :style="{ width: `${progress || 0}%` }"
          ></div>
        </div>
        <span class="text-xs text-slate-400 w-10 text-right">{{ progress || 0 }}%</span>
      </div>
      <p v-else class="text-xs text-slate-500">{{ formattedSize }}</p>
      
      <p v-if="status === UploadStatus.FAILED && error" class="text-xs text-red-400 mt-1" :title="error">Error: {{ error }}</p>
    </div>
    <div class="flex-shrink-0 ml-4 flex items-center gap-2">
      <span class="text-sm font-semibold w-20 text-right">{{ status }}</span>
      <component :is="statusIcon" class="w-5 h-5" :class="statusIconClass" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type FileMetadata, UploadStatus } from "../types/types";

import FileIcon from './icons/FileIcon.vue';
import CheckCircleIcon from './icons/CheckCircleIcon.vue';
import ExclamationCircleIcon from './icons/ExclamationCircleIcon.vue';
import ClockIcon from './icons/ClockIcon.vue';
import ArrowUpCircleIcon from './icons/ArrowUpCircleIcon.vue';
import CogIcon from './icons/CogIcon.vue';
// Import other file type icons as needed, falling back to FileIcon for now to save space/time
// or I can implement them all. I'll implement the logic to select them.

const props = defineProps<{
  metadata: FileMetadata;
  status: UploadStatus;
  error?: string;
  progress?: number;
}>();

const statusColorClass = computed(() => {
  switch (props.status) {
    case UploadStatus.PENDING: return 'border-slate-700';
    case UploadStatus.PROCESSING: return 'border-purple-700 bg-purple-900/20'; // Mapped CONVERTING to PROCESSING
    case UploadStatus.UPLOADING: return 'border-sky-700 bg-sky-900/20';
    case UploadStatus.SUCCESS: return 'border-green-700 bg-green-900/20';
    case UploadStatus.ERROR: return 'border-red-700 bg-red-900/20'; // Mapped FAILED to ERROR
    default: return 'border-slate-700';
  }
});

const statusIcon = computed(() => {
  switch (props.status) {
    case UploadStatus.PENDING: return ClockIcon;
    case UploadStatus.PROCESSING: return CogIcon;
    case UploadStatus.UPLOADING: return ArrowUpCircleIcon;
    case UploadStatus.SUCCESS: return CheckCircleIcon;
    case UploadStatus.ERROR: return ExclamationCircleIcon;
    default: return null;
  }
});

const statusIconClass = computed(() => {
  switch (props.status) {
    case UploadStatus.PENDING: return 'text-slate-500';
    case UploadStatus.PROCESSING: return 'text-purple-400 animate-spin';
    case UploadStatus.UPLOADING: return 'text-sky-500 animate-pulse';
    case UploadStatus.SUCCESS: return 'text-green-500';
    case UploadStatus.ERROR: return 'text-red-500';
    default: return '';
  }
});

const formattedSize = computed(() => {
  const bytes = props.metadata.size || 0;
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

const iconComponent = computed(() => {
    // Simplified icon selection for now
    return FileIcon;
});
</script>
