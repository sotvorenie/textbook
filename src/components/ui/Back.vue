<script setup lang="ts">

import Btn from "./Btn.vue";
import Arrow from "../../assets/icons/Arrow.vue";
</script>

<template>

  <Btn class="button-width-svg recolor-svg button-small">
    <Arrow/> назад
  </Btn>

</template>

<style scoped lang="scss">
svg {
  width: 30px;
  height: auto;
}
button {
  column-gap: 10px;
}
</style>