<script setup lang="ts">
import {computed, ref} from "vue";

import {Item} from "../../../../types/item.ts";

import {useItem} from "../../../../composables/item/useItem.ts";

import TextbookSkeleton from "../loading/TextbookSkeleton.vue";
import StatisticsSkeleton from "../loading/StatisticsSkeleton.vue";
import HomeItemStatistics from "../HomeItemStatistics.vue";

import HomeTextbookSlider from "../HomeTextbookSlider.vue";
import HomeItemCode from "../HomeItemCode.vue";
import Modal from "../../../common/Modal.vue";
import Btn from "../../../ui/Btn.vue";

import SearchIcon from "../../../../assets/icons/SearchIcon.vue";

import useOnlineStore from "../../../../store/useOnlineStore.ts";
import Arrow from "../../../../assets/icons/Arrow.vue";
import HomeItemComments from "../HomeItemComments.vue";
const onlineStore = useOnlineStore();

const props = defineProps({
  apiUrl: {
    type: String,
    required: true,
    default: ''
  },
  name: {
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
  statistics: {
    views: 0,
    downloads: 0,
    likes: 0,
  }
})
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


//=========================================================//
//-- вызов composable-функции --//
const {
  isLoading,
  parsedText: text,
  handleCopy,
  downloadVisible,
  isDownload,
  handleDownload,
  upBtnVisible,
  clickToUp,
  commentsVisible,
} = useItem(
    props.name,
    props.apiUrl,
    item,
    activeIndex
)
//=========================================================//
</script>

<template>

  <div class="item-root">
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

      <ul class="item__date flex flex-align-center">
        <li class="item__date-item flex flex-align-center">
          <p class="h5">Дата создания:</p>
          <p class="h6">{{item.date}}</p>
          <p class="h6">{{item.time}}</p>
        </li>
        <li class="item__date-item flex flex-align-center" v-if="item.redacted">
          <p class="h5">Редактировано:</p>
          <p class="h6">{{item.redacted.date}}</p>
          <p class="h6">{{item.redacted.time}}</p>
        </li>
      </ul>

      <Suspense v-if="onlineStore.isOnlineMode">
        <template #default>
          <HomeItemStatistics :name="name"
                              :api-name="apiUrl"
                              :statistics="item.statistics"
          />
        </template>

        <template #fallback>
          <StatisticsSkeleton/>
        </template>
      </Suspense>

      <HomeItemComments v-if="commentsVisible && onlineStore.isOnlineMode"
                        :name="name"
                        :api-name="apiUrl"
      />

      <Transition name="scale" appear>
        <button class="item__up flex-center button-width-svg recolor-svg position-fixed"
                type="button"
                @click="clickToUp"
                v-if="upBtnVisible"
        >
          <Arrow/>
        </button>
      </Transition>
    </div>
  </div>

</template>