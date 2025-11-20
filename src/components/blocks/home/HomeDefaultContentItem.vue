<script setup lang="ts">
import {computed, onMounted, onActivated, onDeactivated, VueElement} from "vue";

import {useSaveScroll} from "../../../composables/useSaveScroll.ts";

import HomeDefaultList from "./HomeDefaultList.vue";
import HomeDefaultItem from "./HomeMenuItems/HomeDefaultItem.vue";
import HomeDefaultCreate from "./HomeCreate/HomeDefaultCreate.vue";

import DefaultListSkeleton from "./HomeLoadings/DefaulListSkeleton.vue";

import useBlocksStore from "../../../store/blocksStore.ts";
const blocksStore = useBlocksStore();
import useIdStore from "../../../store/idStore.ts";
const idStore = useIdStore();

const props = defineProps({
  // название блока (hints, advices и т.д.)
  name: {
    type: String,
    required: true,
  },
  // название url апи (posts, textbooks и т.д.)
  apiUrl: {
    type: String,
    required: true,
  },
  // компонент списка
  listComponent: {
    type: VueElement,
    default: HomeDefaultList,
  },
  // компонент элемента списка
  itemComponent: {
    type: VueElement,
    default: HomeDefaultItem,
  },
  // компонент страницы создания
  createComponent: {
    type: VueElement,
    default: HomeDefaultCreate,
  },
})

//=========================================================//

//=========================================================//
//-- компоненты --//
// активный компонент
const activeComponent = computed(() => {
  if (blocksStore.activeBlock[props.name] === 'list') {
    return props.listComponent;
  } else if (blocksStore.activeBlock[props.name] === 'item') {
    return props.itemComponent;
  } else {
    return props.createComponent;
  }
})

// пропсы активного компонента
const componentProps = { apiUrl: props.apiUrl, name: props.name }
//=========================================================//


//=========================================================//
//-- компонент списка --//
// выбор элемента списка
const changeItem = (id: number): void => {
  blocksStore.activeBlock[props.name] = 'item';
  idStore.idValues[props.name] = id;
}
//=========================================================//


//=========================================================//
//-- скролл --//
const scrollManager = useSaveScroll(props.name)

onMounted(() => {
  scrollManager.setup();
});

onActivated(() => {
  scrollManager.setup()
  scrollManager.restoreScroll();
});

onDeactivated(() => {
  scrollManager.destroy();
});
//=========================================================//
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