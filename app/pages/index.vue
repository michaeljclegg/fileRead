<template>
  <div
    class="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-sky-500/30"
  >
    <div
      class="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 h-screen flex flex-col"
    >
      <!-- Header -->
      <header class="mb-8 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="bg-gradient-to-br from-sky-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-sky-900/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <title>File Search AI Icon</title>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <div
            class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-red-800"
          >
            Index Files AI
          </div>
        </div>
        <div class="text-[14px] font-bold text-slate-600 mr-4">
          version 1.03
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 flex flex-col min-h-0">
        <transition name="fade" mode="out-in">
          <!-- Upload View -->
          <div
            v-if="view === 'upload'"
            class="flex flex-col h-full space-y-6"
            key="upload"
          >
            <div class="space-y-4">
              <FolderSelect
                @filesSelected="handleFilesSelected"
                :compact="uploadedFiles.length > 0"
                :folderName="selectedFolderName"
              />

              <!-- Load from Firestore Button -->
              <div class="flex items-center gap-4">
                <div class="flex-1 border-t border-slate-700"></div>
                <span class="text-slate-500 text-sm">OR</span>
                <div class="flex-1 border-t border-slate-700"></div>
              </div>

              <button
                @click="handleLoadFromFirestore"
                :disabled="isLoadingFromFirestore"
                class="w-full px-6 py-3 bg-gradient-to-r from-slate-600 to-indigo-600 hover:from-gray-700 hover:to-gray-500 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg
                  v-if="!isLoadingFromFirestore"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                <svg
                  v-else
                  class="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{{
                  isLoadingFromFirestore
                    ? "Loading from Firestore..."
                    : "Load from Firestore"
                }}</span>
              </button>
            </div>

            <div
              v-if="uploadedFiles.length > 0"
              class="flex-1 flex flex-col min-h-0 bg-slate-800/50 rounded-xl border border-slate-700 p-6 space-y-6"
            >
              <div class="flex-1 overflow-hidden">
                <FileList :files="uploadedFiles" @remove="handleRemoveFile" />
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
import { ref, computed, onMounted } from "vue";
import { type FileUploadState, UploadStatus } from "../types/types";
import {
  fetchFilesFromFirestore,
  uploadFileToFirebase,
} from "../utils/fileSearchService";

const view = ref<"upload" | "chat">("upload");
const uploadedFiles = ref<FileUploadState[]>([]);
const isProcessing = ref(false);
const progress = ref(0);
const isLoadingFromFirestore = ref(false);
const selectedFolderName = ref<string>("");

const processedCount = computed(
  () =>
    uploadedFiles.value.filter((f) => f.status === UploadStatus.SUCCESS).length
);

// Removed auto-load from onMounted - files are now loaded manually via button

const handleFilesSelected = (fileList: FileList) => {
  // Extract folder name from the first file's path
  if (fileList.length > 0) {
    const firstFile = fileList[0];
    if (firstFile) {
      const path = firstFile.webkitRelativePath || firstFile.name;
      // Get the folder name (first part of the path)
      const folderName = path.split("/")[0];
      selectedFolderName.value = folderName || "";
    }
  }

  const newFiles: FileUploadState[] = Array.from(fileList).map((file) => ({
    file,
    status: UploadStatus.PENDING,
    metadata: {
      name: file.name,
      size: file.size,
      type: file.type,
      path: file.webkitRelativePath || file.name,
    },
  }));
  uploadedFiles.value = [...uploadedFiles.value, ...newFiles];
};

const handleLoadFromFirestore = async () => {
  isLoadingFromFirestore.value = true;
  try {
    const files = await fetchFilesFromFirestore();
    // Add files from Firestore to the existing list, avoiding duplicates
    const existingIds = new Set(
      uploadedFiles.value.map((f) => f.metadata.id).filter(Boolean)
    );
    const newFiles = files.filter((f) => !existingIds.has(f.metadata.id));
    uploadedFiles.value = [...uploadedFiles.value, ...newFiles];
  } catch (error) {
    console.error("Error loading files from Firestore:", error);
  } finally {
    isLoadingFromFirestore.value = false;
  }
};

const handleRemoveFile = (index: number) => {
  uploadedFiles.value.splice(index, 1);
};

const handleClear = () => {
  uploadedFiles.value = [];
  progress.value = 0;
};

const handleReset = () => {
  handleClear();
  view.value = "upload";
};

const handleProcess = async () => {
  if (uploadedFiles.value.length === 0) return;

  isProcessing.value = true;
  progress.value = 0;

  const total = uploadedFiles.value.length;

  // Simulate processing (in reality, we just mark them as ready for the AI service)
  for (let i = 0; i < total; i++) {
    // Skip if already uploaded or no file object (loaded from Firestore)
    if (
      uploadedFiles.value[i].status === UploadStatus.SUCCESS ||
      !uploadedFiles.value[i].file
    ) {
      continue;
    }

    uploadedFiles.value[i].status = UploadStatus.UPLOADING;

    try {
      // Upload to Firebase
      const metadata = await uploadFileToFirebase(
        uploadedFiles.value[i].file!,
        (progress) => {
          uploadedFiles.value[i].progress = progress;
        }
      );
      uploadedFiles.value[i].metadata = metadata;
      uploadedFiles.value[i].status = UploadStatus.SUCCESS;
    } catch (error) {
      console.error("Upload failed:", error);
      uploadedFiles.value[i].status = UploadStatus.ERROR;
      uploadedFiles.value[i].error =
        error instanceof Error ? error.message : "Upload failed";
    }

    progress.value = ((i + 1) / total) * 100;
  }

  isProcessing.value = false;
  view.value = "chat";
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
