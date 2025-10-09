<script setup lang="ts">
import {computed, ref, watch} from "vue";

import {roundedButtonStyle} from "../../../data/styles.ts";

import Messenger from "./HomeMenuItems/Messenger.vue";
import Blog from "./HomeMenuItems/Blog.vue";

import HomeDefaultSettings from "./HomeDefaultSettings.vue";
import MessengerSettings from "./HomeSettingsItems/MessengerSettings.vue";
import BlogSettings from "./HomeSettingsItems/BlogSettings.vue";

import HomeUserCard from "./HomeUserCard.vue";
import HomeEmpty from "./HomeEmpty/HomeEmpty.vue";

import UserIcon from "../../../assets/icons/UserIcon.vue";
import Modal from "../../common/Modal.vue";

import useUserStore from "../../../store/userStore.ts";
import HomeDefaultContentItem from "./HomeDefaultContentItem.vue";
const userStore = useUserStore();

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
    [key: string]: any; // для других возможных props
  };
}

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
      removedItemsId: [],
    },
  },
  {
    component: HomeDefaultContentItem,
    props: {
      name: 'textbooks',
      apiUrl: 'textbooks',
      removedItemsId: [],
    },
  },
  {
    component: HomeDefaultContentItem,
    props: {
      name: 'textbooks',
      apiUrl: 'textbooks',
      removedItemsId: [],
    },
  },
  {
    component: HomeDefaultContentItem,
    props: {
      name: 'textbooks',
      apiUrl: 'textbooks',
      removedItemsId: [],
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
])

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

const handleItemRemoved = ({blockName, id}: { blockName: string, id: number }) => {
  contentComponents.value.forEach(el => {
    if (el.props.name === blockName) {
      if (!el.props.removedItemsId) {
        el.props.removedItemsId = []
      }
      el.props.removedItemsId.push(id)
    }
  })
}

const transitionName = ref<string>('')
watch(() => props.activeIndex,
    (newVal, prevVal) => {
          if (newVal > prevVal) {
            transitionName.value = 'top'
          } else {
            transitionName.value = 'bottom'
          }
    }
)
</script>

<template>

  <div class="home__content flex flex-column">
    <header class="home__content-header home__header flex flex-align-center flex-between">

      <div v-if="activeIndex === 0"></div>

      <KeepAlive v-else>
        <Component :key="`settings-${activeIndex - 1}`"
                   :is="settingsComponentsAttributes[activeIndex - 1]?.component"
                   v-bind="settingsComponentsAttributes[activeIndex - 1]?.props || {}"
                   @remove-item="handleItemRemoved"
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
                   :transition-name="transitionName"
        />
      </KeepAlive>
    </div>
  </div>

</template>