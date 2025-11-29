<script setup lang="ts">
import {ref} from "vue";

import {Statistic} from "../../../api/statistics/types.ts";

import {getStatistics} from "../../../api/statistics/statistics.ts";

import {showError} from "../../../utils/modals.ts";

import DownloadIcon from "../../../assets/icons/DownloadIcon.vue";
import EyeIcon from "../../../assets/icons/EyeIcon.vue";
import Heart from "../../../assets/icons/Heart.vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  apiName: {
    type: String,
    required: true,
  },
})

interface StatisticsList {
  name: String
  icon: any
  number: Number | String
}

const statistics = ref<StatisticsList[]>([])

const getData = async () => {
  try {
    const data: Statistic | undefined =
        await getStatistics(props.name, props.apiName)

    if (data) {
      statistics.value = [
        {
          name: 'Кол-во просмотров: ',
          icon: EyeIcon,
          number: data?.statistic.views || 0,
        },
        {
          name: 'Кол-во скачиваний: ',
          icon: DownloadIcon,
          number: data?.statistic.downloads || 0,
        },
        {
          name: 'Кол-во добавления в избранное: ',
          icon: Heart,
          number: data?.statistic.likes || 0,
        },
      ]
    }
  } catch (err) {
    statistics.value = [
      {
        name: 'Кол-во просмотров: ',
        icon: EyeIcon,
        number: 'Неизвестно',
      },
      {
        name: 'Кол-во скачиваний: ',
        icon: DownloadIcon,
        number: 'Неизвестно',
      },
      {
        name: 'Кол-во добавления в избранное: ',
        icon: Heart,
        number: 'Неизвестно',
      },
    ]
    await showError(
        'Ошибка загрузки статистики поста',
        'Не удалось загрузить данные статистики..'
    )
  }
}

await getData()
</script>

<template>

  <div class="statistics">
    <p class="statistics__title h4">Статистика поста:</p>

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