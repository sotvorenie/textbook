<script setup lang="ts">

const index = defineModel();

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
  index.value = value;
}
</script>

<template>

  <div class="settings__btn-bar flex">
    <button :class="{
              'settings__btn': true,
              'is-active': index === 'all'
            }"
            @click="handleIndex('all')"
    >Все</button>
    <button :class="{
              'settings__btn': true,
              'is-active': index === 'likes'
            }"
            @click="handleIndex('likes')"
    >Избранные</button>
    <button :class="{
              'settings__btn': true,
              'is-active': index === 'my'
            }"
            v-if="myVisible"
            @click="handleIndex('my')"
    >{{secondTitle}}</button>
  </div>

</template>