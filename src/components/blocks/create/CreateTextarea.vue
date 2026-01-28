<script setup lang="ts">
import {computed, nextTick, onMounted, ref, watch} from "vue";

import {textareaAttributesList} from "../../../composables/create/useCreate.ts";

import {onBlur, onInput} from "../../../composables/useFormValidation.ts";
import {addLabelText, removeLabelText} from "../../../composables/useLabelText.ts";

import Btn from "../../ui/Btn.vue";
import DragAndDropIcon from "../../../assets/icons/DragAndDropIcon.vue";
import ArrowTextarea from "../../../assets/icons/ArrowTextarea.vue";

//=========================================================//

const props = defineProps({
  name: String,
  code: String,
})

const emits = defineEmits(['removeTextarea'])

//=========================================================//

const text = defineModel({type: String, required: true});

const activeTab = defineModel('activeIndex')

const blurInput = (event: Event) => {
  onBlur(event)
  removeLabelText(event)
}

// текст в поле ввода textarea
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// для автоматической высоты поля ввода
const autoResize = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'

    if (isClosed.value) {
      isClosed.value = false
    }
  }
}

// максимальная длина строки в зависимости от типа поля ввода
const maxLength = computed(() => {
  return props.code === textareaAttributesList.title.code ? 100 : 10000
})

// клик по полю ввода
const handleInput = (event: Event) => {
  onInput(event)

  nextTick(() => {
    autoResize()
    updateCloseBtnVisible()
  })
}

// для автоматической табуляции
const handleKeyDown = (event: KeyboardEvent) => {
  if (props.code !== textareaAttributesList.code.code) return // только для code-полей
  const textarea = textareaRef.value
  if (!textarea) return

  const key = event.key
  const indentSize = 3 // пробелов на уровень отступа

  const selectionStart = textarea.selectionStart ?? 0
  const selectionEnd = textarea.selectionEnd ?? 0
  const value = textarea.value

  const getCurrentLineIndent = () => {
    const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
    const line = value.slice(lineStart, selectionStart)
    const match = line.match(/^\s*/)
    return match ? match[0] : ''
  };

  const apply = (newValue: string, newCursorPos: number) => {
    textarea.value = newValue
    textarea.focus()
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    text.value = newValue
    nextTick(() => {
      autoResize()
      updateCloseBtnVisible()
    })
  }

  const pairs: Record<string, string> = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" }

  if (Object.hasOwn(pairs, key) && !event.ctrlKey && !event.metaKey) {
    const closing = pairs[key]
    const nextChar = value[selectionStart] ?? ''

    event.preventDefault()

    if (nextChar === closing) {
      const newValue = value.slice(0, selectionStart) + key + value.slice(selectionEnd)
      apply(newValue, selectionStart + 1)
    } else {
      const newValue = value.slice(0, selectionStart) + key + closing + value.slice(selectionEnd)
      apply(newValue, selectionStart + 1)
    }
    return
  }

  if (key === 'Enter') {
    const prevChar = value[selectionStart - 1] ?? ''
    const nextChar = value[selectionStart] ?? ''
    const currentIndent = getCurrentLineIndent()

    if (['{', '(', '['].includes(prevChar) && nextChar === pairs[prevChar]) {
      event.preventDefault()

      const innerIndent = ' '.repeat(indentSize);
      const insertText = `\n${currentIndent}${innerIndent}\n${currentIndent}`
      const newValue = value.slice(0, selectionStart) + insertText + value.slice(selectionEnd)

      const newCursorPos = selectionStart + 1 + currentIndent.length + innerIndent.length
      apply(newValue, newCursorPos)
      return
    }

    event.preventDefault()
    const insertText = `\n${currentIndent}`
    const newValue = value.slice(0, selectionStart) + insertText + value.slice(selectionEnd)
    const newCursorPos = selectionStart + 1 + currentIndent.length
    apply(newValue, newCursorPos)
    return
  }

  if (key === 'Tab') {
    event.preventDefault()
    const spaces = ' '.repeat(indentSize)
    const newValue = value.slice(0, selectionStart) + spaces + value.slice(selectionEnd)
    const newCursorPos = selectionStart + spaces.length
    apply(newValue, newCursorPos)
  }
}

// свернут ли textarea
const isClosed = ref<boolean>(false)

// сворачивание/разворачивание textarea
const handleCloseTextarea = () => {
  if (!closeBtnVisible.value) return

  isClosed.value = !isClosed.value

  const textarea = textareaRef.value
  if (!textarea) return

  if (isClosed.value) {
    textarea.style.height = '100px'
    textarea.style.overflow = 'hidden'
  } else {
    textarea.style.overflow = 'hidden'
    autoResize()
  }
}

// видимость кнопки "развернуть/свернуть"
const closeBtnVisible = ref<boolean>(false)

// изменить видимость кнопки "развернуть/свернуть"
const updateCloseBtnVisible = () => {
  const textarea = textareaRef.value

  if (!textarea) return

  closeBtnVisible.value = textarea.scrollHeight > 100
}


watch(() => activeTab.value,
    () => nextTick(() => {
      autoResize()
    })
)

onMounted(() => {
  nextTick(() => {
    autoResize()
    updateCloseBtnVisible()
  })
})
</script>

<template>

  <label class="create__label textarea label position-relative" @click="addLabelText">
        <span class="label__text is-active position-absolute cursor-text user-select-none"
              @click.stop
        >
          {{ name }}
        </span>
    <button class="create__handler recolor-svg position-absolute hover-color-accent"><DragAndDropIcon/></button>
    <textarea class="create__textarea"
              :aria-describedby="`text-${code}`"
              @blur="blurInput"
              @input="handleInput"
              @focus="addLabelText"
              @keydown="handleKeyDown"
              v-model="text"
              required
              :maxlength="maxLength"
              ref="textareaRef"
    />

    <span class="label__counter position-absolute">{{text.length}}/{{maxLength}}</span>

    <Transition name="scale">
      <Btn :class="{
            'create__close button-small position-absolute recolor-svg': true,
            'is-active': isClosed,
          }"
           @click.stop="handleCloseTextarea"
           v-if="closeBtnVisible"
      >
        <ArrowTextarea/>
      </Btn>
    </Transition>

    <Btn class="create__remove button-small position-absolute"
         @click="emits('removeTextarea')"
    >Удалить</Btn>
  </label>

</template>