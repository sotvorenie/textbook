<script setup lang="ts">
import {nextTick, PropType, ref, watch} from "vue";
import {Swiper, SwiperSlide} from "swiper/vue";
import 'swiper/css'

import type { Swiper as SwiperType } from 'swiper';
import Arrow from "../../../assets/icons/Arrow.vue";

defineProps({
  items: Array as PropType<string[]>,
  isCreate: {
    type: Boolean,
    default: false,
  },
})

const activeIndex = defineModel('active-index')

const emits = defineEmits(['createTab'])


// выбор активного tab
const handleTab = (index: number) => {
  activeIndex.value = index
}


// DOM-элемент слайдера
const swiperElement = ref<SwiperType | null>(null)

// видимость кнопки "Назад"
const isBeginning = ref(true);

// видимость кнопки "Вперед"
const isEnd = ref(false);


// инициализация слайдера
const onSwiper = (swiper: any) => {
  swiperElement.value = swiper
}

// проверка видимости кнопок слайдера
const checkSlides = () => {
  if (!swiperElement.value) return

  isBeginning.value = swiperElement.value.isBeginning;
  isEnd.value = swiperElement.value.isEnd;
}

// предыдущий слайд
const slidePrev = () => {
  if (swiperElement.value && !isBeginning.value) {
    swiperElement.value.slidePrev();
  }
};

// следующий слайд
const slideNext = () => {
  if (swiperElement.value && !isEnd.value) {
    swiperElement.value.slideNext();
  }
};

// функция для прокрутки к активному слайду
const scrollToActiveSlide = () => {
  if (!swiperElement.value || activeIndex.value === undefined || activeIndex.value === null) return

  const slides = swiperElement.value.slides
  const activeSlide = slides[activeIndex.value as number]

  if (!activeSlide) return

  const swiperRect = swiperElement.value.el.getBoundingClientRect()
  const slideRect = activeSlide.getBoundingClientRect()

  const isFullyVisible = slideRect.left >= swiperRect.left && slideRect.right <= swiperRect.right

  if (!isFullyVisible) {
    swiperElement.value.slideTo(activeIndex.value as number)
  }
}

// следим за изменением activeIndex и прокручиваем к нему
watch(activeIndex, async (newIndex, oldIndex) => {
  if (newIndex !== oldIndex && newIndex !== undefined && newIndex !== null) {
    await nextTick()
    scrollToActiveSlide()
  }
})
</script>

<template>

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
                   v-for="(el, index) in items"
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

      <SwiperSlide class="textbook__tabs-item" v-if="isCreate">
        <button class="button button-small"
                type="button"
                @click="emits('createTab')"
        >
          + создать
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

</template>