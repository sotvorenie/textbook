<script setup lang="ts">
import {computed, ref, watch, nextTick} from "vue";

import {Meta} from "../../../types/meta.ts";

import {debounce} from "../../../utils/debounce.ts";
import {showError, showWarning} from "../../../utils/modals.ts";

import {getList} from "../../../api/posts/posts.ts";
import {sendToTelegram, TelegramEventType} from "../../../api/telegram/telegram.ts";
import {like} from "../../../api/liked/liked.ts";

import HomeEmptyList from "./empty/HomeEmptyList.vue";

import {List} from "../../../types/list.ts";
import Like from "../../ui/Like.vue";
import Absolute from "../../common/Absolute.vue";
import Btn from "../../ui/Btn.vue";

import useSearchStore from "../../../store/searchStore.ts";
const searchStore = useSearchStore();
import useSettingsStore from "../../../store/settingsStore.ts";
const settingsStore = useSettingsStore();
import useUserStore from "../../../store/userStore.ts";
const userStore = useUserStore();
import useItemsStore from "../../../store/useItemsStore.ts";
const itemsStore = useItemsStore();
import useOnlineStore from "../../../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();
import useCreateStore from "../../../store/useCreateStore.ts";
const createStore = useCreateStore();

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  apiUrl: {
    type: String,
    required: true,
    default: ''
  },
})

const emits = defineEmits(['changeItem']);

//=========================================================//

//=========================================================//
//-- асинхронные функции --//
// для получения данных с апи при изменениях фильтров
const debouncedGetPosts = debounce(() => getPosts(false), 500);

// данные о номере страницы апи
const page = ref<number>(1)

// данные обо всех/оставшихся элементов в апи
const meta = ref<Meta>();


// получение данных списка с апи
const getPosts = async(push: boolean = true) => {
  try {
    loadingVisible.value = true

    if (!push || !meta.value?.current_page) {
      page.value = 1
    } else {
      page.value = meta.value?.current_page + 1
    }

    let user_id: number | null = null
    let likes: number[] = []
    if (searchStore.myOtherFilter[props?.name] === 'my') {
      user_id = userStore.user.id
    } else if (searchStore.myOtherFilter[props?.name] === 'likes') {
      likes = likedItems.value?.length ? likedItems.value : [-1]
     }

    const response: {meta: any, items: List[]} = await getList(
        props.apiUrl,
        page.value,
        searchStore.searchNames[props?.name],
        searchStore.filterTechnologies[props?.name],
        user_id,
        searchStore.sortBy[props?.name],
        likes
    );

    if (response) {
      if (push) {
        itemsStore.items[props.name]?.push(...response.items)
      } else {
        itemsStore.items[props.name] = response.items
      }

      meta.value = response.meta

      const checkTotalItems: boolean = (meta.value?.total_items as number) < 500

      createStore.isCanCreateInAPI[props.name] = checkTotalItems

      if (!checkTotalItems && (userStore.isAdmin || userStore.isFullAdmin) && onlineStore.isOnlineMode) {
        await showWarning(
            'Недостаточно места!!',
            'Внимание! На сервере недостаточно места для данной категории! Создание нового элемента будет происходить локально'
        )
      }

      await nextTick();
    }

    settingsStore.settingsVisible[props.name] = 'list'
  } catch (_) {
    await showError(
        'Ошибка загрузки контента',
        'Не удалось загрузить список элементов'
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
//-- данные фильтров --//
// выбранные языки и технологии
const searchTechnologies = computed(() => {
  return searchStore.filterTechnologies[props.name] ?? []
});
//=========================================================//


//=========================================================//
//-- элемент списка --//
// выбор элемента списка
const handleItem = (id: number) => {
  emits('changeItem', id);
}
//=========================================================//


//=========================================================//
//-- подсветка текста --//
// метод для подсветки текста
const highlightText = (text: string) => {
  if (!text) return 'Без названия'
  if (!searchStore.searchNames[props?.name]) return text;

  const words = searchStore.searchNames[props?.name].split(/\s+/).filter(Boolean);
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


// добавление элемента в избранное
const handleLike = async (id: number) => {
  try {
    const element = itemsStore.items[props.name]?.find(el => el.id === id) ?? {title: ''}

    let isLike: boolean = false

    const userLikes = userStore.userLiked.items[props.name]

    if (userLikes && userLikes?.includes(id)) {
      userStore.userLiked.items[props.name] =
          userLikes?.filter((item: number) => item !== id)
    } else {
      if (!userLikes) {
        userStore.userLiked.items[props.name] = []
      }
      userStore.userLiked?.items[props.name].push(id)
      isLike = true
    }

    const response = await like(props.name)

    if (response) {
      isLike ? await sendToTelegram(TelegramEventType.LIKE, element.title)
          : await sendToTelegram(TelegramEventType.UNLIKE, element.title)

      if (userStore.userLiked.id < 0) {
        userStore.userLiked.id = response.id
      }
    }
  } catch (_) {
    await showError(
        'Ошибка добавления в избранное',
        'Не удалось добавить элемент в избранное'
    )
    userStore.userLiked?.items[props.name].pop()
  }
}
//=========================================================//


//=========================================================//
//-- кнопка "Загрузить ещё" --//
// видимость кнопки "Загрузить ещё"
const loadMoreVisible = computed(() => {
  return itemsStore.items[props.name]?.length > 0
      && (page.value >= 1 && meta.value?.remaining_count! > 0)
})

// видимость анимации загрузки
const loadingVisible = ref(true);
//=========================================================//


//=========================================================//
//-- наблюдатели --//
// следим за изменение фильтров, чтобы обращаться к апи по заданным параметрам
watch(
    () => [
      searchStore.searchNames[props?.name],
      searchStore.filterTechnologies[props?.name],
      searchStore.myOtherFilter[props?.name],
      searchStore.sortBy[props?.name],
    ],
    () => debouncedGetPosts()
)
//=========================================================//


//=========================================================//
//-- вызов асинхронных функций --//
await getPosts()
//=========================================================//
</script>

<template>

  <div class="list-wrapper">
    <ul class="list flex row" v-if="itemsStore.items[name]?.length">
      <li class="list__item cursor-pointer col-4 ds-col-3 position-relative"
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
                @click.stop="handleLike(item.id)"
          />
        </button>

        <p class="list__title h5" v-html="highlightText(item.title)"></p>

        <div class="list__info">
          <p class="list__date">Дата: {{item?.date}}</p>

          <Absolute :is-visible="item?.languages_and_technologies?.length > 3">
            <template #activator>
              <div class="list__tech">
                <div class="list__tech-title flex flex-align-center">
                  <p>Технологии:</p>
                  <button class="hover-color-accent"
                          type="button"
                          v-if="item?.languages_and_technologies?.length > 3"
                  >
                    Смотреть все
                  </button>
                </div>

                <ul class="list__technologies flex flex-wrap">
                  <li :class="['list__technologies-item list__name', {'is-active': searchTechnologies.includes(technology)}]"
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
                   :class="['list__name absolute__content-item', {'is-active': searchTechnologies.includes(technology)}]"
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

    <HomeEmptyList v-if="emptyVisible"/>
  </div>

</template>