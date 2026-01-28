<script setup lang="ts">
import {ref, nextTick, onMounted, onBeforeUnmount, watch, computed} from "vue";
import {useRoute, useRouter} from "vue-router";

import {debounce} from "../../../utils/debounce.ts";

import SearchIcon from "../../../assets/icons/SearchIcon.vue";

const route = useRoute()
const router = useRouter()

const isVisible = ref<boolean>(false);

const inputElement = ref<HTMLInputElement | null>(null);
const searchWrapper = ref<HTMLElement | null>(null);

const updateQuery = debounce((value: string) => {
  router.replace({
    query: {
      ...route.query,
      name: value || undefined,
      page: 1
    }
  })
}, 500)
const name = computed({
  get: () => (route.query.name as string) ?? '',
  set: (value: string) => {
    updateQuery(value)
  }
})

const buttonsVisible = defineModel('buttons-visible')

const handleVisible = (): void => {
  isVisible.value = !isVisible.value

  if (isVisible.value) setFocus()
}

const handleClickOutside = (event: MouseEvent) => {
  if (!searchWrapper.value) return
  if (!searchWrapper.value.contains(event.target as Node)) {
    isVisible.value = false
  }
}

const setFocus = () => {
  nextTick(() => {
    inputElement.value?.focus()
  })
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(isVisible, () => {
  if (isVisible.value) {
    buttonsVisible.value = false
  } else {
    setTimeout(() => {
      buttonsVisible.value = true
    }, 200)
  }
})
</script>

<template>
  <div :class="{
          'search flex flex-align-center': true,
          'is-active': isVisible,
        }"
       ref="searchWrapper"
  >
    <button class="search__btn recolor-svg hover-color-accent"
            title="Поиск"
            type="button"
            @click="handleVisible"
    >
      <SearchIcon/>
    </button>

    <Transition name="scale-left">
      <input class="search__input input input-small"
             v-show="isVisible"
             ref="inputElement"
             v-model="name"
      >
    </Transition>
  </div>
</template>