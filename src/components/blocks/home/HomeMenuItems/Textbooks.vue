<script setup lang="ts">
import {computed, onMounted, onActivated, onDeactivated} from "vue";

import {useSaveScroll} from "../../../../composables/useSaveScroll.ts";

import HomeDefaultList from "../HomeDefaultList.vue";
import HomeTextbookItem from "../HomeTextbookItem.vue";
import HomeDefaultCreate from "../HomeDefaultCreate.vue";

import DefaultListSkeleton from "../../../ui/loading/DefaulListSkeleton.vue";

import useBlocksStore from "../../../../store/blocksStore.ts";
const blocksStore = useBlocksStore();
import useIdStore from "../../../../store/idStore.ts";
const idStore = useIdStore();

const activeComponent = computed(() => {
  if (blocksStore.activeBlock.textbooks === 'list') {
    return HomeDefaultList;
  } else if (blocksStore.activeBlock.textbooks === 'item') {
    return HomeTextbookItem;
  } else {
    return HomeDefaultCreate;
  }
})

const componentProps = computed(() => {
  switch (blocksStore.activeBlock.textbooks) {
    case "item":
      return { apiUrl: `textbooks`, idName: 'textbooks' };
    case "create":
      return { apiUrl: "textbooks", name: 'textbooks' };
    default:
      return { apiUrl: 'textbooks', searchName: 'textbooks' };
  }
})

const changeItem = (id: number) => {
  blocksStore.activeBlock.textbooks = 'item';
  idStore.idValues.textbooks = id;
}

// для сохранения скролла
const scrollManager = useSaveScroll('textbooks')

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