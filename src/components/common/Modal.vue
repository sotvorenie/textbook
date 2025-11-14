<script setup lang="ts">
import Cross from "../../assets/icons/Cross.vue";

import { roundedButtonStyle } from "../../data/styles.ts";

const visible = defineModel({default: false});

const props = defineProps({
  closeVisible: {
    type: Boolean,
    default: true
  },
  size: {
    type: Number,
    default: 600
  },
  // чтобы запретить закрытие модалки, пока не закончатся асинхронные запросы
  closeActive: {
    type: Boolean,
    default: true,
  },
})

const emits = defineEmits(['close']);

const open = () => {
  visible.value = true;
}

const close = () => {
  if (!props.closeActive) return

  emits('close');
  visible.value = false;
}

</script>

<template>

  <slot name="activator" :open="open" :close="close" />

  <Teleport to="body">
    <Transition name="fade">
      <div class="modal position-absolute z-10000 flex-center" v-if="visible" @click="close">
        <div class="modal__content position-relative" :style="{width: `${size}px`}" @click.stop>
          <button :class="['modal__close', 'position-absolute', ...roundedButtonStyle]"
                  @click="close"
                  type="button"
                  title="Закрыть"
                  aria-label="Закрыть"
                  v-if="closeVisible && closeActive"
          >
            <Cross/>
          </button>

          <slot :close="close" />
        </div>
      </div>
    </Transition>
  </Teleport>

</template>