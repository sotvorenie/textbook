<script setup lang="ts">

import {emptyList} from "../../../../data/base64/emptyListFox.ts";

</script>

<template>

  <div class="flex-center flex-column">
    <img :src="emptyList" alt="Пусто..">

    <p>Список пуст..</p>
  </div>

</template>

<style scoped>

div {
  margin-top: -5vw;
}

img {
  width: 60%;
  margin-bottom: -8vw;
  filter: brightness(.95);
}

p {
  font-size: 26px;
}
</style>