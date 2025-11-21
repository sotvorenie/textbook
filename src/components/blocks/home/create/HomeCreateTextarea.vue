<script setup lang="ts">
import {computed, nextTick, onMounted, ref, watch} from "vue";

import {textareaAttributesList} from "../../../../composables/create/useCreate.ts";

import {onBlur, onInput} from "../../../../composables/useFormValidation.ts";
import {removeLabelText} from "../../../../composables/useLabelText.ts";
import {addLabelText} from "../../../../composables/useLabelText.ts";

import Btn from "../../../ui/Btn.vue";
import DragAndDropIcon from "../../../../assets/icons/DragAndDropIcon.vue";

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

// максимальная длина строки в зависимости от типа поля ввода
const maxLength = computed(() => {
  if (props.code === textareaAttributesList.code.code || props.code === textareaAttributesList.text.code) {
    return 10000
  } else {
    return 100
  }
})

// клик по полю ввода
const handleInput = (event: Event) => {
  onInput(event)

  autoResize()
}

watch(() => activeTab.value,
    () => nextTick(() => {
      autoResize()
    })
)

onMounted(() => {
  nextTick(() => {
    autoResize()
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
              v-model="text"
              required
              :maxlength="maxLength"
              ref="textareaRef"
    />

    <span class="label__counter position-absolute">{{text.length}}/{{maxLength}}</span>

    <Btn class="create__remove button-small position-absolute"
         @click="emits('removeTextarea')"
    >Удалить</Btn>
  </label>

</template>