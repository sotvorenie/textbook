<script setup lang="ts">

import {onBlur, onInput} from "../../../../composables/useFormValidation.ts";
import {removeLabelText} from "../../../../composables/useLabelText.ts";
import {addLabelText} from "../../../../composables/useLabelText.ts";

const text = defineModel({type: String, required: true});

const blurInput = (event: Event) => {
  onBlur(event);
  removeLabelText(event);
}

</script>

<template>

  <label class="create__label label position-relative" @click="addLabelText">
        <span class="label__text is-active position-absolute cursor-text user-select-none"
              @click.stop
        >
          Текст
        </span>
    <textarea class="create__textarea"
              aria-describedby="text-error"
              @blur="blurInput"
              @input="onInput"
              @focus="addLabelText"
              v-model="text"
              required
    />
    <span class="create__error fields_error label__error position-absolute"
          id="text-error"
          data-js-form-field-errors
          @click.stop>
        </span>
  </label>

</template>