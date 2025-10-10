<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";

const handleTab = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    const target = e.target as HTMLElement;

    if (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'text')) {
      e.preventDefault();
      const el = target as HTMLTextAreaElement | HTMLInputElement;
      const start = el.selectionStart ?? 0;
      const end = el.selectionEnd ?? 0;

      const value = el.value;
      el.value = value.substring(0, start) + '\t' + value.substring(end);

      el.selectionStart = el.selectionEnd = start + 1;
    } else {
      e.preventDefault();
    }
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleTab);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleTab);
});
</script>

<template>
  <router-view/>
</template>