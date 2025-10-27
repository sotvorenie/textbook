<script setup lang="ts">
import {watch} from "vue";

const visible = defineModel();

defineProps({
  isError: {
    type: Boolean,
    default: false
  }
})

watch(visible, () => {
  if (visible.value === true) {
    setTimeout(() => {
      visible.value = false;
    }, 3000)
  }
})
</script>

<template>
  <Teleport to="body">
    <div :class="{
         'message position-absolute': true,
         'is-active': visible
        }"
         :style="{
          color: (isError ? '#fe7971' : '#59eb68')
       }"
    >
      <slot/>
    </div>
  </Teleport>
</template>