<script setup lang="ts">

</script>

<template>

  <div class="skeleton skeleton-default-item">
    <div class="skeleton-default-item__title line line__background h-30"></div>
    <div class="skeleton-default-item__slider flex">
      <div class="line__background" v-for="_ in 3"></div>
    </div>
    <div class="skeleton-default-item__text line line__background h-20" v-for="_ in 5"></div>
    <div class="skeleton-default-item__code line line__background"></div>
  </div>

</template>