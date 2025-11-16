<script setup lang="ts">
import {ref} from "vue";

import {UnAuthorizedList} from "../../../types/list.ts";
import {Item} from "../../../types/item.ts";

import {sliceString} from "../../../composables/useSliceString.ts";

import {createItem, redactItem} from "../../../api/posts/posts.ts";
import {getItemFromDB} from "../../../api/posts/postsDB.ts";
import {removeOffline} from "../../../api/database.ts";

import Btn from "../../ui/Btn.vue";

import useOnlineStore from "../../../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();

const emits = defineEmits(['onClose', 'offClose', 'close', 'message'])

// синхронизировать данные для одного элемента списка
const syncItem = async (item: UnAuthorizedList, isAll: boolean = false) => {
  isLoading.value = true

  if (!isAll) {
    emits('offClose')
  }

  try {
    const response: Item = await getItemFromDB(item.block_name, item.id)

    if (item.offline === 'create') {
      const itemElement: Item = await createItem(item.block_name, response, false)

      await removeOffline(item.block_name, item.id, itemElement.id)
    } else if (item.offline === 'redact') {
      await redactItem(item.block_name, response, response.id as number, false)

      await removeOffline(item.block_name, item.id)
    }

    onlineStore.offlinePosts = onlineStore.offlinePosts.filter(el => {
      return !(el.id === item.id && el.block_name === item.block_name)
    })

    if (!isAll) {
      emits('message', 'Запись синхронизирована')
    }

  } catch (err) {
    throw err
  } finally {
    if (!isAll) {
      isLoading.value = false
      emits('onClose')
    }
  }
}

// видимость анимации загрузки
const isLoading = ref< boolean>(false)

// синхронизировать все
const syncAll = async () => {
  isLoading.value = true
  emits('offClose');

  try {
    const itemsToSync = [...onlineStore.offlinePosts]

    await Promise.all(
        itemsToSync.map(el => syncItem(el, true))
    );

    onlineStore.offlinePosts = []

    emits('message', 'Все записи синхронизированы!!')

    emits('close')

  } catch (error) {
    throw error;
  } finally {
    isLoading.value = false;
    emits('onClose');
  }
}
</script>

<template>

  <div class="sync">
    <Btn class="sync__btn all"
         @click="syncAll"
         :is-loading="isLoading"
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
          v-for="item in onlineStore.offlinePosts"
          :title="item.title"
      >
        <p class="sync__name h5">{{sliceString(item.title, 25)}}</p>
        <p class="sync__date">{{item.date}}</p>

        <Btn class="sync__btn"
             @click="syncItem(item)"
             :is-loading="isLoading"
        >
          Синхронизировать
        </Btn>
      </li>
    </TransitionGroup>
  </div>

</template>