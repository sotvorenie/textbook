<script setup lang="ts">
import {onMounted, ref} from "vue";

import Arrow from "../../assets/icons/Arrow.vue";
import Reload from "../../assets/icons/Reload.vue";
import Sun from "../../assets/icons/Sun.vue";
import ToggleButton from "../ui/ToggleButton.vue";
import Moon from "../../assets/icons/Moon.vue";

defineProps({
  backVisible: {
    type: Boolean,
    default: true
  },
  isAbsolute: {
    type: Boolean,
    default: true
  }
})

const theme = ref<string>('dark');

const getTheme = () => {
  theme.value = localStorage.getItem('theme') ?? '';

  setTheme();
}

const changeTheme = () => {
  theme.value === 'dark' ? theme.value = 'light' : theme.value = 'dark';

  setTheme();

  localStorage.setItem('theme', theme.value);
}

const setTheme = () => {
  document.documentElement.setAttribute('data-theme', theme.value);
}

const locationReload = () => {
  window.location.reload();
}

onMounted(() => {
  getTheme();
})
</script>

<template>
  <div :class="{
          'navigation flex flex-align-center': true,
          'position-absolute': isAbsolute,
        }">
    <button class="navigation__btn back recolor-svg flex flex-align-center" type="button" v-if="backVisible">
      <Arrow/>
      назад
    </button>
    <button class="navigation__btn reload recolor-svg"
            type="button"
            title="Перезагрузить страницу"
            @click="locationReload"
    ><Reload/></button>
    <button class="navigation__btn theme recolor-svg flex flex-align-center"
            title="Изменить цветовую схему"
            type="button"
    >
      <Moon/>
      <ToggleButton :theme="theme" @click="changeTheme"/>
      <Sun/>
    </button>
  </div>
</template>