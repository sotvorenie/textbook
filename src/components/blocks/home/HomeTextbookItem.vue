<script setup lang="ts">
import {ref} from "vue";

import {Item} from "../../../types/item.ts";

import {useItem} from "../../../composables/useItem.ts";

import TextbookSkeleton from "../../ui/loading/TextbookSkeleton.vue";

import HomeTextbookSlider from "./HomeTextbookSlider.vue";

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
//-- табы --//
// активный индекс табов
const activeIndex = ref<number>(0)
//=========================================================//


//=========================================================//
//-- вызов функций --//
// вызываем функцию получения данных из кэша/апи, а также получаем в переменную текст для отрисовки
const parsedText = useItem(
    isLoading,
    props.idName,
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
      <p class="textbook__title h2">{{item.title}}</p>

      <HomeTextbookSlider :items="Object.keys(item?.content ?? {})"
                          v-model:active-index="activeIndex"
      />

      <div class="textbook__content">
        <template v-for="part in parsedText">
          <h4 class="item__pod-title text-w500" v-if="part.type === 'title'">
            {{ part.content }}
          </h4>

          <p class="item__text" v-else-if="part.type === 'text'">
            {{ part.content }}
          </p>

          <pre class="item__code" v-else v-html="part.content"></pre>
        </template>
      </div>
    </div>
  </div>

</template>