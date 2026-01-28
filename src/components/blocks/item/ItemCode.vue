<script setup lang="ts">

import Btn from "../../ui/Btn.vue";

defineProps({
  text: String,
})

const emits = defineEmits(['copy'])

</script>

<template>

  <div class="item__code position-relative mb-not-last-20">
    <pre v-html="text" />

    <Btn class="position-absolute button-small"
         @click="emits('copy', text)"
    >
      Копировать
    </Btn>
  </div>

</template>