<script setup lang="ts">
import {onMounted} from "vue";

import HomeContent from "../components/blocks/home/HomeContent.vue";

import useHomeStore from "../store/useHomeStore.ts";
import AppSkeleton from "../components/ui/loading/AppSkeleton.vue";
const homeStore = useHomeStore();

onMounted(async () => {
  if (homeStore.firstLoading) {
    await homeStore.loadInfo(true)
    homeStore.getNumberPage()
    homeStore.firstLoading = false
  }
})
</script>

<template>
  <HomeContent v-if="!homeStore.loadingVisible"/>
  <Teleport to="body" v-else>
    <AppSkeleton/>
  </Teleport>
</template>