<script setup lang="ts">
import {computed, ref, watch, onMounted, onBeforeUnmount} from "vue";
import {useRoute, useRouter} from "vue-router";

import {Item} from "../../../types/item.ts";
import {List} from "../../../types/list.ts";

import {getList} from "../../../api/posts/posts.ts";
import {handleLike} from "../../../api/liked/liked.ts";

import {showError} from "../../../utils/modals.ts";
import toRouteName from "../../../composables/useToRouteName.ts";
import {useSignal} from "../../../composables/useSignal.ts";

import ListEmpty from "./ListEmpty.vue";
import ListDefaultSkeleton from "./ListDefaultSkeleton.vue";
import Absolute from "../../common/Absolute.vue";
import Like from "../../ui/Like.vue";
import Btn from "../../ui/Btn.vue";

import useUserStore from "../../../store/useUserStore.ts";
const userStore = useUserStore();
import useItemsStore from "../../../store/useItemsStore.ts";
const itemsStore = useItemsStore();
import useOnlineStore from "../../../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();
import useScrollStore from "../../../store/useScrollStore.ts";
const scrollStore = useScrollStore();

const route = useRoute()
const router = useRouter()

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

//=========================================================//

const signal = useSignal()

const tab = computed(() => (route.query.tab as string) ?? 'all')
const searchName = computed(() => (route.query.name as string) ?? '')
const technologies = computed(() => {
  const techQuery = route.query.tech as string | undefined
  return techQuery ? techQuery.split(',') : []
})
const sortBy = computed(() => (route.query.sort as string) ?? '-sort_date')

//=========================================================//
//-- асинхронные функции --//
// получение данных списка с апи
const getPosts = async(push: boolean = true) => {
  try {
    loadingVisible.value = true

    let user_id: number | null = null
    let likes: number[] = []
    if (tab.value === 'my') {
      user_id = userStore.user.id
    } else if (tab.value === 'likes') {
      likes = likedItems.value?.length ? likedItems.value : [-1]
     }

    const response: {meta: any, items: List[]} = await getList({
      name: props.name,
      page: itemsStore.meta[props.name].current_page,
      value: searchName.value,
      languages: technologies.value,
      user_id,
      sortBy: sortBy.value,
      id: likes,
      signal
    })

    if (response) {
      if (push) {
        itemsStore.items[props.name]?.push(...response.items)
      } else {
        itemsStore.items[props.name] = response.items
      }

      itemsStore.meta[props.name] = {...response.meta, current_page: response.meta.current_page + 1}
    }
  } catch (err) {
    console.error('Не удалось загрузить данные с сервера', err)

    await showError(
        'Ошибка загрузки контента с сервера',
        'Не удалось загрузить список элементов с сервера приложения'
    )
  } finally {
    loadingVisible.value = false
  }
}
//=========================================================//


//=========================================================//
//-- пустая страница --//
// видимость пустой страницы
const emptyVisible = computed(() => {
  return !itemsStore.items[props.name]?.length && !loadingVisible.value
})
//=========================================================//


//=========================================================//
//-- элемент списка --//
// выбор элемента списка
const handleItem = (id: number) => {
  router.push({
    name: `${toRouteName(props.name)}Item`,
    params: { id },
    query: route.query
  })
}
//=========================================================//


//=========================================================//
//-- подсветка текста --//
// метод для подсветки текста
const highlightText = (text: string) => {
  if (!text) return 'Без названия'
  if (!searchName.value) return text;

  const words = searchName.value.split(/\s+/).filter(Boolean);
  let result = text;

  words.forEach(word => {
    const regex = new RegExp(`(${word})`, "gi");
    result = result.replace(regex, `<span class="is-active">$1</span>`);
  });

  return result;
};
//=========================================================//


//=========================================================//
//-- избранное --//
// список избранных элементов пользователя
const likedItems = computed(() => {
  return userStore.userLiked?.items[props.name];
})


// добавление/удаление элемента из избранного
const like = async (id: number, statistics: Item['statistics']) => {
  await handleLike(props.name, id, signal, statistics)
}
//=========================================================//


//=========================================================//
//-- кнопка "Загрузить ещё" --//
// видимость кнопки "Загрузить ещё"
const loadMoreVisible = computed(() => {
  return itemsStore.items[props.name]?.length > 0
      && itemsStore.meta[props.name].total_pages >= itemsStore.meta[props.name].current_page
})

// первая ли это загрузка страницы
const isFirstLoad = ref(true)

// видимость анимации загрузки
const loadingVisible = ref(true);

// видимость скелетона
const skeletonVisible = ref(false)
//=========================================================//


//=========================================================//
//-- scroll --//
const scrollManager = scrollStore.useSaveScroll(props.name, 'list')

onMounted(() => {
  scrollManager.setup()
  scrollManager.restoreScroll()
});

onBeforeUnmount(() => {
  scrollManager.destroy()
});
//=========================================================//

const resetAndLoad = async (force: boolean = false) => {
  const hasItems = itemsStore.items[props.name]?.length > 0

  if (hasItems && !force) {
    isFirstLoad.value = false
    skeletonVisible.value = false
    loadingVisible.value = false
    return
  }

  skeletonVisible.value = !hasItems && onlineStore.isOnlineMode
  loadingVisible.value = true

  itemsStore.resetMeta(props.name)

  await getPosts(false)

  isFirstLoad.value = false
  skeletonVisible.value = false
}

watch(
    () => props.name,
    async () => {
      await resetAndLoad()
    },
    { immediate: true }
)

watch(
    () => [route.query.tab, route.query.name, route.query.sort, route.query.tech],
    async () => {
      await resetAndLoad(true)
    }
)
</script>

<template>

  <div class="list-wrapper" v-if="!skeletonVisible">
    <ul class="list flex row mb-30" v-if="itemsStore.items[name]?.length">
      <li class="list__item cursor-pointer ks-col-2 ds-col-3 col-4 position-relative"
          v-for="(item, index) in itemsStore.items[name]"
          :key="item.id"
          @click="handleItem(item.id)"
          :style="{'--index': index}"
      >
        <button class="list__like recolor-svg button-width-svg position-absolute"
                type="button"
                v-if="onlineStore.isOnlineMode"
        >
          <Like :liked="likedItems?.includes(item.id)"
                @click.stop="like(item.id, item.statistics)"
          />
        </button>

        <p class="list__title h5 mb-10" v-html="highlightText(item.title)"></p>

        <div class="list__info">
          <p class="list__date mb-10">Дата: {{item?.date}}</p>

          <Absolute :is-visible="item?.languages_and_technologies?.length > 3">
            <template #activator>
              <div class="list__tech">
                <div class="list__tech-title flex flex-align-center mb-10">
                  <p>Технологии:</p>
                  <button class="hover-color-accent"
                          type="button"
                          v-if="item?.languages_and_technologies?.length > 3"
                  >
                    Смотреть все
                  </button>
                </div>

                <ul class="list__technologies flex flex-wrap">
                  <li :class="['list__technologies-item list__name', {'is-active': technologies.includes(technology)}]"
                      v-for="technology in item?.languages_and_technologies?.slice(0, 3)"
                  >
                    {{technology}}
                  </li>
                </ul>
              </div>
            </template>

            <template #default>
              <div class="list__tech-content flex flex-wrap">
                <p v-for="technology in item?.languages_and_technologies"
                   :class="['list__name absolute__content-item', {'is-active': technologies.includes(technology)}]"
                >
                  {{technology}}
                </p>
              </div>
            </template>

          </Absolute>
        </div>
      </li>
    </ul>

    <Btn class="list__load-more m-auto"
         :is-disabled="loadingVisible"
         :is-loading="loadingVisible"
         @click="getPosts"
         v-if="loadMoreVisible"
    >
      Загрузить ещё
    </Btn>

    <ListEmpty v-if="emptyVisible"/>
  </div>

  <ListDefaultSkeleton v-else/>

</template>