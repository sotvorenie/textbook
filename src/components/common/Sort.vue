<script setup lang="ts">
import {ref} from "vue";
import SortIcon from "../../assets/icons/SortIcon.vue";

const emits = defineEmits(['search'])

const selectedValue = ref<string>('-sort_date')

const handleSort = () => {
  emits('search', selectedValue.value)
}

</script>

<template>

  <div class="sort position-relative">

    <select class="sort overflow-hidden cursor-pointer"
            @change="handleSort"
            v-model="selectedValue"
    >
      <option class="sort__item" selected value="-sort_date">Сначала новые</option>
      <option class="sort__item" value="sort_date">Сначала старые</option>
    </select>

    <i class="recolor-svg i-svg position-absolute">
      <SortIcon/>
    </i>

  </div>

</template>