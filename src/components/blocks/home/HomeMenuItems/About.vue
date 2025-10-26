<script setup lang="ts">

import GitHub from "../../../../assets/icons/links/GitHub.vue";

const languages = [
  {
    name: 'Vue',
    icon: ''
  },
  {
    name: 'SCSS',
    icon: ''
  },
  {
    name: 'Axios',
    icon: ''
  },
  {
    name: 'MOKKY.DEV',
    icon: ''
  },
  {
    name: 'Typescript',
    icon: ''
  },
  {
    name: 'Capacitor',
    icon: ''
  },
  {
    name: 'Vite',
    icon: ''
  },
  {
    name: 'Pinia',
    icon: ''
  },
  {
    name: 'Swiper.js',
    icon: ''
  },
]

const links = [
  {
    icon: GitHub,
    url: 'https://github.com/sotvorenie/textbook',
    title: 'GitHub',
  },
]

</script>

<template>

  <div class="about">
    <h2 class="about__title">Приложение создано с помощью технологий:</h2>

    <ul class="about__list flex flex-wrap">
      <li v-for="lang in languages"
          class="about__item cursor-pointer hover-color-accent"
      >
        {{lang.name}}
      </li>
    </ul>

    <h2 class="about__title">Ссылки:</h2>

    <ul class="about__list is-links flex">
      <li v-for="link in links"
          class="about__item cursor-pointer"
      >
        <a class="flex-center" :href="link.url" target="_blank">
          <i class="i-svg"><Component :is="link.icon" /></i>
          {{link.title}}
        </a>
      </li>
    </ul>
  </div>

</template>