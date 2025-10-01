<script setup lang="ts">

import Heart from "../../assets/icons/Heart.vue";

defineProps({
  liked: {
    type: Boolean,
    default: false
  }
})

</script>

<template>

  <Heart :class="{
            'heart': true,
            'fill': liked
          }"/>

</template>