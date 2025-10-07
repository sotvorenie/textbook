<script setup lang="ts">
import {computed, ref, watch, nextTick} from "vue";

import {debounce} from "../../../utils/debounce.ts";

import {getList} from "../../../api/posts/posts.ts";
import {sendToTelegram, TelegramEventType} from "../../../api/telegram/telegram.ts";
import {like} from "../../../api/liked/liked.ts";

import {Meta} from "../../../types/meta.ts";

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

const props = defineProps({
  searchName: {
    type: String,
    required: true
  },
  apiUrl: {
    typer: String,
    required: true,
    default: ''
  }
})

const emits = defineEmits(['changeItem']);

const searchTechnologies = computed(() => {
  return searchStore.filterTechnologies[props.searchName] ?? []
});

//await new Promise(resolve => setTimeout(resolve, 3000000));

// Метод для подсветки текста
const highlightText = (text: string) => {
  if (!text) return 'Без названия'
  if (!searchStore.searchNames[props?.searchName]) return text;

  // Разбиваем searchName на слова
  const words = searchStore.searchNames[props?.searchName].split(/\s+/).filter(Boolean);
  let result = text;

  words.forEach(word => {
    const regex = new RegExp(`(${word})`, "gi");
    result = result.replace(regex, `<span class="is-active">$1</span>`);
  });

  return result;
};

const handleItem = (id: number) => {
  emits('changeItem', id);
}

const items = ref<List[]>([]);

const meta = ref<Meta>();

const loadingVisible = ref(true);

const getPosts = async(push: boolean = true) => {
  try {
    loadingVisible.value = true

    let page: number
    if (!push || !meta.value?.current_page) {
      page = 1
    } else {
      page = meta.value?.current_page + 1
    }

    let user_id: number | null = null
    let likes: number[] = []
    if (searchStore.myOtherFilter[props?.searchName] === 'my') {
      user_id = userStore.user.id
    } else if (searchStore.myOtherFilter[props?.searchName] === 'likes') {
      likes = likedItems.value
    }

    const response: {meta: any, items: List[]} = await getList(
        props.apiUrl,
        page,
        searchStore.searchNames[props?.searchName],
        searchStore.filterTechnologies[props?.searchName],
        user_id,
        searchStore.sortBy[props?.searchName],
        likes
    );

    if (response) {
      if (push) {
        items.value?.push(...response.items)
      } else {
        items.value = response.items
      }

      meta.value = response.meta

      await nextTick();
    }

    loadingVisible.value = false

    settingsStore.settingsVisible[props.searchName] = 'list'
  } catch (_) {}
}
await getPosts();

const likedItems = computed(() => {
  return userStore.userLiked?.items[props.searchName];
})

const handleLike = async (id: number) => {
  try {
    const element = items.value?.find(el => el.id === id) ?? {title: ''}

    let isLike: boolean = false

    const userLikes = userStore.userLiked.items[props.searchName]

    if (userLikes && userLikes?.includes(id)) {
      userStore.userLiked.items[props.searchName] =
          userLikes?.filter((item: number) => item !== id)
    } else {
      if (!userLikes) {
        userStore.userLiked.items[props.searchName] = []
      }
      userStore.userLiked?.items[props.searchName].push(id)
      isLike = true
    }

    const response = await like(props.searchName)

    if (response) {
      isLike ? await sendToTelegram(TelegramEventType.LIKE, element.title)
          : await sendToTelegram(TelegramEventType.UNLIKE, element.title)

      if (userStore.userLiked.id < 0) {
        userStore.userLiked.id = response.id
      }
    }
  } catch (_) {}
}

const debouncedGetPosts = debounce(() => getPosts(false), 500);

watch(
    () => searchStore.searchNames[props?.searchName],
    () => debouncedGetPosts()
)

watch(
    () => searchStore.filterTechnologies[props?.searchName],
    () => debouncedGetPosts()
)

watch(
    () => searchStore.myOtherFilter[props?.searchName],
    () => debouncedGetPosts()
)

watch(
    () => searchStore.sortBy[props?.searchName],
    () => debouncedGetPosts()
)
</script>

<template>

  <div class="list-wrapper">
    <ul class="list flex row" ref="listRef">
      <li class="list__item cursor-pointer col-4 position-relative"
          v-for="item in items"
          :key="item.id"
          @click="handleItem(item.id)"
      >
        <button class="list__like recolor-svg button-width-svg position-absolute"
                type="button"
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
         :is-disabled="meta?.remaining_count! === 0 || loadingVisible"
         :is-loading="loadingVisible"
         @click="getPosts"
    >
      Загрузить ещё
    </Btn>
  </div>

</template>