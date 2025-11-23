<template>
  <div class="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-sky-500/30">
    <div class="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 h-screen flex flex-col">
      
      <!-- Header -->
      <header class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="bg-gradient-to-br from-sky-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-sky-900/20">
      
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <title>File Search AI Icon</title>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-red-800">
            Index Files AI
          </h1>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-h-0">
        <transition name="fade" mode="out-in">
          
          <!-- Upload View -->
          <div v-if="view === 'upload'" class="flex flex-col h-full space-y-6" key="upload">
            <FolderSelect @filesSelected="handleFilesSelected" />
            
            <div v-if="uploadedFiles.length > 0" class="flex-1 flex flex-col min-h-0 bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-6">
              <div class="flex-1 overflow-hidden">
                <FileList :files="uploadedFiles" />
              </div>
              
              <div class="pt-4 border-t border-slate-700 space-y-4">
                <UploadProgress 
                  :progress="progress" 
                  :isProcessing="isProcessing" 
                  :processedFiles="processedCount" 
                  :totalFiles="uploadedFiles.length" 
                />
                <div class="flex gap-4">
                  <UploadControls 
                    :onProcess="handleProcess" 
                    :onClear="handleClear" 
                    :canProcess="uploadedFiles.length > 0 && !isProcessing" 
                    :isProcessing="isProcessing" 
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Chat View -->
          <ChatView 
            v-else 
            :uploadedFiles="uploadedFiles" 
            @back="view = 'upload'" 
            @reset="handleReset" 
            key="chat"
          />

        </transition>
      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { type FileUploadState, UploadStatus } from "../types/types";


const view = ref<'upload' | 'chat'>('upload');
const uploadedFiles = ref<FileUploadState[]>([]);
const isProcessing = ref(false);
const progress = ref(0);

const processedCount = computed(() => 
  uploadedFiles.value.filter(f => f.status === UploadStatus.SUCCESS).length
);

const handleFilesSelected = (fileList: FileList) => {
  const newFiles: FileUploadState[] = Array.from(fileList).map(file => ({
    file,
    status: UploadStatus.PENDING,
    metadata: {
      name: file.name,
      size: file.size,
      type: file.type,
      path: file.webkitRelativePath || file.name
    }
  }));
  uploadedFiles.value = [...uploadedFiles.value, ...newFiles];
};

const handleClear = () => {
  uploadedFiles.value = [];
  progress.value = 0;
};

const handleReset = () => {
  handleClear();
  view.value = 'upload';
};

const handleProcess = async () => {
  if (uploadedFiles.value.length === 0) return;
  
  isProcessing.value = true;
  progress.value = 0;
  
  const total = uploadedFiles.value.length;
  
  // Simulate processing (in reality, we just mark them as ready for the AI service)
  for (let i = 0; i < total; i++) {
    uploadedFiles.value[i].status = UploadStatus.UPLOADING;
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 100));
    uploadedFiles.value[i].status = UploadStatus.SUCCESS;
    progress.value = ((i + 1) / total) * 100;
  }
  
  isProcessing.value = false;
  view.value = 'chat';
};
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
