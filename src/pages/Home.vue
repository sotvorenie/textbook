<script setup lang="ts">
import {onMounted} from "vue";

import HomeAside from "../components/blocks/home/HomeAside.vue";
import HomeContent from "../components/blocks/home/HomeContent.vue";
import Message from "../components/common/Message.vue";
import AppSkeleton from "../components/ui/loading/AppSkeleton.vue";

import useHomeStore from "../store/useHomeStore.ts";
const homeStore = useHomeStore();
import useMessageStore from "../store/useMessageStore.ts";
const messageStore = useMessageStore();

onMounted(async () => {
  await homeStore.loadInfo(true)
  homeStore.getNumberPage()
})
</script>

<template>

  <template v-if="!homeStore.loadingVisible as boolean">
    <Message v-model="messageStore.isVisible" :is-error="messageStore.isError">
      {{messageStore.text}}
    </Message>

    <main class="home w-100">
      <div class="home__inner flex w-100">
        <HomeAside/>

        <HomeContent/>
      </div>
    </main>
  </template>

  <AppSkeleton v-else/>
</template>