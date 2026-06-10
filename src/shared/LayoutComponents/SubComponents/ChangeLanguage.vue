<script setup lang="ts">
  import { ref, onMounted, type Component } from 'vue';
  import { useI18n } from 'vue-i18n';
  // import { useUserStore } from '@/stores/user';
  // import { LangsMap } from '@/constant/langs';
  // import IndexLangParams from '@/features/setting/languages/Core/params/indexLangParams';
  // import IndexLangController from '@/features/setting/languages/Presentation/controllers/indexLangController';
  // import IconEgypt from '@/shared/icons/IconEgypt.vue';
  // import IconEnglish from '@/shared/icons/IconEnglish.vue';

  import Popover from 'primevue/popover';

  /* ===============================
   i18n (Global)
================================ */
  const { locale } = useI18n({ useScope: 'global' });
  // const { user } = useUserStore();

  /* ===============================
   State
================================ */
  const lang = ref<string>('en');
  const op = ref();
  const langDefault = ref<
    {
      locale: string;
      title: string;
      icon?: Component;
    }[]
  >([]);

  /* ===============================
   Helpers
================================ */
  const applyLangToDOM = (langCode: string) => {
    document.documentElement.lang = langCode;
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
  };

  /* ===============================
   Change Language (User Action)
================================ */
  const changeLang = (langCode: string) => {
    if (locale.value === langCode) return;

    // update state
    lang.value = langCode;
    locale.value = langCode;

    // save
    localStorage.setItem('lang', langCode);

    // apply to html
    applyLangToDOM(langCode);

    // flag to avoid infinite reload
    sessionStorage.setItem('lang-reload', 'true');

    op.value?.hide();

    // 🔄 reload once
    window.location.reload();
  };

  /* ===============================
   Initialize Language (On Load)
================================ */
  const initializeLang = () => {
    const savedLang = localStorage.getItem('lang') || 'en';

    lang.value = savedLang;
    locale.value = savedLang;

    applyLangToDOM(savedLang);

    // remove reload flag after reload
    if (sessionStorage.getItem('lang-reload')) {
      sessionStorage.removeItem('lang-reload');
    }
  };

  /* ===============================
   Fetch Languages
================================ */
  // const fetchLang = async () => {
  //   // from user store
  //   if (user?.languages?.length) {
  //     langDefault.value = user.languages.map((item: any) => ({
  //       locale: item.code,
  //       title: item.code.toUpperCase(),
  //       icon: markRaw(LangsMap[item.code as keyof typeof LangsMap]?.icon || IconEnglish),
  //     }));
  //     return;
  //   }

  //   // from API
  //   const params = new IndexLangParams('', 1, 10, 0);
  //   const controller = await IndexLangController.getInstance().getData(params);
  //   const response = controller.value;

  //   if (response?.data?.length) {
  //     langDefault.value = response.data.map((item: any) => ({
  //       locale: item.code,
  //       title: item.code.toUpperCase(),
  //       icon: markRaw(LangsMap[item.code as keyof typeof LangsMap]?.icon || IconEnglish),
  //     }));
  //   } else {
  //     // fallback
  //     langDefault.value = [
  //       { locale: 'en', title: 'English', icon: IconEnglish },
  //       { locale: 'ar', title: 'العربية', icon: IconEgypt },
  //     ];
  //   }
  // };

  /* ===============================
   Popover
================================ */
  const toggle = (event: Event) => {
    op.value?.toggle(event);
  };

  /* ===============================
   Lifecycle
================================ */
  onMounted(async () => {
    initializeLang();
    // await fetchLang();
  });
</script>

<template>
  <div class="relative flex items-center justify-center">
    <!-- Trigger -->
    <button
      class="w-[70%] h-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
      @click="toggle"
    >
      <component :is="langDefault.find((l) => l.locale === lang)?.icon" class="w-5 h-5" />
    </button>

    <!-- Popover -->
    <Popover ref="op" class="w-32">
      <ul class="list-none p-3 m-0 flex flex-col gap-1">
        <li
          v-for="l in langDefault"
          :key="l.locale"
          class="flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-gray-100"
          @click="changeLang(l.locale)"
        >
          <component :is="l.icon" class="w-5 h-5" />
          <span>{{ l.title }}</span>
        </li>
      </ul>
    </Popover>
  </div>
</template>
