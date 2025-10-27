<script setup lang="ts">

import {empty} from "../../../../data/base64/sleepFox.ts";

</script>

<template>

  <div class="flex-center flex-column">
    <img :src="empty" alt="Пусто..">

    <p>Выбери раздел и начни работу)</p>
  </div>

</template>

<style scoped>

  div {
    margin-top: -5vw;
    width: 100%;
  }

  img {
    width: 60%;
    margin-bottom: -8vw;
  }

  p {
    font-size: 26px;
  }
</style>