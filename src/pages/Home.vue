<script setup lang="ts">
import {onMounted, ref} from "vue";
import router from "../router";

import {User} from "../types/user";

import {userAva} from "../utils/ava.ts";
import {getCurrentDateTime} from "../composables/useDate.ts";

import {get} from "../api/base";
import {check} from "../api/auth/auth.ts";
import {getAva, getLastSession, setLastSession} from "../api/users/users.ts";
import {sendToTelegram, TelegramEventType} from "../api/telegram/telegram.ts";

import HomeAside from "../components/blocks/home/HomeAside.vue";
import HomeContent from "../components/blocks/home/HomeContent.vue";
import Message from "../components/common/Message.vue";
import AppSkeleton from "../components/ui/loading/AppSkeleton.vue";

import useTechnologiesStore from "../store/technologiesStore.ts";
const technologiesStore = useTechnologiesStore();
import useUserStore from "../store/userStore.ts";
const userStore = useUserStore();
import useOnlineStore from "../store/useOnlineStore.ts";
import {showError} from "../utils/modals.ts";
const onlineStore = useOnlineStore();

const isLoading = ref<boolean>(true);

const activeMenuIndex = ref<number>(0)

onMounted(async () => {
  onlineStore.isOnline = navigator.onLine

  if (!onlineStore.isOnline) {
    onlineStore.isOnlineMode = false
    isLoading.value = false
    return
  } else {
    onlineStore.getFromLocalStorage()

    if (!onlineStore.isOnlineMode) {
      isLoading.value = false
      return
    }
  }

  const checkUser = async () => {
    try {
      const user = await check();
      userStore.setUser(user as User);
    } catch (err: any) {
      if (err.message === 'NO_TOKEN') {
        isLoading.value = false
        await router.push('/')
        return
      }

      if (err.message === 'OFFLINE') {
        await showError(
            'Ошибка авторизации',
            'Приложение переключено в оффлайн режим'
        )
        onlineStore.isOnline = false
        onlineStore.isOnlineMode = false
        isLoading.value = false
        return
      }

      isLoading.value = false
      await router.push('/')
      return
    }
  }
  await checkUser()

  const getAdmins = async () => {
    try {
      const response: {id:number, full: boolean, viewer: boolean}[] =
          await get(`/admins?id=${userStore.user.id}`);

      let user
      if (response?.length) {
        user = response[0]
      }

      userStore.isAdmin = !!user;
      userStore.isFullAdmin = user?.full ?? false
      userStore.isViewer = user?.viewer ?? false
    } catch (_) {
      await showError(
          'Ошибка получения статуса',
          'Не удалось получить статус пользователя'
      )
    }
  }
  await getAdmins()

  const getTechnologies = async () => {
    try {
      const response: string[] = await get('/technologies');

      if (response) {
        technologiesStore.technologies = response
      }
    } catch (_) {
      await showError(
          'Ошибка получения языков и технологий',
          'Не удалось получить список языков и технологий'
      )
    }
  }
  await getTechnologies()

  const getLiked = async () => {
    try {
      const response: any = await get(`/user_liked?user_id=${userStore.user.id}`);

      if (response?.length) {
        userStore.userLiked = response[0];
      }
    } catch (_) {
      await showError(
          'Ошибка получения избранных постов',
          'Не удалось получить список избранных постов'
      )
    }
  }
  await getLiked()

  const getUserAvatar = async () => {
    try {
      const ava = userAva.get()
      if (!ava?.url) {
        await getAva()
      } else {
        userStore.user.ava = ava
      }
    } catch (_) {
      await showError(
          'Ошибка загрузки аватара',
          'Не удалось загрузить аватар пользователя'
      )
    }
  }
  await getUserAvatar()

  await getLastSession()
  await setLastSession()

  const date = getCurrentDateTime()
  if (date.date !== userStore.lastSession) {
    await sendToTelegram(TelegramEventType.NEW_SESSION)
  }

  // получаем несинхронизированные данные с бд
  await onlineStore.getOfflinePosts()

  isLoading.value = false
})
</script>

<template>

  <template v-if="!isLoading">
    <Message/>

    <main class="home">
      <div class="home__inner flex">
        <HomeAside v-model="activeMenuIndex" />

        <HomeContent :active-index="activeMenuIndex" />
      </div>
    </main>
  </template>

  <AppSkeleton v-else/>
</template>