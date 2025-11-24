<template>
  <div class="space-y-3 max-h-96 overflow-y-auto pr-2 rounded-lg">
    <h3 class="text-lg font-semibold text-slate-300 px-2">Files to Process</h3>
    <FileListItem
      v-for="(fileState, index) in files"
      :key="fileState.metadata.path"
      v-bind="fileState"
      @remove="$emit('remove', index)"
    />
  </div>
</template>

<script setup lang="ts">
import { type FileUploadState } from "../types/types";
import FileListItem from "./FileListItem.vue";

defineProps<{
  files: FileUploadState[];
}>();

defineEmits<{
  (e: "remove", index: number): void;
}>();
</script>
