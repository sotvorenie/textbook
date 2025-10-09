<script setup lang="ts">
import {computed, ref, watch} from "vue";

import {FilterList} from "../../../types/filter.ts";

import {showConfirm} from "../../../utils/modals.ts";

import {removeItem} from "../../../api/posts/posts.ts";

import HomeSettingsMyOther from "./HomeSettingsMyOther.vue";

import Filter from "../../common/Filter.vue";
import Sort from "../../common/Sort.vue";
import Search from "../../common/Search.vue";
import Back from "../../ui/Back.vue";
import Btn from "../../ui/Btn.vue";

import useBlocksStore from "../../../store/blocksStore.ts";
import useSearchStore from "../../../store/searchStore.ts";
import useSettingsStore from "../../../store/settingsStore.ts";
import useUserStore from "../../../store/userStore.ts";
import useCreateStore from "../../../store/useCreateStore.ts";
import useItemMemoStore from "../../../store/itemMemoStore.ts";
import useIdStore from "../../../store/idStore.ts";

const blocksStore = useBlocksStore();
const searchStore = useSearchStore();
const settingsStore = useSettingsStore();
const userStore = useUserStore();
const createStore = useCreateStore();
const itemMemoStore = useItemMemoStore();
const idStore = useIdStore();

const props = defineProps({
  createName: String,
  blockName: {
    type: String,
    required: true,
  },
  apiName: {
    type: String,
    required: true,
  },
})

const emits = defineEmits(['removeItem'])

const handleFilterChange = (list: FilterList): void => {
  let checkedItems = list?.filter(item => item.checked)
  searchStore.filterTechnologies[props?.blockName] = checkedItems?.map(item => item.name)
}

const handleSort = (value: string): void => {
  searchStore.sortBy[props?.blockName] = value;
}

const handleCreate = () => {
  blocksStore.activeBlock[props.blockName] = 'create'
  settingsStore.settingsVisible[props?.blockName] = 'create'
}

const goToList = () => {
  blocksStore.activeBlock[props.blockName]= 'list'
  settingsStore.settingsVisible[props.blockName] = 'list'
}

const handleBack = () => {
  if (userStore.isUserPost[props.blockName]
      && blocksStore.activeBlock[props.blockName] === 'create') {

    blocksStore.activeBlock[props.blockName] = 'item'

    createStore.createData[props.blockName] = {
      title: '',
      text: '',
      id: -1,
    }
  } else {
    goToList()

    userStore.isUserPost[props.blockName] = false
  }
}

const createVisible = computed(() => {
  if (props.blockName === 'textbooks') {
    return userStore.isFullAdmin
  }

  return userStore.isAdmin
})

const createBtnVisible = ref(true)

const myBtnVisible = computed(() => {
  if (props.blockName === 'textbooks') {
    return userStore.isFullAdmin
  }

  return userStore.isAdmin
})

const handleRedact = () => {
  blocksStore.activeBlock[props.blockName] = 'create'

  let item = itemMemoStore.getLastFromCache(props.blockName)?.value

  createStore.createData[props.blockName] = {
    title: item?.title ?? '',
    text: item?.text ?? '',
    id: item?.id ?? -1,
  }
}

const handleRemove = async () => {
  const confirm = await showConfirm(
      'Удаление записи',
      `Вы действительно хотите удалить ${props.createName}?`
  )
  if (confirm) {
    await removeItem(props.apiName, idStore.idValues[props.blockName])

    emits('removeItem', {
      blockName: props.blockName,
      id: idStore.idValues[props.blockName]
    })

    goToList()
  }
}

watch(
    () => blocksStore.activeBlock[props.blockName],
    () => createBtnVisible.value = true
)

</script>

<template>

  <div class="settings flex"
       v-if="settingsStore.settingsVisible[props.blockName] === 'list'"
  >
    <Search v-model="searchStore.searchNames[props.blockName]"
            v-model:create-visible="createBtnVisible"
    />

    <Filter v-show="createBtnVisible" @change="handleFilterChange"/>



    <HomeSettingsMyOther v-if="createBtnVisible"
                         v-model="searchStore.myOtherFilter[blockName]"
                         :block-name="blockName"
                         :my-visible="myBtnVisible"
    />

    <Sort @search="handleSort" v-show="createBtnVisible"/>

    <Btn class="settings__create button button-small text-nowrap"
         v-show="createBtnVisible"
         v-if="createVisible"
         @click="handleCreate"
    >
      {{ `Создать ${createName}` }}
    </Btn>
  </div>

  <div class="settings__back flex flex-align-center" v-else>
    <Back @click="handleBack"/>

    <Btn class="button-small"
         v-if="userStore.isUserPost[blockName]"
         @click="handleRedact"
    >
      Редактировать
    </Btn>

    <Btn class="button-small"
         v-if="userStore.isUserPost[blockName]"
         @click="handleRemove"
    >
      Удалить
    </Btn>
  </div>

</template>