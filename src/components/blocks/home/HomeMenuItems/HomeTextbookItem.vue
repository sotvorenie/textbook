<script setup lang="ts">
import {computed, ref, watchEffect} from "vue";

import {Item} from "../../../../types/item.ts";

import {useItem} from "../../../../composables/useItem.ts";
import decodeHtmlEntities from "../../../../composables/useDecodeHtmlEntities.ts";
import {showConfirm} from "../../../../utils/modals.ts";

import {checkPost, createItemInDB} from "../../../../api/posts/postsDB.ts";

import TextbookSkeleton from "../HomeLoadings/TextbookSkeleton.vue";

import HomeTextbookSlider from "../HomeTextbookSlider.vue";
import HomeItemCode from "../HomeItemCode.vue";
import Message from "../../../common/Message.vue";
import Modal from "../../../common/Modal.vue";

import SearchIcon from "../../../../assets/icons/SearchIcon.vue";

import useOnlineStore from "../../../../store/useOnlineStore.ts";
import useIdStore from "../../../../store/idStore.ts";
import Btn from "../../../ui/Btn.vue";

const onlineStore = useOnlineStore();
const idStore = useIdStore();

const props = defineProps({
  apiUrl: {
    type: String,
    required: true,
    default: ''
  },
  idName: {
    type: String,
    required: true
  }
})

//=========================================================//


//=========================================================//
//-- элемент списка --//
// первоначальный вид элемента списка
const item = ref<Item>({
  user_id: -1,
  title: '',
  languages_and_technologies: [],
  content: {},
  date: '',
  sort_date: '',
  time: '',
})

// видимость анимации загрузки
const isLoading = ref<boolean>(true)
//=========================================================//


//=========================================================//
//-- tabs --//
// активный индекс tab
const activeIndex = ref<number>(0)

// название активного tab
const activeTabName = computed((): string => {
  return allTabs.value[activeIndex.value] ?? ''
})

// массив tabs
const allTabs = computed((): string[] => {
  return Object.keys(item.value?.content ?? {}) ?? []
})
//=========================================================//


//=========================================================//
//-- message --//
// видимость message
const messageVisible = ref(false)
//=========================================================//


//=========================================================//
//-- блоки с кодом --//
// копирование кода
const handleCopy = async (code: string): Promise<void> => {
  await navigator.clipboard.writeText(decodeHtmlEntities(code));

  messageVisible.value = true
}
//=========================================================//


//=========================================================//
//-- вызов функций --//
// вызываем функцию получения данных из кэша/апи, а также получаем в переменную текст для отрисовки
const {text, itemElement} = useItem(
    isLoading,
    props.idName,
    props.apiUrl,
    item,
    activeIndex
)
//=========================================================//


//=========================================================//
//-- скачивание --//
// видимость кнопки "Скачать"
const downloadVisible = ref<boolean>(false)

// видимость анимации скачивания
const isDownload =  ref<boolean>(false)


// клик по кнопке "Скачать"
const handleDownload = async () => {
  const check = await showConfirm(
      'Скачивание материала',
      'Вы действительно хотите скачать данный материал?'
  )

  if (check) {
    isDownload.value = true

    await createItemInDB(props.apiUrl, itemElement.value, itemElement.value.id)

    downloadVisible.value = false
    isDownload.value = false
  }
}

// проверка наличие поста в локальной бд для скрытия/показа кнопки "Скачать"
watchEffect(async () => {
  if (!onlineStore.isOnlineMode) return

  downloadVisible.value = !await checkPost(props.apiUrl, idStore.idValues[props.idName])
})
//=========================================================//


//=========================================================//
//-- модальное окно --//
// название темы в поле ввода в модальном окне
const searchNameInModal = ref<string>('')

// отфильтрованный список tabs для модального окна
const filteredTabsForModal = computed((): string[] => {
  return allTabs.value?.filter((el: string) => el.toLowerCase().includes(searchNameInModal.value.toLowerCase())) ?? []
})


// выбор активного tab в модальном окне
const handleTabInModal = (tabName: string): void => {
  activeIndex.value = allTabs.value.indexOf(tabName)
}
//=========================================================//
</script>

<template>

  <div class="item-root">
    <Message v-model="messageVisible">Скопировано</Message>

    <TextbookSkeleton v-if="isLoading"/>

    <div class="textbook" v-else>
      <Btn class="item__download button-small"
           v-if="downloadVisible"
           @click="handleDownload"
           :is-loading="isDownload"
      >
        Скачать
      </Btn>

      <p class="textbook__title h2">{{item.title}}</p>

      <Modal :size="500">
        <template #activator="{open}">
          <Btn class="textbook__search-btn button-small recolor-svg m-auto flex"
               @click="open"
          >
            <span>Найти тему</span>
            <SearchIcon/>
          </Btn>
        </template>

        <template #default="{close}">
          <input class="textbook__search-input input"
                 placeholder="Найти тему.."
                 v-model="searchNameInModal"
          >

          <ul class="textbook__search-list">
            <li v-for="tab in filteredTabsForModal"
                :key="tab"
                :class="{
                  'textbook__search-item cursor-pointer': true,
                  'is-active': tab === activeTabName
                }"
                @click="() => {
                  handleTabInModal(tab)
                  close()
                }"
            >
              {{tab}}
            </li>
          </ul>
        </template>
      </Modal>

      <HomeTextbookSlider :items="allTabs"
                          v-model:active-index="activeIndex"
      />

      <div class="textbook__content">
        <template v-for="part in text">
          <h4 class="item__pod-title text-w500" v-if="part.type === 'title'">
            {{ part.content }}
          </h4>

          <p class="item__text" v-else-if="part.type === 'text'">
            {{ part.content }}
          </p>

          <HomeItemCode :text="part.content"
                        @copy="handleCopy"
                        v-else/>
        </template>
      </div>
    </div>
  </div>

</template>