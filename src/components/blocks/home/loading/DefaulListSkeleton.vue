<script setup lang="ts">
import {onMounted, ref} from "vue";

const colElements = ref(6)

onMounted(() =>{
  if (window.innerWidth > 1440) {
    colElements.value = 12
  }
})

</script>

<template>

  <ul class="skeleton skeleton-default-list row">
    <li class="skeleton-default-list__item loading-line col-4 ds-col-3 position-relative"
        v-for="_ in colElements"
        :key="_"
    >
      <div class="skeleton-default-list__title">
        <div class="line line__background h-30"></div>
      </div>

      <div class="skeleton-default-list__info">
        <div class="skeleton-default-list__date h-20 line line__background"></div>
        <div class="skeleton-default-list__tech-title h-20 line line__background"></div>
        <ul class="skeleton-default-list__technologies flex row">
          <li class="col-4 h-30 line" v-for="_ in 3" :key="_"></li>
        </ul>
      </div>

      <div class="skeleton-default-list__like position-absolute line"></div>
    </li>
  </ul>

</template>