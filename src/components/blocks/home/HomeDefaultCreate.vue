<script setup lang="ts">
import {onMounted, reactive, ref, watch} from "vue";

import {showAsk, showConfirm} from "../../../utils/modals.ts";
import {sendToTelegram, TelegramEventType} from "../../../api/telegram/telegram.ts";

import {addLabelText, removeLabelText} from "../../../composables/useLabelText.ts";
import {onBlur, onInput, onSubmit} from "../../../composables/useFormValidation.ts";

import {Item} from "../../../types/item.ts";
import Btn from "../../ui/Btn.vue";

import TextTextarea from "./HomeCreateTextareas/TextTextarea.vue";
import CodeTextarea from "./HomeCreateTextareas/CodeTextarea.vue";

import Modal from "../../common/Modal.vue";
import CheckboxList from "../../ui/CheckboxList.vue";

import useBlocksStore from "../../../store/blocksStore.ts";
import {createItem} from "../../../api/posts/posts.ts";
import useSettingsStore from "../../../store/settingsStore.ts";
import {getCurrentDateTime} from "../../../composables/useDate.ts";
import useTechnologiesStore from "../../../store/technologiesStore.ts";

const technologiesStore = useTechnologiesStore();

const settingsStore = useSettingsStore();

const blocksStore = useBlocksStore();

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
    TextTextarea,
    CodeTextarea
  }
})

const technologies = ref<{title: string, checked: boolean}[]>([]);

settingsStore.settingsVisible.hints = 'create'

const newItem = reactive<Item>({
  user_id: 10,
  title: '',
  languages_and_technologies: [],
  text: '',
  date: '',
  sort_date: '',
  time: ''
})

const newItemText = ref<Record<number, {type: string, text: string}>>({})

const blurInput = (event: Event) => {
  onBlur(event);
  removeLabelText(event);
}

const textBlock = ref<string[]>([])

const textareaItems: Record<string, string> = {
  text: 'TextTextarea',
  code: 'CodeTextarea'
}

const createTextarea = (type: string): void => {
  let index: number = textBlock.value.length;

  newItemText.value[index] = {
    type,
    text: ''
  }

 textBlock.value.push(textareaItems[type]);
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
  const blockArray = Object.values(newItemText.value)

  newItem.text = convertBlocksToText(blockArray)

  const dateTime = getCurrentDateTime()

  newItem.time = dateTime.time
  newItem.date = dateTime.date
  newItem.sort_date = dateTime.sort_date

  newItem.languages_and_technologies = technologies.value
      ?.filter(item => item.checked)
      ?.map(item => item.title)

  await createItem(props.apiUrl, newItem)

  const blockNameToEventType: Record<string, TelegramEventType> = {
    'hints': TelegramEventType.CREATE_HINTS,
    'textbooks': TelegramEventType.CREATE_TEXTBOOKS,
    'projects': TelegramEventType.CREATE_PROJECTS,
    'advices': TelegramEventType.CREATE_ADVICES,
  };

  await sendToTelegram(blockNameToEventType[props.name], newItem.title)

  textBlock.value = []
  newItemText.value = {}

  back()
}

watch(() => blocksStore.activeBlock.hints, (newVal) => {
  if (newVal === 'create') {
    settingsStore.settingsVisible.hints = 'create'
  }
})

onMounted(() => {
  technologiesStore.technologies?.forEach(el => {
    technologies.value.push({
      title: el,
      checked: false
    })
  })
})
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
        <span class="label__text position-absolute cursor-text user-select-none" @click.stop>Заголовок</span>
        <input class="create__input input"
               aria-describedby="title-error"
               @blur="blurInput"
               @input="onInput"
               @focus="addLabelText"
               maxlength="100"
               required
               v-model="newItem.title"
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

        <template v-if="textBlock.length">
          <template v-for="(textarea, index) in textBlock">
            <Component :is="textarea"  v-model="newItemText[index].text"/>
          </template>
        </template>
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