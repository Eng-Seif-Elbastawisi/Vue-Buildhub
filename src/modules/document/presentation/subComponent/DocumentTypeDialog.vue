<script lang="ts" setup>
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import IndexAddIcon from '@/shared/icons/IndexAddIcon.vue';
import EditeIcon from '@/shared/icons/DocaumentType/EditeIcon.vue';
import MultiLangInput from '@/shared/MultiLangInput.vue';
import DeletedAccountsIcon from '@/assets/images/DeletedReson.png';
import DeleteDialog from '@/base/Presentation/Dialogs/MainDialogs/DeleteDialog.vue';
import IndexDelete from '@/shared/icons/DocaumentType/IndexDelete.vue';
import DocumentTypeController from '../controllers/DocumentType/document.type.controller';
import EditDocumentTypeParams from '../../core/params/documntType/edit.document.type.params';
import DocumentTranslationTypeParams from '../../core/params/documntType/translation.params';
import AddDocumentTypeParams from '../../core/params/documntType/add.document.type.params';
import IndexDocumentTypeParams from '../../core/params/documntType/index.document.type.params';
import DeleteDocumentTypeParams from '../../core/params/documntType/delete.document.type.params';
import ShowDocumentTypeParams from '../../core/params/documntType/show.document.type.params';

const visible = ref(false);
const documentTypeController = DocumentTypeController.getInstance();
const isEdit = ref(false);
const editId = ref<number | null>(null);

const title = ref<Record<string, string>>({});
const SavenDocumentType = async () => {

  if (isEdit.value) {
    const editparams = new EditDocumentTypeParams({
      document_type_id: editId.value!,
      translations: new DocumentTranslationTypeParams({
        title: title.value!,
      }),
    });

    await documentTypeController.update(editparams);
  } else {
    const addDeletedParams = new AddDocumentTypeParams({
      translations: new DocumentTranslationTypeParams({
        title: title.value!,
      }),
    });
    await documentTypeController.create(addDeletedParams);
  }
  await FetchReasons();
  title.value = {};
  isEdit.value = false;
};

const FetchReasons = async () => {
  const FetchReasonsParams = new IndexDocumentTypeParams();
  await documentTypeController.fetchList(FetchReasonsParams);
};

const OpenDialog = async () => {
  visible.value = true;
  await FetchReasons();
};
const deleteDialogTitle = ref('Are you sure you want to remove this delete account reasons?');
const deleteDialogMessage = ref('if you want this reason agiain , you want to write again');

const deleteReason = async (id: number) => {
  await documentTypeController.delete(
    new DeleteDocumentTypeParams({
      document_id: id,
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
  const showDeleteResonsParams = new ShowDocumentTypeParams({
    document_type_id: Id,
  });
  const res = await documentTypeController.fetchOne(showDeleteResonsParams);
  console.log(res.data, "res")
  title.value = res.data?.translations.title ?? {};
};
</script>

<template>
  <button class="btn btn-primary" @click="OpenDialog">
    <IndexAddIcon />
    <span> Document Type</span>
  </button>
  <Dialog
v-model:visible="visible" :modal="true" :pt="{
    root: 'delete-reason-dialog',
    header: 'dialog-header',
    content: 'dialog-body',
  }" :style="{ width: '35rem' }">
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
      <div v-for="(item, index) in documentTypeController.listState.value.data" :key="index" class="document-type-row">
        <div class="item-title">
          <span class="item-small-title">document type</span>
          <span class="item-main-title">{{ item.title }}</span>
        </div>

        <div class="item-actions">
          <EditeIcon @click="showDetails(item.id!)" />

          <DeleteDialog
:title="deleteDialogTitle" :message="deleteDialogMessage" :hasbtn="true"
            @delete="deleteReason(item.id!)">
            <template #btn>
              <IndexDelete />
            </template>
          </DeleteDialog>
        </div>
      </div>
      <div class="input-wrapper">
        <MultiLangInput
:field-key="`title`" :label="`title`" :languages="['en', 'ar']" :model-value="title"
          :type="'title'" @update:model-value="updatetitle" />
      </div>
      <div class="btns">
        <button class="btn btn-primary" @click="SavenDocumentType">save</button>
        <button class="btn btn-secondary" @click="visible = false">cancel</button>
      </div>
    </div>
  </Dialog>
</template>
