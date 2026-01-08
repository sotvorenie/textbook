<script setup lang="ts">
import {onMounted, ref} from "vue";

import Absolute from "./Absolute.vue";
import FilterIcon from "../../assets/icons/FilterIcon.vue";
import Checkbox from "../ui/Checkbox.vue";

import useTechnologiesStore from "../../store/useTechnologiesStore.ts";
const technologiesStore = useTechnologiesStore();

const emits = defineEmits(['change'])

const filterVisible = ref<boolean>(false)

const filterList = ref<{id: number, name: string, checked: boolean, icon: string}[]>([])

const checkboxChange = (number: number): void => {
  filterList.value[number].checked = !filterList.value[number].checked
  emits('change', filterList.value)
}

onMounted(() => {
  technologiesStore.technologies?.forEach((el, index) => {
    filterList.value.push({
      id: index,
      name: el,
      checked: false,
      icon: ''
    })
  })
})

</script>

<template>

  <Absolute class="is-left"
            v-model="filterVisible"
            :show-delay="400"
            :hide-delay="200"
  >
    <template #activator>
      <button class="settings__btn-transparent recolor-svg">
        <FilterIcon/>
      </button>
    </template>

    <template #default>
      <div class="filter">
        <p class="filter__title">Выберите языки/технологии</p>

        <ul class="filter__list">
          <li class="filter__item absolute__content-item"
              v-for="(item, index) in filterList"
              :key="item?.id"
          >
            <label class="flex flex-align-center flex-between" :for="`checkbox-${item?.id}`">
              <span class="filter__name">{{item.name}}</span>
              <Checkbox :checked="item?.checked"
                        :id="`checkbox-${item?.id}`"
                        :disabled="!item"
                        @change="checkboxChange(index)"/>
            </label>
          </li>
        </ul>
      </div>
    </template>
  </Absolute>

</template>