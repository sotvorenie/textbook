<script setup lang="ts">
import {computed, ref, watch} from "vue";

import {FilterList} from "../../../../types/filter.ts";

import {showConfirm, showError} from "../../../../utils/modals.ts";
import {cancel} from "../../../../composables/create/useCreate.ts";

import {removeItem} from "../../../../api/posts/posts.ts";
import {handleLike} from "../../../../api/liked/liked.ts";

import HomeSettingsMyOther from "../HomeSettingsMyOther.vue";

import Filter from "../../../common/Filter.vue";
import Sort from "../../../common/Sort.vue";
import Search from "../../../common/Search.vue";
import Back from "../../../ui/Back.vue";
import Btn from "../../../ui/Btn.vue";

import useBlocksStore from "../../../../store/useBlocksStore.ts";
const blocksStore = useBlocksStore();
import useSearchStore from "../../../../store/useSearchStore.ts";
const searchStore = useSearchStore();
import useSettingsStore from "../../../../store/useSettingsStore.ts";
const settingsStore = useSettingsStore();
import useUserStore from "../../../../store/useUserStore.ts";
const userStore = useUserStore();
import useCreateStore from "../../../../store/useCreateStore.ts";
const createStore = useCreateStore();
import useItemMemoStore from "../../../../store/useItemMemoStore.ts";
const itemMemoStore = useItemMemoStore();
import useIdStore from "../../../../store/useIdStore.ts";
const idStore = useIdStore();
import useItemsStore from "../../../../store/useItemsStore.ts";
const itemsStore = useItemsStore();
import useOnlineStore from "../../../../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  createName: String,
})

//=========================================================//


//=========================================================//
//-- фильтры --//
// видимость всех элементов кроме блока поля поиска (чтобы когда оно открыто - скрывать все остальные поля0
const buttonsVisible = ref(true)

// видимость кнопки "Мои"
const myBtnVisible = computed(() => {
  if (props.name === 'textbooks') {
    return userStore.isFullAdmin
  }

  return userStore.isAdmin
})


// выбор языков и технологий
const handleFilterChange = (list: FilterList): void => {
  let checkedItems = list?.filter(item => item.checked)
  searchStore.filterTechnologies[props?.name] = checkedItems?.map(item => item.name)
}

// выбор: сначала старые/новые
const handleSort = (value: string): void => {
  searchStore.sortBy[props?.name] = value;
}
//=========================================================//


//=========================================================//
//-- кнопка "Назад" --//
// возврат на страницу списка
const goToList = () => {
  blocksStore.activeBlock[props.name]= 'list'
  settingsStore.settingsVisible[props.name] = 'list'
  userStore.isUserPost[props.name] = false
}

// клик по кнопке "Назад"
const handleBack = () => {
  if (userStore.isUserPost[props.name]
      && blocksStore.activeBlock[props.name] === 'create'
      && createStore.isRedact[props.name]
  ) {

    cancel(props.name, () => {
      blocksStore.activeBlock[props.name] = 'item'

      createStore.createData[props.name] = {
        title: '',
        text: '',
        id: -1,
        languages_and_technologies: [],
        date: '',
        sort_date: '',
        time: ''
      }
    }, 'редактирование')

    createStore.isRedact[props.name] = false
  } else if (blocksStore.activeBlock[props.name] === 'create') {
    cancel(props.name, goToList)
  } else {
    goToList()
  }
}
//=========================================================//


//=========================================================//
//-- страница списка --//
// видимость кнопки "Создать"
const createVisible = computed(() => {
  if (props.name === 'textbooks') {
    return userStore.isFullAdmin || !onlineStore.isOnlineMode
  }

  return userStore.isAdmin || !onlineStore.isOnlineMode
})


// клик по кнопке "Создать"
const handleCreate = () => {
  blocksStore.activeBlock[props.name] = 'create'
  settingsStore.settingsVisible[props?.name] = 'create'
}
//=========================================================//


//=========================================================//
//-- страница элемента списка --//
// видимость кнопки редактировать/удалить
const removeRedactBtnVisible = computed(() => {
  let userStatus

  if (props.name === 'textbooks') {
    userStatus = userStore.isFullAdmin
  } else {
    userStatus = userStore.isAdmin
  }

  return ((userStore.isUserPost[props.name] && userStatus) || !onlineStore.isOnlineMode)
      && blocksStore.activeBlock[props.name] === 'item'
})


// клик по кнопке "Редактировать"
const handleRedact = () => {
  blocksStore.activeBlock[props.name] = 'create'

  let item = itemMemoStore.getLastFromCache(props.name)?.value

  createStore.createData[props.name] = {
    title: item?.title ?? '',
    text: item?.text ?? '',
    id: item?.id ?? -1,
    languages_and_technologies: item?.languages_and_technologies ?? [],
    content: item?.content ?? {},
    date: item?.date ?? '',
    sort_date: item?.sort_date ?? '',
    time: item?.time ?? '',
  }

  createStore.isRedact[props.name] = true
}

// клик по кнопке "Удалить"
const handleRemove = async () => {
  const confirm = await showConfirm(
      'Удаление записи',
      `Вы действительно хотите удалить ${props.createName}?`
  )
  if (confirm) {
    try {
      await removeItem(props.name, idStore.idValues[props.name])

      await handleLike(props.name, idStore.idValues[props.name])

      const arr = itemsStore.items[props.name];
      const index = arr.findIndex(el => el.id === idStore.idValues[props.name]);
      if (index !== -1) arr.splice(index, 1);
    } catch (_) {
      await showError(
          'Ошибка удаления записи',
          'Не удалось удалить запись..'
      )
    } finally {
      goToList()
    }
  }
}
//=========================================================//


//=========================================================//
//-- наблюдатели --//
// следим за изменением активного элемента (list, item и т.д.), чтобы показывать кнопки в header-е
watch(
    () => blocksStore.activeBlock[props.name],
    () => buttonsVisible.value = true
)
//=========================================================//
</script>

<template>

  <div class="settings flex"
       v-if="settingsStore.settingsVisible[props.name] === 'list'"
  >
    <Search v-model="searchStore.searchNames[props.name]"
            v-model:buttons-visible="buttonsVisible"
    />

    <Filter v-show="buttonsVisible" @change="handleFilterChange"/>

    <HomeSettingsMyOther v-if="buttonsVisible && onlineStore.isOnlineMode"
                         v-model="searchStore.myOtherFilter[name]"
                         :block-name="name"
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
         v-if="removeRedactBtnVisible"
         @click="handleRedact"
    >
      Редактировать
    </Btn>

    <Btn class="button-small"
         v-if="removeRedactBtnVisible"
         @click="handleRemove"
    >
      Удалить
    </Btn>
  </div>

</template>