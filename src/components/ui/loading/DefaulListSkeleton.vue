<script setup lang="ts">

</script>

<template>

  <ul class="skeleton skeleton-default-list flex row">
    <li class="skeleton-default-list__item col-4 position-relative"
        v-for="_ in 9"
    >
      <div class="skeleton-default-list__title">
        <div></div>
      </div>

      <div class="skeleton-default-list__info">
        <div class="skeleton-default-list__date"></div>
        <div class="skeleton-default-list__tech-title"></div>
        <ul class="skeleton-default-list__technologies flex row">
          <li class="col-4"></li>
          <li class="col-4"></li>
          <li class="col-4"></li>
        </ul>
      </div>

      <div class="skeleton-default-list__like position-absolute"></div>
    </li>
  </ul>

</template>