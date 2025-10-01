<script setup lang="ts">
import {reactive, ref} from "vue";
import router from "../router";
import {Swiper, SwiperSlide} from "swiper/vue";
import type { Swiper as ISwiper } from 'swiper/types'
import 'swiper/css';

import {onBlur, onInput, onSubmit} from "../composables/useFormValidation.ts";
import {addLabelText, removeLabelText} from "../composables/useLabelText.ts";

import {login, register} from "../api/auth/auth.ts";
import {AuthResponse, RegisterData, LoginData} from "../api/auth/types.ts";

import {showWarning} from "../utils/modals.ts";

import {classes} from "../data/classes.ts";

import Btn from "../components/ui/Btn.vue";
import Navigation from "../components/common/Navigation.vue";
import Message from "../components/common/Message.vue";
import Loading from "../components/ui/Loading.vue";

//=========================================================//

//=========================================================//
//-- асинхронные функции --//
const isLoading = ref<boolean>(false);


const loginUser = async () => {
  isLoading.value = true;

  let data: LoginData = {
    email: loginForm.email,
    password: loginForm.password,
  }

  let response: AuthResponse = await login(data);

  if (response.token) {
    router.push('/main').catch(() => {});
  } else {
    await showWarning('Ошибка входа','Пользователя с таким логином/паролем не существует!!')
  }

  isLoading.value = false;
}

const registerUser = async () => {
  isLoading.value = true;

  let data: RegisterData = {
    email: registerForm.email,
    password: registerForm.password,
    name: registerForm.name
  }

  let response: AuthResponse = await register(data);

  if (response.token) {
    successRegister();
  } else {
    await showWarning('Ошибка регистрации','Пользователь с таким email уже существует!!');
  }

  isLoading.value = false;
}

const successRegister = () => {
  messageText.value = 'Регистрация прошла успешно!!';
  messageVisible.value = true;

  setTimeout(() => {
    router.push('/main');
  }, 2000)
}
//=========================================================//

//=========================================================//
//-- auth-блок --//
const authElement = ref<HTMLDivElement | null>(null);
//=========================================================//

//=========================================================//
//-- header --//
const titleElements: HTMLButtonElement[] = [];


const setActiveTitle = (value: number) => {
  titleElements.forEach(el => el.classList.remove(classes.isActive));
  titleElements[value].classList.add(classes.isActive);
}
//=========================================================//

//=========================================================//
//-- swiper --//
const swiperElement = ref<ISwiper | null>(null);


const changeSwiper = (value: number) => {
  swiperElement.value?.slideTo(value);

  setActiveTitle(value);

  clearForms();
}
//=========================================================//

//=========================================================//
//-- формы --//
const loginForm = reactive({
  email: "",
  password: "",
  errors: {
    email: "",
    password: ""
  }
})
const registerForm = reactive({
  name: "",
  email: "",
  password: "",
  errors: {
    name: "",
    email: "",
    password: ""
  }
})


const blurInput = (event: Event) => {
  onBlur(event);
  removeLabelText(event);
}

const removeAllErrors = () => {
  if (authElement.value) {
    let errors: NodeListOf<HTMLSpanElement> = authElement.value!.querySelectorAll('.fields_error');
    errors.forEach(el => el.textContent = '');
  }
}

const removeAllLabelText = () => {
  if (authElement.value) {
    let labelTexts: NodeListOf<HTMLSpanElement> = authElement.value!.querySelectorAll('.label__text');
    labelTexts.forEach(el => el.classList.remove(classes.isActive));
  }
}

const clearForms = () => {
  loginForm.email = "";
  loginForm.password = "";

  registerForm.name = "";
  registerForm.email = "";
  registerForm.password = "";

  removeAllErrors();
  removeAllLabelText();
}

const handleLogin = (event: Event) => {
  onSubmit(event) ? loginUser() : -1;
}
const handleRegister = (event: Event) => {
  onSubmit(event) ? registerUser() : null;
}
//=========================================================//

//=========================================================//
//-- message --//
const messageText = ref<string>('');
const messageVisible = ref<boolean>(false);
//=========================================================//
</script>

<template>
  <Navigation :back-visible="false"/>

  <Message v-model="messageVisible">{{messageText}}</Message>

  <main class="auth flex-center" ref="authElement">
    <div class="auth__inner overflow-hidden">
      <div class="auth__header flex flex-around">
        <button class="auth__title is-active"
                type="button"
                @click="changeSwiper(0)"
                :ref="el => titleElements[0] = el as HTMLButtonElement"
        >Войти</button>
        <button class="auth__title"
                type="button"
                @click="changeSwiper(1)"
                :ref="el => titleElements[1] = el as HTMLButtonElement"
        >Зарегистрироваться</button>
      </div>
      <Swiper class="auth__swiper"
              :allow-touch-move="false"
              @init="swiperElement = $event"
      >
        <SwiperSlide class="auth__slide">
          <form class="auth__form flex flex-column"
                novalidate
                method="post"
                @submit.prevent="handleLogin"
                data-js-form
          >
            <label class="auth__label label position-relative" @click="addLabelText">
              <span class="label__text position-absolute cursor-text user-select-none" @click.stop>Email</span>
              <input class="auth__input input"
                     type="email"
                     aria-describedby="email-error"
                     pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                     @blur="blurInput"
                     @input="onInput"
                     @focus="addLabelText"
                     v-model="loginForm.email"
                     required
              >
              <span class="auth__error fields_error label__error position-absolute"
                    id="email-error"
                    data-js-form-field-errors
                    @click.stop></span>
            </label>
            <label class="auth__label label position-relative" @click="addLabelText">
              <span class="label__text position-absolute cursor-text user-select-none" @click.stop>Пароль</span>
              <input class="auth__input input"
                     type="password"
                     aria-describedby="password-error"
                     minlength="4"
                     maxlength="11"
                     @blur="blurInput"
                     @input="onInput"
                     @focus="addLabelText"
                     v-model="loginForm.password"
                     required
              >
              <span class="auth__error fields_error label__error position-absolute" id="password-error" data-js-form-field-errors @click.stop></span>
            </label>

            <Btn class="auth__btn button-big-radius" :is-submit="true" :is-disabled="isLoading">
              <Loading v-if="isLoading"/>
              <span v-else>Войти</span>
            </Btn>
          </form>
        </SwiperSlide>
        <SwiperSlide class="auth__slide">
          <form class="auth__form flex flex-column"
                novalidate
                method="post"
                @submit.prevent="handleRegister"
                data-js-form
          >
            <label class="auth__label label position-relative" @click="addLabelText">
              <span class="label__text position-absolute cursor-text user-select-none" @click.stop>Имя</span>
              <input class="auth__input input"
                     aria-describedby="name-error"
                     @blur="blurInput"
                     @input="onInput"
                     @focus="addLabelText"
                     v-model="registerForm.name"
                     required
              >
              <span class="auth__error fields_error label__error position-absolute"
                    id="name-error"
                    data-js-form-field-errors
                    @click.stop></span>
            </label>
            <label class="auth__label label position-relative" @click="addLabelText">
              <span class="label__text position-absolute cursor-text user-select-none" @click.stop>Email</span>
              <input class="auth__input input"
                     type="email"
                     aria-describedby="email-error"
                     pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                     @blur="blurInput"
                     @input="onInput"
                     @focus="addLabelText"
                     v-model="registerForm.email"
                     required
              >
              <span class="auth__error fields_error label__error position-absolute"
                    id="email-error"
                    data-js-form-field-errors
                    @click.stop></span>
            </label>
            <label class="auth__label label position-relative" @click="addLabelText">
              <span class="label__text position-absolute cursor-text user-select-none" @click.stop>Пароль</span>
              <input class="auth__input input"
                     type="password"
                     aria-describedby="password-error"
                     minlength="4"
                     maxlength="11"
                     @blur="blurInput"
                     @input="onInput"
                     @focus="addLabelText"
                     v-model="registerForm.password"
                     required
              >
              <span class="auth__error fields_error label__error position-absolute" id="password-error" data-js-form-field-errors @click.stop></span>
            </label>

            <Btn class="auth__btn button-big-radius" :is-submit="true" :is-disabled="isLoading">
              <Loading v-if="isLoading"/>
              <span v-else>Зарегистрироваться</span>
            </Btn>
          </form>
        </SwiperSlide>
      </Swiper>
    </div>
  </main>
</template>