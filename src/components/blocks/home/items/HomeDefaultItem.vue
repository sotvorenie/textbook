<script setup lang="ts">
import {ref, watchEffect} from "vue";

import {useItem} from "../../../../composables/item/useItem.ts";
import decodeHtmlEntities from "../../../../composables/useDecodeHtmlEntities.ts";
import {showConfirm, showError} from "../../../../utils/modals.ts";

import {checkPost, createItemInDB} from "../../../../api/posts/postsDB.ts";

import {Item} from "../../../../types/item.ts";

import DefaultItemSkeleton from "../loading/DefaultItemSkeleton.vue";
import HomeItemCode from "../HomeItemCode.vue";
import Message from "../../../common/Message.vue";
import Btn from "../../../ui/Btn.vue";

import useIdStore from "../../../../store/idStore.ts";
const idStore = useIdStore();
import useOnlineStore from "../../../../store/useOnlineStore.ts";
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
const {text, itemElement} = useItem(
    isLoading,
    props.name,
    props.apiUrl,
    item
)

// видимость message
const messageVisible = ref(false)

// текст message
const messageText = ref<string>('Скопировано')

// ошибочный ли message
const isErrorMessage = ref<boolean>(false)

// копирование кода
const handleCopy = async (code: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(decodeHtmlEntities(code));

    messageText.value = 'Скопировано'
    isErrorMessage.value = false
    messageVisible.value = true
  } catch (_) {
    await showError(
        'Ошибка копирования',
        'Не удалось скопировать данные..'
    )
  }
}

// видимость кнопки "Скачать"
const downloadVisible = ref<boolean>(false)

// клик по кнопке "Скачать"
const handleDownload = async () => {
  const check = await showConfirm(
      'Скачивание материала',
      'Вы действительно хотите скачать данный материал?'
  )

  if (check) {
    isDownload.value = true

    try {
      await createItemInDB(props.apiUrl, itemElement.value, itemElement.value.id)

      isDownload.value = false
    } catch (_) {
      messageText.value = 'Не удалось скачать..'
      isErrorMessage.value = true
      messageVisible.value = true
    } finally {
      downloadVisible.value = false
    }
  }
}

// видимость анимации скачивания
const isDownload =  ref<boolean>(false)

// проверка наличие поста в бд
watchEffect(async () => {
  if (!onlineStore.isOnlineMode) return

  downloadVisible.value = !await checkPost(props.apiUrl, idStore.idValues[props.name])
})
</script>

<template>

  <div class="item-root">
    <Message v-model="messageVisible" :is-error="isErrorMessage">Скопировано</Message>

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