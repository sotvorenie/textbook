<script setup lang="ts">

import {PropType, ref} from "vue";

const props = defineProps({
  handler: String,
  cssClass: String,
})

const items = defineModel({
  type:Array as PropType<
      {
        id: string,
        text: string,
        attributes: {
          name: string;
          code: string;
        }
      }[]>, required: true})

const activeItemHeight = ref(0)

const draggableIndex = ref<number | null>(null)
const newDraggableIndex = ref<number | null>(null)

// стартовая позиция мыши
const startY = ref(0)
// значение для translate
const offsetY = ref(0)

// перетаскиваем ли мы сейчас элемент или нет
const isDragging = ref<boolean>(false)

// клик мышью - начало перетаскивания
const mouseDown = (event: MouseEvent, index: number) => {
  const container = event.currentTarget as HTMLElement
  const target = event.target as HTMLElement

  if (props.handler && !target.classList.contains(props.handler) && !target.closest(`.${props.handler}`)) {
    return
  }

  activeItemHeight.value = container.offsetHeight

  draggableIndex.value = index
  startY.value = event.clientY
  offsetY.value = 0
  isDragging.value = true

  globalThis.addEventListener('mousemove', updateMouse)
  globalThis.addEventListener('mouseup', mouseEnd)
}

// движение мышью
const updateMouse = (event: MouseEvent) => {
  if (draggableIndex.value === null) return

  offsetY.value = event.clientY - startY.value

  newDraggableIndex.value = calculateNewIndex(draggableIndex.value)
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

  globalThis.removeEventListener('mousemove', updateMouse)
  globalThis.removeEventListener('mouseup', mouseEnd)
}

// если передвинули на половину высоты перемещаемого элемента вверх/вниз - задаем новый индекс
const calculateNewIndex = (currentIndex: number) => {
  const itemHeight = activeItemHeight.value

  if (offsetY.value > itemHeight / 2 && currentIndex < items.value.length - 1) return currentIndex + 1
  if (offsetY.value < -itemHeight / 2 && currentIndex > 0) return currentIndex - 1

  return currentIndex
}

// стили элемента списка
const getItemStyle = (index: number) => {
  if (draggableIndex.value === index) {
    return {
      transform: `translate3d(0, ${offsetY.value}px, 0) !important`,
      zIndex: 9999,
      position: 'relative' as const,
      transition: 'none !important',
      pointerEvents: 'none' as const,
    }
  }

  if (draggableIndex.value !== null && newDraggableIndex.value !== null) {
    const shiftHeight = activeItemHeight.value + 40

    if (index > draggableIndex.value && index <= newDraggableIndex.value) {
      return {
        transform: `translateY(-${shiftHeight}px)`,
        transition: 'transform 0.2s'
      }
    }
    if (index < draggableIndex.value && index >= newDraggableIndex.value) {
      return {
        transform: `translateY(${shiftHeight}px)`,
        transition: 'transform 0.2s'
      }
    }
  }

  return {}
}
</script>

<template>

  <div>
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
      <slot name="item" :item="item" :index="index"/>
    </div>
  </div>

</template>