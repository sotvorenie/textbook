<script setup lang="ts">
import {computed, onMounted, onActivated, onDeactivated, VueElement} from "vue";

import {useSaveScroll} from "../../../composables/useSaveScroll.ts";

import HomeDefaultList from "./HomeDefaultList.vue";
import HomeDefaultItem from "./HomeDefaultItem.vue";
import HomeDefaultCreate from "./HomeDefaultCreate.vue";

import DefaultListSkeleton from "../../ui/loading/DefaulListSkeleton.vue";

import useBlocksStore from "../../../store/blocksStore.ts";
const blocksStore = useBlocksStore();
import useIdStore from "../../../store/idStore.ts";
const idStore = useIdStore();

const props = defineProps({
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
  if (blocksStore.activeBlock[props.name] === 'list') {
    return props.listComponent;
  } else if (blocksStore.activeBlock[props.name] === 'item') {
    return props.itemComponent;
  } else {
    return props.createComponent;
  }
})

const componentProps = computed(() => {
  switch (blocksStore.activeBlock[props.name]) {
    case "item":
      return { apiUrl: props.apiUrl, idName: props.name };
    case "create":
      return { apiUrl: props.apiUrl, name: props.name };
    default:
      return { apiUrl: props.apiUrl,
        searchName: props.name,
      };
  }
})

const changeItem = (id: number): void => {
  blocksStore.activeBlock[props.name] = 'item';
  idStore.idValues[props.name] = id;
}

// для сохранения скролла
const scrollManager = useSaveScroll(props.name)

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

  <KeepAlive exclude="HomeDefaultCreate">
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