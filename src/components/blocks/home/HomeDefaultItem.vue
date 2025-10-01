<script setup lang="ts">
import {computed, onMounted, ref} from "vue";

import useIdStore from "../../../store/idStore.ts";
const idStore = useIdStore();
import useSettingsStore from "../../../store/settingsStore.ts";
const settingsStore = useSettingsStore();
import useItemMemoStore from "../../../store/itemMemoStore.ts";
const itemMemoStore = useItemMemoStore();

import {Item} from "../../../types/item.ts";
import {getItem} from "../../../api/posts/posts.ts";

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
  time: '',
})

const getListItem = async () => {
  try {
    const response = await getItem(props.apiUrl, idStore.idValues[props.idName]);
    if (response) {
      item.value = response;
    }
  } catch (_){}
}

const highlightCodeComments = (code: string): string => {
  return code.replace(/(\/\/.*$)/gm, '<span class="item__comment">$1</span>');
};

const parsedText = computed(() => {
  const regex = /<code>(.*?)<\/code>/gis;
  let lastIndex = 0;
  const result: Array<{ type: "text" | "code"; content: string }> = [];

  let match;
  while ((match = regex.exec(item.value.text)) !== null) {
    const index = match.index;

    if (index > lastIndex) {
      const rawText = item.value?.text.slice(lastIndex, index);
      const restoredText = rawText
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/<[^>]*>/g, '');

      result.push({ type: "text", content: restoredText });
    }

    const codeContent = match[1]
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');

    const highlightedCode = highlightCodeComments(codeContent);
    result.push({ type: "code", content: highlightedCode });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < item.value?.text?.length) {
    const remainingText = item.value?.text.slice(lastIndex)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/<[^>]*>/g, '');

    result.push({ type: "text", content: remainingText });
  }

  return result;
});

onMounted(async () => {
  const data = itemMemoStore.getItem(
      props.idName,
      idStore.idValues[props.idName]
  );

  if (data) {
    item.value = data
  } else {
    await getListItem();

    itemMemoStore.setItem(
        props.idName,
        idStore.idValues[props.idName], item.value
    )
  }

  settingsStore.settingsVisible[props.idName] = 'item';
})
</script>

<template>

  <div class="item">
    <p class="item__title h2">{{item?.title}}</p>

    <div>
      <template v-for="part in parsedText">
        <p class="item__text" v-if="part.type === 'text'">{{part.content}}</p>
        <pre class="item__code" v-else v-html="part.content"></pre>
      </template>
    </div>
  </div>

</template>