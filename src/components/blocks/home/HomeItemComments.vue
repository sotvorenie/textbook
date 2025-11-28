<script setup lang="ts">
import {ref} from "vue";

import {Comment} from "../../../api/comments/types.ts";
import {getComments, setComment, checkComment} from "../../../api/comments/comments.ts";
import {showError} from "../../../utils/modals.ts";
import Btn from "../../ui/Btn.vue";
import Absolute from "../../common/Absolute.vue";
import Dots from "../../../assets/icons/Dots.vue";

import useUserStore from "../../../store/useUserStore.ts";
const userStore = useUserStore();

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
})

const comments = ref<Comment[]>([])

const commentText = ref<string>('')

const visibleCreateComment = ref<boolean>(false)

const isLoading = ref<boolean>(false)

const getData = async () => {
  try {
    const data: Comment[] | undefined = await getComments(props.name)
    const visibleData: boolean | undefined = await checkComment(props.name)

    if (data) {
      comments.value = data
    }

    visibleCreateComment.value = !visibleData
  } catch (err) {
    await showError(
        'Ошибка загрузки комментариев',
        'Не удалось загрузить комментарии..'
    )
  }
}

await getData()

const createComment = async () => {
  try {
    const comment: Comment | undefined = await setComment(props.name, commentText.value)

    if (comment) {
      comments.value.push(comment)
    }
  } catch (err) {
    await showError(
        'Ошибка отправки комментария',
        'Не удалось отправить комментарий..'
    )
  }
}
</script>

<template>

  <div class="comments position-relative">
    <p class="statistics__title h4">Комментарии:</p>

    <ul class="comments__list" v-if="comments.length">
      <li class="comments__item flex position-relative" v-for="comment in comments">
        <div class="comments__avatar flex-center">{{comment.user_name?.[0].toUpperCase()}}</div>

        <div class="comments__content">
          <div class="comments__top flex flex-justify-between">
            <div class="comments__info">
              <p class="comments__name">{{comment.user_name}}</p>
              <p class="comments__date flex">
                <span>{{comment.date}}</span>
                <span v-if="comment.is_redact">Редактировано</span>
              </p>
            </div>

            <Absolute class="is-left-center"
                      position="left"
                      v-if="comment.user_id === userStore.user.id"
            >
              <template #activator>
                <button class="comments__dots recolor-svg button-width-svg flex-center" type="button">
                  <Dots/>
                </button>
              </template>

              <template #default>
                <Btn class="button-small">Редактировать</Btn>
              </template>
            </Absolute>
          </div>

          <p class="comments__text">{{comment.text}}</p>
        </div>
      </li>
    </ul>

    <p class="comments__empty h5" v-else>Комментариев пока нет..</p>

    <form class="comments__form position-sticky" v-if="visibleCreateComment">
      <label class="label">
        <input type="text"
               class="comments__input input"
               placeholder="Написать комментарий.."
               v-model="commentText"
        >
        <span class="label__counter position-absolute">{{commentText.length}}/1000</span>
      </label>

      <div class="comments__btn-bar flex">
        <Btn class="button-small"
             :is-disabled="!commentText.length"
             :is-loading="isLoading"
             @click="createComment"
        >
          Отправить
        </Btn>
        <Btn class="button-small" :is-disabled="isLoading">Очистить</Btn>
      </div>
    </form>
  </div>

</template>