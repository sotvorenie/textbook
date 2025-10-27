<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";

import {Item} from "../../../../types/item.ts";

import {showAsk} from "../../../../utils/modals.ts";
import {getCurrentDateTime} from "../../../../composables/useDate.ts";
import {cancel} from "../../../../composables/useCancelCreated.ts";

import {sendToTelegram, TelegramEventType} from "../../../../api/telegram/telegram.ts";
import {createItem, redactItem} from "../../../../api/posts/posts.ts";

import {addLabelText, removeLabelText} from "../../../../composables/useLabelText.ts";
import {onBlur, onInput, onSubmit} from "../../../../composables/useFormValidation.ts";

import Btn from "../../../ui/Btn.vue";

import HomeCreateTextarea from "./HomeCreateTextarea.vue";

import Modal from "../../../common/Modal.vue";
import CheckboxList from "../../../ui/CheckboxList.vue";

import useBlocksStore from "../../../../store/blocksStore.ts";
const blocksStore = useBlocksStore();
import useSettingsStore from "../../../../store/settingsStore.ts";
const settingsStore = useSettingsStore();
import useTechnologiesStore from "../../../../store/technologiesStore.ts";
const technologiesStore = useTechnologiesStore();
import useCreateStore from "../../../../store/useCreateStore.ts";
const createStore = useCreateStore();
import useUserStore from "../../../../store/userStore.ts";
const userStore = useUserStore();
import useItemMemoStore from "../../../../store/itemMemoStore.ts";
const itemMemoStore = useItemMemoStore();
import useItemsStore from "../../../../store/useItemsStore.ts";
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
      setNewLanguages()

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

  textBlock.value = []
  newItemText.value = []
  textareaAttributes.value = []

  back()
}
//=========================================================//


//=========================================================//
//-- создаваемый элемент --//
// создаваемый элемент
const newItem = reactive<Item>({
  user_id: userStore.user.id,
  title: '',
  languages_and_technologies: [],
  text: '',
  date: '',
  sort_date: '',
  time: ''
})

// текст создаваемого элемента
const newItemText = ref<{type: string, text: string}[]>([])
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


// выбор технологий при редактировании поста
const getSearchTechnologies = () => {
  let languages = createStore.createData[props.name].languages_and_technologies

  if (!languages.length) return

  technologies.value = technologies.value?.map(el => {
    if (languages.includes(el.title)) {
      return {
        title: el.title,
        checked: true,
      }
    }

    return el
  })
}

// если изменился список языков, то добавить в нужный элемент list
const setNewLanguages = () => {
  const redactLanguages = Object.values(createStore.createData[props.name].languages_and_technologies)
  const filteredLanguages = technologies.value?.filter(el => el.checked)?.map(el => el.title)

  if (redactLanguages !== filteredLanguages) {
    itemsStore.items[props.name] = itemsStore.items[props.name]?.map(el => {
      if (el.id === createStore.createData[props.name].id) {
        return {
          ... el,
          languages_and_technologies: filteredLanguages,
        }
      }

      return el
    })
  }
}
//=========================================================//


//=========================================================//
//-- поля ввода --//
// список всех полей ввода
const textBlock = ref<string[]>([])

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
const textareaAttributes = ref<{ name: string, code: string }[]>([])


// создание нового поля ввода
const createTextarea = (type: string): void => {
  newItemText.value.push({
    type,
    text: ''
  })

  textBlock.value.push('HomeCreateTextarea');
  textareaAttributes.value.push(textareaAttributesList[type])
}

// удаление поля ввода
const removeTextarea = (index: number) => {
  newItemText.value.splice(index, 1)
  textBlock.value.splice(index, 1)
  textareaAttributes.value.splice(index, 1)
}
//=========================================================//


//=========================================================//
//-- кнопки действий --//
// закрытие блока создания
const back = () => {
  blocksStore.activeBlock[props.name] = 'list';
  settingsStore.settingsVisible[props.name] = 'list'

  createStore.createData[props.name] = {
    title: '',
    text: '',
    id: -1,
    languages_and_technologies: []
  }
  createStore.isRedact[props.name] = false
}

// клик по кнопке "Отмена"
const handleBack = (): void => {
  if (userStore.isUserPost[props.name]
      && blocksStore.activeBlock[props.name] === 'create'
      && createStore.isRedact[props.name]
  ) {
    cancel(props.name, () => {
      blocksStore.activeBlock[props.name] = 'item'

      createStore.createData[props.name] = {
        title: '',
        text: '',
        id: -1,
        languages_and_technologies: []
      }

      createStore.isRedact[props.name] = false
    }, 'редактирование')
  } else {
    cancel(props.name, back)
    userStore.isUserPost[props.name] = false
  }
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

  const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const processElement = (element: Element): { type: string, text: string } | null => {
    let text = element.innerHTML;

    if (element.tagName === 'PRE' && element.querySelector('code')) {
      const codeElement = element.querySelector('code');
      if (codeElement) {
        let codeText = codeElement.innerHTML
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/&nbsp;/g, ' ');

        codeText = decodeHtmlEntities(codeText);

        return {
          type: 'code',
          text: codeText
        };
      }
    } else if (element.tagName === 'H3') {
      text = element.textContent || '';
      text = decodeHtmlEntities(text);

      return {
        type: 'title',
        text: text
      };
    } else if (element.tagName === 'P') {
      text = element.innerHTML;
      text = text
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/&nbsp;/g, ' ');

      text = decodeHtmlEntities(text);

      return {
        type: 'text',
        text: text
      };
    }

    return null;
  };

  for (const child of Array.from(tempDiv.children)) {
    const block = processElement(child);
    if (block) {
      blocks.push(block);
    }
  }

  return blocks;
};

// для создания разметки при редактировании записи
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

// конвертирование блоков в текст для отправки в апи
const convertBlocksToText = (blocks: { type: string, text: string }[]): string => {
  return blocks?.map(block => {
    const escapeHtml = (text: string): string => {
      return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
    };

    const formattedText = escapeHtml(block.text)
        .replace(/\n/g, '<br>')
        .replace(/ /g, '&nbsp;');

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

  getSearchTechnologies()
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
        <Btn @click="handleBack">Отмена</Btn>
      </div>

    </form>
  </div>

</template>