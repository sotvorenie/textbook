<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";

import {Item} from "../../../../types/item.ts";

import {showConfirm} from "../../../../utils/modals.ts";
import {textareaAttributesList} from "../../../../composables/create/useCreate.ts";

import {addLabelText} from "../../../../composables/useLabelText.ts";
import {onInput} from "../../../../composables/useFormValidation.ts";
import {useCreate} from "../../../../composables/create/useCreate.ts";

import Btn from "../../../ui/Btn.vue";

import HomeCreateTextarea from "./HomeCreateTextarea.vue";
import HomeTextbookSlider from "../HomeTextbookSlider.vue";

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

const {
  handleBack,
  blurInput,
  save,
  newItemsTextbook: newItems,
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
//-- tabs --//
const activeTab = ref<number>(0)

const tabs = ref<{id: number, name: string}[]>([{
  id: 0,
  name: ''
}])

const tabId = computed(() => tabs.value[activeTab.value]?.id);

// возможность создания нового tab-а (чтобы был лимит tab-ов)
const isVisibleCreateTab = computed(() => {
  return tabs.value.length < 250
})


const createTab = () => {
  tabs.value.push({id: tabs.value.length, name: ''})
  activeTab.value = tabs.value.length - 1
}

const removeTab = async () => {
  const confirm = await showConfirm(
      'Удаление раздела учебника',
      'Вы действительно хотите удалить этот раздел?'
  )

  if (confirm) {
    const idToRemove = tabId.value;

    tabs.value.splice(activeTab.value, 1);

    delete newItems.value[idToRemove];

    if (activeTab.value >= tabs.value.length) {
      activeTab.value = tabs.value.length - 1;
    }
  }
};
//=========================================================//



//=========================================================//
//-- создаваемый элемент --//
// создаваемый элемент для апи
const newItem = reactive<Item>({
  user_id: userStore.user.id,
  title: '',
  languages_and_technologies: [],
  content: {},
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


//=========================================================//
//-- конвертация --//
// для создания разметки при редактировании записи
const initializeFromStore = () => {
  const storedContent = createStore.createData[props.name].content;
  if (!storedContent || !Object.keys(storedContent).length) return;

  let tabCounter = 0;

  tabs.value = []

  newItem.title = createStore.createData[props.name].title

  for (const tabName in storedContent) {
    const id = tabCounter++;
    tabs.value.push({ id, name: tabName });

    const blocks = convertTextToBlocks(storedContent[tabName]);
    newItems.value[id] = [];

    blocks.forEach(block => {
      newItems.value[id].push({
        id: crypto.randomUUID(),
        ...block,
        attributes: textareaAttributesList[block.type]
      });
    });
  }
};
//=========================================================//


//=========================================================//
//-- хуки --//
// получаем список всевозможных языков и технологий, чтобы отобразить их с checkbox
onMounted(() => {
  getTechnologies(initializeFromStore)
})
//=========================================================//
</script>

<template>

  <div class="create">

    <form class="create__form"
          novalidate
          method="post"
          @submit.prevent="save($event, newItem, tabs)"
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

      <HomeTextbookSlider :items="tabs?.map(el => el.name)"
                          :is-create="isVisibleCreateTab"
                          v-model:active-index="activeTab"
                          @create-tab="createTab"
      />

      <label class="create__label label position-relative" @click.stop>
        <span class="label__text position-absolute cursor-text user-select-none"
              @click.stop
        >
          {{`Название ${activeTab + 1} темы`}}
        </span>
        <input class="create__input input"
               aria-describedby="title-error"
               @blur="blurInput"
               @input="onInput"
               @focus="addLabelText"
               maxlength="100"
               required
               v-model="tabs[activeTab]!.name"
        >
        <span class="create__error fields_error label__error position-absolute"
              id="title-error"
              data-js-form-field-errors
              @click.stop>
        </span>

        <span class="label__counter position-absolute">{{newItem.title.length}}/100</span>
      </label>

      <Btn @click="removeTab">Удалить этап</Btn>

      <div class="create__block position-relative">
        <div class="create__btn-bar position-sticky z-1000 flex" v-if="isVisibleCreateBtnBar(activeTab)">
          <Btn @click="createTextarea('code', tabId)">Код <></Btn>
          <Btn @click="createTextarea('text', tabId)">Текст</Btn>
          <Btn @click="createTextarea('title', tabId)"
               v-if="name === 'textbooks'"
          >
            Подзаголовок
          </Btn>
        </div>

        <DragAndDrop v-model="newItems[activeTab]"
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