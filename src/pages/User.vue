<script setup lang="ts">
import {computed, onBeforeMount, onUnmounted, reactive, ref} from "vue";
import {useRoute} from "vue-router";
import router from "../router";

const myEmail = import.meta.env.VITE_MY_EMAIL;
import {menuItems} from "../data/asideLinks.ts";

import {get} from "../api/base.ts";
import {getAuthor} from "../api/posts/posts.ts";

import {showError} from "../utils/modals.ts";

import AppSkeleton from "../components/ui/loading/AppSkeleton.vue";
import Btn from "../components/ui/Btn.vue";
import List from "../components/blocks/user/List.vue";

import UserIcon from "../assets/icons/UserIcon.vue";
import Modal from "../components/common/Modal.vue";
import Statistics from "../components/blocks/user/Statistics.vue";

import useRouterStore from "../store/useRouterStore.ts";
const routerStore = useRouterStore();
import useIdStore from "../store/useIdStore.ts";
const idStore = useIdStore();

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const route = useRoute()

//=========================================================//

//=========================================================//
//-- асинхронные функции --//
// анимация загрузки
const isLoading = ref<boolean>(true)

// контроллер для аборта
let controller: AbortController | null = null


// получение данных пользователя: имя, аватар, последний сеанс, email
const getUserInfo = async (signal?: AbortSignal) => {
  try {
    const data: {ava?: {url: string}, name: string, last_session: string, email: string} =
        await getAuthor(+props.id, true, signal)

    user.name = data.name
    user.last_session = data.last_session
    user.email = data.email

    if (data.ava) user.ava = data.ava
  } catch (err: any) {
    if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return

    console.error('не удалось получить данные автора', err)

    await showError(
        'Ошибка получения данных пользователя',
        'Не удалось загрузить данные пользователя'
    )

    await router.replace('/main')
  }
}

// получение статуса пользователя
const getUserStatus = async (signal?: AbortSignal) => {
  try {
    const response: {id:number, full: boolean, viewer: boolean}[] =
        await get(`/admins?id=${props.id}`, undefined, signal)

    if (response?.length) {
      const info = response[0]

      if (info.full && user.email === myEmail) {
        status.value = 'Владелец'
      } else if (info.viewer) {
        status.value = 'Пользователь'
      } else if (info.full) {
        status.value = 'Совладелец'
      } else {
        status.value = 'Админ'
      }
    }
  } catch (err: any) {
    if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return

    console.error('не удалось получить статус автора', err)
  }
}
//=========================================================//


//=========================================================//
//-- пользователь --//
// основная информация
const user = reactive({
  id: props.id,
  name: '',
  last_session: '',
  email: '',
  ava: {url: ''}
})

// статус пользователя
const status = ref<string>('')
//=========================================================//


//=========================================================//
//-- tabs --//
// активный таб
const activeTab = ref<number>(0)

// список tabs
const tabs = computed(() => {
  return menuItems.slice(0, 4)
})


// клик по табу
const handleTab = (index: number) => {
  activeTab.value = index
}
//=========================================================//


//=========================================================//
//-- статистика --//
const statistics = ref({
  'Всего просмотров': 0,
  'Добавлено в избранное': 0,
  'Всего скачано': 0,
})
//=========================================================//


//=========================================================//
//-- хуки --//
onBeforeMount(async () => {
  isLoading.value = true

  controller = new AbortController()

  try {
    await Promise.all([
        getUserInfo(controller.signal),
        getUserStatus(controller.signal)
    ])
  } finally {
    isLoading.value = false
  }

  routerStore.isUser = true

  const name = Array.isArray(route.query.name) ? route.query.name[0] : route.query.name
  const postId = Array.isArray(route.query.postId) ? route.query.postId[0] : route.query.postId
  if (name && postId) {
    idStore.oldIdValues[name] = +postId
  }}
)

onUnmounted(() => {
  controller?.abort()
})
//=========================================================//
</script>

<template>

  <div class="user-page" v-if="!isLoading">
    <header class="user-page__header flex mb-30">
      <div class="user-page__avatar img-container">
        <img :src="user.ava.url" :alt="user.name" v-if="user?.ava?.url">
        <UserIcon v-else/>
      </div>

      <div class="user-page__info">
        <p class="user-page__name h4 mb-10">{{user?.name}}</p>

        <p class="user-page__status mb-10">Статус пользователя: {{status}}</p>

        <p class="user-page__last-session">Последний сеанс: {{user?.last_session}}</p>
      </div>
    </header>

    <div class="flex cg-10">
      <ul class="user-page__tabs flex cg-10">
        <li class="user-page__tab h5 mb-20"
            v-for="(tab, index) in tabs"
            :key="tab.id"
        >
          <Btn :class="{
                'button-small': true,
                'is-active': activeTab === index
               }"
               @click="handleTab(index)"
          >{{tab?.name}}</Btn>
        </li>
      </ul>

      <Modal :size="400">
        <template #activator="{open}">
          <Btn class="button-small" @click="open">Статистика</Btn>
        </template>

        <template #default>
          <Statistics :user-id="+props.id" v-model:statistics="statistics"/>
        </template>
      </Modal>
    </div>

    <div class="user-page__content">
      <List :user-id="+props.id" :name="tabs[activeTab].value"/>
    </div>
  </div>

  <AppSkeleton v-else/>

</template>