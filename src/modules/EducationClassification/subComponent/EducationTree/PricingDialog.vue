<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue';
  import Dialog from 'primevue/dialog';
  import PricingDIalogIcon from '@/shared/icons/PricingDIalogIcon.vue';
  import AddEducationSubjectPricingParams from '../../core/params/EducationPricing/add.education.subject.pricing.params';
  import EditEducationSubjectPricingParams from '../../core/params/EducationPricing/edit.education.subject.pricing.params';
  import DeleteEducationSubjectPricingParams from '../../core/params/EducationPricing/delete.education.subject.pricing.params';
  import IndexEducationSubjectPricingParams from '../../core/params/EducationPricing/index.education.subject.pricing.params';
  import ShowEducationSubjectPricingParams from '../../core/params/EducationPricing/show.education.subject.pricing.params';
  import EducationPricingController from '../../presentation/controllers/EducationPricing/education.pricing.controller';
  import { DurationTypeEnum } from '../../core/constant/duration.type.enum';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import EditeIcon from '@/shared/icons/DocaumentType/EditeIcon.vue';
  import IndexDelete from '@/shared/icons/DocaumentType/IndexDelete.vue';

  const props = defineProps<{
    visible: boolean;
    level: number;
    branchName: string;
    branchId?: number;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', val: boolean): void;
  }>();

  const educationPricingController = EducationPricingController.getInstance();
  const pricingState = computed(() => educationPricingController.listState.value);

  const isEdit = ref(false);
  const editId = ref<number | null>(null);
  const durationValue = ref<number>(0);
  const pricingValue = ref<number>(0);
  const inputRef = ref<HTMLInputElement | null>(null);

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val),
  });

  watch(dialogVisible, async (val) => {
    if (val) {
      resetForm();
      await fetchPricing();
      await nextTick();
      inputRef.value?.focus();
    }
  });

  const isInputEmpty = computed(() => durationValue.value < 0 || pricingValue.value < 0); 

  function resetForm() {
    durationValue.value = 0 ;
    pricingValue.value = 0;
    isEdit.value = false;
    editId.value = null;
  }

  const fetchPricing = async () => {
    if (!props.branchId) return;
    await educationPricingController.fetchList(
      new IndexEducationSubjectPricingParams({ subjectId: props.branchId }),
    );
  };

  const handleSave = async () => {
    if (isEdit.value && editId.value !== null) {
      await educationPricingController.update(
        new EditEducationSubjectPricingParams({
          pricingId: editId.value,
          duration: durationValue.value ,
          durationType: DurationTypeEnum.MONTH,
          price: pricingValue.value,
        }),
      );
    } else if (props.branchId) {
      await educationPricingController.create(
        new AddEducationSubjectPricingParams({
          id: props.branchId,
          duration: durationValue.value,
          durationType: DurationTypeEnum.MONTH,
          price: pricingValue.value,
        }),
      );
    }
    await fetchPricing();
    resetForm();
  };

  const deletePricing = async (id: number) => {
    await educationPricingController.delete(
      new DeleteEducationSubjectPricingParams({ pricingId: id }),
    );
    await fetchPricing();
  };

  const showDetails = async (id: number) => {
    isEdit.value = true;
    editId.value = id;
    const res = await educationPricingController.fetchOne(
      new ShowEducationSubjectPricingParams({ pricingId: id }),
    );
    if (res?.data) {
      durationValue.value = res.data.duration;
      pricingValue.value = res.data.price;
    }
  };
</script>

<template>
  <Dialog
    v-model:visible="dialogVisible"
    modal
    :style="{ width: '35rem' }"
    :pt="{
      root: 'pricing-dialog',
      header: 'dialog-header',
      content: 'dialog-body',
    }"
  >
    <template #header>
      <div class="dialog-icon">
        <PricingDIalogIcon />
      </div>
      <div class="dialog-header-text">
        <h3 class="dialog-title">{{ $t('subject pricing') }}</h3>
        <p class="dialog-subtitle">
          {{ $t('Manage how each subject is priced within your system.') }}
        </p>
      </div>
    </template>

    <div class="dialog-content">
      <div v-for="(item, index) in pricingState.data" :key="index" class="document-type-row">
        <div class="item-title">
          <span class="item-small-title">{{ $t('duration') }}</span>
          <span class="item-main-title">{{ item.duration }} {{ $t('months') }}</span>
        </div>
        <div class="item-title">
          <span class="item-small-title">{{ $t('pricing') }}</span>
          <span class="item-main-title">{{ item.price }}</span>
        </div>
        <div class="item-actions">
          <EditeIcon @click="showDetails(item.id)" />
          <DeleteDialog
            :title="$t('Are you sure you want to remove this pricing?')"
            :message="$t('This action cannot be undone.')"
            :hasbtn="true"
            @delete="deletePricing(item.id)"
          >
            <template #btn>
              <IndexDelete />
            </template>
          </DeleteDialog>
        </div>
      </div>

      <div class="dialog-inputs">
        <div class="field-group">
          <label class="field-label" :for="`duration-input-${level}`">{{ $t('duration') }}</label>
          <input
            :id="`duration-input-${level}`"
            ref="inputRef"
            v-model="durationValue"
            type="number"
            :placeholder="$t('enter_duration')"
            min="0"
            class="field-input"
            @keydown.esc="dialogVisible = false"
            @keydown.enter="!isInputEmpty && handleSave()"
          />
          <span class="error-message-inputs" v-if="durationValue < 0">
            {{ $t('duration must be greater than 0') }}
          </span>
        </div>
        <div class="field-group">
          <label class="field-label" :for="`pricing-input-${level}`">{{ $t('pricing') }}</label>
          <input
            :id="`pricing-input-${level}`"
            v-model="pricingValue"
            type="number"
            :placeholder="$t('enter_pricing')"
            min="0"
            class="field-input"
            @keydown.esc="dialogVisible = false"
            @keydown.enter="!isInputEmpty && handleSave()"
          />
          <span class="error-message-inputs" v-if="pricingValue < 0">
            {{ $t('pricing must be greater than 0') }}
          </span>
        </div>
      </div>

      <div class="dialog-footer">
        <button class="btn btn-primary" :disabled="isInputEmpty" @click="handleSave">
          {{ isEdit ? $t('save') : $t('add') }}
        </button>
        <button v-if="isEdit" class="btn btn-secondary" @click="resetForm">
          {{ $t('cancel') }}
        </button>
        <button class="btn btn-secondary" @click="dialogVisible = false">
          {{ $t('close') }}
        </button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.error-message-inputs{
  color: red;
  font-family: "medium";
}
  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .document-type-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 0.75rem;
    border-radius: 8px;
    background-color: var(--color-light-gray);
  }
  .item-title {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .item-small-title {
    font-size: 0.7rem;
    color: var(--bread-crumb-color-span);
  }
  .item-main-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: black;
  }
  .item-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  .field-input {
    background-color: var(--bg-main);
    border-radius: 30px;
    margin-bottom: 1rem;

    ::placeholder {
      color: var(--bread-crumb-color-span);
    }
  }
  .dialog-inputs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    gap: 5px;
    .field-group {
      &:first-child {
        width: 60%;
      }
      &:last-child {
        width: 40%;
      }
    }
  }
  .dialog-footer {
    display: flex;
    gap: 0.5rem;
  }
</style>
