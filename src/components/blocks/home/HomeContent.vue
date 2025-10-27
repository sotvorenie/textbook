<script setup lang="ts">
import {computed, ref, watch} from "vue";

import {roundedButtonStyle} from "../../../data/styles.ts";

import Messenger from "./HomeMenuItems/Messenger.vue";
import Blog from "./HomeMenuItems/Blog.vue";

import HomeDefaultSettings from "./HomeSettingsItems/HomeDefaultSettings.vue";
import MessengerSettings from "./HomeSettingsItems/MessengerSettings.vue";
import BlogSettings from "./HomeSettingsItems/BlogSettings.vue";

import HomeDefaultContentItem from "./HomeDefaultContentItem.vue";
import HomeTextbookCreate from "./HomeCreate/HomeTextbookCreate.vue";
import HomeTextbookItem from "./HomeMenuItems/HomeTextbookItem.vue";

import HomeUserCard from "./HomeUserCard.vue";
import HomeEmpty from "./HomeEmpty/HomeEmpty.vue";

import UserIcon from "../../../assets/icons/UserIcon.vue";
import Modal from "../../common/Modal.vue";

import useUserStore from "../../../store/userStore.ts";
const userStore = useUserStore();
import useSettingsStore from "../../../store/settingsStore.ts";
const settingsStore = useSettingsStore();
import useBlocksStore from "../../../store/blocksStore.ts";
import AboutSettings from "./HomeSettingsItems/AboutSettings.vue";
import About from "./HomeMenuItems/About.vue";
const blocksStore = useBlocksStore();

const props = defineProps({
  activeIndex: {
    type: Number,
    request: true,
    default: 0
  }
})

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
// компоненты header-а
const settingsComponentsAttributes = [
  {
    component: HomeDefaultSettings,
    props: {
      createName: 'подсказку',
      blockName: 'hints',
      apiName: 'posts',
    }
  },
  {
    component: HomeDefaultSettings,
    props: {
      createName: 'учебник',
      blockName: 'textbooks',
      apiName: 'textbooks',
    }
  },
  {
    component: HomeDefaultSettings,
    props: {
      createName: 'проект',
      blockName: 'projects',
      apiName: 'projects',
    }
  },
  {
    component: HomeDefaultSettings,
    props: {
      createName: 'совет',
      blockName: 'advices',
      apiName: 'advices',
    }
  },
  {
    component: MessengerSettings,
    props: {},
  },
  {
    component: BlogSettings,
    props: {},
  },
  {
    component: AboutSettings,
    props: {},
  },
]

// компоненты контент-части
const contentComponents = ref<ContentComponent[]>([
  {
    component: HomeEmpty,
    props: {},
  },
  {
    component: HomeDefaultContentItem,
    props: {
      name: 'hints',
      apiUrl: 'posts',
    },
  },
  {
    component: HomeDefaultContentItem,
    props: {
      name: 'textbooks',
      apiUrl: 'textbooks',
      createComponent: HomeTextbookCreate,
      itemComponent: HomeTextbookItem,
    },
  },
  {
    component: HomeDefaultContentItem,
    props: {
      name: 'projects',
      apiUrl: 'projects',
    },
  },
  {
    component: HomeDefaultContentItem,
    props: {
      name: 'advices',
      apiUrl: 'advices',
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


//=========================================================//
//-- аватарка пользователя --//
// имя пользователя
const userName = computed((): string => {
  return userIconVisible ? userStore.user?.name : 'Пользователь';
})

// проерка: есть ли у пользователя аватарка или нет (если нет, то показывать svg-человечка)
const userIconVisible = computed(() => {
  if (!userStore.user.ava) return

  return !!userStore.user.ava.url?.length
})
//=========================================================//


//=========================================================//
//-- модальное окно --//
// видимость модального окна
const modalVisible = ref<boolean>(false);
//=========================================================//

//=========================================================//
//-- наблюдатели --//
// наблюдаем за активным индексом, чтобы изменять внешний вид header-а при переключении между активными элементами бокового меню
watch(
    () => props.activeIndex,
    () => {
      const name: string = settingsComponentsAttributes[props.activeIndex - 1].props.blockName!
      settingsStore.settingsVisible[name] = blocksStore.activeBlock[name]
    }
)
//=========================================================//
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
          <Transition name="avatar" appear>
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
          </Transition>
        </template>

        <template #default>
          <HomeUserCard/>
        </template>
      </Modal>
    </header>

    <div class="home__main">
      <KeepAlive>
        <Component :is="contentComponents[activeIndex].component"
                   :key="`content-${activeIndex}`"
                   v-bind="contentComponents[activeIndex].props"
        />
      </KeepAlive>
    </div>
  </div>

</template>