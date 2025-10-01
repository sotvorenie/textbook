<script setup lang="ts">
import {computed} from "vue";

import HomeDefaultList from "../HomeDefaultList.vue";
import HomeDefaultItem from "../HomeDefaultItem.vue";
import HomeDefaultCreate from "../HomeDefaultCreate.vue";

import Skeleton from "../../../../App.vue";

import useBlocksStore from "../../../../store/blocksStore.ts";
const blocksStore = useBlocksStore();
import useIdStore from "../../../../store/idStore.ts";
const idStore = useIdStore();

const activeComponent = computed(() => {
  if (blocksStore.activeBlock.hints === 'list') {
    return HomeDefaultList;
  } else if (blocksStore.activeBlock.hints === 'item') {
    return HomeDefaultItem;
  } else {
    return HomeDefaultCreate;
  }
})

const componentProps = computed(() => {
  switch (blocksStore.activeBlock.hints) {
    case "item":
      return { apiUrl: `posts`, idName: 'hints' };
    case "create":
      return { apiUrl: "posts", name: 'hints' };
    default:
      return { apiUrl: 'posts', searchName: 'hints' };
  }
})

const changeItem = (id: number) => {
  blocksStore.activeBlock.hints = 'item';
  idStore.idValues.hints = id;
}

</script>

<template>

  <KeepAlive :include="['HomeDefaultList', 'HomeDefaultCreate']">
    <Suspense>
      <Component :is="activeComponent"
                 v-bind="componentProps"
                 @change-item="changeItem"
      />

      <template #fallback>
        <Skeleton/>
      </template>
    </Suspense>
  </KeepAlive>

</template>