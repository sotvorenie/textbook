<script setup lang="ts">

import Modal from "../../common/Modal.vue";

const visible = defineModel()
</script>

<template>

  <Modal :size="400"
         :close-visible="false"
         :close-active="false"
         v-model="visible"
         is-top
  >
    <template #activator></template>
    <template #default>
      <div class="fox-modal flex-center flex-column">
        <img class="fox-modal__img mb-20" src="/gifs/FoxJump.gif" alt="Loading">

        <p class="h4">Загрузка..</p>
      </div>
    </template>
  </Modal>

</template>