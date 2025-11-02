<script setup lang="ts">
import {ref} from "vue";

import {useItem} from "../../../../composables/useItem.ts";
import decodeHtmlEntities from "../../../../composables/useDecodeHtmlEntities.ts";

import {Item} from "../../../../types/item.ts";

import DefaultItemSkeleton from "../HomeLoadings/DefaultItemSkeleton.vue";
import HomeItemCode from "../HomeItemCode.vue";
import Message from "../../../common/Message.vue";

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

// видимость message
const messageVisible = ref(false)

// копирование кода
const handleCopy = async (code: string): Promise<void> => {
  await navigator.clipboard.writeText(decodeHtmlEntities(code));

  messageVisible.value = true
}
</script>

<template>

  <div class="item-root">
    <Message v-model="messageVisible">Скопировано</Message>

    <DefaultItemSkeleton v-if="isLoading"/>

    <div class="item" v-else>
      <Transition name="item-title" appear>
        <p class="item__title h2">{{item?.title}}</p>
      </Transition>

      <div>
        <TransitionGroup name="item-list" appear>
          <template v-for="part in parsedText">
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