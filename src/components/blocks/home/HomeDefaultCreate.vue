<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";

import {showAsk, showConfirm} from "../../../utils/modals.ts";

import {sendToTelegram, TelegramEventType} from "../../../api/telegram/telegram.ts";
import {createItem, redactItem} from "../../../api/posts/posts.ts";
import {getCurrentDateTime} from "../../../composables/useDate.ts";

import {addLabelText, removeLabelText} from "../../../composables/useLabelText.ts";
import {onBlur, onInput, onSubmit} from "../../../composables/useFormValidation.ts";

import {Item} from "../../../types/item.ts";
import Btn from "../../ui/Btn.vue";

import HomeCreateTextarea from "./HomeCreateTextareas/HomeCreateTextarea.vue";

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

const emits = defineEmits(['createItem'])

const technologies = ref<{title: string, checked: boolean}[]>([]);

settingsStore.settingsVisible.hints = 'create'

const newItem = reactive<Item>({
  user_id: userStore.user.id,
  title: '',
  languages_and_technologies: [],
  text: '',
  date: '',
  sort_date: '',
  time: ''
})

const newItemText = ref<{type: string, text: string}[]>([])

const blurInput = (event: Event) => {
  onBlur(event);
  removeLabelText(event);
}

const textBlock = ref<string[]>([])

const textareaAttributesList: Record<string, { name: string, code: string }> = {
  code: {
    name: 'Код',
    code: 'code',
  },
  text: {
    name: 'Текст',
    code: 'text',
  }
}
const textareaAttributes = ref<{ name: string, code: string }[]>([])

const createTextarea = (type: string): void => {
  newItemText.value.push({
    type,
    text: ''
  })

  textBlock.value.push('HomeCreateTextarea');
  textareaAttributes.value.push(textareaAttributesList[type])
}

const removeTextarea = (index: number) => {
  newItemText.value.splice(index, 1)
  textBlock.value.splice(index, 1)
  textareaAttributes.value.splice(index, 1)
}

const back = () => {
  blocksStore.activeBlock.hints = 'list';
  settingsStore.settingsVisible.hints = 'list'
}

const cancel = async () => {
  const confirm = await showConfirm(
      'Отмена создания подсказки',
      'Вы действительно хотите отменить создание подсказки?'
  )

  if (confirm) back()
}

const save = async (event: Event) => {
  const valid: boolean = onSubmit(event)

  if (!valid) return

  const ask = await showAsk(
      'Сохранение подсказки',
      'Вы действительно хотите сохранить подсказку?'
  )

  if (ask) await sendRequest()
}

const convertTextToBlocks = (str: string): {type: string, text: string}[] => {
  if (!str) return [];

  const blocks: {type: string, text: string}[] = [];
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = str;

  for (const child of Array.from(tempDiv.children)) {
    if (child.tagName === 'PRE' && child.querySelector('code')) {
      const codeElement = child.querySelector('code');
      if (codeElement) {
        let codeText = codeElement.innerHTML;

        codeText = codeText
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
    } else if (child.tagName === 'P') {
      let text = child.innerHTML;

      text = text
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");

      blocks.push({
        type: 'text',
        text: text
      });
    }
  }

  return blocks;
}

const initializeFromStore = () => {
  const storedText = createStore.createData[props.name].text;

  newItem.title = createStore.createData[props.name].title

  if (storedText) {
    const blocks = convertTextToBlocks(storedText);

    blocks.forEach(block => {
      textBlock.value.push('HomeCreateTextarea');
      textareaAttributes.value.push(textareaAttributesList[block.type])
      newItemText.value.push({
        type: block.type,
        text: block.text
      });
    });
  }
};

const convertBlocksToText = (blocks: {type: string, text: string}[]): string => {
  return blocks?.map(block => {
    const lines = block.text.split('\n');

    const processedLines = lines.map(line => {
      return line.replace(/ /g, '&nbsp;');
    });

    const formattedText = processedLines.join('<br>');

    if (block.type === 'code') {
      return `<pre><code>${formattedText}</code></pre>`;
    } else {
      return `<p>${formattedText}</p>`;
    }
  }).join('');
};

const sendRequest = async () => {
  newItem.text = convertBlocksToText(newItemText.value)

  const dateTime = getCurrentDateTime()

  newItem.time = dateTime.time
  newItem.date = dateTime.date
  newItem.sort_date = dateTime.sort_date

  newItem.languages_and_technologies = technologies.value
      ?.filter(item => item.checked)
      ?.map(item => item.title)

  if (!createStore.createData[props.name].title.length) {
    const response: Item = await createItem(props.apiUrl, newItem)

    emits('createItem', response)
  } else {
    await redactItem(
        props.apiUrl,
        newItem,
        createStore.createData[props.name].id
    )

    itemMemoStore.updateLastItemInCache(props.name, newItem)
  }

  const blockNameToEventType: Record<string, TelegramEventType> = {
    'hints': TelegramEventType.CREATE_HINTS,
    'textbooks': TelegramEventType.CREATE_TEXTBOOKS,
    'projects': TelegramEventType.CREATE_PROJECTS,
    'advices': TelegramEventType.CREATE_ADVICES,
  };

  await sendToTelegram(blockNameToEventType[props.name], newItem.title)

  textBlock.value = []
  newItemText.value = []
  textareaAttributes.value = []

  back()
}

onMounted(() => {
  technologiesStore.technologies?.forEach(el => {
    technologies.value.push({
      title: el,
      checked: false
    })
  })

  initializeFromStore()
})
</script>

<template>

  <div class="create">

    {{newItem.text}}
    <form class="create__form"
          novalidate
          method="post"
          @submit.prevent="save"
          data-js-form
    >
      <label class="create__label label position-relative" @click.stop>
        <span class="label__text position-absolute cursor-text user-select-none" @click.stop>Заголовок</span>
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
        </div>

        <TransitionGroup name="textarea"
                         tag="div"
        >
          <Component v-for="(textarea, index) in textBlock"
                     :key="index"
                     :is="textarea"
                     v-model="newItemText[index].text"
                     v-bind="textareaAttributes[index]"
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
        <Btn @click="cancel">Отмена</Btn>
      </div>

    </form>
  </div>

</template>