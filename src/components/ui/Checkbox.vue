<script setup lang="ts">

import Check from "../../assets/icons/Check.vue";

defineProps({
  checked: {
    type: Boolean,
    default: false,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['change'])

const handleChange = () => {
  emits('change');
}
</script>

<template>

  <div class="checkbox recolor-svg position-relative">
    <input type="checkbox" :checked="checked" @change="handleChange" :disabled="disabled">
    <Check class="position-absolute"/>
  </div>

</template>