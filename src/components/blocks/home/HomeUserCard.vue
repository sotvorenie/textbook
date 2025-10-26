<script setup lang="ts">
import {computed, ref} from "vue";
import router from "../../../router";

import {authToken} from "../../../utils/auth.ts";
import {showConfirm, showError, showWarning} from "../../../utils/modals.ts";
import {userAva} from "../../../utils/ava.ts";
import { resetAllStores } from "../../../utils/resetAllStores";

import {deletePredLastFile, postAva, postFile} from "../../../api/users/users.ts";
import {sendToTelegram, TelegramEventType} from "../../../api/telegram/telegram.ts";

import Navigation from "../../common/Navigation.vue";
import Btn from "../../ui/Btn.vue";

import Edit from "../../../assets/icons/Edit.vue";
import UserIcon from "../../../assets/icons/UserIcon.vue";

import useUserStore from "../../../store/userStore.ts";
const userStore = useUserStore();

//=========================================================//

//=========================================================//
//-- аинхронные функции --//
// загрузка аватарки
const uploadFile = async (event: Event) => {
  try {
    const target = event.target as HTMLInputElement

    if (!target || target.files?.length === 0) {
      await showError('Файл не выбран', 'Пожалуйста, выберите фото для загрузки')
      return
    }

    const file = target.files?.[0]

    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      await showError('Файл слишком большой', 'Максимальный размер фото - 5 Мб')
      return
    }

    await postFile(file)

    await postAva()


    if (userStore.user?.ava?.id) {
      const lastAva: number = userStore.user.ava.id

      userAva.set()

      if (lastAva >= 0) {
        await deletePredLastFile(lastAva)
      }
    }

    await sendToTelegram(TelegramEventType.LOAD_AVA, userStore.user.ava?.url)
  } catch (_) {}
}
//=========================================================//


//=========================================================//
//-- аватарка пользователя --//
// DOM-элемент поля ввода загрузки фото аватарки
const input = ref<HTMLInputElement | null>(null)

// клик по полю ввода
const triggerInput = async () => {
  if (!userStore.isAdmin) {
    await showWarning(
        'Замена аватарки невозможна!!',
        'Вы не являетесь Админом'
    )

    return
  }

  input.value?.click()
}
//=========================================================//


//=========================================================//
//-- данные пользователя --//
// роль/статус пользователя
const role = computed(() => {
  if (userStore.isFullAdmin
      && userStore.user.email === 'vitalikabrosimov00@gmail.com'
  ) return 'Владелец'
  if (userStore.isFullAdmin) return 'Совладелец'
  if (userStore.isAdmin) return 'Админ'
  return 'Пользователь'
})
//=========================================================//


//=========================================================//
//-- кнопки действий --//
// выход из профиля
const exit = async () => {
  const confirmed: boolean = await showConfirm('Выход из профиля', 'Вы действительно хотите выйти из профиля?');

  if (confirmed) {
    authToken.remove()
    userAva.remove()

    resetAllStores()

    await router.push('/')

    window.location.reload()
  }
}

// клик по кнопке "Удалить пользователя"
const handleRemoveUser = async () => {
  await showWarning(
      'Невозможно удалить страницу!!',
      'Ты в системе и никуда теперь отсюда не денешься))'
  )
}
//=========================================================//
</script>

<template>
  <div class="user-card">
    <div class="user-card__top flex row user-select-none">
      <div class="user-card__img-container img-container position-relative col-6">
        <img v-if="userStore.user?.ava?.url"
             :src="userStore.user?.ava?.url"
             :alt="userStore.user?.name"/>

        <i class="recolor-svg" v-else>
          <UserIcon/>
        </i>

        <button class="hover-color-accent recolor-svg"
                type="button"
                @click="triggerInput"
        >
          <Edit class="user-card__edit"/>
        </button>

        <input type="file"
               ref="input"
               @change="uploadFile"
               accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.svg"
        >
      </div>

      <div class="user-card__info flex flex-column flex-between col-6">
        <div>
          <p class="user-card__name">Имя: {{userStore.user?.name}}</p>
          <p class="user-card__name">Статус: {{role}}</p>
          <p class="user-card__name">Последний сеанс: {{userStore.lastSession}}</p>
        </div>

        <Navigation :back-visible="false" :is-absolute="false"/>
      </div>
    </div>
    <div class="user-card__btn-bar flex">
      <Btn class="user-card__btn" @click="exit">Выйти</Btn>
      <Btn class="user-card__btn" @click="handleRemoveUser">Удалить профиль</Btn>
    </div>
  </div>
</template>