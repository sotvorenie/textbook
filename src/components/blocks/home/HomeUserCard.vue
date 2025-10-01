<script setup lang="ts">
import useUserStore from '../../../store/userStore';
import Navigation from "../../common/Navigation.vue";
import Btn from "../../ui/Btn.vue";
import {showConfirm, showError} from "../../../utils/modals.ts";
import {authToken} from "../../../utils/auth.ts";
import router from "../../../router";
import Edit from "../../../assets/icons/Edit.vue";
import {ref} from "vue";
import {deletePredLastFile, postAva, postFile} from "../../../api/users/users.ts";
import UserIcon from "../../../assets/icons/UserIcon.vue";
import {userAva} from "../../../utils/ava.ts";
import {sendToTelegram, TelegramEventType} from "../../../api/telegram/telegram.ts";

const userStore = useUserStore();

const exit = async () => {
  const confirmed: boolean = await showConfirm('Выход из профиля', 'Вы действительно хотите выйти из профиля?');

  if (confirmed) {
    authToken.remove();
    router.push('/').catch(() => {});
  }
}

const input = ref<HTMLInputElement | null>(null)

const triggerInput = () => {
  input.value?.click()
}

const uploadFile = async (event: Event) => {
  try {
    const target = event.target as HTMLInputElement

    if (!target || target.files.length === 0) {
      await showError('Файл не выбран', 'Пожалуйста, выберите фото для загрузки')
      return
    }

    const file = target.files[0]

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

</script>

<template>
  <div class="user-card">
    <div class="user-card__top flex row user-select-none">
      <div class="user-card__img-container img-container position-relative col-5">
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

      <div class="user-card__info flex flex-column flex-between">
        <div>
          <p class="user-card__name">Имя: {{userStore.user?.name}}</p>
          <p class="user-card__name">Класс: разработчик</p>
          <p class="user-card__name">Последний сеанс: {{userStore.lastSession}}</p>
        </div>

        <Navigation :back-visible="false" :is-absolute="false"/>
      </div>
    </div>
    <div class="user-card__btn-bar flex">
      <Btn class="user-card__btn" @click="exit">Выйти</Btn>
      <Btn class="user-card__btn">Удалить профиль</Btn>
    </div>
  </div>
</template>