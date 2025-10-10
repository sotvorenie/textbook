<script setup lang="ts">
import {nextTick, onMounted, ref, watch} from "vue";

import {onBlur, onInput} from "../../../../composables/useFormValidation.ts";
import {removeLabelText} from "../../../../composables/useLabelText.ts";
import {addLabelText} from "../../../../composables/useLabelText.ts";

import Btn from "../../../ui/Btn.vue";

//=========================================================//

defineProps({
  name: String,
  code: String,
})

const emits = defineEmits(['removeTextarea'])

//=========================================================//

const text = defineModel({type: String, required: true});

const blurInput = (event: Event) => {
  onBlur(event);
  removeLabelText(event);
}

// текст в поле ввода textarea
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// для автоматической высоты поля ввода
const autoResize = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = textarea.scrollHeight + 'px'
  }
}

// клик по полю ввода
const handleInput = (event: Event) => {
  onInput(event)

  autoResize()
}


// вызываем после монтирования, чтобы textarea растянулась под уже имеющийся текст
onMounted(() => {
  nextTick(() => {
    autoResize()
  })
})

// следим за внешним обновлением текста и подгоняем высоту
watch(() => text, () => {
  nextTick(() => {
    autoResize()
  })
})
</script>

<template>

  <label class="create__label label position-relative" @click="addLabelText">
        <span class="label__text is-active position-absolute cursor-text user-select-none"
              @click.stop
        >
          {{ name }}
        </span>
    <textarea class="create__textarea"
              :aria-describedby="`text-${code}`"
              @blur="blurInput"
              @input="handleInput"
              @focus="addLabelText"
              v-model="text"
              required
              ref="textareaRef"
    />
    <span :class="`create__${code} fields_${code} label__${code} position-absolute`"
          :id="`text-${code}`"
          data-js-form-field-errors
          @click.stop>
    </span>

    <Btn class="create__remove button-small position-absolute"
         @click="emits('removeTextarea')"
    >Удалить</Btn>
  </label>

</template>