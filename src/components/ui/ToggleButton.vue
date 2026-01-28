<script setup lang="ts">

defineProps({
  active: {
    type: Boolean,
    default: true
  },
  setAccentColor: {
    type: Boolean,
    default: false,
  },
})

</script>

<template>
  <div :class="{
          'toggle-button flex flex-align-center': true,
          'is-accent': active && setAccentColor,
        }"
  >
    <button :class="{
              'toggle-button__btn': true,
              'is-active': active,
              'is-accent': active && setAccentColor,
            }"
            type="button"></button>
  </div>
</template>