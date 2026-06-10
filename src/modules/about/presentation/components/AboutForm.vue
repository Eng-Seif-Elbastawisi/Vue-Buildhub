<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import type AboutModel from '../../core/models/about.model';
  import EditAboutParams from '../../core/params/edit.about.params';
  import MultiLangInput from '@/shared/MultiLangInput.vue';
  import TranslationParams from '../../core/params/translation.params';
  import HandleFilesUpload from '@/shared/FormInputs/HandleFilesUpload.vue';
  import UplaodImageInput from '@/shared/icons/UploadImage/UplaodImageInput.vue';
  import LinksIcon from '@/shared/icons/SocialIcons/LinksIcon.vue';
  import type SocialModel from '../../core/models/social.model';
  import Generalinformaion from '@/shared/icons/generalinformaion.vue';
  import AddAboutParams from '../../core/params/add.about.params';
  import DeleteSocialLinkParams from '../../core/params/delete.social.link.params';
  import AboutController from '../controllers/about.controller';
  import ShowAboutParams from '../../core/params/show.about.params';
  import SocialParams from '../../core/params/Socail.params';

  // ─── Types ───────────────────────────────────────────────────────────────────

  // ─── Emits & Props ────────────────────────────────────────────────────────────

  const emit = defineEmits(['updateData']);

  const { about, loading } = defineProps<{
    about?: AboutModel;
    formKey?: string;
    loading?: boolean;
  }>();

  // ─── Form State ───────────────────────────────────────────────────────────────

  const description = ref<Record<string, string>>({});
  const title = ref<Record<string, string>>({});
  const image = ref<string | null>(null);

  const socialMediaList = ref<SocialModel[]>([{ link: '', icon: '' }]);

  // ─── Watchers ─────────────────────────────────────────────────────────────────

  // ─── Route ────────────────────────────────────────────────────────────────────

  const route = useRoute();

  // ─── Social Media Handlers ────────────────────────────────────────────────────

  const addSocialMediaEntry = () => {
    socialMediaList.value.push({ link: '', icon: '' });
  };

  const controller = AboutController.getInstance();

  const deleteSocialLink = async (id: number) => {
    await controller.deleteSocialLink(new DeleteSocialLinkParams(id));
    // await controller.fetchList();
    await controller.fetchOne(new ShowAboutParams(1));
  };

  // const _removeSocialMediaEntry = (index: number) => {
  //   if (socialMediaList.value.length === 1) {
  //     socialMediaList.value = [{ link: '', icon: '' }];
  //     return;
  //   }
  //   socialMediaList.value.splice(index, 1);
  // };

  const resetSocialMedia = () => {
    socialMediaList.value = [{ link: '', icon: '' }];
  };
  const uploadKey = ref(0);
  const resetGeneralInputs = () => {
    title.value = {};
    description.value = {};
    image.value = null;
    uploadKey.value++;
  };

  // ─── Form Actions ─────────────────────────────────────────────────────────────

  const updateData = () => {
    const socialMedia = socialMediaList.value
      .filter((entry) => (entry.link?.trim() || '') !== '' || (entry.icon?.trim() || '') !== '')
      .map((entry) => new SocialParams({ link: entry.link || '', icon: entry.icon || '' }));

    let params: EditAboutParams | AddAboutParams;
    if (route.params.id) {
      params = new EditAboutParams({
        translations: new TranslationParams({
          title: title.value,
          description: description.value,
        }),
        images: image.value || '',
        socialMedia: socialMedia,
      });
    } else {
      params = new AddAboutParams({
        images: image.value || '',
        translation: new TranslationParams({
          title: title.value,
          description: description.value,
        }),
        socialMedia: socialMedia,
      });
    }

    // console.log(params, "params")
    emit('updateData', params);
  };

  // ─── File Handler ─────────────────────────────────────────────────────────────

  const handleImageChange = (file: Array<{ base64: string }>) => {
    image.value = file[0]?.base64 ?? null;
    updateData();
  }

  watch(
    () => about,
    (newAbout) => {
      if (newAbout) {
        description.value = newAbout.translations.description || {};
        title.value = newAbout.translations.title || {};
        image.value = newAbout.images || null;
        socialMediaList.value = newAbout.socialMedia;

        // Populate social media if provided by the model
        if (newAbout.socialMedia?.length) {
          socialMediaList.value = newAbout.socialMedia.map((item) => ({
            id: item.id,
            link: item.link ?? '',
            icon: item.icon ?? '',
          }));
        }
        // Initialize parent params with loaded data
        updateData();
      }
    },
    { immediate: true },
  );
</script>

<template>
  <div class="about-form-card">
    <div class="about-header">
      <h2 class="title">{{ $t('about us') }}</h2>
      <p class="description">
        {{ $t('Manage and review platform information visible to students') }}
      </p>
    </div>
    <div class="general-information-header">
      <div class="general-information-title">
        <span class="globe-icon">
          <Generalinformaion />
        </span>
        <span>{{ $t('General_Information') }}</span>
      </div>
      <button type="button" class="reset-btn" @click="resetGeneralInputs">{{ $t('reset') }}</button>
    </div>
    <div class="form-fields">
      <!-- Title -->
      <div class="field-group col-span-2" :class="{ disabled: loading }">
        <MultiLangInput
          :field-key="`title`"
          :label="$t(`title`)"
          :languages="['en', 'ar']"
          :model-value="title"
          :type="`title`"
          @update:model-value="
            title = $event;
            updateData();
          "
        />
      </div>

      <!-- Description -->
      <div class="field-group col-span-2" :class="{ disabled: loading }">
        <MultiLangInput
          :field-key="`description`"
          :label="$t(`Description`)"
          :languages="['en', 'ar']"
          :model-value="description"
          :type="`description`"
          @update:model-value="
            description = $event;
            updateData();
          "
        />
      </div>

      <!-- Image Upload -->
      <div class="field-group col-span-2" :class="{ disabled: loading }">
        <HandleFilesUpload
          :key="uploadKey"
          :label="`upload image`"
          accept="image/*"
          :multiple="false"
          :index="1"
          :file="image || undefined"
          :have-content="true"
          :class="`image-input`"
          @change="handleImageChange"
        >
          <template #content>
            <div class="add-imaegs-data">
              <UplaodImageInput />
              <p class="first-text"><span>Click to upload</span> or drag and drop</p>
              <p class="second-text">JPG, JPEG, PNG less than 1MB</p>
            </div>
          </template>
        </HandleFilesUpload>
      </div>

      <!-- ── Social Media Links ─────────────────────────────────────────── -->
      <div class="field-group col-span-2 social-media-section">
        <div class="social-media-header">
          <div class="social-media-title">
            <span class="globe-icon">
              <LinksIcon />
            </span>
            <span>Social Media Links</span>
          </div>
          <button type="button" class="reset-btn" @click="resetSocialMedia">Reset</button>
        </div>

        <!-- Column Labels -->
        <div class="social-media-labels">
          <span>Social Media Link</span>
          <span>Social Media Icon</span>
        </div>

        <!-- {{ socialMedia }} -->
        <div v-for="(entry, index) in socialMediaList" :key="index" class="social-media-row">
          <input
            v-model="entry.link"
            type="url"
            placeholder="Social Media Link"
            class="sm-input"
            @input="updateData"
          />

          <select v-model="entry.icon" class="sm-select" @change="updateData">
            <option value="" disabled>Select Social Media Icon</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
            <option value="twitter">Twitter / X</option>
            <option value="linkedin">LinkedIn</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="snapchat">Snapchat</option>
            <option value="pinterest">Pinterest</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
          </select>
          <button
            v-if="index === socialMediaList.length - 1"
            type="button"
            class="sm-add-btn"
            title="Add another link"
            @click="addSocialMediaEntry"
          >
            <span>+</span>
          </button>
          <button
            v-else
            type="button"
            class="sm-remove-btn"
            title="Remove this link"
            @click="deleteSocialLink(entry?.id!)"
          >
            <span>×</span>
          </button>
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
