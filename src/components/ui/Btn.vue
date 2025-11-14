<script setup lang="ts">

import Loading from "./Loading.vue";

defineProps({
  isSubmit: {
    type: Boolean,
    default: false,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

</script>

<template>
  <button class="button position-relative"
          :type="isSubmit ? 'submit' : 'button'"
          :disabled="isDisabled || isLoading"
  >
    <span :style="{opacity: isLoading ? '0' : '100'}">
      <slot/>
    </span>
    <Loading v-if="isLoading"/>
  </button>
</template>