<script setup lang="ts">

import {isDevelopingFox} from "../../../../data/base64/inDevelopingFox.ts";

</script>

<template>

  <div class="flex-center flex-column">
    <img :src="isDevelopingFox" alt="в разработке..">
    <p>В разработке..</p>
  </div>

</template>

<style scoped>

img {
  width: 60%;
}

p {
  font-size: 26px;
}

</style>