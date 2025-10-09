<script setup lang="ts">
import {ref} from "vue";

import {useItem} from "../../../composables/useItem.ts";

import {Item} from "../../../types/item.ts";

import DefaultItemSkeleton from "../../ui/loading/DefaultItemSkeleton.vue";

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

// видимость анимации загрузки
const isLoading = ref<boolean>(true)

// вызываем функцию получения данных из кэша/апи, а также получаем в переменную текст для отрисовки
const parsedText = useItem(
    isLoading,
    props.idName,
    props.apiUrl,
    item
)
</script>

<template>

  <div class="item-root">
    <DefaultItemSkeleton v-if="isLoading"/>

    <div class="item" v-else>
      <Transition name="item-title" appear>
        <p class="item__title h2">{{item?.title}}</p>
      </Transition>

      <div>
        <TransitionGroup name="item-list" appear>
          <div v-for="(part, index) in parsedText"
               :key="index"
               :style="{'--index': index}"
          >
            <p class="item__text" v-if="part.type === 'text'">{{part.content}}</p>
            <pre class="item__code" v-else v-html="part.content"></pre>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>

</template>