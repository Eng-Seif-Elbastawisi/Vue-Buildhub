import { computed, shallowRef } from 'vue';
import { env } from '@/base/Core/Config/environment.manager';

export interface GalleryAttachment {
  url: string;
  name: string;
  mimeType?: string;
  type?: string | number;
}

export type GalleryKind = 'image' | 'pdf' | 'video' | 'file';

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif', 'bmp']);
const videoExtensions = new Set(['mp4', 'webm', 'ogg']);

const kindFromType = (type: string | number | undefined): GalleryKind | undefined => {
  if (type === 1 || type === 'image' || (typeof type === 'string' && type.startsWith('image/')))
    return 'image';
  if (type === 'pdf' || type === 'application/pdf') return 'pdf';
  if (type === 'video' || (typeof type === 'string' && type.startsWith('video/'))) return 'video';
  return undefined;
};

export interface AttachmentSource {
  file?: string | null;
  url?: string | null;
  link?: string | null;
  name?: string | null;
  alt?: string | null;
  type?: string | number | null;
  mimeType?: string;
}

const attachments = shallowRef<GalleryAttachment[]>([]);
const activeIndex = shallowRef(0);
const visible = shallowRef(false);

export const attachmentGallery = {
  attachments,
  activeIndex,
  visible,
  current: computed(() => attachments.value[activeIndex.value]),
  open(group: GalleryAttachment[], index: number) {
    if (!group.length || index < 0 || index >= group.length) return;
    attachments.value = group;
    activeIndex.value = index;
    visible.value = true;
  },
  close() {
    visible.value = false;
  },
};

export const attachmentExtension = (name: string, url = ''): string => {
  const path = (name.includes('.') ? name : url).split(/[?#]/)[0] ?? '';
  return path.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() ?? '';
};

export const attachmentKind = (attachment: GalleryAttachment): GalleryKind => {
  const mime =
    attachment.mimeType?.toLowerCase() ||
    attachment.url.match(/^data:([^;,]+)/i)?.[1]?.toLowerCase();
  const backendType =
    typeof attachment.type === 'string' ? attachment.type.toLowerCase() : attachment.type;
  if (mime) return kindFromType(mime) ?? 'file';
  const fromBackend = kindFromType(backendType);
  if (fromBackend) return fromBackend;
  const extension = attachmentExtension(attachment.name, attachment.url);
  if (imageExtensions.has(extension)) return 'image';
  if (extension === 'pdf') return 'pdf';
  if (videoExtensions.has(extension)) return 'video';
  return 'file';
};

export const toGalleryAttachment = (source: AttachmentSource): GalleryAttachment => {
  const url = (source.file || source.url || source.link || '').trim();
  const safeUrl = !url
    ? ''
    : /^(?:https?:|blob:|data:)/i.test(url)
      ? url
      : /^[a-z][a-z\d+.-]*:/i.test(url)
        ? ''
        : new URL(url, new URL(env.apiBaseUrl).origin).href;
  const pathName =
    safeUrl.startsWith('data:') || safeUrl.startsWith('blob:')
      ? ''
      : safeUrl.split(/[?#]/)[0]?.split('/').pop() || '';
  let decodedName = pathName;
  try {
    decodedName = decodeURIComponent(pathName);
  } catch {
    // Keep the original filename when the URL contains malformed escapes.
  }
  return {
    url: safeUrl,
    name: source.name || decodedName || source.alt || 'file',
    mimeType: source.mimeType,
    type: source.type ?? undefined,
  };
};

export const downloadAttachment = async (attachment: GalleryAttachment): Promise<void> => {
  if (!attachment.url) return;

  const link = document.createElement('a');
  link.href = attachment.url;
  link.download = attachment.name || attachment.url.split(/[?#]/)[0]?.split('/').pop() || 'file';
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
  }
};
