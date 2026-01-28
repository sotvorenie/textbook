<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";

import {FilterList} from "../../../types/filter.ts";
import {Item} from "../../../types/item.ts";
import {List} from "../../../types/list.ts";

import {moveItem, removeItem} from "../../../api/posts/posts.ts";
import {handleLike} from "../../../api/liked/liked.ts";

import {showConfirm, showError} from "../../../utils/modals.ts";
import {cancel} from "../../../composables/create/useCreate.ts";
import {useQueryUpdater} from "../../../composables/useUpdateQuery.ts";
import toRouteName from "../../../composables/useToRouteName.ts";
import {useSignal} from "../../../composables/useSignal.ts";

import HomeSettingsMyOther from "./HeaderMyOther.vue";
import HeaderFilter from "./HeaderFilter.vue";
import HeaderSort from "./HeaderSort.vue";
import HeaderSearch from "./HeaderSearch.vue";
import Back from "../../ui/Back.vue";
import Btn from "../../ui/Btn.vue";
import Modal from "../../common/Modal.vue";
import FoxModal from "../../ui/loading/FoxModal.vue";

import useUserStore from "../../../store/useUserStore.ts";
const userStore = useUserStore();
import useCreateStore from "../../../store/useCreateStore.ts";
const createStore = useCreateStore();
import useItemMemoStore from "../../../store/useItemMemoStore.ts";
const itemMemoStore = useItemMemoStore();
import useItemsStore from "../../../store/useItemsStore.ts";
const itemsStore = useItemsStore();
import useOnlineStore from "../../../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();
import useRouterStore from "../../../store/useRouterStore.ts";
const routerStore = useRouterStore();

const route = useRoute();
const router = useRouter();

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  createName: String,
})

//=========================================================//


const { debouncedUpdateQuery, updateQuery } = useQueryUpdater()
const signal = useSignal()

//=========================================================//
//-- модальное окно загрузки при удалении/перемещении --//
const isLoading = ref(false)
//=========================================================//


//=========================================================//
//-- фильтры --//
// видимость всех элементов кроме блока поля поиска (чтобы когда оно открыто - скрывать все остальные поля
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
  const checked = list.filter(item => item.checked).map(item => item.name)

  debouncedUpdateQuery({
    tech: checked.length ? checked.join(',') : undefined,
    page: 1
  })
}

// выбор: сначала старые/новые
const handleSort = (value: string): void => {
  updateQuery({
    sort: value || undefined,
    page: 1
  })
}
//=========================================================//


//=========================================================//
//-- кнопка "Назад" --//
// список страниц, на которых будет простая кнопка "Назад" с router.back()
const pagesListForSimpleBack = new Set(['User'])

// видимость блока "Назад"
const backVisible = computed(() => {
  if (!route.path || !route.name || !props.name) return false

  return route.path !== `/${props.name}` && !pagesListForSimpleBack.has(route.name as string)
})

// видимость простой кнопки "Назад"
const simpleBackVisible = computed(() => {
  if (!route.name) return false

  return pagesListForSimpleBack.has(route.name as string)
})


// клик по кнопке "Назад"
const handleBack = () => {
  if (route.path.includes('/create')) {
    if (route.query.id) {
      cancel(props.name, () => {
        createStore.isRedact[props.name] = false
        router.push({name: `${toRouteName(props.name)}Item`, params: {id: route.query.id as string}})
      }, 'редактирование')
    } else {
      cancel(props.name, () => router.back())
    }

    return
  }

  const section = pagesListForSimpleBack.has(route.name as string) ? route.query.name as string : props.name
  const routes = routerStore.sectionRoutes[section]

  if (routes?.length > 1) {
    const lastIndex = routes.length - 2
    if (lastIndex >= 0) {
      const last = routes[lastIndex]
      router.push(last)
      routes.pop()
      return
    }
  }

  router.push({ path: `/${section}` })
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
  router.push({name: `${toRouteName(props.name)}Create`})
}
//=========================================================//


//=========================================================//
//-- страница элемента списка --//
// видимость блока фильтров
const filtersVisible = computed(() => {
  if (!route.name) return false

  return route.path === `/${props.name}` && !pagesListForSimpleBack.has(route.name as string)
})

// видимость кнопки редактировать/удалить
const redactsBtnVisible = computed(() => {
  let userStatus

  if (props.name === 'textbooks') {
    userStatus = userStore.isFullAdmin
  } else {
    userStatus = userStore.isAdmin
  }

  return ((userStore.isUserPost[props.name] && userStatus) || !onlineStore.isOnlineMode) && !route.path.includes('/create')
})


// клик по кнопке "Редактировать"
const handleRedact = async () => {
  await router.push({
    name: `${toRouteName(props.name)}Create`,
    query: {
      id: route.params.id
    }
  })

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
      isLoading.value = true

      await removeItem(props.name, +route.params.id, signal)

      await handleLike(props.name, +route.params.id, signal)

      const arr = itemsStore.items[props.name]
      const index = arr.findIndex(el => el.id === +route.params.id)
      if (index !== -1) arr.splice(index, 1)

      router.back()
    } catch (err) {
      console.error('Ошибка удаления записи', err)

      await showError(
          'Ошибка удаления записи',
          'Не удалось удалить запись..'
      )
    } finally {
      isLoading.value = false
    }
  }
}
//=========================================================//


//=========================================================//
//-- перенос поста --//
// видимость кнопки "Переместить"
const moveBtnVisible = computed(() => {
  return redactsBtnVisible.value && props.name !== 'textbooks'
})

// список всех разделов
const allSectionsList = [
  {
    name: 'hints',
    value: 'Полезное',
  },
  {
    name: 'advices',
    value: 'Советы',
  },
  {
    name: 'projects',
    value: 'Проекты',
  },
]

// активный раздел на котором мы находимся
const activeSection = computed((): {name: string, value: string} => {
  const activeSection = (route.name as string).toLowerCase()

  return allSectionsList.find(section => activeSection.includes(section.name))!
})

// список разделов для переноса
const sectionsListForMove = computed(() => {
  const activeSection = (route.name as string).toLowerCase()

  return allSectionsList.filter(section => !activeSection.includes(section.name))
})


// клик по разделу для переноса
const handleSectionMove = async (section: {name: string, value: string}) => {
  const confirm = await showConfirm(
      'Перенос записи',
      `Вы действительно хотите перенести запись из раздела "${activeSection.value.value}" в раздел "${section.value}"?`
  )
  if (confirm) {
    isLoading.value = true

    const id = Number(route.params.id as string)
    const item: Item = itemMemoStore.getLastFromCache(props.name)?.value as Item

    try {
      const hasLike: boolean = userStore.userLiked.items[props.name].includes(id)

      if (hasLike) await handleLike(activeSection.value.name, id, signal)

      const newItemId: number = await moveItem(id, activeSection.value.name, section.name, item, signal) as number

      const deletedItem = {...itemsStore.items[props.name].find(item => item.id === id) as List, id: newItemId }
      itemsStore.items[props.name] = itemsStore.items[props.name]?.filter(item => item.id !== id)

      if (itemsStore.items[section.name].length > 0) {
        itemsStore.items[section.name].unshift(deletedItem)
      }

      if (hasLike) await handleLike(section.name, newItemId, signal)

      router.back()
    } catch (err) {
      console.error('Не удалось перенести элемент в другой раздел', err)

      await showError(
          'Ошибка переноса записи',
          'Не удалось перенести запись в другой раздел..'
      )
    } finally {
      isLoading.value = false
    }
  }
}
//=========================================================//


//=========================================================//
//-- наблюдатели --//
// следим за изменением активного элемента (list, item и т.д.), чтобы показывать кнопки в header-е
watch(
    () => route.path,
    () => buttonsVisible.value = true
)
//=========================================================//
</script>

<template>

  <FoxModal v-model="isLoading"/>

  <div class="header flex" v-if="filtersVisible">
    <HeaderSearch v-model:buttons-visible="buttonsVisible"/>

    <HeaderFilter v-show="buttonsVisible" @change="handleFilterChange"/>

    <HomeSettingsMyOther v-if="buttonsVisible && onlineStore.isOnlineMode"
                         :block-name="name"
                         :my-visible="myBtnVisible"
    />

    <HeaderSort @search="handleSort" v-show="buttonsVisible"/>

    <Btn class="header__create button button-small text-nowrap"
         v-show="buttonsVisible"
         v-if="createVisible"
         @click="handleCreate"
    >
      {{ `Создать ${createName}` }}
    </Btn>
  </div>

  <div class="header__back flex flex-align-center" v-if="backVisible">
    <Back @click="handleBack"/>

    <Btn class="button-small"
         v-if="redactsBtnVisible"
         @click="handleRedact"
    >
      Редактировать
    </Btn>

    <Btn class="button-small"
         v-if="redactsBtnVisible"
         @click="handleRemove"
    >
      Удалить
    </Btn>

    <Modal v-if="moveBtnVisible" :size="500">
      <template #activator="{open}">
        <Btn class="button-small" @click="open">Перенести</Btn>
      </template>
      <template #default>
        <p class="text-center mb-20 h5">Выберите раздел для переноса</p>

        <ul class="list">
          <li class="list__item cursor-pointer mb-not-last-10"
              v-for="section in sectionsListForMove"
              :key="section.name"
              @click="handleSectionMove(section)"
          >
            {{section?.value}}
          </li>
        </ul>
      </template>
    </Modal>
  </div>

  <Back class="hello" @click="handleBack" v-if="simpleBackVisible"/>

</template>