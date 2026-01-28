<script setup lang="ts">

import Modal from "../../common/Modal.vue";
import ToggleButton from "../ToggleButton.vue";

import SantaHat from "../../../assets/icons/winter/SantaHat.vue";

import useUIStore from "../../../store/useUIStore.ts";
const uiStore = useUIStore();

</script>

<template>

  <Modal :size="400" v-if="uiStore.winterUiVisible">
    <template #activator="{open}">
      <button class="winter__btn position-absolute z-1000"
              type="button"
              title="Новогодние настройки"
              aria-label="Новогодние настройки"
              @click="open"
      >
        <SantaHat/>
      </button>
    </template>
    <template #default>
      <p class="winter__title text-center mb-20">Новогодние настройки</p>

      <div class="winter__content flex flex-justify-between">
        <label class="winter__label flex-center flex-column" for="snow">
          Снег:
          <ToggleButton :active="uiStore.snowVisible"
                        set-accent-color
                        id="snow"
                        @click="uiStore.snowVisible = !uiStore.snowVisible"
          />
        </label>

        <label class="winter__label flex-center flex-column" for="garland">
          Гирлянда:
          <ToggleButton :active="uiStore.garlandVisible"
                        set-accent-color
                        id="garland"
                        @click="uiStore.garlandVisible = !uiStore.garlandVisible"
          />
        </label>

        <label class="winter__label flex-center flex-column" for="light">
          Вкл гирлянду:
          <ToggleButton :active="uiStore.garlandIsActive"
                        set-accent-color
                        id="light"
                        @click="uiStore.garlandIsActive = !uiStore.garlandIsActive"
          />
        </label>
      </div>
    </template>
  </Modal>

</template>