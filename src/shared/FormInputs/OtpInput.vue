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

<style scoped>
  .custom-otp-input {
    width: var(--bh-control-height);
    height: var(--bh-control-height);
    padding: 0;
    border: 1px solid var(--bh-field-line);
    border-radius: var(--bh-radius-control);
    color: var(--bh-text);
    background: var(--bh-surface-raised);
    font-family: var(--bh-font);
    font-size: var(--bh-text-md);
    text-align: center;
  }

  .custom-otp-input:focus {
    border-color: var(--bh-focus);
    outline: 2px solid var(--bh-focus);
    outline-offset: 2px;
  }
</style>
