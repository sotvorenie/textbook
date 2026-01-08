<script setup lang="ts">
import {computed, ref, watch} from "vue";

import {roundedButtonStyle} from "../../../data/styles.ts";

import Messenger from "./items/Messenger.vue";
import Blog from "./items/Blog.vue";

import HomeDefaultSettings from "./settings/HomeDefaultSettings.vue";
import MessengerSettings from "./settings/MessengerSettings.vue";
import BlogSettings from "./settings/BlogSettings.vue";

import HomeDefaultContentItem from "./HomeDefaultContentItem.vue";
import HomeTextbookCreate from "./create/HomeTextbookCreate.vue";
import HomeTextbookItem from "./items/HomeTextbookItem.vue";

import AboutSettings from "./settings/AboutSettings.vue";
import About from "./items/About.vue";

import HomeUserCard from "./HomeUserCard.vue";
import HomeEmpty from "./empty/HomeEmpty.vue";

import UserIcon from "../../../assets/icons/UserIcon.vue";
import Modal from "../../common/Modal.vue";

import useUserStore from "../../../store/useUserStore.ts";
const userStore = useUserStore();
import useSettingsStore from "../../../store/useSettingsStore.ts";
const settingsStore = useSettingsStore();
import useBlocksStore from "../../../store/useBlocksStore.ts";
const blocksStore = useBlocksStore();
import useOnlineStore from "../../../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();
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
// компоненты header-а
const settingsComponentsAttributes = [
  {
    component: HomeDefaultSettings,
    props: {
      createName: 'подсказку',
      name: 'hints'
    }
  },
  {
    component: HomeDefaultSettings,
    props: {
      createName: 'учебник',
      name: 'textbooks',
    }
  },
  {
    component: HomeDefaultSettings,
    props: {
      createName: 'проект',
      name: 'projects',
    }
  },
  {
    component: HomeDefaultSettings,
    props: {
      createName: 'совет',
      name: 'advices',
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


//=========================================================//
//-- аватарка пользователя --//
// имя пользователя
const userName = computed((): string => {
  return userIconVisible ? userStore.user?.name : 'Пользователь'
})

// проверка: есть ли у пользователя аватарка или нет (если нет, то показывать svg-человечка)
const userIconVisible = computed(() => {
  if (!userStore.user.ava) return

  return !!userStore.user.ava.url?.length
})
//=========================================================//


//=========================================================//
//-- модальное окно --//
// видимость модального окна
const modalVisible = ref<boolean>(false)

// можно ли закрыть модальное окно (чтобы при загрузке аватарки нельзя было закрыть модальное окно)
const isAvatarLoaded = ref<boolean>(true)

// можно ли закрыть модальное окно (чтобы при загрузке данных при переключении на онлайн-режим нельзя было закрыть модальное окно)
const isModeLoaded = ref<boolean>(true)
//=========================================================//

//=========================================================//
//-- наблюдатели --//
// наблюдаем за активным индексом, чтобы изменять внешний вид header-а при переключении между активными элементами бокового меню
watch(
    () => homeStore.activeMenuIndex,
    () => {
      const name: string = settingsComponentsAttributes[homeStore.activeMenuIndex - 1]?.props.name!
      settingsStore.settingsVisible[name] = blocksStore.activeBlock[name]
    }
)

// наблюдаем за значением видимости анимации загрузки при переключении online/offline режимов
watch(
    () => onlineStore.modeLoadingVisible,
    (val) => isModeLoaded.value = !val
)
//=========================================================//
</script>

<template>

  <div class="home__content flex flex-column w-100">
    <header class="home__content-header home__header flex flex-align-center flex-between mb-20">

      <div v-if="homeStore.activeMenuIndex === 0"></div>

      <KeepAlive v-else>
        <Component :key="`settings-${homeStore.activeMenuIndex - 1}`"
                   :is="settingsComponentsAttributes[homeStore.activeMenuIndex - 1]?.component"
                   v-bind="settingsComponentsAttributes[homeStore.activeMenuIndex - 1]?.props || {}"
        />
      </KeepAlive>

      <Modal v-model="modalVisible" :size="600" :close-active="isAvatarLoaded && isModeLoaded">
        <template #activator="{open}">
          <Transition name="scale" appear>
            <div class="home__user-wrapper position-relative" @click="open">
              <button :class="['home__user', 'img-container', ...roundedButtonStyle]"
                      :title="userName"
                      aria-label="Пользователь"
                      type="button"
              >
                <img :src="userStore.user.ava?.url"
                     :alt="userName"
                     v-if="userIconVisible"
                />
                <UserIcon v-else/>
              </button>

              <div class="home__user-sync position-absolute cursor-pointer"
                   title="Доступна синхронизация!"
                   v-if="onlineStore.visibleUnSync"
              >
                !
              </div>
            </div>
          </Transition>
        </template>

        <template #default>
          <HomeUserCard @on-close="isAvatarLoaded = true"
                        @off-close="isAvatarLoaded = false"
          />
        </template>
      </Modal>
    </header>

    <div class="home__main w-100 h-100">
      <KeepAlive>
        <Component :is="contentComponents[homeStore.activeMenuIndex].component"
                   :key="`content-${homeStore.activeMenuIndex}`"
                   v-bind="contentComponents[homeStore.activeMenuIndex].props"
        />
      </KeepAlive>
    </div>
  </div>

</template>