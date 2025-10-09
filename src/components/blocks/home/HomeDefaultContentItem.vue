<script setup lang="ts">
import {computed, onMounted, onActivated, onDeactivated, VueElement, PropType, ref} from "vue";

import {List} from "../../../types/list.ts";

import {useSaveScroll} from "../../../composables/useSaveScroll.ts";

import HomeDefaultList from "./HomeDefaultList.vue";
import HomeDefaultItem from "./HomeDefaultItem.vue";
import HomeDefaultCreate from "./HomeDefaultCreate.vue";

import DefaultListSkeleton from "../../ui/loading/DefaulListSkeleton.vue";

import useBlocksStore from "../../../store/blocksStore.ts";
const blocksStore = useBlocksStore();
import useIdStore from "../../../store/idStore.ts";
import {Item} from "../../../types/item.ts";
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
  removedItemsId: Array as PropType<number[]>,
  transitionName: {
    type: String,
    default: 'top',
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
      return { apiUrl: props.apiUrl, idName: [props.name] };
    case "create":
      return { apiUrl: props.apiUrl, name: [props.name] };
    default:
      return { apiUrl: props.apiUrl,
        searchName: [props.name],
        removedItemsId: props.removedItemsId,
        createdItems: createdItems.value
      };
  }
})

const changeItem = (id: number): void => {
  blocksStore.activeBlock[props.name] = 'item';
  idStore.idValues[props.name] = id;
}

const createdItems = ref<List[]>([])
const createItem = (response: Item): void => {
  createdItems.value.push({
    id: response.id!,
    title: response.title,
    date: response.date,
    languages_and_technologies: response.languages_and_technologies
  });
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
          @create-item="createItem"
      />

      <template #fallback>
        <DefaultListSkeleton/>
      </template>
    </Suspense>
  </KeepAlive>

</template>