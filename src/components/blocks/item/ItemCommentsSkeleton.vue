<script setup lang="ts">

</script>

<template>

  <div class="skeleton skeleton-comments">
    <div class="skeleton-comments__title line line__background loading-line h-30 mb-20"></div>
    <ul class="skeleton-comments__list">
      <li v-for="_ in [1,2]"
          :key="_"
          class="skeleton-comments__item line line__background loading-line mb-not-last-10"
      ></li>
    </ul>
  </div>

</template>