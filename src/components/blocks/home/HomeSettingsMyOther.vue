<script setup lang="ts">

const index = defineModel();

defineProps({
  secondTitle: {
    type: String,
    default: 'Мои'
  }
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
            }" class="settings__btn"
            @click="handleIndex('all')"
    >Все</button>
    <button :class="{
              'settings__btn': true,
              'is-active': index === 'my'
            }" class="settings__btn"
            @click="handleIndex('my')"
    >{{secondTitle}}</button>
  </div>

</template>