<script setup lang="ts">

</script>

<template>

  <div class="skeleton skeleton-statistics">
    <div class="skeleton-statistics__title line line__background loading-line h-30"></div>
    <ul class="skeleton-statistics__list">
      <li v-for="_ in [1,2,3]"
          class="skeleton-statistics__item line line__background loading-line h-20"
      ></li>
    </ul>
  </div>

</template>