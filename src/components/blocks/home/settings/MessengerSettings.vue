<script setup lang="ts">

</script>

<template>

  <a class="messenger__user user flex flex-align-center position-relative">
    <button class="messenger__ava user__ava img-container" type="button">
      <img src="../../../../../public/ava.webp" loading="lazy" alt="user"/>
    </button>

    <div class="messenger__user-about">
      <p class="messenger__user-name user__name">Диана Лисингтон</p>
      <p class="messenger__user-time">Онлайн</p>
    </div>

    <div class="messenger__online position-absolute"></div>
  </a>

</template>