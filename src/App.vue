<script setup lang="ts">
import Skeleton from "./components/ui/Skeleton.vue";
</script>

<template>
  <Suspense>
    <router-view/>

    <template #fallback>
      <Skeleton/>
    </template>
  </Suspense>
</template>