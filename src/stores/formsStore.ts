import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { translate } from '@/locales/i18n';
export const useFormsStore = defineStore(
  'forms',
  () => {
    const formData = ref<Record<string, any>>({});

    const setFormData = (key: string, data: any) => {
      const isAllDataEmpty = ref(true);
      formData.value[key] = data;
      const arr = Object.values(formData.value[key]);
      isAllDataEmpty.value = arr.some((el: any) => el?.length > 0);
      if (isAllDataEmpty.value) {
        clearFormData(key);
      }
    };

    const getFormData = (key: string) => {
      return formData.value[key];
    };

    const clearFormData = (key: string) => {
      formData.value[key] = null;
    };

    const hasUnsavedChanges = (key: string) => {
      const data = formData.value[key];
      return data && (data.email !== '' || data.type !== undefined);
    };

    const showReturnWarning = (targetPath: string) => {
      const toast = useToast();
      const router = useRouter();

      toast.add({
        severity: 'info',
        summary: translate('unsaved_changes'),
        detail: translate('return_to_form'),
      });

      const observer = new MutationObserver(() => {
        const toastDialog = document.querySelector('.p-toast .p-toast-message-text');
        if (toastDialog && !toastDialog.querySelector('.return-btn')) {
          const BtnsContainer = document.createElement('div');
          const SaveDatabutton = document.createElement('button');
          const ClearDatabutton = document.createElement('button');

          BtnsContainer.className = 'return-btn-container';
          BtnsContainer.style.display = 'flex';
          BtnsContainer.style.gap = '10px';
          BtnsContainer.style.justifyContent = 'space-between';

          SaveDatabutton.innerText = translate('return_to_form_button');
          ClearDatabutton.innerText = translate('clear_data');

          SaveDatabutton.className = 'return-btn';
          ClearDatabutton.className = 'return-btn';

          SaveDatabutton.onclick = () => {
            router.push(targetPath);
            toast.removeAllGroups();
          };

          ClearDatabutton.onclick = () => {
            clearFormData(targetPath);
            toast.removeAllGroups();
          };

          BtnsContainer.appendChild(SaveDatabutton);
          BtnsContainer.appendChild(ClearDatabutton);
          toastDialog.appendChild(BtnsContainer);
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    };

    return {
      formData,
      setFormData,
      getFormData,
      clearFormData,
      hasUnsavedChanges,
      showReturnWarning,
    };
  },
  {
    persist: {
      key: 'forms',
      storage: sessionStorage,
    },
  },
);
