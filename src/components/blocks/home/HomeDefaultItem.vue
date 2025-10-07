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

const item = ref<Item>({
  user_id: -1,
  title: '',
  languages_and_technologies: [],
  text: '',
  date: '',
  sort_date: '',
  time: '',
})

const isLoading = ref<boolean>(true)

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
      <p class="item__title h2">{{item?.title}}</p>

      <div>
        <template v-for="part in parsedText">
          <p class="item__text" v-if="part.type === 'text'">{{part.content}}</p>
          <pre class="item__code" v-else v-html="part.content"></pre>
        </template>
      </div>
    </div>
  </div>

</template>