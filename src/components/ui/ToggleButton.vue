<script setup lang="ts">

defineProps({
  active: {
    type: Boolean,
    default: true
  }
})

</script>

<template>
  <div class="toggle-button flex flex-align-center">
    <button :class="{
              'toggle-button__btn': true,
              'is-active': active
            }"
            type="button"></button>
  </div>
</template>