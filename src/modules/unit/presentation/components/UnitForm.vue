<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { onBeforeRouteLeave, useRoute } from 'vue-router';
  import { useFormsStore } from '@/stores/formsStore';
  import TitleInterface from '@/base/Data/Models/titleInterface';
  import UpdatedCustomInputSelect from '@/shared/FormInputs/UpdatedCustomInputSelect.vue';
  import type UnitModel from '../../core/models/unit.model';
  import AddUnitParams from '../../core/params/add.unit.params';

  const emit = defineEmits(['updateData']);

  const { unit, formKey, loading } = defineProps<{
    unit?: UnitModel;
    formKey?: string;
    loading?: boolean;
  }>();

  const FormStore = useFormsStore();
  onBeforeRouteLeave((to, from) => {
    const savedData = FormStore.getFormData(formKey!);
    if (savedData && to.path !== from.path) {
      FormStore.showReturnWarning(formKey!);
    }
  });

  // Form state
  const title = ref<string>('');
  const subject = ref<TitleInterface<number>>(
    new TitleInterface<number>({
      id: 0,
      title: '',
    }),
  );
  const stage = ref<TitleInterface<number>>(
    new TitleInterface<number>({
      id: 0,
      title: '',
    }),
  );

  watch(
    () => unit,
    (newUnit) => {
      if (newUnit) {
        title.value = newUnit.title;
      }
    },
    { immediate: true },
  );

  const route = useRoute();

  const updateData = () => {
    FormStore.setFormData(formKey!, {
      title: title.value,
      subject: subject.value,
    });
    const params = new AddUnitParams({
      title: title.value,
      SubjectId: subject.value?.id as number,
      StageId: stage.value?.id as number,
    });
    emit('updateData', params);
  };

  const resetForm = () => {
    title.value = '';
    subject.value = new TitleInterface<number>({
      id: 0,
      title: '',
    });
  };

  onMounted(() => {
    const saved = FormStore.getFormData(formKey!);
    if (saved) {
      title.value = saved.title;
      subject.value = saved.subject;
      updateData();
    } else {
      resetForm();
    }
  });

  const EducationTypes = ref<TitleInterface<number>[]>([
    new TitleInterface({
      id: 1,
      title: 'الرياضيات',
    }),
    new TitleInterface({
      id: 2,
      title: 'الفيزياء',
    }),
    new TitleInterface({
      id: 3,
      title: 'الكيمياء',
    }),
    new TitleInterface({
      id: 4,
      title: 'الاحياء',
    }),
    new TitleInterface({
      id: 5,
      title: 'العلوم',
    }),
  ]);

  const Stages = ref<TitleInterface<number>[]>([
    new TitleInterface({
      title: 'المرحلة الإعدادية',
      id: 1,
    }),
    new TitleInterface({
      title: 'المرحلة الابتدائية',
      id: 2,
    }),
  ]);

  watch(
    () => unit,
    (newUnit) => {
      if (!newUnit) return;
      stage.value = new TitleInterface<number>({
        id: newUnit.Stage.id,
        title: newUnit.Stage.title,
      });

      subject.value = new TitleInterface<number>({
        id: newUnit.Subject.id,
        title: newUnit.Subject.title,
      });
    },
    { immediate: true },
  );
</script>

<template>
  <div class="email-form-card">
    <!-- ── Card Header ───────────────────────────────────── -->
    <header class="form-header">
      <div class="header-text">
        <h3>{{ route.params.id ? 'Edit Unit' : 'Add New Unit' }}</h3>
        <p class="header-subtitle">
          {{
            route.params.id
              ? 'Update the unit details below'
              : 'Fill in the unit name, code and flag'
          }}
        </p>
      </div>
      <span v-if="route.params.id" class="edit-badge">Editing</span>
    </header>

    <!-- ── Divider ───────────────────────────────────────── -->
    <div class="form-divider" />

    <!-- ── Fields ────────────────────────────────────────── -->
    <div class="form-fields">
      <!-- Email Field -->
      <div class="field-group" :class="{ disabled: loading }">
        <label class="field-label" for="title"> Unit Title </label>
        <div class="input-wrap">
          <input
            id="title"
            v-model="title"
            type="text"
            placeholder="Unit Title"
            class="field-input"
            @input="updateData"
          />
        </div>
      </div>

      <div class="field-group" :class="{ disabled: loading }">
        <div class="input-wrap">
          <UpdatedCustomInputSelect
            id="subject"
            :label="`Subject`"
            :static-options="EducationTypes"
            :model-value="subject"
            placeholder="Subject"
            @update:model-value="
              (val) => {
                subject = val as TitleInterface<number>;
                updateData();
              }
            "
          />
        </div>
      </div>

      <div class="field-group" :class="{ disabled: loading }">
        <div class="input-wrap">
          <UpdatedCustomInputSelect
            id="stage"
            :label="`Stage`"
            :static-options="Stages"
            :model-value="stage"
            placeholder="Stage"
            @update:model-value="
              (val) => {
                stage = val as TitleInterface<number>;
                updateData();
              }
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .field-group {
    &.disabled {
      cursor: not-allowed;
      pointer-events: none;
      opacity: 0.7;
    }
  }
</style>

<!-- <style lang="scss" scoped>
  /* ═══════════════════════════════════════════
   EMAIL FORM — Luxury Card Design
   ═══════════════════════════════════════════ */

  .email-form-card {
    background: var(--bg-main);
    border-radius: var(--radius-xl);
    border: 1px solid var(--border-strong);
    box-shadow:
      0 1px 3px var(--black-alpha-4),
      0 8px 32px var(--black-alpha-4);
    overflow: hidden;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--indigo-alpha-15), transparent);
      pointer-events: none;
    }
  }

  /* ── Form Header ────────────────────────── */
  .form-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px 24px 16px;

    .header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--PrimaryColor-light), var(--indigo-light-alpha-40));
      color: var(--PrimaryColor);
      flex-shrink: 0;
      box-shadow:
        0 2px 6px var(--indigo-alpha-12),
        inset 0 1px 0 var(--white-alpha-50);
    }

    .header-text {
      flex: 1;

      h3 {
        font-size: 1.1rem;
        font-weight: 800;
        color: var(--gray-900);
        margin: 0;
        letter-spacing: -0.01em;
      }

      .header-subtitle {
        margin-top: 2px;
        font-size: 0.8rem;
        color: var(--gray-400);
        margin-bottom: 0;
      }
    }

    .edit-badge {
      padding: 4px 12px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--warning-light), var(--warning-light-alpha-50));
      color: var(--warning-dark);
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
      box-shadow: inset 0 1px 0 var(--white-alpha-50);
    }
  }

  /* ── Divider ────────────────────────────── */
  .form-divider {
    height: 1px;
    margin: 0 24px;
    background: linear-gradient(90deg, var(--border-weak), var(--gray-200-alpha-30), transparent);
  }

  /* ── Form Fields ────────────────────────── */
  .form-fields {
    padding: 20px 24px 24px;
    // display: flex;
    // flex-direction: column;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .field-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--gray-700);
    text-transform: uppercase;
    letter-spacing: 0.04em;

    svg {
      color: var(--PrimaryColor);
      flex-shrink: 0;
    }
  }

  .input-wrap {
    position: relative;
  }

  .field-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-weak);
    border-radius: var(--radius-md);
    font-size: 0.9rem;
    color: var(--gray-800);
    background: var(--gray-50);
    outline: none;
    transition: all 0.25s ease;
    font-family: var(--font-family);

    &::placeholder {
      color: var(--gray-400);
    }

    &:focus {
      border-color: var(--PrimaryColor);
      background: var(--bg-main);
      box-shadow:
        0 0 0 3px var(--PrimaryColor-light),
        0 2px 8px var(--indigo-alpha-6);
    }

    &:hover:not(:focus) {
      border-color: var(--gray-300);
      background: var(--bg-main);
    }
  }

  /* ── Deep: Custom Input Select ──────────── */
  :deep(.myacc) {
    border: none;
  }

  :deep(.AccordionPanel) {
    border: 1px solid var(--border-weak) !important;
    border-radius: var(--radius-md) !important;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: var(--gray-50);

    &:hover {
      border-color: var(--PrimaryColor) !important;
    }
  }

  :deep(.AccordionHeader) {
    padding: 12px 16px;
    background: transparent;
    border: none;
    font-weight: 600;
    color: var(--gray-800);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: background 0.2s ease;
    font-size: 0.9rem;

    &:hover {
      background: var(--PrimaryColor-light);
      color: var(--PrimaryColor);
    }
  }

  :deep(.AccordionContent) {
    background: var(--bg-main);
    color: var(--gray-600);
    padding: 12px 16px;
    font-size: 0.875rem;
    line-height: 1.6;
  }

  /* ── Responsive ─────────────────────────── */
  @media (max-width: 600px) {
    .form-header {
      padding: 16px;
      flex-wrap: wrap;
    }

    .form-fields {
      padding: 16px;
      gap: 16px;
    }

    .form-divider {
      margin: 0 16px;
    }

    .edit-badge {
      display: none;
    }
  }
</style> -->
<!-- .p-select{
  padding4PX

} -->
