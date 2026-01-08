<script setup lang="ts">
import {ref} from "vue";

import {menuItems} from "../../../data/asideLinks.ts";

import Menu from "../../../assets/icons/Menu.vue";

import useHomeStore from "../../../store/useHomeStore.ts";
const homeStore = useHomeStore();

//=========================================================//
// открыто/закрыто боковое меню
const isClosed = ref<boolean>(false);

// открытие/закрытие бокового меню
const changeClosed = () => {
  isClosed.value = !isClosed.value;
}

// выбор активного элемента меню
const changeActiveIndex = (number: number): void => {
  homeStore.activeMenuIndex = number;
}
</script>

<template>

  <aside :class="{
            'menu flex flex-column': true,
            'closed': isClosed
          }"
  >

    <div class="menu__top home__header flex-center">
      <Transition name="menu-top" appear>
        <button class="menu__btn menu__logo flex flex-align-center recolor-svg"
                :title="isClosed ? 'Открыть' : 'Закрыть'"
                type="button"
        >
          <Menu @click="changeClosed"/>
          <Transition name="menu-top" :delay="500">
            <span class="menu__name" v-show="!isClosed">Textbook</span>
          </Transition>
        </button>
      </Transition>
    </div>

    <ul class="ul">
      <TransitionGroup class="menu__list"
                       name="menu"
                       tag="div"
                       appear
                       :delay="1000"
      >
        <li :class="{
            'menu__item': true,
            'is-active': homeStore.activeMenuIndex === index + 1,
          }"
            v-for="(item, index) in menuItems"
            :key="item.id"
            :style="{'--index': index}"
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
      </TransitionGroup>
    </ul>

    <button class="menu__bottom button button-small m-auto"
            type="button"
            v-if="!isClosed"
            @click="changeActiveIndex(menuItems?.length + 1)"
    >Подробнее</button>
  </aside>

</template>