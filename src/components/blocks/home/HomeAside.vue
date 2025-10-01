<script setup lang="ts">
import {ref} from "vue";

import {menuItems} from "../../../data/asideLinks.ts";

import Menu from "../../../assets/icons/Menu.vue";

const activeIndex = defineModel();

const isClosed = ref<boolean>(false);

const changeClosed = () => {
  isClosed.value = !isClosed.value;
}

const changeActiveIndex = (number: number): void => {
  activeIndex.value = number;
}
</script>

<template>

  <aside :class="{
            'menu flex flex-column': true,
            'closed': isClosed
          }"
  >

    <div class="menu__top home__header flex-center">
      <button class="menu__btn menu__logo flex flex-align-center recolor-svg"
              :title="isClosed ? 'Открыть' : 'Закрыть'"
              type="button"
      >
        <Menu @click="changeClosed"/>
        <Transition name="scale-left">
          <span class="menu__name" v-show="!isClosed">Textbook</span>
        </Transition>
      </button>
    </div>

    <ul class="menu__list">
      <li :class="{
            'menu__item': true,
            'is-active': activeIndex === index + 1,
          }"
          v-for="(item, index) in menuItems"
          :key="item.id"
      >
        <button class="menu__btn hover-color-accent recolor-svg flex flex-align-center"
                :title="isClosed ? item.name : ''"
                type="button"
                @click="changeActiveIndex(index + 1)"
        >
          <Component :is="item.icon"/>
          <Transition name="scale-left">
            <span class="menu__name" v-show="!isClosed">{{item.name}}</span>
          </Transition>
        </button>
      </li>
    </ul>

    <button class="menu__bottom button button-small m-auto"
            type="button"
            v-if="!isClosed"
    >Подробнее</button>
  </aside>

</template>