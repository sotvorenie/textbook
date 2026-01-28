<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {useRoute} from "vue-router";

import { roundedButtonStyle } from "../data/styles.ts";

import HomeAside from "../components/blocks/aside/Aside.vue";
import Message from "../components/common/Message.vue";
import HomeDefaultSettings from "../components/blocks/header/HeaderDefault.vue";
import MessengerSettings from "../components/blocks/header/HeaderMessenger.vue";
import BlogSettings from "../components/blocks/header/HeaderBlog.vue";
import AboutSettings from "../components/blocks/header/HeaderAbout.vue";
import HomeUserCard from "../components/blocks/main/UserCard.vue";
import Modal from "../components/common/Modal.vue";

import UserIcon from "../assets/icons/UserIcon.vue";

import useUserStore from "../store/useUserStore.ts";
const userStore = useUserStore();
import useOnlineStore from "../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();
import useHomeStore from "../store/useHomeStore.ts";
const homeStore = useHomeStore();
import useMessageStore from "../store/useMessageStore.ts";
const messageStore = useMessageStore();

const route = useRoute();

// компоненты настроек
const settingsComponentsAttributes = [
  { component: HomeDefaultSettings, props: { createName: 'подсказку', name: 'hints' } },
  { component: HomeDefaultSettings, props: { createName: 'учебник', name: 'textbooks' } },
  { component: HomeDefaultSettings, props: { createName: 'проект', name: 'projects' } },
  { component: HomeDefaultSettings, props: { createName: 'совет', name: 'advices' } },
  { component: MessengerSettings, props: {} },
  { component: BlogSettings, props: {} },
  { component: AboutSettings, props: {} },
];

// аватар пользователя
const userIconVisible = computed(() => !!userStore.user.ava?.url?.length)
const userName = computed(() => userStore.user?.name || 'Пользователь')

// модальное окно
const modalVisible = ref(false)
const isAvatarLoaded = ref(true)
const isModeLoaded = ref(true)

// наблюдатели
watch(() => onlineStore.modeLoadingVisible, (val) => isModeLoaded.value = !val)
</script>

<template>
  <Message v-model="messageStore.isVisible" :is-error="messageStore.isError">
    {{ messageStore.text }}
  </Message>

  <main class="home w-100">
    <div class="home__inner flex w-100">
      <HomeAside />

      <div class="home__content flex flex-column w-100">
        <header class="home__content-header home__header flex flex-align-center flex-between mb-20">
          <div v-if="homeStore.activeMenuIndex === -1 && route.name === 'Main'" />

          <HomeDefaultSettings name="user" v-if="homeStore.activeMenuIndex === -1 && route.name === 'User'" />

          <div v-if="homeStore.activeMenuIndex !== -1">
            <Component
                :key="`header-${homeStore.activeMenuIndex}`"
                :is="settingsComponentsAttributes[homeStore.activeMenuIndex]?.component"
                v-bind="settingsComponentsAttributes[homeStore.activeMenuIndex]?.props || {}"
            />
          </div>

          <Modal v-model="modalVisible" :size="600" :close-active="isAvatarLoaded && isModeLoaded">
            <template #activator="{open}">
              <Transition name="scale" appear>
                <div class="home__user-wrapper position-relative" @click="open">
                  <button :class="['home__user', 'img-container', ...roundedButtonStyle]"
                          :title="userName"
                          aria-label="Пользователь"
                          type="button">
                    <img v-if="userIconVisible" :src="userStore.user.ava?.url" :alt="userName"/>
                    <UserIcon v-else/>
                  </button>

                  <div v-if="onlineStore.visibleUnSync"
                       class="home__user-sync position-absolute cursor-pointer"
                       title="Доступна синхронизация!"
                  >
                    !
                  </div>
                </div>
              </Transition>
            </template>

            <template #default>
              <HomeUserCard @on-close="isAvatarLoaded = true" @off-close="isAvatarLoaded = false"/>
            </template>
          </Modal>
        </header>

        <div class="home__main w-100 h-100">
          <router-view/>
        </div>
      </div>
    </div>
  </main>
</template>