<script setup lang="ts">
import {onBeforeMount, onMounted, onUnmounted} from "vue";

import {useTheme} from "./utils/theme.ts";

import SnowFall from "./components/ui/winter/SnowFall.vue";
import Garland from "./components/ui/winter/Garland.vue";

import useUIStore from "./store/useUIStore.ts";
const uiStore = useUIStore();

const {getTheme} = useTheme()

const handleTab = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    const target = e.target as HTMLElement

    if (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'text')) {
      e.preventDefault()
      const el = target as HTMLTextAreaElement | HTMLInputElement
      const start = el.selectionStart ?? 0
      const end = el.selectionEnd ?? 0

      const value = el.value;
      el.value = value.substring(0, start) + '\t' + value.substring(end)

      el.selectionStart = el.selectionEnd = start + 1
    } else {
      e.preventDefault()
    }
  }
}

onBeforeMount(() => {
  uiStore.setWinterUiVisible()
})

onMounted(() => {
  document.addEventListener('keydown', handleTab)

  getTheme()
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleTab)
})
</script>

<template>
  <SnowFall v-if="uiStore.winterUiVisible && uiStore.snowVisible"/>
  <Garland v-if="uiStore.winterUiVisible && uiStore.garlandVisible"/>

  <router-view/>
</template>