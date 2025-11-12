<script setup lang="ts">

import {sliceString} from "../../../composables/useSliceString.ts";

import useOnlineStore from "../../../store/useOnlineStore.ts";
const onlineStore = useOnlineStore();

import Btn from "../../ui/Btn.vue";

</script>

<template>

  <div class="sync">
    <Btn class="sync__btn all">Синхронизировать все</Btn>

    <p class="sync__title h4">Список созданных элементов:</p>

    <TransitionGroup tag="ul"
                     class="sync__list"
                     name="item-list"
                     appear
    >
      <li class="sync__item" v-for="item in [...onlineStore.redactedPosts, ...onlineStore.createdPosts]">
        <p class="sync__name h5">{{sliceString(item.title, 40)}}</p>
        <p class="sync__date">{{item.date}}</p>

        <div class="sync__btn-bar flex">
          <Btn class="sync__btn button-small">Синхронизировать</Btn>
          <Btn class="sync__btn button-small">Отмена</Btn>
        </div>
      </li>
    </TransitionGroup>
  </div>

</template>