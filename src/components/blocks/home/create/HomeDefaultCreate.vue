<script setup lang="ts">
import {onMounted, reactive} from "vue";

import {Item} from "../../../../types/item.ts";

import {textareaAttributesList, useCreate} from "../../../../composables/create/useCreate.ts";

import {addLabelText} from "../../../../composables/useLabelText.ts";
import {onInput} from "../../../../composables/useFormValidation.ts";

import Btn from "../../../ui/Btn.vue";

import HomeCreateTextarea from "./HomeCreateTextarea.vue";

import Modal from "../../../common/Modal.vue";
import DragAndDrop from "../../../common/DragAndDrop.vue";
import CheckboxList from "../../../ui/CheckboxList.vue";
import ToggleButton from "../../../ui/ToggleButton.vue";

import useCreateStore from "../../../../store/useCreateStore.ts";
const createStore = useCreateStore();
import useUserStore from "../../../../store/useUserStore.ts";
const userStore = useUserStore();
import useOnlineStore from "../../../../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})

defineOptions({
  components: {
    HomeCreateTextarea
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
  newItems,
  isVisibleCreateBtnBar,
  createTextarea,
  removeTextarea,
  technologies,
  getTechnologies,
  convertTextToBlocks,
  localCopyActive,
  isVisibleLocalHandler,
  handleLocalCopy
} = useCreate(props.name)


//=========================================================//
//-- конвертация --//
// для создания разметки при редактировании записи
const initializeFromStore = () => {
  const storedText = createStore.createData[props.name].text;

  newItem.title = createStore.createData[props.name].title

  if (storedText) {
    const blocks = convertTextToBlocks(storedText);

    blocks.forEach(block => {
      newItems.value.push({
        id: crypto.randomUUID(),
        type: block.type,
        text: block.text,
        attributes: textareaAttributesList[block.type]
      });
    });
  }
};
//=========================================================//


//=========================================================//
//-- хуки --//
// получаем список всевозможных языков и технологий, чтобы отобразить их с checkbox
onMounted(async () => {
  getTechnologies(initializeFromStore)
})
//=========================================================//
</script>

<template>

  <div class="create">

    <form class="create__form"
          novalidate
          method="post"
          @submit.prevent="save($event, newItem)"
          data-js-form
    >
      <label class="create__label label position-relative" @click.stop>
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
        <div class="create__btn-bar position-sticky z-1000 flex" v-if="isVisibleCreateBtnBar()">
          <Btn @click="createTextarea('code')">Код <></Btn>
          <Btn @click="createTextarea('text')">Текст</Btn>
          <Btn @click="createTextarea('title')"
               v-if="name === 'textbooks'"
          >
            Подзаголовок
          </Btn>
        </div>

        <DragAndDrop v-model="newItems"
                     transition-name="textarea"
                     handler="create__handler"
                     css-class="create__label-container"
        >
          <template #item="{item, index}">
            <HomeCreateTextarea
              :key="item.id"
              v-model="item.text"
              :name="item.attributes.name"
              :code="item.attributes.code"
              @remove-textarea="removeTextarea(index)"
            />
          </template>
        </DragAndDrop>
      </div>

      <div class="create__technologies" v-if="onlineStore.isOnlineMode">
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
        <p class="create__local-title h5">
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

      <div class="create__btn-bar flex flex-justify-center">
        <Btn :is-submit="true">Сохранить</Btn>
        <Btn @click="handleBack">Отмена</Btn>
      </div>

    </form>
  </div>

</template>