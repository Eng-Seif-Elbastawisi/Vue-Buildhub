<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  // import { useFormsStore } from '@/stores/formsStore';

  import type SkillModel from '../../core/models/skills.model';
  import TranslationParams from '@/modules/about/core/params/translation.params';
  import EditSkillsParams from '../../core/params/edit.skills.params';
  import AddSkillsParams from '../../core/params/add.skills.params';
  import MultiLangInput from '@/shared/MultiLangInput.vue';

  const emit = defineEmits(['updateData']);

  const { skill, loading } = defineProps<{
    skill?: SkillModel;
    formKey?: string;
    loading?: boolean;
  }>();

  // const FormStore = useFormsStore();
  // onBeforeRouteLeave((to, from) => {
  //   const savedData = FormStore.getFormData(formKey!);
  //   if (savedData && to.path !== from.path) {
  //     FormStore.showReturnWarning(formKey!);
  //   }
  // });

  // Form state
  const translations = ref<Record<string, string>>({});

  watch(
    () => skill,
    (newskill) => {
      if (newskill) {
        // Record<string, string> | Array<Record<string, string>>
        const raw: any = newskill.title;
        if (Array.isArray(raw)) {
          translations.value = raw.reduce(
            (acc: Record<string, string>, item: Record<string, string>) => {
              if (item?.locale) {
                acc[item.locale] = item.title ?? '';
              }
              return acc;
            },
            {},
          );
        } else {
          translations.value = raw;
        }
      }
    },
    { immediate: true },
  );

  const route = useRoute();

  const updateData = () => {
    const data = {
      translations: new TranslationParams({
        title: translations.value,
      }),
    };

    // FormStore.setFormData(formKey!, data);

    let params: any;
    if (route.params.id) {
      params = new EditSkillsParams({
        id: Number(route.params.id),
        ...data,
      });
    } else {
      params = new AddSkillsParams(data);
    }

    emit('updateData', params);
  };

  const resetForm = () => {
    translations.value = {};
  };

  onMounted(() => {
    // const saved = FormStore.getFormData(formKey!);
    // if (saved) {
    //   translations.value = saved.translations;

    //   updateData();
    // } else if (!skill) {
    resetForm();
    // }
  });

  const updateTranslations = (newTranslations: Record<string, string>) => {
    // console.log(newTranslations, 'newTranslations');
    translations.value = newTranslations;
    updateData();
  };
</script>

<template>
  <div class="employee-details-form-card">
    <header class="form-header">
      <div class="form-title">
        <div class="header-text">
          <h3>{{ route.params.id ? 'Edit Skill' : 'Add New Skill' }}</h3>
          <p class="header-subtitle">
            {{
              route.params.id
                ? 'Update the skill details below'
                : 'Fill in the required information to add a new skill'
            }}
          </p>
        </div>
      </div>
    </header>

    <!-- <div class="employee-details-form">
      <p><EmployeeIcon /> {{ $t(`Basic Info`) }}</p>
      <h6 @click="resetForm">{{ $t(`reset`) }}</h6>
    </div> -->

    <div class="form-fields">
      <div class="field-group col-span-2 w-full" :class="{ disabled: loading }">
        <MultiLangInput
          :field-key="`title`"
          :label="$t(`title`)"
          :languages="['en', 'ar']"
          :model-value="translations"
          :type="`title`"
          @update:model-value="updateTranslations"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .form-fields {
    width: 100%;
  }
  .field-group {
    width: 100%;
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>
