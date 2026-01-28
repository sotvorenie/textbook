<script setup lang="ts">
import {onMounted} from "vue";

import MainEmpty from "../components/blocks/main/MainEmpty.vue";
import AppSkeleton from "../components/ui/loading/AppSkeleton.vue";

import useHomeStore from "../store/useHomeStore.ts";
const homeStore = useHomeStore();
import useUserStore from "../store/useUserStore.ts";
const userStore = useUserStore();

onMounted(async () => {
  if (userStore.user.id >= 0) return

  await homeStore.loadInfo(true)
  homeStore.getNumberPage()
})
</script>

<template>
  <MainEmpty v-if="!homeStore.loadingVisible"/>

  <Teleport to="body" v-else>
    <AppSkeleton/>
  </Teleport>
</template>