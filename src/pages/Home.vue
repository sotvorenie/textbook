<script setup lang="ts">
import {onMounted, ref} from "vue";

import {User} from "../types/user";

import {userAva} from "../utils/ava.ts";
import {getCurrentDateTime} from "../composables/useDate.ts";

import {executeSQL} from "../api/database.ts";
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
const onlineStore = useOnlineStore();

const isLoading = ref<boolean>(true);

const activeMenuIndex = ref<number>(0)

const syncLanguagesToDB = async (): Promise<void> => {
  try {
    await executeSQL("BEGIN TRANSACTION");

    for (const tech of technologiesStore.technologies) {
      await executeSQL(
          "INSERT OR REPLACE INTO technologies (id, title) VALUES (?, ?)",
          [tech.id, tech.name]
      );
    }

    await executeSQL("COMMIT");
  } catch (err) {
    await executeSQL("ROLLBACK");
    console.error("Ошибка при синхронизации технологий:", err);
    throw err;
  }
};

onMounted(async () => {
  onlineStore.isOnline = navigator.onLine

  if (!onlineStore.isOnline) {
    onlineStore.isOnlineMode = false
    isLoading.value = false
    return
  } else {
    onlineStore.getFromLocalStorage()
  }

  const user = await check();
  userStore.setUser(user as User);

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
    } catch (_) {}
  }
  await getAdmins()

  const getTechnologies = async () => {
    try {
      const response: {id: number, name: string}[] = await get('/technologies');

      if (response) {
        technologiesStore.technologies = response
      }
    } catch (_) {}
  }
  await getTechnologies()

  await syncLanguagesToDB()

  const getLiked = async () => {
    try {
      const response: any = await get(`/user_liked?user_id=${userStore.user.id}`);

      if (response?.length) {
        userStore.userLiked = response[0];
      }
    } catch (_) {}
  }
  await getLiked()

  const ava = userAva.get()
  if (!ava?.url) {
    await getAva()
  } else {
    userStore.user.ava = ava
  }

  await getLastSession()
  await setLastSession()

  const date = getCurrentDateTime()
  if (date.date !== userStore.lastSession) {
    await sendToTelegram(TelegramEventType.NEW_SESSION)
  }

  // получаем несихнронизированные данные с бд
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