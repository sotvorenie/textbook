<script setup lang="ts">
import {onUnmounted, watch} from "vue";

const visible = defineModel({default: false});

const props = defineProps({
  position: {
    type: String,
    default: 'top',
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
  showDelay: {
    type: Number,
    default: 100,
  },
  hideDelay: {
    type: Number,
    default: 200,
  },
})

let showTimeout: number | null = null
let hideTimeout: number | null = null

const clearTimeouts = () => {
  if (showTimeout) {
    clearTimeout(showTimeout)
    showTimeout = null
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
}

const addMouse = () => {
  if (!props.isVisible) return

  clearTimeouts()

  if (visible.value) return

  showTimeout = setTimeout(() => {
    visible.value = true
    showTimeout = null
  }, props.showDelay)
}

const removeMouse = () => {
  if (!props.isVisible) return

  clearTimeouts()

  hideTimeout = setTimeout(() => {
    visible.value = false
    hideTimeout = null
  }, props.hideDelay)
}

onUnmounted(clearTimeouts)

watch(() => props.isVisible, (newVal) => {
  if (!newVal) {
    clearTimeouts()
    visible.value = false
  }
})

</script>

<template>

  <div class="absolute" @mouseenter="addMouse" @mouseleave="removeMouse">
    <slot name="activator"/>

    <Transition :name="position === 'top' ? 'fade-top' : 'fade-bottom'">
      <div class="absolute__content" v-if="visible && isVisible">
        <slot/>
      </div>
    </Transition>
  </div>

</template>