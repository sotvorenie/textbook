<script setup lang="ts">

defineProps({
  theme: {
    type: String,
    default: 'dark'
  }
})

</script>

<template>
  <div class="toggle-button flex flex-align-center">
    <button :class="{
              'toggle-button__btn': true,
              'is-active': theme === 'light'
            }"
            type="button"></button>
  </div>
</template>