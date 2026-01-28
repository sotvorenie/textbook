<script setup lang="ts">
import {ref, watchEffect} from "vue";
import {useRouter, useRoute} from "vue-router";

import {menuItems} from "../../../data/asideLinks.ts";

import Menu from "../../../assets/icons/Menu.vue";

import useHomeStore from "../../../store/useHomeStore.ts";
const homeStore = useHomeStore();
import useRouterStore from "../../../store/useRouterStore.ts";
const routerStore = useRouterStore();

const router = useRouter();
const route = useRoute();

//=========================================================//
// открыто/закрыто боковое меню
const isClosed = ref<boolean>(false);

// открытие/закрытие бокового меню
const changeClosed = () => {
  isClosed.value = !isClosed.value;
}

// выбор активного элемента меню
const changeActiveIndex = (index: number): void => {
  if (index === -1) {
    router.push({ name: 'Main' })
  } else {
    const tabName = menuItems[index].value
    const routes = routerStore.sectionRoutes[tabName]

    if (routes?.length) {
      const last = routes[routes.length - 1]

      if (last) {
        router.push(last)
        return
      }
    }

    router.push({ path: `/${tabName}` })
  }
}

watchEffect(() => {
  const pathValue = route?.path.replace('/', '')
  const foundIndex = menuItems.findIndex(item => pathValue.startsWith(item.value));
  homeStore.activeMenuIndex = foundIndex >= 0 ? foundIndex : -1
})
</script>

<template>

  <aside :class="{
            'menu flex flex-column': true,
            'closed': isClosed
          }"
  >

    <div class="menu__top home__header flex-center mb-40-20">
      <Transition name="menu-top" appear>
        <button class="menu__btn menu__logo flex flex-align-center recolor-svg w-100"
                :title="isClosed ? 'Открыть' : 'Закрыть'"
                type="button"
        >
          <Menu @click="changeClosed"/>
          <Transition name="menu-top" :delay="500">
            <span class="menu__name" v-show="!isClosed" @click="changeActiveIndex(-1)">Textbook</span>
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
            'menu__item mb-not-last-10': true,
            'is-active': homeStore.activeMenuIndex === index,
          }"
            v-for="(item, index) in menuItems"
            :key="item.id"
            :style="{'--index': index}"
        >
          <button class="menu__btn hover-color-accent recolor-svg flex flex-align-center w-100"
                  :title="isClosed ? item.name : ''"
                  type="button"
                  @click="changeActiveIndex(index)"
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
            @click="router.push({name: 'About'})"
    >Подробнее</button>
  </aside>

</template>