<script setup lang="ts">
  import { ref } from 'vue';
  import LoginController from '@/modules/MainAdmin/auth_admin/presentation/controllers/login.controller';
  import LoginParams from '@/modules/MainAdmin/auth_admin/core/params/login.params';
  import CloseEyeIcon from '@/shared/icons/Login/CloseEyeIcon.vue';
  import OpenEyeIcon from '@/shared/icons/Login/OpenEyeIcon.vue';
  // import ChangeLanguage from '@/shared/LayoutComponents/SubComponents/ChangeLanguage.vue';
  import LoadingIcon from '@/assets/images/loading.webp';
  import { useUserStore } from '@/stores/user';
  import { useRouter } from 'vue-router';

  withDefaults(
    defineProps<{
      mode?: 'admin' | 'organization';
      badge?: string;
    }>(),
    {
      mode: 'admin',
      badge: '',
    },
  );

  const email = ref('');
  const password = ref('');
  const router = useRouter();
  const controller = LoginController.getInstance();
  const loading = ref(false);
  const login = async () => {
    loading.value = true;
    const params = new LoginParams(email.value, password.value);
    await controller.login(params);

    if (useUserStore().user?.type === 1) {
      router.push({ name: 'Admin' });
    } else {
      router.push({ name: 'Employee' });
    }
    loading.value = false;
  };

  const isPasswordVisible = ref(false);
</script>

<template>
  <form class="login-form" @submit.prevent="login">
    <div class="lang-switcher">
      <!-- <ChangeLanguage /> -->
    </div>

    <div class="login-form__toolbar">
      <span class="login-form__badge">{{ badge }}</span>
      <!-- <button type="button" class="login-form__language">
        <span>{{ $t('auth_language_arabic') }}</span>
        <span aria-hidden="true">⌄</span>
      </button> -->
    </div>

    <div class="title">
      <h2>{{ $t(mode === 'admin' ? 'auth_admin_form_title' : 'auth_organization_form_title') }}</h2>
      <p>
        {{ $t(mode === 'admin' ? 'auth_admin_form_subtitle' : 'auth_organization_form_subtitle') }}
      </p>
    </div>

    <div class="inputs">
      <div class="input-wrapper">
        <label for="email">{{ $t('Email') }}</label>
        <div class="auth-input-wrap">
          <input
            id="email"
            v-model="email"
            class="input"
            :placeholder="$t('Enter Your Mail')"
            type="text"
          />
        </div>
      </div>
      <div class="input-wrapper input-wrapper--password">
        <label for="password">{{ $t('Password') }}</label>
        <div class="auth-input-wrap auth-input-wrap--password">
          <input
            id="password"
            v-model="password"
            :type="isPasswordVisible ? 'text' : 'password'"
            :placeholder="$t('Enter Your Password')"
            class="input py"
          />
          <button
            type="button"
            class="auth-password-toggle"
            :aria-label="$t('auth_password_toggle_label')"
            @click="isPasswordVisible = !isPasswordVisible"
          >
            <CloseEyeIcon v-if="isPasswordVisible" class="icon-eye" />
            <OpenEyeIcon v-else class="icon-eye" />
          </button>
        </div>
      </div>
    </div>

    <!-- <div class="login-form__meta">
      <label class="login-form__remember">
        <input type="checkbox" />
        <span>{{ $t('auth_remember_me') }}</span>
      </label>
      <button type="button" class="login-form__link">{{ $t('auth_forgot_password') }}</button>
    </div> -->

    <button type="submit" :class="{ disabled: loading }" class="btn btn-primary">
      <img
        v-if="loading"
        :src="LoadingIcon"
        class="loader-skills"
        :alt="$t('loading_image_alt')"
        width="30"
        height="30"
      />
      <span v-else>
        {{ $t('Log In') }}
      </span>
    </button>

    <!-- <div class="login-form__divider">
      <span>{{ $t('auth_or') }}</span>
    </div>

    <button type="button" class="login-form__support">
      <span aria-hidden="true">☎</span>
      <span>{{ $t('auth_contact_support') }}</span>
    </button> -->
  </form>
</template>

<style scoped>
  .disabled {
    cursor: not-allowed;
    opacity: 0.6;
    pointer-events: none;
  }
</style>
