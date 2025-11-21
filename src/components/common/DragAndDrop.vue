<script setup lang="ts">

import {PropType, ref} from "vue";

const props = defineProps({
  transitionName: {
    type: String,
    default: 'textarea',
  },
  handler: String,
  cssClass: String,
  height: {
    type: Number,
    default: 100,
  },
})

const items = defineModel({type:Array as PropType<{id: number}[]>, required: true})

const draggableIndex = ref<number | null>(null)

// стартовая позиция мыши
const startY = ref(0);
// значение для translate
const offsetY = ref(0);

// клик мышью - начало перетаскивания
const mouseDown = (event: MouseEvent, index: number) => {
  const target = event.target as HTMLElement

  if (props.handler && !target.classList.contains(props.handler)) return

  draggableIndex.value = index

  startY.value = event.clientY
  offsetY.value = 0

  window.addEventListener('mousemove', updateMouse)
  window.addEventListener('mouseup', mouseEnd)
}

// движение мышью
const updateMouse = (event: MouseEvent) => {
  if (draggableIndex.value === null) return

  offsetY.value = event.clientY - startY.value;

  const newIndex = calculateNewIndex(draggableIndex.value);

  if (newIndex !== draggableIndex.value) {
    const draggedItem = items.value.splice(draggableIndex.value, 1)[0];
    items.value.splice(newIndex, 0, draggedItem);
    draggableIndex.value = newIndex;
    startY.value = event.clientY;
    offsetY.value = 0;
  }
}

// отпускаем мышь - конец перетаскивания
const mouseEnd = () => {
  draggableIndex.value = null
  offsetY.value = 0

  window.removeEventListener('mousemove', updateMouse)
  window.removeEventListener('mouseup', mouseEnd)
}

// если передвинули на половину props.height вверх/вниз - меняем элементы местами
function calculateNewIndex(currentIndex: number) {
  const itemHeight = props.height

  if (offsetY.value > itemHeight / 2 && currentIndex < items.value.length - 1) return currentIndex + 1
  if (offsetY.value < -itemHeight / 2 && currentIndex > 0) return currentIndex - 1

  return currentIndex
}
</script>

<template>

  <TransitionGroup :name="transitionName" tag="div">
    <div v-for="(item, index) in items"
         :key="item.id"
         :class="[
             {
                'drag-and-drop__item cursor-pointer flex flex-align-center': true,
                'dragging': index === draggableIndex
             },
             cssClass
         ]"
         :style="draggableIndex === index ? {transform: `translateY(${offsetY}px)`} : {}"
         @mousedown="mouseDown($event, index)"
    >
      <slot name="item" :item="item"/>
    </div>
  </TransitionGroup>

</template>