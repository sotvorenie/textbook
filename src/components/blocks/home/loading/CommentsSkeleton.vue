<script setup lang="ts">

</script>

<template>

  <div class="skeleton skeleton-comments">
    <div class="skeleton-comments__title line line__background loading-line h-30"></div>
    <ul class="skeleton-comments__list">
      <li v-for="_ in [1,2]"
          class="skeleton-comments__item line line__background loading-line"
      ></li>
    </ul>
  </div>

</template>