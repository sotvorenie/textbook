<script setup lang="ts">
import {computed, onActivated, ref} from "vue";

import {Item} from "../../../types/item.ts";

import {Swiper, SwiperSlide} from "swiper/vue";
import 'swiper/css'

import {getItem} from "../../../api/posts/posts.ts";

import Arrow from "../../../assets/icons/Arrow.vue";

import TextbookSkeleton from "../../ui/loading/TextbookSkeleton.vue";

import useIdStore from "../../../store/idStore.ts";
const idStore = useIdStore();
import useItemMemoStore from "../../../store/itemMemoStore.ts";
const itemMemoStore = useItemMemoStore();
import useSettingsStore from "../../../store/settingsStore.ts";
const settingsStore = useSettingsStore();

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
  content: {},
  date: '',
  sort_date: '',
  time: '',
})

const highlightCodeComments = (code: string): string => {
  return code.replace(/(\/\/.*$)/gm, '<span class="item__comment">$1</span>');
};

const getListItem = async () => {
  try {
    const response = await getItem(props.apiUrl, idStore.idValues[props.idName]);
    if (response) {
      item.value = response;
    }
  } catch (_){}
}

const parsedText = computed(() => {
  const regex = /<code>(.*?)<\/code>/gis;
  let lastIndex = 0;
  const result: Array<{ type: "text" | "code"; content: string }> = [];

  let match;
  let text = Object.values(item.value.content)[activeIndex.value]
  while ((match = regex.exec(text)) !== null) {
    const index = match.index;

    if (index > lastIndex) {
      const rawText = text?.slice(lastIndex, index);
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

  if (lastIndex < text?.length) {
    const remainingText = text?.slice(lastIndex)
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

const swiperElement = ref(null)

const isBeginning = ref(true);
const isEnd = ref(false);

const onSwiper = (swiper: any) => {
  swiperElement.value = swiper
}

const checkSlides = () => {
  if (!swiperElement.value) return

  isBeginning.value = swiperElement.value.isBeginning;
  isEnd.value = swiperElement.value.isEnd;
}

const slidePrev = () => {
  if (swiperElement.value && !isBeginning.value) {
    swiperElement.value.slidePrev();
  }
};
const slideNext = () => {
  if (swiperElement.value && !isEnd.value) {
    swiperElement.value.slideNext();
  }
};

const activeIndex = ref<number>(0)

const handleTab = (index: number) => {
  activeIndex.value = index
}

const isLoading = ref<boolean>(true)

onActivated(async () => {
  isLoading.value = true

  const data = itemMemoStore.getItem(
      props.idName,
      idStore.idValues[props.idName]
  );

  settingsStore.settingsVisible[props.idName] = 'item';

  if (data) {
    item.value = data
  } else {
    await getListItem();

    itemMemoStore.setItem(
        props.idName,
        idStore.idValues[props.idName], item.value
    )
  }

  isLoading.value = false
})
</script>

<template>

  <TextbookSkeleton v-if="isLoading"/>

  <div class="textbook" v-else>
    <p class="textbook__title h2">Учебник Vue</p>

    <div class="textbook__tabs flex flex-align-center">
      <button class="textbook__btn textbook__prev button-width-svg hover-color-accent recolor-svg"
              type="button"
              @click="slidePrev"
              :disabled="isBeginning"
      >
        <Arrow/>
      </button>
      <Swiper @swiper="onSwiper"
              @slide-change="checkSlides"
              :slides-per-view="'auto'"
              :space-between="10"
      >
        <SwiperSlide class="textbook__tabs-item"
                     v-for="(el, index) in Object.keys(item?.content ?? {})"
        >
          <button :class="{
                    'button button-small': true,
                    'is-active': activeIndex === index
                  }"
                  type="button"
                  @click="handleTab(index)"
          >
            {{el}}
          </button>
        </SwiperSlide>
      </Swiper>
      <button class="textbook__btn textbook__next button-width-svg hover-color-accent recolor-svg"
              type="button"
              @click="slideNext"
              :disabled="isEnd"
      >
        <Arrow/>
      </button>
    </div>

    <div>
      <template v-for="part in parsedText">
        <p class="item__text" v-if="part.type === 'text'">{{part.content}}</p>
        <pre class="item__code" v-else v-html="part.content"></pre>
      </template>
    </div>
  </div>

</template>