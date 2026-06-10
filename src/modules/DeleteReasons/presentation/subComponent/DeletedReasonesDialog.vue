<script lang="ts" setup>
  import { computed, ref } from 'vue';
  import Dialog from 'primevue/dialog';
  import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
  import EditeIcon from '@/shared/icons/DocaumentType/EditeIcon.vue';
  import AddDeleteResonsParams from '../../core/params/add.delete.reasons.params';
  import TranslationParams from '@/modules/about/core/params/translation.params';
  import DeletedReasonsController from '../controllers/deleted.reasons.controller';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import DeletedAccountsIcon from '@/assets/images/DeletedReson.png';
  import IndexDeleteResonsParams from '../../core/params/idnex.delete.reasons.params';
  import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
  import DeleteDeleteResonsParams from '../../core/params/delete.delete.reasons.params';
  import IndexDelete from '@/shared/icons/DocaumentType/IndexDelete.vue';
  import ShowDeleteResonsParams from '../../core/params/show.delete.reasons.params';
  import EditDeleteResonsParams from '../../core/params/edit.delete.reasons.params';

  const visible = ref(false);
  const deletedReasonsController = DeletedReasonsController.getInstance();
  const deletedReasonesstae = computed(() => deletedReasonsController.listState.value);
  const isEdit = ref(false);
  const editId = ref<number | null>(null);

  const title = ref<Record<string, string>>({});
  const loading = ref(false);
  const SavenDocumentType = async () => {
    const deletedReasonsController = DeletedReasonsController.getInstance();

    loading.value = true;
    try {
      if (isEdit.value) {
        const editparams = new EditDeleteResonsParams({
          id: editId.value!,
          translations: new TranslationParams({
            title: title.value!,
          }),
        });

        await deletedReasonsController.update(editparams);
      } else {
        const addDeletedParams = new AddDeleteResonsParams({
          translations: new TranslationParams({
            title: title.value!,
          }),
        });
        await deletedReasonsController.create(addDeletedParams);
      }
      await FetchReasons();
      title.value = {};
      isEdit.value = false;
    } finally {
      loading.value = false;
    }
  };

  const FetchReasons = async () => {
    const FetchReasonsParams = new IndexDeleteResonsParams();
    await deletedReasonsController.fetchList(FetchReasonsParams);
  };

  const OpenDialog = async () => {
    visible.value = true;
    await FetchReasons();
  };
  const deleteDialogTitle = ref('Are you sure you want to remove this delete account reasons?');
  const deleteDialogMessage = ref('if you want this reason agiain , you want to write again');

  const deleteReason = async (id: number) => {
    await deletedReasonsController.delete(
      new DeleteDeleteResonsParams({
        id: id,
      }),
    );
    await FetchReasons();
  };
  const updatetitle = (data: Record<string, string>) => {
    title.value = data;
  };

  const showDetails = async (Id: number) => {
    isEdit.value = true;
    editId.value = Id;
    const showDeleteResonsParams = new ShowDeleteResonsParams({
      delete_account_reason_id: Id,
    });
    const res = await deletedReasonsController.fetchOne(showDeleteResonsParams);
    title.value = res.data?.titles ?? {};
  };
</script>

<template>
  <button class="btn btn-primary" @click="OpenDialog">
    <IndexAddIcon />
    <span> Deleted Reason</span>
  </button>
  <Dialog
    v-model:visible="visible"
    :modal="true" 
    :pt="{
      root: 'delete-reason-dialog',
      header: 'dialog-header',
      content: 'dialog-body',
    }"
    :style="{ width: '35rem' }"
  >
    <template #header>
      <div class="header-container">
        <!-- <DeletedAccountsIcon /> -->
        <img :src="DeletedAccountsIcon" alt="DeletedAccountsIcon" width="50" />
        <div class="header-text">
          <h4>Add New reason for delete</h4>
          <p>Define why this item is being removed from the system.</p>
        </div>
      </div>
    </template>
    <div class="document-type-content">
      <div v-for="(item, index) in deletedReasonesstae.data" :key="index" class="document-type-row">
        <div class="item-title">
          <span class="item-small-title">reason</span>
          <span class="item-main-title">{{ item.Reason }}</span>
        </div>

        <div class="item-actions">
          <EditeIcon @click="showDetails(item.id!)" />

          <DeleteDialog
            :title="deleteDialogTitle"
            :message="deleteDialogMessage"
            :hasbtn="true"
            @delete="deleteReason(item.id!)"
          >
            <template #btn>
              <IndexDelete />
            </template>
          </DeleteDialog>
        </div>
      </div>
      <div class="input-wrapper">
        <MultiLangInput
          :field-key="`title`"
          :label="`delete account reasons`"
          :languages="['en', 'ar']"
          :model-value="title"
          :type="'title'"
          @update:model-value="updatetitle"
        />
      </div>
      <div class="btns">
        <button class="btn btn-primary" @click="SavenDocumentType">
          <span v-if="loading" class="loader"></span>
          <span v-else>save</span>
        </button>
        <button class="btn btn-secondary" @click="visible = false">cancel</button>
      </div>
    </div>
  </Dialog>
</template>
