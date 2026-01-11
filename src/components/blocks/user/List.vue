<script setup lang="ts">
import {computed, onBeforeMount, ref, watch} from "vue";

import router from "../../../router";

import {Meta} from "../../../types/meta.ts";
import {List} from "../../../types/list.ts";
import {Item} from "../../../types/item.ts";

import {showError} from "../../../utils/modals.ts";

import {getList} from "../../../api/posts/posts.ts";
import {handleLike} from "../../../api/liked/liked.ts";

import EmptyList from "../../common/EmptyList.vue";

import Like from "../../ui/Like.vue";
import Absolute from "../../common/Absolute.vue";
import Btn from "../../ui/Btn.vue";
import DefaulListSkeleton from "../home/loading/DefaulListSkeleton.vue";


import useUserStore from "../../../store/useUserStore.ts";
const userStore = useUserStore();
import useIdStore from "../../../store/useIdStore.ts";
const idStore = useIdStore();

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  userId: {
    type: Number,
    required: true,
  },
})

const emits = defineEmits(['changeItem']);

//=========================================================//

//=========================================================//
//-- асинхронные функции --//
// данные о номере страницы апи
const page = ref<number>(1)

// данные обо всех/оставшихся элементов в апи
const meta = ref<Meta>()


// получение данных списка с апи
const getPosts = async(push: boolean = true) => {
  try {
    isLoadMore.value = true

    if (!push || !meta.value?.current_page) {
      page.value = 1
    } else {
      page.value = meta.value?.current_page + 1
    }

    let user_id: number | null = props.userId

    const response: {meta: any, items: List[]} = await getList({
      name: props.name,
      page: page.value,
      value: '',
      languages: [],
      user_id,
      sortBy: '-sort_date',
    })

    if (response.items?.length > 0) {
      if (push) {
        items.value.push(...response.items)
      } else {
        items.value = response.items
      }

      meta.value = response.meta
    } else {
      items.value = []
    }
  } catch (err) {
    console.error('Не удалось загрузить данные с сервера', err)

    await showError(
        'Ошибка загрузки контента с сервера',
        'Не удалось загрузить список элементов с сервера приложения'
    )
  } finally {
    isLoadMore.value = false
  }
}
//=========================================================//


//=========================================================//
//-- элементы списка --//
const items = ref<List[]>([])
//=========================================================//


//=========================================================//
//-- пустая страница --//
// видимость пустой страницы
const emptyVisible = computed(() => {
  return items.value.length === 0 && !loadingVisible.value
})
//=========================================================//


//=========================================================//
//-- элемент списка --//
// выбор элемента списка
const handleItem = (id: number) => {
  idStore.idValues[props.name] = id
  router.push({name: 'Main'})
}
//=========================================================//


//=========================================================//
//-- избранное --//
// список избранных элементов пользователя
const likedItems = computed(() => {
  return userStore.userLiked?.items[props.name];
})


// добавление/удаление элемента из избранного
const like = async (id: number, statistics: Item['statistics']) => {
  await handleLike(props.name, id, statistics)
}
//=========================================================//


//=========================================================//
//-- кнопка "Загрузить ещё" --//
// видимость кнопки "Загрузить ещё"
const loadMoreVisible = computed(() => {
  return items.value.length > 0 && (page.value >= 1 && meta.value?.remaining_count! > 0)
})

// видимость анимации загрузки
const loadingVisible = ref<boolean>(true);

// видимость анимации загрузки при клике на "Загрузить еще"
const isLoadMore = ref<boolean>(false)
//=========================================================//


//=========================================================//
//-- хуки --//
onBeforeMount(async () => {
  loadingVisible.value = true
  await getPosts()
  loadingVisible.value = false
})

watch(
    () => props.name,
    async () => {
      loadingVisible.value = true
      await getPosts(false)
      loadingVisible.value = false
    }
)
//=========================================================//
</script>

<template>

  <template v-if="!loadingVisible">
    <ul class="list flex row mb-30" v-if="items?.length">
      <li class="list__item cursor-pointer ks-col-2 ds-col-3 col-4 position-relative"
          v-for="(item, index) in items"
          :key="item.id"
          @click="handleItem(item?.id)"
          :style="{'--index': index}"
      >
        <button class="list__like recolor-svg button-width-svg position-absolute" type="button">
          <Like :liked="likedItems?.includes(item.id)"
                @click.stop="like(item.id, item.statistics)"
          />
        </button>

        <p class="list__title h5 mb-10">{{item?.title}}</p>

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
                  <li class="list__technologies-item list__name"
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
                   class="list__name absolute__content-item"
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
         :is-disabled="loadingVisible || isLoadMore"
         :is-loading="isLoadMore"
         @click="getPosts"
         v-if="loadMoreVisible"
    >
      Загрузить ещё
    </Btn>

    <EmptyList v-if="emptyVisible"/>
  </template>

  <DefaulListSkeleton v-else/>

</template>