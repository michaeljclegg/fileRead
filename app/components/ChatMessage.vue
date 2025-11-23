<template>
  <div :class="['flex w-full', isUser ? 'justify-end' : 'justify-start']">
    <div 
      :class="[
        'max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-4 shadow-md text-sm sm:text-base leading-relaxed',
        isUser 
          ? 'bg-sky-600 text-white rounded-br-none' 
          : 'bg-slate-700 text-slate-200 rounded-bl-none border border-slate-600'
      ]"
    >
      <div v-if="message.isLoading && !message.text" class="flex space-x-2 h-6 items-center">
        <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
        <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
        <div class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
      </div>
      <div v-else class="whitespace-pre-wrap markdown-body">
        <!-- We can use a markdown renderer here if needed, for now just text -->
        {{ message.text }}
        <span v-if="message.isLoading" class="inline-block w-1.5 h-4 ml-1 align-middle bg-sky-400 animate-pulse"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type ChatMessage, MessageSender } from "../types/types";


const props = defineProps<{
  message: ChatMessage;
}>();

const isUser = computed(() => props.message.sender === MessageSender.USER);
</script>
