<script setup lang="ts">
import {ref} from "vue";

import Messenger from "./items/Messenger.vue";
import Blog from "./items/Blog.vue";

import HomeDefaultContentItem from "./HomeDefaultContentItem.vue";
import HomeTextbookCreate from "./create/HomeTextbookCreate.vue";
import HomeTextbookItem from "./items/HomeTextbookItem.vue";

import About from "./items/About.vue";

import HomeEmpty from "./empty/HomeEmpty.vue";

import useHomeStore from "../../../store/useHomeStore.ts";
const homeStore = useHomeStore();

interface ContentComponent {
  component: any;
  props: {
    name?: string;
    apiUrl?: string;
    removedItemsId?: number[];
    [key: string]: any;
  };
}

//=========================================================//


//=========================================================//
//-- компоненты --//
const contentComponents = ref<ContentComponent[]>([
  {
    component: HomeEmpty,
    props: {},
  },
  {
    component: HomeDefaultContentItem,
    props: {
      name: 'hints',
    },
  },
  {
    component: HomeDefaultContentItem,
    props: {
      name: 'textbooks',
      createComponent: HomeTextbookCreate,
      itemComponent: HomeTextbookItem,
    },
  },
  {
    component: HomeDefaultContentItem,
    props: {
      name: 'projects',
    },
  },
  {
    component: HomeDefaultContentItem,
    props: {
      name: 'advices',
    },
  },
  {
    component: Messenger,
    props: {},
  },
  {
    component: Blog,
    props: {},
  },
  {
    component: About,
    props: {},
  },
])
//=========================================================//
</script>

<template>
  <div class="home__main w-100 h-100">
    <KeepAlive>
      <Component :is="contentComponents[homeStore.activeMenuIndex].component"
                 :key="`content-${homeStore.activeMenuIndex}`"
                 v-bind="contentComponents[homeStore.activeMenuIndex].props"
      />
    </KeepAlive>
  </div>
</template>