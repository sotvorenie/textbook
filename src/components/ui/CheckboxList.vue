<script setup lang="ts">
import Checkbox from "./Checkbox.vue";

const items = defineModel({
  default: [{title: '', checked: false}],
});

</script>

<template>

  <div class="checkbox-list flex flex-wrap">
    <div class="checkbox-list__item" v-for="item in items">
      <label class="flex flex-align-center">
        <span>{{item.title}}</span>
        <Checkbox :checked="item.checked"
                  @change="item.checked = !item.checked"
        />
      </label>
    </div>
  </div>

</template>