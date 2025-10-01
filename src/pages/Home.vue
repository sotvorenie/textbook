<script setup lang="ts">
import {ref} from "vue";

import {get} from "../api/base";

import Message from "../components/common/Message.vue";

import {check} from "../api/auth/auth.ts";

import useUserStore from "../store/userStore.ts";
import {User} from "../types/user";
import useTechnologiesStore from "../store/technologiesStore.ts";
import HomeAside from "../components/blocks/home/HomeAside.vue";
import HomeContent from "../components/blocks/home/HomeContent.vue";
import {getAva, getLastSession, setLastSession} from "../api/users/users.ts";
import {userAva} from "../utils/ava.ts";
import {sendToTelegram, TelegramEventType} from "../api/telegram/telegram.ts";
import {getCurrentDateTime} from "../composables/useDate.ts";

const technologiesStore = useTechnologiesStore();

const userStore = useUserStore();

const user = await check();
userStore.setUser(user as User);

const getAdmins = async () => {
  try {
    const response: {id:number, full: boolean}[] =
        await get(`/admins?id=${userStore.user.id}`);

    let user
    if (response?.length) {
      user = response[0]
    }

    userStore.isAdmin = !!user;
    userStore.isFullAdmin = user?.full ?? false
  } catch (_) {}
}
await getAdmins()

const activeMenuIndex = ref<number>(0);

const getTechnologies = async () => {
  try {
    const response: string[] = await get('/technologies');

    if (response) {
      technologiesStore.technologies = response
    }
  } catch (_) {}
}
await getTechnologies()

const getLiked = async () => {
  try {
    const response: any = await get(`/user_liked?user_id=${userStore.user.id}`);
    userStore.userLiked = response[0];
  } catch (_) {}
}
await getLiked()

const ava = userAva.get()
if (!ava?.url) {
  getAva()
} else {
  userStore.user.ava = ava
}

await getLastSession()
await setLastSession()

const date = getCurrentDateTime()
if (date.date !== userStore.lastSession) {
  sendToTelegram(TelegramEventType.NEW_SESSION)
}
</script>

<template>
  <Message></Message>

  <main class="home">
    <div class="home__inner flex">

      <HomeAside v-model="activeMenuIndex"/>

      <HomeContent :active-index="activeMenuIndex"/>
    </div>
  </main>

</template>