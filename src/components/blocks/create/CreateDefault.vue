<script setup lang="ts">
import {onMounted, reactive, watch} from "vue";

import {Item} from "../../../types/item.ts";

import {textareaAttributesList, useCreate} from "../../../composables/create/useCreate.ts";

import {addLabelText} from "../../../composables/useLabelText.ts";
import {onInput} from "../../../composables/useFormValidation.ts";

import Btn from "../../ui/Btn.vue";
import Modal from "../../common/Modal.vue";
import DragAndDrop from "../../common/DragAndDrop.vue";
import CheckboxList from "../../ui/CheckboxList.vue";
import ToggleButton from "../../ui/ToggleButton.vue";
import CreateTextarea from "./CreateTextarea.vue";
import FoxModal from "../../ui/loading/FoxModal.vue";

import useCreateStore from "../../../store/useCreateStore.ts";
const createStore = useCreateStore();
import useUserStore from "../../../store/useUserStore.ts";
const userStore = useUserStore();
import useOnlineStore from "../../../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

defineOptions({
  components: {
    CreateTextarea
  }
})

//=========================================================//


//=========================================================//
//-- создаваемый элемент --//
// создаваемый элемент для апи
const newItem = reactive<Item>({
  user_id: userStore.user.id,
  title: '',
  languages_and_technologies: [],
  text: '',
  date: '',
  sort_date: '',
  time: '',
  statistics: {
    views: 0,
    downloads: 0,
    likes: 0,
  },
})
//=========================================================//

const {
  handleBack,
  blurInput,
  save,
  isLoading,
  newItems,
  isVisibleCreateBtnBar,
  createTextareaElement,
  removeTextarea,
  technologies,
  getTechnologies,
  convertTextToBlocks,
  localCopyActive,
  isVisibleLocalHandler,
  handleLocalCopy
} = useCreate(props.name)


//=========================================================//
//-- хуки --//
// получаем список всевозможных языков и технологий, чтобы отобразить их с checkbox
onMounted(() => {
  const draft = createStore.draft[props.name]

  if (draft) {
    Object.assign(newItem, draft.newItem)
    newItems.value = draft.newItems
    technologies.value = draft.technologies
  }

  getTechnologies()
})

watch(
    () => createStore.createData[props.name],
    (data) => {
      if (!data?.text) return
      if (newItems.value.length) return

      newItem.title = data.title

      const blocks = convertTextToBlocks(data.text)
      blocks.forEach(block => {
        newItems.value.push({
          id: crypto.randomUUID(),
          type: block.type,
          text: block.text,
          attributes: textareaAttributesList[block.type]
        })
      })
    }
)

watch(
    () => [
      newItem,
      newItems.value,
      technologies.value
    ],
    () => {
      if (!newItem.title.length) return

      createStore.draft[props.name] = {
        newItem: JSON.parse(JSON.stringify(newItem)),
        newItems: JSON.parse(JSON.stringify(newItems.value)),
        technologies: JSON.parse(JSON.stringify(technologies.value))
      }
    },
    { deep: true }
)
//=========================================================//
</script>

<template>

  <div class="create">
    <FoxModal v-model="isLoading"/>

    <form class="create__form"
          novalidate
          method="post"
          @submit.prevent="save($event, newItem)"
          data-js-form
    >
      <label class="create__label label position-relative w-100" @click.stop>
        <span class="label__text position-absolute cursor-text user-select-none"
              @click.stop
        >
          Заголовок
        </span>
        <input class="create__input input"
               aria-describedby="title-error"
               @blur="blurInput"
               @input="onInput"
               @focus="addLabelText"
               maxlength="100"
               required
               v-model="newItem.title"
               v-autofocus
        >
        <span class="create__error fields_error label__error position-absolute"
              id="title-error"
              data-js-form-field-errors
              @click.stop>
        </span>

        <span class="label__counter position-absolute">{{newItem.title.length}}/100</span>
      </label>

      <div class="create__block position-relative">
        <div class="create__btn-bar position-sticky z-1000 flex mb-40" v-if="isVisibleCreateBtnBar()">
          <Btn @click="createTextareaElement('code')">Код <></Btn>
          <Btn @click="createTextareaElement('text')">Текст</Btn>
          <Btn @click="createTextareaElement('title')"
               v-if="name === 'textbooks'"
          >
            Подзаголовок
          </Btn>
        </div>

        <DragAndDrop v-model="newItems"
                     handler="create__handler"
                     css-class="create__label-container mb-not-last-40"
        >
          <template #item="{item, index}">
            <CreateTextarea
              :key="item.id"
              class="w-100"
              v-model="item.text"
              :name="item.attributes.name"
              :code="item.attributes.code"
              @remove-textarea="removeTextarea(index)"
            />
          </template>
        </DragAndDrop>
      </div>

      <div class="create__technologies mb-20" v-if="onlineStore.isOnlineMode">
        <Modal>
          <template #activator="{open}">
            <Btn class="m-auto" @click="open">Выбрать языки и технологии</Btn>
          </template>

          <template #default>
            <div class="create__technologies-list">
              <CheckboxList v-model="technologies"/>
            </div>
          </template>
        </Modal>
      </div>

      <div class="create__local flex flex-column flex-align-center"
           v-if="isVisibleLocalHandler"
      >
        <p class="create__local-title h5 mb-10">
          {{createStore.isRedact[name] ? 'Редактировать' : 'Создать'}} локальную копию?
        </p>

        <div class="create__local-btn flex flex-align-center"
             :title="`${createStore.isRedact[name] ? 'Редактировать' : 'Создать'} локальную копию?`"
        >
          нет
          <ToggleButton :active="localCopyActive" @click="handleLocalCopy"/>
          да
        </div>
      </div>

      <div class="create__btn-bar flex flex-justify-center mb-20">
        <Btn :is-submit="true">Сохранить</Btn>
        <Btn @click="handleBack">Отмена</Btn>
      </div>

    </form>
  </div>

</template>