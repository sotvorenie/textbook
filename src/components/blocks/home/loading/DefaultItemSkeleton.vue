<script setup lang="ts">

</script>

<template>

  <div class="skeleton skeleton-default-item">
    <div class="skeleton-default-item__title line line__background loading-line h-30 mb-20"></div>
    <div class="skeleton-default-item__text line line__background loading-line h-20"
         v-for="_ in 5"
         :key="_"
    ></div>
    <div class="skeleton-default-item__code line line__background loading-line mb-10"></div>
    <div class="skeleton-default-item__text line line__background loading-line h-20 mb-10"
         v-for="_ in 3"
         :key="_"
    ></div>
  </div>

</template>