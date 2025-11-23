<template>
  <div class="bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl shadow-slate-950/50 p-4 sm:p-6 flex flex-col h-[75vh] w-full">
    <div class="flex justify-between items-center pb-4 border-b border-slate-700 gap-4">
      <h2 class="text-xl font-bold text-sky-400 truncate">Query Your Documents</h2>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button 
          @click="$emit('reset')" 
          class="text-sm bg-red-800/70 hover:bg-red-700 text-red-200 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          title="Forget all uploaded files and start over"
        >
          Start Over
        </button>
        <button @click="$emit('back')" class="text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-2 px-4 rounded-lg transition-colors">
          Back to Uploader
        </button>
      </div>
    </div>

    <div v-if="uploadedFiles.length > 0" class="py-4 border-b border-slate-700">
      <button 
        @click="isFileListVisible = !isFileListVisible"
        class="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-sky-400 transition-colors w-full"
      >
        <FolderOpenIcon class="w-5 h-5" />
        <span>View {{ uploadedFiles.length }} Uploaded Files</span>
      </button>
      <div v-if="isFileListVisible" class="mt-3 pl-4 max-h-32 overflow-y-auto space-y-2">
        <div v-for="fileState in uploadedFiles" :key="fileState.metadata.name" class="flex items-center gap-2 text-sm text-slate-400">
          <FileIcon class="w-4 h-4 flex-shrink-0" />
          <span class="truncate" :title="fileState.metadata.name">{{ fileState.metadata.name }}</span>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto py-6 pr-2 space-y-6" ref="messagesContainer">
      <ChatMessage v-for="(msg, index) in messages" :key="index" :message="msg" />
    </div>

    <div class="mt-auto pt-4 border-t border-slate-700 flex items-center gap-4">
      <input
        type="text"
        v-model="input"
        @keypress.enter="handleSend"
        placeholder="Ask a question about your files..."
        :disabled="isQuerying || uploadedFiles.length === 0"
        class="flex-1 bg-slate-900 border border-slate-600 rounded-lg py-3 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors disabled:bg-slate-800 disabled:cursor-not-allowed"
      />
      <button
        @click="handleSend"
        :disabled="isQuerying || !input.trim() || uploadedFiles.length === 0"
        class="bg-sky-600 text-white p-3 rounded-lg shadow-lg shadow-sky-900/50 hover:bg-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-500/50 transform hover:scale-105 transition-all duration-300 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        <PaperAirplaneIcon class="w-6 h-6" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue';
import { type ChatMessage as ChatMessageType, type FileUploadState, MessageSender } from "../types/types";

import { queryFileSearchStore } from '../utils/fileSearchService';
import ChatMessage from './ChatMessage.vue';
import PaperAirplaneIcon from './icons/PaperAirplaneIcon.vue';
import FolderOpenIcon from './icons/FolderOpenIcon.vue';
import FileIcon from './icons/FileIcon.vue';

const props = defineProps<{
  uploadedFiles: FileUploadState[];
}>();

defineEmits(['back', 'reset']);

const messages = ref<ChatMessageType[]>([]);
const input = ref('');
const isQuerying = ref(false);
const isFileListVisible = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

// Initialize messages
if (props.uploadedFiles.length > 0) {
  messages.value.push({ 
    sender: MessageSender.AI, 
    text: "I'm ready to answer questions about your files. How can I help you?" 
  });
} else {
  messages.value.push({ 
    sender: MessageSender.AI, 
    text: "It looks like you haven't uploaded any files yet. Please go back to upload some." 
  });
}

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

watch(messages, scrollToBottom, { deep: true });
onMounted(scrollToBottom);

const handleSend = async () => {
  const trimmedInput = input.value.trim();
  if (!trimmedInput || isQuerying.value || props.uploadedFiles.length === 0) return;

  const userMessage: ChatMessageType = { sender: MessageSender.USER, text: trimmedInput };
  const aiMessagePlaceholder: ChatMessageType = { sender: MessageSender.AI, text: '', isLoading: true };

  messages.value.push(userMessage);
  messages.value.push(aiMessagePlaceholder);
  input.value = '';
  isQuerying.value = true;

  try {
    const onChunk = (chunk: string) => {
      const lastMessage = messages.value[messages.value.length - 1];
      if (lastMessage && lastMessage.sender === MessageSender.AI) {
        lastMessage.text += chunk;
      }
      scrollToBottom();
    };
    
    await queryFileSearchStore(trimmedInput, props.uploadedFiles, onChunk);

  } catch (error) {
    const errorMessageText = error instanceof Error ? error.message : "An unknown error occurred during the query.";
    // Remove the placeholder or update it? 
    // The React code appended a new error message. I'll update the placeholder to be the error or append.
    // React code: setMessages(prev => [...prev.slice(0, -1), errorMessage]);
    // So it replaced the placeholder.
    messages.value.pop(); // remove placeholder
    messages.value.push({ sender: MessageSender.AI, text: `Sorry, I encountered an error: ${errorMessageText}`, isLoading: false });
  } finally {
    isQuerying.value = false;
    const lastMessage = messages.value[messages.value.length - 1];
    if (lastMessage && lastMessage.sender === MessageSender.AI) {
      lastMessage.isLoading = false;
    }
  }
};
</script>
