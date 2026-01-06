<script setup lang="ts">

import {theme, changeTheme} from "../../utils/theme.ts";

import ToggleButton from "../ui/ToggleButton.vue";

import Moon from "../../assets/icons/Moon.vue";
import Offline from "../../assets/icons/Offline.vue";
import Online from "../../assets/icons/Online.vue";
import Arrow from "../../assets/icons/Arrow.vue";
import Reload from "../../assets/icons/Reload.vue";
import Sun from "../../assets/icons/Sun.vue";

import Loading from "../ui/loading/Loading.vue";

import useOnlineStore from "../../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();

defineProps({
  backVisible: {
    type: Boolean,
    default: true
  },
  isAbsolute: {
    type: Boolean,
    default: true
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
})

const locationReload = () => {
  window.location.reload();
}
</script>

<template>
  <div :class="{
          'navigation flex flex-align-center': true,
          'flex-wrap': !backVisible,
          'position-absolute': isAbsolute,
        }">
    <button class="navigation__btn back recolor-svg flex flex-align-center"
            type="button"
            v-if="backVisible"
            :disabled="isDisabled"
    >
      <Arrow/>
      назад
    </button>
    <button class="navigation__btn reload recolor-svg"
            type="button"
            title="Перезагрузить страницу"
            @click="locationReload"
            :disabled="isDisabled"
    ><Reload/></button>
    <button class="navigation__btn theme recolor-svg flex flex-align-center"
            title="Изменить цветовую схему"
            type="button"
            :disabled="isDisabled"
    >
      <Moon/>
      <ToggleButton :active="theme === 'light'" @click="changeTheme"/>
      <Sun/>
    </button>

    <button class="navigation__btn position-relative"
            title="Оффлайн/Онлайн режим"
            type="button"
            v-if="onlineStore.isOnline"
            :disabled="isDisabled"
    >
      <span class="online flex flex-align-center" :style="{opacity: onlineStore.modeLoadingVisible ? '0' : '1'}">
        <Offline/>
        <ToggleButton :active="onlineStore.isOnlineMode"
                      @click="onlineStore.changeMode"
        />
        <Online/>
      </span>

      <Loading class="navigation__loading position-absolute" v-if="onlineStore.modeLoadingVisible"/>
    </button>
  </div>
</template>