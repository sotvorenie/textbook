<script setup lang="ts">

</script>

<template>

  <div class="skeleton skeleton-statistics mb-30">
    <div class="skeleton-statistics__title line line__background loading-line h-30 mb-20"></div>
    <ul class="skeleton-statistics__list">
      <li v-for="_ in [1,2,3]"
          :key="_"
          class="skeleton-statistics__item line line__background loading-line h-20 mb-not-last-10"
      ></li>
    </ul>
  </div>

</template>