<script setup lang="ts">
import {ref} from "vue";

import {Item} from "../../../../types/item.ts";

import {useItem} from "../../../../composables/item/useItem.ts";

import DefaultItemSkeleton from "../loading/DefaultItemSkeleton.vue";
import HomeItemCode from "../HomeItemCode.vue";
import Btn from "../../../ui/Btn.vue";

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
  text: '',
  date: '',
  sort_date: '',
  time: '',
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
  handleDownload
} = useItem(
    props.name,
    props.apiUrl,
    item
)
//=========================================================//
</script>

<template>

  <div class="item-root">
    <DefaultItemSkeleton v-if="isLoading"/>

    <div class="item" v-else>
      <Btn class="item__download button-small"
           v-if="downloadVisible"
           @click="handleDownload"
           :is-loading="isDownload"
      >
        Скачать
      </Btn>

      <Transition name="item-title" appear>
        <p class="item__title h2">{{item?.title}}</p>
      </Transition>

      <div>
        <TransitionGroup name="item-list" appear>
          <template v-for="part in text">
            <h3 class="item__pod-title text-w500" v-if="part.type === 'title'">
              {{ part.content }}
            </h3>

            <p class="item__text" v-else-if="part.type === 'text'">
              {{ part.content }}
            </p>

            <HomeItemCode :text="part.content"
                          @copy="handleCopy"
                          v-else/>
          </template>
        </TransitionGroup>
      </div>
    </div>
  </div>

</template>