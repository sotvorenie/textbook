<script setup lang="ts">
import {onMounted, ref} from "vue";

import {Comment} from "../../../api/comments/types.ts";
import {getComments, setComment, checkComment, redactComment, removeComment} from "../../../api/comments/comments.ts";
import {showConfirm, showError} from "../../../utils/modals.ts";
import Btn from "../../ui/Btn.vue";
import Absolute from "../../common/Absolute.vue";
import Dots from "../../../assets/icons/Dots.vue";
import CommentsSkeleton from "./loading/CommentsSkeleton.vue";

import useUserStore from "../../../store/useUserStore.ts";
const userStore = useUserStore();

const props = defineProps({
  name: {
    type: String,
    required: true,
  }
})

// список комментариев
const comments = ref<Comment[]>([])

// текст в input для создания комментария
const commentText = ref<string>('')

// видимость формы для создания комментария
const visibleCreateComment = ref<boolean>(false)

// видимость загрузки при создании и редактировании
const isLoading = ref<boolean>(false)

// сколько страниц осталось
const totalPages = ref<number>(0)

// страница получения комментариев с апи
const page = ref<number>(1)

// DOM-элемент main
const mainElement = ref<HTMLElement | null>(null)

// видимость скелетона при загрузке дополнительных комментариев
const skeletonVisible = ref<boolean>(false)

// редактируемый message
const redactedComment = ref<Comment | null>(null)

// очистка поля ввода
const handleClear = () => {
  commentText.value = ''
}

// очистка поля ввода и закрытие формы
const clearAndRemoveForm = (redacted: boolean = false) => {
  handleClear()
  visibleCreateComment.value = false

  if (redacted) {
    redactedComment.value = null
  }
}

// клик по "Редактировать"
const handleRedact = (comment: Comment) => {
  redactedComment.value = comment
  visibleCreateComment.value = true
  commentText.value = comment.text
}

// получение данных с апи
const getData = async (getVisible: boolean = false) => {
  try {
    skeletonVisible.value = true

    const data: {meta: any, items: Comment[]} =
        await getComments(props.name, page.value)

    if (getVisible) {
      const visibleData: boolean | undefined =
          await checkComment(props.name)

      visibleCreateComment.value = !visibleData
    }

    if (data && data.items.length) {
      comments.value.push(...data.items)
      page.value += 1
      totalPages.value = data.meta.total_pages
    }
  } catch (err) {
    console.error('Ошибка загрузки комментариев', err)

    await showError(
        'Ошибка загрузки комментариев',
        'Не удалось загрузить комментарии..'
    )
  } finally {
    skeletonVisible.value = false
  }
}
await getData()

// создание/редактирование комментария
const createComment = async () => {
  try {
    if (redactedComment.value) {
      const comment: Comment | undefined = await redactComment(
          props.name,
          redactedComment.value.id as number,
          commentText.value
      )

      if (comment) {
        comments.value = comments.value.map((item: Comment) => {
          return item.id === redactedComment.value!.id ? comment : item
        })

        clearAndRemoveForm(true)
      }
    } else {
      const comment: Comment | undefined =
          await setComment(props.name, commentText.value)

      if (comment) {
        comments.value.push(comment)

        clearAndRemoveForm()
      }
    }
  } catch (err) {
    console.error('Ошибка редактирования комментария', err)

    await showError(
        'Ошибка отправки комментария',
        'Не удалось отправить комментарий..'
    )
  }
}

// получение комментариев при scroll-е
const getFromScroll = async () => {
  if (skeletonVisible.value) return
  if (!mainElement.value) return
  if (page.value > totalPages.value) return

  const check: boolean =
      mainElement.value.scrollHeight - mainElement.value.scrollTop - mainElement.value.clientHeight <= 50

  if (check) {
    await getData()
  }
}

// удаление комментария
const handleRemoveComment = async (id: number) => {
  const check = await showConfirm(
      'Удаление комментария',
      'Вы действительно хотите удалить комментарий?'
  )

  if (check) {
    try {
      await removeComment(props.name, id)

      comments.value = comments.value.filter(comment => comment.id !== id)
    } catch (err) {
      console.error('Ошибка удаления комментария', err)

      await showError(
          'Ошибка удаления комментария',
          'Не удалось удалить комментарий..'
      )
    }
  }
}

onMounted(() => {
  mainElement.value = document.querySelector('.home__main')

  if (mainElement.value) {
    mainElement.value.addEventListener('scroll', getFromScroll)
  }
})
</script>

<template>

  <div class="comments position-relative">
    <p class="statistics__title h4">Комментарии:</p>

    <ul class="ul" v-if="comments.length">
      <TransitionGroup tag="div"
                       class="comments__list mb-20"
                       name="item-list"
      >
        <li :class="{
            'comments__item flex position-relative mb-not-last-10': true,
            'is-active': comment.user_id === userStore.user.id && redactedComment
          }"
            v-for="comment in comments"
        >
          <div class="comments__avatar flex-center">{{comment.user_name?.[0].toUpperCase()}}</div>

          <div class="comments__content w-100">
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
                  <div class="comments__actions flex flex-column">
                    <Btn class="comments__actions-btn button-small mb-10" @click="handleRedact(comment)">Редактировать</Btn>
                    <Btn class="comments__actions-btn button-small" @click="handleRemoveComment(comment.id!)">Удалить</Btn>
                  </div>
                </template>
              </Absolute>
            </div>

            <p class="comments__text">{{comment.text}}</p>
          </div>
        </li>
      </TransitionGroup>
    </ul>

    <p class="comments__empty h5 mb-20" v-else>Комментариев пока нет..</p>

    <CommentsSkeleton v-if="skeletonVisible"/>

    <Transition name="fade-bottom">
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
          <Btn class="comments__button button-small"
               :is-disabled="!commentText.length"
               :is-loading="isLoading"
               @click="createComment"
          >
            Отправить
          </Btn>
          <Btn class="comments__button button-small"
               :is-disabled="isLoading"
               @click="handleClear"
          >
            Очистить
          </Btn>
          <Btn class="comments__button button-small"
               v-if="redactedComment"
               :is-disabled="isLoading"
               @click="clearAndRemoveForm(true)"
          >
            Отмена
          </Btn>
        </div>
      </form>
    </Transition>
  </div>

</template>