<script setup lang="ts">
  import type CountryModel from '@/modules/country/core/models/country.model';
  import IconCheck from '@/shared/icons/IconCheck.vue';

  const { country, selectedCountryId } = defineProps<{
    country: CountryModel;
    selectedCountryId: number;
  }>();
  const emit = defineEmits<{ (e: 'select-country', country: CountryModel): void }>();
  const selectCountry = () => {
    emit('select-country', country);
  };
</script>

<template>
  <!-- {{ selectedCountryId }} -->
  <button
    class="country-card"
    :class="{ active: country.id === selectedCountryId }"
    @click="selectCountry"
  >
    <div class="flag-container">
      <img :src="country.flag" alt="flag" class="flag" />
      <IconCheck v-if="country.id === selectedCountryId" class="flag-selected-icon" />
    </div>
    <span class="title">{{ country.title }}</span>
  </button>
</template>
