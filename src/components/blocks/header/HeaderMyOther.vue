<script setup lang="ts">
import {computed} from "vue";
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const index = computed({
  get: () => (route.query.tab as string) ?? 'all',
  set: (value: string) => {
    router.replace({
      query: {
        ...route.query,
        tab: value || undefined
      }
    })
  }
})

defineProps({
  secondTitle: {
    type: String,
    default: 'Мои',
  },
  myVisible: {
    type: Boolean,
    default: false,
  },
})

const handleIndex = (value: string) => {
  index.value = value
}
</script>

<template>

  <div class="header__btn-bar flex">
    <button :class="{
              'header__btn': true,
              'is-active': index === 'all'
            }"
            @click="handleIndex('all')"
    >Все</button>
    <button :class="{
              'header__btn': true,
              'is-active': index === 'likes'
            }"
            @click="handleIndex('likes')"
    >Избранные</button>
    <button :class="{
              'header__btn': true,
              'is-active': index === 'my'
            }"
            v-if="myVisible"
            @click="handleIndex('my')"
    >{{secondTitle}}</button>
  </div>

</template>