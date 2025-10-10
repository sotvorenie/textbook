<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";

import {Item} from "../../../types/item.ts";

import {showAsk, showConfirm} from "../../../utils/modals.ts";
import {getCurrentDateTime} from "../../../composables/useDate.ts";
import {cancel} from "../../../composables/useCancelCreated.ts";

import {sendToTelegram, TelegramEventType} from "../../../api/telegram/telegram.ts";
import {createItem, redactItem} from "../../../api/posts/posts.ts";

import {addLabelText, removeLabelText} from "../../../composables/useLabelText.ts";
import {onBlur, onInput, onSubmit} from "../../../composables/useFormValidation.ts";

import Btn from "../../ui/Btn.vue";

import HomeCreateTextarea from "./HomeCreateTextareas/HomeCreateTextarea.vue";
import HomeTextbookSlider from "./HomeTextbookSlider.vue";

import Modal from "../../common/Modal.vue";
import CheckboxList from "../../ui/CheckboxList.vue";

import useBlocksStore from "../../../store/blocksStore.ts";
const blocksStore = useBlocksStore();
import useSettingsStore from "../../../store/settingsStore.ts";
const settingsStore = useSettingsStore();
import useTechnologiesStore from "../../../store/technologiesStore.ts";
const technologiesStore = useTechnologiesStore();
import useCreateStore from "../../../store/useCreateStore.ts";
const createStore = useCreateStore();
import useUserStore from "../../../store/userStore.ts";
const userStore = useUserStore();
import useItemMemoStore from "../../../store/itemMemoStore.ts";
const itemMemoStore = useItemMemoStore();
import useItemsStore from "../../../store/useItemsStore.ts";
const itemsStore = useItemsStore();

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
  const content: Record<string, string> = {};

  for (const tab of tabs.value) {
    const key = tab.name || `tab${tab.id}`;
    content[key] = convertBlocksToText(newItemText.value[tab.id] || []);
  }

  newItem.content = content;

  const dateTime = getCurrentDateTime();
  newItem.time = dateTime.time;
  newItem.date = dateTime.date;
  newItem.sort_date = dateTime.sort_date;

  newItem.languages_and_technologies = technologies.value
      ?.filter(item => item.checked)
      ?.map(item => item.title);


  if (!createStore.createData[props.name].title.length) {
    const response: Item = await createItem(props.apiUrl, newItem)

    if (response && response.id) {
      itemsStore.items[props.name].unshift({
        id: response.id,
        title: response.title,
        date: response.date,
        languages_and_technologies: response.languages_and_technologies,
      })

      const cacheElement = itemMemoStore.findItemById(response.id)

      if (cacheElement) itemMemoStore.updateItemInCacheById(props.name, response.id, newItem)
    }
  } else {
    const response = await redactItem(
        props.apiUrl,
        newItem,
        createStore.createData[props.name].id
    )

    if (response && response.id) {
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
  }

  const blockNameToEventType: Record<string, TelegramEventType> = {
    'hints': TelegramEventType.CREATE_HINTS,
    'textbooks': TelegramEventType.CREATE_TEXTBOOKS,
    'projects': TelegramEventType.CREATE_PROJECTS,
    'advices': TelegramEventType.CREATE_ADVICES,
  };

  await sendToTelegram(blockNameToEventType[props.name], newItem.title)

  back()
}
//=========================================================//


//=========================================================//
//-- табы --//
const activeTab = ref<number>(0)

const tabs = ref<{id: number, name: string}[]>([{
  id: 0,
  name: ''
}])

const tabId = computed(() => tabs.value[activeTab.value]?.id);


const createTab = () => {
  tabs.value.push({id: tabs.value.length, name: ''})
  activeTab.value = tabs.value.length - 1
}

// удаление таба по индексу
const removeTab = async () => {
  const confirm = await showConfirm(
      'Удаление раздела учебника',
      'Вы действительно хотите удалить этот раздел?'
  )

  if (confirm) {
    const idToRemove = tabId.value;

    tabs.value.splice(activeTab.value, 1);

    delete newItemText.value[idToRemove];
    delete textBlock.value[idToRemove];
    delete textareaAttributes.value[idToRemove];

    if (activeTab.value >= tabs.value.length) {
      activeTab.value = tabs.value.length - 1;
    }
  }
};
//=========================================================//


//=========================================================//
//-- создаваемый элемент --//
// создаваемый элемент
const newItem = reactive<Item>({
  user_id: userStore.user.id,
  title: '',
  languages_and_technologies: [],
  content: {},
  date: '',
  sort_date: '',
  time: ''
})

// текст создаваемого элемента
const newItemText = ref<Record<string, { type: string; text: string }[]>>({});
//=========================================================//


//=========================================================//
//-- заголовок --//
// потеря фокуса поля ввода заголовка
const blurInput = (event: Event) => {
  onBlur(event);
  removeLabelText(event);
}
//=========================================================//


//=========================================================//
//-- языки и технологии --//
// список языков и технологий с полями checked для чекбоксов
const technologies = ref<{title: string, checked: boolean}[]>([]);
//=========================================================//


//=========================================================//
//-- поля ввода --//
// список всех полей ввода
const textBlock = ref<Record<string, string[]>>({});

// список всевозможных типов полей ввода
const textareaAttributesList: Record<string, { name: string, code: string }> = {
  code: {
    name: 'Код',
    code: 'code',
  },
  text: {
    name: 'Текст',
    code: 'text',
  },
  title: {
    name: 'Подзаголовок',
    code: 'title',
  },
}

// список типов созданных полей ввода
const textareaAttributes = ref<Record<string, { name: string; code: string }[]>>({});

// создание нового поля ввода
const createTextarea = (type: string): void => {
  const id = tabId.value;

  if (!newItemText.value[id]) newItemText.value[id] = [];
  if (!textBlock.value[id]) textBlock.value[id] = [];
  if (!textareaAttributes.value[id]) textareaAttributes.value[id] = [];

  newItemText.value[id].push({ type, text: '' });
  textBlock.value[id].push('HomeCreateTextarea');
  textareaAttributes.value[id].push(textareaAttributesList[type]);
};

// удаление поля ввода
const removeTextarea = (index: number) => {
  const id = tabId.value;
  newItemText.value[id]?.splice(index, 1);
  textBlock.value[id]?.splice(index, 1);
  textareaAttributes.value[id]?.splice(index, 1);
};
//=========================================================//


//=========================================================//
//-- кнопки действий --//
// закрытие блока создания
const back = () => {
  blocksStore.activeBlock[props.name] = 'list';
  settingsStore.settingsVisible[props.name] = 'list'
}

// клик по кнопке "Отмена"
const handleBack = (): void => {
  cancel(props.name, back)
}

// клик по кнопке "Сохранить"
const save = async (event: Event) => {
  const valid: boolean = onSubmit(event)

  if (!valid) return

  const ask = await showAsk(
      'Сохранение подсказки',
      'Вы действительно хотите сохранить подсказку?'
  )

  if (ask) await sendRequest()
}
//=========================================================//


//=========================================================//
//-- конвертация --//
// конвертация текста в блоки (при редактировании записи)
const convertTextToBlocks = (str: string): { type: string, text: string }[] => {
  if (!str) return [];

  const blocks: { type: string, text: string }[] = [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = str;

  for (const child of Array.from(tempDiv.children)) {
    let text = child.innerHTML;

    text = text
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

    if (child.tagName === 'PRE' && child.querySelector('code')) {
      const codeElement = child.querySelector('code');
      if (codeElement) {
        let codeText = codeElement.innerHTML
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

        blocks.push({
          type: 'code',
          text: codeText
        });
      }
    } else if (child.tagName === 'H3') {
      blocks.push({
        type: 'title',
        text
      });
    } else if (child.tagName === 'P') {
      blocks.push({
        type: 'text',
        text
      });
    }
  }

  return blocks;
};

// для создания разметки при редактировании записи
const initializeFromStore = () => {
  const storedContent = createStore.createData[props.name].content;
  if (!storedContent) return;

  let tabCounter = 0;

  tabs.value = []

  newItem.title = createStore.createData[props.name].title

  for (const tabName in storedContent) {
    const id = tabCounter++;
    tabs.value.push({ id, name: tabName });

    const blocks = convertTextToBlocks(storedContent[tabName]);
    newItemText.value[id] = [];
    textBlock.value[id] = [];
    textareaAttributes.value[id] = [];

    blocks.forEach(block => {
      newItemText.value[id].push(block);
      textBlock.value[id].push('HomeCreateTextarea');
      textareaAttributes.value[id].push(textareaAttributesList[block.type]);
    });
  }
};

// конвертирование блоков в текст для отправки в апи
const convertBlocksToText = (blocks: { type: string, text: string }[]): string => {
  return blocks?.map(block => {
    const lines = block.text.split('\n');

    const processedLines = lines.map(line => line.replace(/ /g, '&nbsp;'));
    const formattedText = processedLines.join('<br>');

    if (block.type === 'code') {
      return `<pre><code>${formattedText}</code></pre>`;
    } else if (block.type === 'title') {
      return `<h3>${formattedText}</h3>`;
    } else {
      return `<p>${formattedText}</p>`;
    }
  }).join('');
};
//=========================================================//


//=========================================================//
//-- хуки --//
// получаем список всевозможных языков и технологий, чтобы отобраить их с чекбоксами
onMounted(() => {
  technologiesStore.technologies?.forEach(el => {
    technologies.value.push({
      title: el,
      checked: false
    })
  })

  initializeFromStore()
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

      <HomeTextbookSlider :items="tabs?.map(el => el.name)"
                          :is-create="true"
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
               v-model="tabs[activeTab].name"
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
          <Component v-for="(textarea, index) in textBlock[tabId] || []"
                     :key="index"
                     :is="textarea"
                     v-model="newItemText[tabId][index].text"
                     v-model:active-index="activeTab"
                     v-bind="textareaAttributes[tabId][index]"
                     @remove-textarea="removeTextarea(index)"
          />
        </TransitionGroup>
      </div>

      <div class="create__technologies">
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

      <div class="create__btn-bar flex flex-justify-center">
        <Btn :is-submit="true">Сохранить</Btn>
        <Btn @click="handleBack">Отмена</Btn>
      </div>

    </form>
  </div>

</template>