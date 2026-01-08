<script setup lang="ts">
import {ref} from "vue";

import {Item} from "../../../../types/item.ts";

import {useItem} from "../../../../composables/item/useItem.ts";

import DefaultItemSkeleton from "../loading/DefaultItemSkeleton.vue";
import HomeItemCode from "../HomeItemCode.vue";
import Btn from "../../../ui/Btn.vue";
import StatisticsSkeleton from "../loading/StatisticsSkeleton.vue";
import HomeItemComments from "../HomeItemComments.vue";
import HomeItemStatistics from "../HomeItemStatistics.vue";

import Arrow from "../../../../assets/icons/Arrow.vue";

import useOnlineStore from "../../../../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();

const props = defineProps({
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
  text: '',
  date: '',
  sort_date: '',
  time: '',
  statistics: {
    views: 0,
    downloads: 0,
    likes: 0,
  },
})
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
    item
)
//=========================================================//
</script>

<template>

  <div class="item-root">
    <DefaultItemSkeleton v-if="isLoading"/>

    <div class="item" v-else>
      <Btn class="item__download button-small mb-10"
           v-if="downloadVisible"
           @click="handleDownload"
           :is-loading="isDownload"
      >
        Скачать
      </Btn>

      <Transition name="item-title" appear>
        <p class="item__title h2 mb-20">{{item?.title}}</p>
      </Transition>

      <TransitionGroup name="item-list" appear>
        <template v-for="part in text">
          <h3 class="item__pod-title text-w500 mb-10" v-if="part.type === 'title'">
            {{ part.content }}
          </h3>

          <p class="item__text mb-not-last-20 w-100" v-else-if="part.type === 'text'">
            {{ part.content }}
          </p>

          <HomeItemCode :text="part.content"
                        @copy="handleCopy"
                        v-else/>
        </template>
      </TransitionGroup>

      <ul class="item__date flex flex-align-center mb-10">
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
                              :statistics="item.statistics"
          />
        </template>

        <template #fallback>
          <StatisticsSkeleton/>
        </template>
      </Suspense>

      <HomeItemComments v-if="commentsVisible && onlineStore.isOnlineMode"
                        :name="name"
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