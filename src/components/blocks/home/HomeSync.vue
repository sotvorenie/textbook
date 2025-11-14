<script setup lang="ts">
import {computed, ref, watch, watchEffect} from "vue";

import {UnAuthorizedList} from "../../../types/list.ts";
import {Item} from "../../../types/item.ts";

import {sliceString} from "../../../composables/useSliceString.ts";

import {createItem, redactItem} from "../../../api/posts/posts.ts";
import {getItemFromDB} from "../../../api/posts/postsDB.ts";
import {removeOffline} from "../../../api/database.ts";

import Btn from "../../ui/Btn.vue";
import Message from "../../common/Message.vue";

import useOnlineStore from "../../../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();
import useUserStore from "../../../store/userStore.ts";
const userStore = useUserStore();

const emits = defineEmits(['onClose', 'offClose', 'close'])

// видимость анимации загрузки в кнопках каждой записи
const listItemsVisible = ref<boolean[]>([])

// изменить значение видимости анимации у какойто кнопки
const setVisible = (index: number) => {
  listItemsVisible.value[index] = !listItemsVisible.value[index];
}

// видимость кнопки "Синхронизировать" (на случай, если у нас есть несинхронизированный учебник, а мы не fullAdmin)
const syncBtnVisible = (item: UnAuthorizedList) => {
  if (item.block_name === 'textbooks') {
    return userStore.isFullAdmin
  }

  return true
}

// видимость кнопки "Синхронизировать все" (на случай, если у нас есть несинхронизированный учебник, а мы не fullAdmin)
const syncAllBtnVisible = computed((): boolean => {
  if (userStore.isFullAdmin) return true

  return onlineStore.offlinePosts.some(el => el.block_name === 'textbooks')
})

// синхронизировать данные для одного элемента списка
const syncItem = async (item: UnAuthorizedList, index?: number) => {
  if (index) {
    setVisible(index)
  }

  try {
    const response: Item = await getItemFromDB(item.block_name, item.id)

    if (item.offline === 'create') {
      await createItem(item.block_name, response, false)
    } else if (item.offline === 'redact') {
      await redactItem(item.block_name, response, response.id as number, false)
    }

    await removeOffline(item.block_name, item.id)

    onlineStore.offlinePosts = onlineStore.offlinePosts.filter(el => {
      return !(el.id === item.id && el.block_name === item.block_name)
    })

    messageText.value = 'Запись синхронизирована!!'
    messageVisible.value = true
  } catch (err) {
    if (index !== undefined) {
      setVisible(index)
    }

    throw err
  }
}

// видимость анимации загрузки в "Синхронизировать все"
const syncAllVisible = ref<boolean>(false)

// синхронизитровать все
const syncAll = async () => {
  syncAllVisible.value = true

  try {
    const itemsToSync = [...onlineStore.offlinePosts]

    await Promise.all(
        itemsToSync.map(el => syncItem(el))
    );

    onlineStore.offlinePosts = []

    messageText.value = 'Все записи синхронизированы!!'
    messageVisible.value = true

    emits('close')

  } catch (error) {
    throw error;
  } finally {
    syncAllVisible.value = false;
  }
}

// видимость message
const messageVisible = ref<boolean>(false)

// текст message
const messageText = ref<string>('')

watchEffect(() => {
  listItemsVisible.value = onlineStore.offlinePosts.map(() => false)
})

watch(
    [() => listItemsVisible.value, () => syncAllVisible.value],
    ([listVisible, syncAll], [oldListVisible, oldSyncAll]) => {
      const hasAnyTrue = syncAll || listVisible.some(item => item === true);

      if (hasAnyTrue) {
        emits('offClose');
      } else {
        const hadAnyTrueBefore = oldSyncAll || (oldListVisible && oldListVisible.some(item => item === true));

        if (hadAnyTrueBefore) {
          emits('onClose');
        }
      }
    },
    { deep: true }
);

</script>

<template>

  <div class="sync">
    <Message v-model="messageVisible">{{messageText}}</Message>

    <Btn class="sync__btn all"
         @click="syncAll"
         :is-loading="syncAllVisible"
         v-if="syncAllBtnVisible"
    >
      Синхронизировать все
    </Btn>

    <p class="sync__title h4">Список созданных элементов:</p>

    <TransitionGroup tag="ul"
                     class="sync__list"
                     name="item-list"
                     appear
    >
      <li class="sync__item"
          v-for="(item, index) in onlineStore.offlinePosts"
          :title="item.title"
      >
        <p class="sync__name h5">{{sliceString(item.title, 25)}}</p>
        <p class="sync__date">{{item.date}}</p>

        <Btn class="sync__btn"
             @click="syncItem(item, index)"
             :is-loading="listItemsVisible[index]"
             v-if="syncBtnVisible(item)"
        >
          Синхронизировать
        </Btn>
      </li>
    </TransitionGroup>
  </div>

</template>