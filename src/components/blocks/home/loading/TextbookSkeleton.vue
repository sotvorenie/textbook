<script setup lang="ts">

</script>

<template>

  <div class="skeleton skeleton-default-item">
    <div class="skeleton-default-item__title line line__background h-30 mb-20"></div>
    <div class="skeleton-default-item__slider flex mb-20">
      <div class="line__background" v-for="_ in 3" :key="_"></div>
    </div>
    <div class="skeleton-default-item__text line line__background h-20 mb-10"
         v-for="_ in 5"
         :key="_"
    ></div>
    <div class="skeleton-default-item__code line line__background mb-10"></div>
  </div>

</template>