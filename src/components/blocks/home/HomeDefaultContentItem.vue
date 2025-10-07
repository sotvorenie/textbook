<script setup lang="ts">
import {computed, onMounted, onActivated, onDeactivated, VueElement} from "vue";

import {useSaveScroll} from "../../../composables/useSaveScroll.ts";

import HomeDefaultList from "../HomeDefaultList.vue";
import HomeDefaultItem from "../HomeDefaultItem.vue";
import HomeDefaultCreate from "../HomeDefaultCreate.vue";

import DefaultListSkeleton from "../../../ui/loading/DefaulListSkeleton.vue";

import useBlocksStore from "../../../store/blocksStore.ts";
const blocksStore = useBlocksStore();
import useIdStore from "../../../store/idStore.ts";
const idStore = useIdStore();

defineProps({
  name: {
    type: String,
    required: true,
  },
  apiUrl: {
    type: String,
    required: true,
  },
  listComponent: {
    type: VueElement,
    default: HomeDefaultList,
  },
  itemComponent: {
    type: VueElement,
    default: HomeDefaultItem,
  },
  createComponent: {
    type: VueElement,
    default: HomeDefaultCreate,
  },
})

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

// для сохранения скролла
const scrollManager = useSaveScroll('hints')

onMounted(() => {
  scrollManager.setup();
});

onActivated(() => {
  scrollManager.restoreScroll();
});

onDeactivated(() => {
  scrollManager.destroy();
});
</script>

<template>

  <KeepAlive>
    <Suspense>
      <Component
          :is="activeComponent"
          v-bind="componentProps"
          @change-item="changeItem"
      />

      <template #fallback>
        <DefaultListSkeleton/>
      </template>
    </Suspense>
  </KeepAlive>

</template>