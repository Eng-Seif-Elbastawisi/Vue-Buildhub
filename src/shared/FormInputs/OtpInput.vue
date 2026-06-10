<script setup lang="ts">
  import InputOtp from 'primevue/inputotp';
  import { ref } from 'vue';

  const value = ref<string>('');
</script>

<template>
  <InputOtp v-model="value">
    <template #default="{ attrs, events }">
      <input type="text" v-bind="attrs" class="custom-otp-input" v-on="events" />
    </template>
  </InputOtp>
</template>
