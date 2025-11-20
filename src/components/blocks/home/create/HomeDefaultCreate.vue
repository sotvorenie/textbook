<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";

import {Item} from "../../../../types/item.ts";

import {showAsk, showError} from "../../../../utils/modals.ts";
import {getCurrentDateTime} from "../../../../composables/useDate.ts";
import {
  blurInput,
  setNewLanguages, textareaAttributesList,
  back, handleBack, convertTextToBlocks, convertBlocksToText, getTechnologies
} from "../../../../composables/create/useCreatedFunctions.ts";

import {sendToTelegram, TelegramEventType} from "../../../../api/telegram/telegram.ts";
import {createItem, redactItem} from "../../../../api/posts/posts.ts";

import {addLabelText} from "../../../../composables/useLabelText.ts";
import {onInput, onSubmit} from "../../../../composables/useFormValidation.ts";

import Btn from "../../../ui/Btn.vue";

import HomeCreateTextarea from "./HomeCreateTextarea.vue";

import Modal from "../../../common/Modal.vue";
import CheckboxList from "../../../ui/CheckboxList.vue";

import useCreateStore from "../../../../store/useCreateStore.ts";
const createStore = useCreateStore();
import useUserStore from "../../../../store/userStore.ts";
const userStore = useUserStore();
import useItemMemoStore from "../../../../store/itemMemoStore.ts";
const itemMemoStore = useItemMemoStore();
import useItemsStore from "../../../../store/useItemsStore.ts";
const itemsStore = useItemsStore();
import useOnlineStore from "../../../../store/useOnlineStore.ts";
import ToggleButton from "../../../ui/ToggleButton.vue";
const onlineStore = useOnlineStore();

const props = defineProps({
  apiUrl: {
    type: String,
    required: true,
    default: ''
  },
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
//-- асинхронные функции --//
// создание/редактирование записи
const sendRequest = async () => {
  newItem.text = convertBlocksToText(newItems.value)

  const dateTime = getCurrentDateTime()

  newItem.time = dateTime.time
  newItem.date = dateTime.date
  newItem.sort_date = dateTime.sort_date

  if (onlineStore.isOnlineMode) {
    newItem.languages_and_technologies = technologies.value
        ?.filter(item => item.checked)
        ?.map(item => item.title)
  } else {
    newItem.languages_and_technologies = createStore.createData[props.name].languages_and_technologies
  }

  if (!createStore.createData[props.name].title.length) {
    try {
      const createInDB: boolean = onlineStore.isOnlineMode ? localCopyActive.value : true

      const response: Item = await createItem(props.apiUrl, newItem, createInDB, createStore.isCanCreateInAPI[props.name])

      if (response && response.id && (createStore.isCanCreateInAPI[props.name] || !onlineStore.isOnlineMode)) {
        itemsStore.items[props.name].unshift({
          id: response.id,
          title: response.title,
          date: response.date,
          languages_and_technologies: response.languages_and_technologies,
        })

        const cacheElement = itemMemoStore.findItemById(response.id)

        if (cacheElement) itemMemoStore.updateItemInCacheById(props.name, response.id, newItem)
      }
    } catch (_) {
      await showError(
          'Ошибка создания записи',
          'Не удалось создать запись..'
      )
    }
  } else {
    try {
      const response = await redactItem(
          props.apiUrl,
          newItem,
          createStore.createData[props.name].id
      )

      if (response && response.id) {
        setNewLanguages(props.name, technologies)

        itemsStore.items[props.name] = itemsStore.items[props.name]?.map(el => {
          if (el.id === response.id) {
            return {
              ...el,
              title: response.title,
            }
          }

          return el
        })

        itemMemoStore.updateLastItemInCache(props.name, newItem)
      }
    } catch (_) {
      await showError(
          'Ошибка редактирования записи',
          'Не удалось редактировать запись..'
      )
    }
  }

  const blockNameToEventType: Record<string, TelegramEventType> = {
    'hints': TelegramEventType.CREATE_HINTS,
    'textbooks': TelegramEventType.CREATE_TEXTBOOKS,
    'projects': TelegramEventType.CREATE_PROJECTS,
    'advices': TelegramEventType.CREATE_ADVICES,
  };

  try {
    await sendToTelegram(blockNameToEventType[props.name], newItem.title)
  } catch (_) {}

  newItems.value = []

  back(props.name)
}
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
  time: ''
})

// список textarea блоков
const newItems= ref<{
  id: string,
  type: string,
  text: string,
  attributes: {
    name: string,
    code: string,
  },
}[]>([])
//=========================================================//


//=========================================================//
//-- языки и технологии --//
// список языков и технологий с полями checked для checkbox
const technologies = ref<{title: string, checked: boolean}[]>([]);
//=========================================================//


//=========================================================//
//-- поля ввода --//
// создание нового поля ввода
const createTextarea = (type: string): void => {
  newItems.value.push({
    id: crypto.randomUUID(),
    type,
    text: '',
    attributes: textareaAttributesList[type]
  })
}

// удаление поля ввода
const removeTextarea = (id: string) => {
  newItems.value = newItems.value?.filter(el => el.id !== id)
}
//=========================================================//


//=========================================================//
//-- кнопки действий --//
// клик по кнопке "Сохранить"
const save = async (event: Event) => {
  const valid: boolean = onSubmit(event)

  if (!valid) return

  const names: Record<string, string> = {
    hints: 'подсказки',
    projects: 'проекта',
    advices: 'совета',
  }

  const names_2: Record<string, string> = {
    hints: 'подсказку',
    projects: 'проект',
    advices: 'совет',
  }

  const ask = await showAsk(
      `Сохранение ${names[props.name]}`,
      `Вы действительно хотите сохранить ${names_2[props.name]}?`
  )

  if (ask) await sendRequest()
}
//=========================================================//


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
//-- локальная копия --//
// создавать ли локальную копию создаваемого поста
const localCopyActive = ref<boolean>(true)


// переключение значения локальной копии
const handleLocalCopy = () => {
  localCopyActive.value = !localCopyActive.value;
}
//=========================================================//


//=========================================================//
//-- хуки --//
// получаем список всевозможных языков и технологий, чтобы отобразить их с checkbox
onMounted(() => {
  getTechnologies(
      technologies,
      initializeFromStore,
      props.name
  )
})
//=========================================================//
</script>

<template>

  <div class="create">

    <form class="create__form"
          novalidate
          method="post"
          @submit.prevent="save"
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
        <div class="create__btn-bar position-sticky z-1000 flex">
          <Btn @click="createTextarea('code')">Код <></Btn>
          <Btn @click="createTextarea('text')">Текст</Btn>
          <Btn @click="createTextarea('title')"
               v-if="name === 'textbooks'"
          >
            Подзаголовок
          </Btn>
        </div>

        <TransitionGroup name="textarea"
                         tag="div"
        >
          <HomeCreateTextarea v-for="item in newItems"
                              v-model="item.text"
                              :name="item.attributes.name"
                              :code="item.attributes.code"
                              @remove-textarea="removeTextarea(item.id)"
          />

        </TransitionGroup>
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
           v-if="onlineStore.isOnlineMode && createStore.isCanCreateInAPI[props.name]"
      >
        <p class="create__local-title h5">Создать локальную копию?</p>

        <div class="create__local-btn flex flex-align-center"
             title="Создать локальную копию?"
        >
          нет
          <ToggleButton :active="localCopyActive" @click="handleLocalCopy"/>
          да
        </div>
      </div>

      <div class="create__btn-bar flex flex-justify-center">
        <Btn :is-submit="true">Сохранить</Btn>
        <Btn @click="handleBack(name)">Отмена</Btn>
      </div>

    </form>
  </div>

</template>