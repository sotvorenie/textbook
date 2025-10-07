<script setup lang="ts">
import {ref} from "vue";

import {Item} from "../../../types/item.ts";
import type { Swiper as SwiperType } from 'swiper';

import {useItem} from "../../../composables/useItem.ts";

import {Swiper, SwiperSlide} from "swiper/vue";
import 'swiper/css'

import Arrow from "../../../assets/icons/Arrow.vue";

import TextbookSkeleton from "../../ui/loading/TextbookSkeleton.vue";

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

const swiperElement = ref<SwiperType | null>(null)

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

const parsedText = useItem(
    isLoading,
    props.idName,
    props.apiUrl,
    item,
    activeIndex
)
</script>

<template>

  <div class="item-root">
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
  </div>

</template>