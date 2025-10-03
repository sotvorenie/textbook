<script setup lang="ts">
import {computed, ref} from "vue";

import {roundedButtonStyle} from "../../../data/styles.ts";

import Hints from "./HomeMenuItems/Hints.vue";
import Advices from "./HomeMenuItems/Advices.vue";
import Textbooks from "./HomeMenuItems/Textbooks.vue";
import Projects from "./HomeMenuItems/Projects.vue";
import Messenger from "./HomeMenuItems/Messenger.vue";
import Blog from "./HomeMenuItems/Blog.vue";

import HomeDefaultSettings from "./HomeDefaultSettings.vue";
import MessengerSettings from "./HomeSettingsItems/MessengerSettings.vue";
import BlogSettings from "./HomeSettingsItems/BlogSettings.vue";

import HomeUserCard from "./HomeUserCard.vue";
import HomeEmpty from "./HomeEmpty.vue";

import UserIcon from "../../../assets/icons/UserIcon.vue";
import Modal from "../../common/Modal.vue";

import useUserStore from "../../../store/userStore.ts";
const userStore = useUserStore();

defineProps({
  activeIndex: {
    type: Number,
    request: true,
    default: 0
  }
})

const contentComponents = [
    HomeEmpty,
    Hints,
    Textbooks,
    Projects,
    Advices,
    Messenger,
    Blog
]

const settingsComponentsAttributes = [
  {
    component: HomeDefaultSettings,
    props: {
      createName: 'подсказку',
      blockName: 'hints',
    }
  },
  {
    component: HomeDefaultSettings,
    props: {
      createName: 'учебник',
      blockName: 'textbooks',
    }
  },
  {
    component: HomeDefaultSettings,
    props: {
      createName: 'проект',
      blockName: 'projects',
    }
  },
  {
    component: HomeDefaultSettings,
    props: {
      createName: 'совет',
      blockName: 'advices',
    }
  },
  {
    component: MessengerSettings,
    props: {},
  },
  {
    component: BlogSettings,
    props: {},
  }
]

const userName = computed((): string => {
  return userIconVisible ? userStore.user?.name : 'Пользователь';
})

const userIconVisible = computed(() => {
  if (!userStore.user.ava) return

  return !!userStore.user.ava.url?.length
})

const modalVisible = ref<boolean>(false);
</script>

<template>

  <div class="home__content flex flex-column">
    <header class="home__content-header home__header flex flex-align-center flex-between">

      <div v-if="activeIndex === 0"></div>

      <KeepAlive v-else>
        <Component :key="`settings-${activeIndex - 1}`"
                   :is="settingsComponentsAttributes[activeIndex - 1]?.component"
                   v-bind="settingsComponentsAttributes[activeIndex - 1]?.props || {}"
        />
      </KeepAlive>

      <Modal v-model="modalVisible" :size="600">
        <template #activator="{open}">
          <button :class="['home__user', 'img-container', ...roundedButtonStyle]"
                  :title="userName"
                  aria-label="Пользователь"
                  type="button"
                  @click="open">
            <img :src="userStore.user.ava?.url"
                 :alt="userName"
                 v-if="userIconVisible"
            />
            <UserIcon v-else/>
          </button>
        </template>

        <template #default>
          <HomeUserCard/>
        </template>
      </Modal>
    </header>

    <div class="home__main">
      <KeepAlive>
        <Component :is="contentComponents[activeIndex]"
                   :key="`content-${activeIndex - 1}`"
        />
      </KeepAlive>
    </div>
  </div>

</template>