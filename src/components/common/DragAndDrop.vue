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
const newDraggableIndex = ref<number | null>(null)

// стартовая позиция мыши
const startY = ref(0);
// значение для translate
const offsetY = ref(0);

// перетаскиваем ли мы сейчас элемент или нет
const isDragging = ref<boolean>(false)

// клик мышью - начало перетаскивания
const mouseDown = (event: MouseEvent, index: number) => {
  const target = event.target as HTMLElement

  if (props.handler && !target.classList.contains(props.handler)) return

  draggableIndex.value = index

  startY.value = event.clientY
  offsetY.value = 0

  isDragging.value = true

  window.addEventListener('mousemove', updateMouse)
  window.addEventListener('mouseup', mouseEnd)
}

// движение мышью
const updateMouse = (event: MouseEvent) => {
  if (draggableIndex.value === null) return

  offsetY.value = event.clientY - startY.value;

  newDraggableIndex.value = calculateNewIndex(draggableIndex.value);

  // if (newIndex !== draggableIndex.value) {
  //   const draggedItem = items.value.splice(draggableIndex.value, 1)[0];
  //   items.value.splice(newIndex, 0, draggedItem);
  //   draggableIndex.value = newIndex;
  //   startY.value = event.clientY;
  //   offsetY.value = 0;
  // }
}

// отпускаем мышь - конец перетаскивания
const mouseEnd = () => {
  if (
      draggableIndex.value !== null &&
      newDraggableIndex.value !== null &&
      draggableIndex.value !== newDraggableIndex.value
  ) {
    const draggableItem = items.value.splice(draggableIndex.value, 1)[0]
    items.value.splice(newDraggableIndex.value, 0, draggableItem)
  }

  draggableIndex.value = null
  offsetY.value = 0

  isDragging.value = false

  window.removeEventListener('mousemove', updateMouse)
  window.removeEventListener('mouseup', mouseEnd)
}

// если передвинули на половину props.height вверх/вниз - задаем новый индекс
function calculateNewIndex(currentIndex: number) {
  const itemHeight = props.height

  if (offsetY.value > itemHeight / 2 && currentIndex < items.value.length - 1) return currentIndex + 1
  if (offsetY.value < -itemHeight / 2 && currentIndex > 0) return currentIndex - 1

  return currentIndex
}

// стили элемента списка
const getItemStyle = (index: number) => {
  if (draggableIndex.value === index) {
    return { transform: `translateY(${offsetY.value}px)` };
  }
  return {};
};
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
         :style="getItemStyle(index)"
         @mousedown="mouseDown($event, index)"
    >
      <slot name="item" :item="item"/>
    </div>
  </TransitionGroup>

</template>