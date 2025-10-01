<script setup lang="ts">
import {computed, ref} from "vue";

import {FilterList} from "../../../types/filter.ts";

import HomeSettingsMyOther from "./HomeSettingsMyOther.vue";

import Filter from "../../common/Filter.vue";
import Sort from "../../common/Sort.vue";
import Search from "../../common/Search.vue";
import Back from "../../ui/Back.vue";
import Btn from "../../ui/Btn.vue";

import useBlocksStore from "../../../store/blocksStore.ts";
const blocksStore = useBlocksStore();
import useSearchStore from "../../../store/searchStore.ts";
const searchStore = useSearchStore();
import useSettingsStore from "../../../store/settingsStore.ts";
const settingsStore = useSettingsStore();
import useUserStore from "../../../store/userStore.ts";
const userStore = useUserStore();

const props = defineProps({
  createName: String,
  blockName: {
    type: String,
    required: true,
  }
})

const handleFilterChange = (list: FilterList): void => {
  let checkedItems = list?.filter(item => item.checked)
  searchStore.filterTechnologies[props?.blockName] = checkedItems?.map(item => item.name)
}

const handleSort = (value: string): void => {
  searchStore.sortBy[props?.blockName] = value;
}

const handleCreate = () => {
  blocksStore.activeBlock[props.blockName] = 'create'
}

const handleBack = () => {
  blocksStore.activeBlock[props.blockName]= 'list'
  settingsStore.settingsVisible[props.blockName] = 'list'
}

const createVisible = computed(() => {
  if (props.blockName === 'textbooks') {
    return userStore.isFullAdmin
  }

  return userStore.isAdmin
})

const createBtnVisible = ref(true)

const myOtherVisible = computed(() => {
  if (props.blockName === 'textbooks') {
    return userStore.isFullAdmin
  }

  return userStore.isAdmin
})

</script>

<template>

  <div class="settings flex"
       v-if="settingsStore.settingsVisible[props.blockName] === 'list'"
  >
    <Search v-model="searchStore.searchNames[props.blockName]"
            v-model:create-visible="createBtnVisible"
    />

    <Filter @change="handleFilterChange"/>

    <HomeSettingsMyOther v-if="myOtherVisible"
                         v-model="searchStore.myOtherFilter[blockName]"
                         :block-name="blockName"
    />

    <Sort @search="handleSort"/>

    <Btn class="settings__create button button-small"
         v-show="createBtnVisible"
         v-if="createVisible"
         @click="handleCreate"
    >
      {{ `Создать ${createName}` }}
    </Btn>
  </div>

  <Back @click="handleBack" v-else/>

</template>