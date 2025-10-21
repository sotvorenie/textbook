<script setup lang="ts">
import {computed, ref, watch} from "vue";

import {FilterList} from "../../../types/filter.ts";

import {showConfirm} from "../../../utils/modals.ts";
import {cancel} from "../../../composables/useCancelCreated.ts";

import {removeItem} from "../../../api/posts/posts.ts";

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
import useCreateStore from "../../../store/useCreateStore.ts";
const createStore = useCreateStore();
import useItemMemoStore from "../../../store/itemMemoStore.ts";
const itemMemoStore = useItemMemoStore();
import useIdStore from "../../../store/idStore.ts";
const idStore = useIdStore();
import useItemsStore from "../../../store/useItemsStore.ts";
const itemsStore = useItemsStore();

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

//=========================================================//


//=========================================================//
//-- фильтры --//
// видимость всех элементов кроме блока поля поиска (чтобы когда оно открыто - скрывать все остальные поля0
const buttonsVisible = ref(true)

// видимость кнопки "Мои"
const myBtnVisible = computed(() => {
  if (props.blockName === 'textbooks') {
    return userStore.isFullAdmin
  }

  return userStore.isAdmin
})


// выбор языков и технологий
const handleFilterChange = (list: FilterList): void => {
  let checkedItems = list?.filter(item => item.checked)
  searchStore.filterTechnologies[props?.blockName] = checkedItems?.map(item => item.name)
}

// выбор: сначала старые/новые
const handleSort = (value: string): void => {
  searchStore.sortBy[props?.blockName] = value;
}
//=========================================================//


//=========================================================//
//-- кнопка "Назад" --//
// возврат на страницу списка
const goToList = () => {
  blocksStore.activeBlock[props.blockName]= 'list'
  settingsStore.settingsVisible[props.blockName] = 'list'
}

// клик по кнопке "Назад"
const handleBack = () => {
  if (userStore.isUserPost[props.blockName]
      && blocksStore.activeBlock[props.blockName] === 'create') {

    cancel(props.blockName, () => {
      blocksStore.activeBlock[props.blockName] = 'item'

      createStore.createData[props.blockName] = {
        title: '',
        text: '',
        id: -1,
        languages_and_technologies: []
      }
    }, 'редактирование')
  } else if (blocksStore.activeBlock[props.blockName] === 'create') {
    cancel(props.blockName, goToList)
  } else {
    goToList()

    userStore.isUserPost[props.blockName] = false
  }
}
//=========================================================//


//=========================================================//
//-- страница списка --//
// видимость кнопки "Создать"
const createVisible = computed(() => {
  if (props.blockName === 'textbooks') {
    return userStore.isFullAdmin
  }

  return userStore.isAdmin
})


// клик по кнопке "Создать"
const handleCreate = () => {
  blocksStore.activeBlock[props.blockName] = 'create'
  settingsStore.settingsVisible[props?.blockName] = 'create'
}
//=========================================================//


//=========================================================//
//-- страница элемента списка --//
// видимость кнопки "Редактировать"
const redactBtnVisible = computed(() => {
  return userStore.isUserPost[props.blockName]
      && blocksStore.activeBlock[props.blockName] === 'item'
})


// клик по кнопке "Редактировать"
const handleRedact = () => {
  blocksStore.activeBlock[props.blockName] = 'create'

  let item = itemMemoStore.getLastFromCache(props.blockName)?.value

  createStore.createData[props.blockName] = {
    title: item?.title ?? '',
    text: item?.text ?? '',
    id: item?.id ?? -1,
    languages_and_technologies: item?.languages_and_technologies ?? [],
    content: item?.content ?? {},
  }
}

// клик по кнопке "Удалить"
const handleRemove = async () => {
  const confirm = await showConfirm(
      'Удаление записи',
      `Вы действительно хотите удалить ${props.createName}?`
  )
  if (confirm) {
    await removeItem(props.apiName, idStore.idValues[props.blockName])

    const arr = itemsStore.items[props.blockName];
    const index = arr.findIndex(el => el.id === idStore.idValues[props.blockName]);
    if (index !== -1) arr.splice(index, 1);

    goToList()
  }
}
//=========================================================//


//=========================================================//
//-- наблюдатели --//
// следим за изменением активного элемента (list, item и т.д.), чтобы показывать кнопки в header-е
watch(
    () => blocksStore.activeBlock[props.blockName],
    () => buttonsVisible.value = true
)
//=========================================================//
</script>

<template>

  <div class="settings flex"
       v-if="settingsStore.settingsVisible[props.blockName] === 'list'"
  >
    <Search v-model="searchStore.searchNames[props.blockName]"
            v-model:buttons-visible="buttonsVisible"
    />

    <Filter v-show="buttonsVisible" @change="handleFilterChange"/>



    <HomeSettingsMyOther v-if="buttonsVisible"
                         v-model="searchStore.myOtherFilter[blockName]"
                         :block-name="blockName"
                         :my-visible="myBtnVisible"
    />

    <Sort @search="handleSort" v-show="buttonsVisible"/>

    <Btn class="settings__create button button-small text-nowrap"
         v-show="buttonsVisible"
         v-if="createVisible"
         @click="handleCreate"
    >
      {{ `Создать ${createName}` }}
    </Btn>
  </div>

  <div class="settings__back flex flex-align-center" v-else>
    <Back @click="handleBack"/>

    <Btn class="button-small"
         v-if="redactBtnVisible"
         @click="handleRedact"
    >
      Редактировать
    </Btn>

    <Btn class="button-small"
         v-if="redactBtnVisible"
         @click="handleRemove"
    >
      Удалить
    </Btn>
  </div>

</template>