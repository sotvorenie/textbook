<script setup lang="ts">
import {onBeforeMount, onUnmounted, ref} from "vue";

import {get} from "../../../api/base.ts";

import UserStatisticsSkeleton from "./UserStatisticsSkeleton.vue";

const props = defineProps({
  userId: {
    type: Number,
    required: true,
  }
})

const statistics = defineModel('statistics', {
  type: Object,
  required: true
})

type StatisticsType = {
  statistics: {
    downloads: number;
    likes: number;
    views: number;
  }
}

//=========================================================//

//=========================================================//
//-- асинхронные функции --//
// контроллер для абортов
let controller: AbortController | null = null

// видимость анимации загрузки
const isLoading = ref<boolean>(true)

// получение постов
const getHints = async (signal?: AbortSignal): Promise<StatisticsType[]> => {
  return await get(`/hints?user_id=${props.userId}&_select=statistics`, undefined, signal)
}
// получение подсказок
const getAdvices = async (signal?: AbortSignal): Promise<StatisticsType[]> => {
  return await get(`/advices?user_id=${props.userId}&_select=statistics`, undefined, signal)
}
// получение учебников
const getTextbooks = async (signal?: AbortSignal): Promise<StatisticsType[]> => {
  return await get(`/textbooks?user_id=${props.userId}&_select=statistics`, undefined, signal)
}
// получение проектов
const getProjects = async (signal?: AbortSignal): Promise<StatisticsType[]> => {
  return await get(`/projects?user_id=${props.userId}&_select=statistics`, undefined, signal)
}

// получение статистики
const getStatistics = async () => {
  controller = new AbortController()

  try {
    const data: StatisticsType[][] = await Promise.all([
        getHints(controller.signal),
        getAdvices(controller.signal),
        getTextbooks(controller.signal),
        getProjects(controller.signal),
    ])

    const newStats: Record<string, number> = {
      'Всего просмотров': 0,
      'Добавлено в избранное': 0,
      'Всего скачано': 0,
    }

    data.forEach((items: StatisticsType[]) => {
      items.forEach((el: StatisticsType) => {
        const stat = el?.statistics
        if (stat) {
          newStats['Всего просмотров'] += stat.views ?? 0
          newStats['Добавлено в избранное'] += stat.likes ?? 0
          newStats['Всего скачано'] += stat.downloads ?? 0
        }
      })
    })

    statistics.value = newStats
  } catch (err: any) {
    if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return

    console.error('не удалось получить данные статистики', err)
  }
}

onUnmounted(() => {
  controller?.abort()
})
//=========================================================//


//=========================================================//
//-- хуки --//
onBeforeMount(async () => {
  isLoading.value = true

  const count: number = Object.values(statistics.value)?.reduce((a: number, b) => a + Number(b), 0)

  if (count === 0) {
    await getStatistics()
  }

  isLoading.value = false
})
//=========================================================//
</script>

<template>

  <div class="user-page__statistics position-relative">
    <p class="h3 text-center mb-20">Статистика</p>

    <ul class="user-page__list" v-if="!isLoading">
      <li class="user-page__item h5 mb-not-last-10" v-for="item in Object.entries(statistics)">
        {{item[0]}}: <span class="accent-color">{{item[1]}}</span>
      </li>
    </ul>

    <UserStatisticsSkeleton v-else/>
  </div>

</template>