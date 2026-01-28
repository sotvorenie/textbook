<script setup lang="ts">
import {computed, PropType} from "vue";

import {Item} from "../../../types/item.ts";

import DownloadIcon from "../../../assets/icons/DownloadIcon.vue";
import EyeIcon from "../../../assets/icons/EyeIcon.vue";
import Heart from "../../../assets/icons/Heart.vue";

const props = defineProps({
  statistics: {
    type: Object as PropType<Item['statistics']>,
    required: true,
  },
})

interface StatisticsList {
  name: string
  icon: any
  number: number | string
}

const statistics = computed((): StatisticsList[] => {
  return [
    {
      name: 'Кол-во просмотров: ',
      icon: EyeIcon,
      number: props?.statistics?.views || 1,
    },
    {
      name: 'Кол-во скачиваний: ',
      icon: DownloadIcon,
      number: props?.statistics?.downloads || 0,
    },
    {
      name: 'Кол-во добавления в избранное: ',
      icon: Heart,
      number: props?.statistics?.likes || 0,
    },
  ]
})
</script>

<template>

  <div class="statistics mb-30">
    <p class="statistics__title h4 mb-10">Статистика поста:</p>

    <ul class="statistics__list">
      <li class="statistics__item flex" v-for="item in statistics">
        <p class="statistics__name">{{item.name}}</p>
        <div class="statistics__number flex flex-align-center recolor-svg">
          <span>{{item.number.toLocaleString()}}</span>
          <Component :is="item.icon" />
        </div>
      </li>
    </ul>
  </div>

</template>