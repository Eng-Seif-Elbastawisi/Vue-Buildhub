import { computed, onMounted, ref } from 'vue';
import { jsPDF } from 'jspdf';
import autoTable, { type CellHookData, type RowInput } from 'jspdf-autotable';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import pdfArabicBoldFontUrl from '@/assets/fonts/Noto/NotoNaskhArabic-Bold.ttf?url';
import pdfArabicRegularFontUrl from '@/assets/fonts/Noto/NotoNaskhArabic-Regular.ttf?url';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import fallbackCompanyLogo from '@/assets/images/BuildHubLogo.jpg';
import fallbackProjectImage from '@/assets/images/ChatGPT Image Jul 1, 2026, 11_19_16 AM.png';
import { loadFirstPdfImage } from '@/shared/Pdf/loadPdfImage';
import { addPdfPageBranding, type PdfPageBranding } from '@/shared/Pdf/pdfPageBranding';
import { useUserStore } from '@/stores/user';
import { getSystemIdentityCompany } from '@/modules/shared/SystemIdentity/presentation/utils/systemIdentityCompany';
import { ProjectItemPriceEnum } from '@/modules/MainOrganization/ProjectItem/core/constant/project.item.Price.enum';
import { ProjectPricingDiscountEnum } from '@/modules/MainOrganization/ProjectPricing/core/constant/project.pricing.discount.enum';
import { FloorNumber } from '@/modules/MainOrganization/ProjectFloor/core/constants/floor.number.enum';
import ShowProjectParams from '../../core/params/show.project.params';
import ChangeProjectStatusParams from '../../core/params/change.project.status.params';
import type ProjectShowModel from '../../core/models/project.show.model';
import { ServiceType } from '../../core/constants/serviceType.enum';
import { ConvertStatus } from '../../core/constants/convert.status.enum';
import ProjectController from '../controllers/project.controller';
import type {
  Attachment,
  FloorSpace,
  LocaleEntry,
  NamedEntity,
  ProjectDepartmentItemRow,
  ProjectFloor,
  ProjectInfoItem,
  ProjectShowRaw,
  TabItem,
} from '../components/project_show/projectShow.types';

type PdfTableDocument = jsPDF & {
  lastAutoTable?: {
    finalY?: number;
  };
};

type PdfFontStyle = 'normal' | 'bold';

const pdfArabicFontFamily = 'NotoNaskhArabic';
let pdfArabicFontFiles: {
  regular: string;
  bold: string;
} | null = null;

export const useProjectShow = () => {
  const route = useRoute();
  const { locale, t } = useI18n();
  const { user } = useUserStore();
  const projectController = ProjectController.getInstance();
  const activeTab = ref('project-data');
  const exportingPdf = ref(false);
  const loading = ref(false);
  const localConvertStatus = ref<ConvertStatus | null>(null);

  const emptyValue = '—';
  const company = computed(() => getSystemIdentityCompany(user, t('buildhub')));
  const companyContactLines = computed(() => [
    `${t('email')}: ${company.value.email || emptyValue} | ${t('phone')}: ${
      company.value.phone || emptyValue
    }`,
    `${t('address')}: ${company.value.address || emptyValue}`,
  ]);

  const projectId = computed(() => {
    const value = Number(route.params.project_id);

    return Number.isNaN(value) ? 0 : value;
  });

  const projectModel = computed(() => projectController.itemData.value as ProjectShowModel | null);
  const project = computed<ProjectShowRaw>(() => {
    return (projectModel.value?.raw ?? projectModel.value ?? {}) as ProjectShowRaw;
  });

  const valueOrEmpty = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return emptyValue;

    return String(value);
  };

  const getLocalizedValue = (
    value?: string | LocaleEntry[] | null,
    key: 'title' | 'description' = 'title',
  ) => {
    if (typeof value === 'string') return value || emptyValue;
    if (!Array.isArray(value)) return emptyValue;

    const current = value.find((item) => item.locale === locale.value)?.[key];
    const english = value.find((item) => item.locale === 'en')?.[key];
    const arabic = value.find((item) => item.locale === 'ar')?.[key];
    const first = value.find((item) => item[key])?.[key];

    return current || english || arabic || first || emptyValue;
  };

  const getEntityName = (entity?: NamedEntity | null) => {
    if (!entity) return emptyValue;

    return entity.name || getLocalizedValue(entity.title) || entity.id?.toString() || emptyValue;
  };

  const getStatusMeta = (status?: number | null) => {
    const active = Number(status) === 1;

    return {
      label: active ? t('ProjectShow.active') : t('ProjectShow.inactive'),
      className: active ? 'is-active' : 'is-muted',
    };
  };

  const currentConvertStatus = computed<ConvertStatus>(() => {
    if (localConvertStatus.value !== null) {
      return localConvertStatus.value;
    }

    const value =
      projectModel.value?.convert_status ??
      project.value.convert_status ??
      project.value.status ??
      ConvertStatus.WAITING_PREVIEW;

    return Number(value) as ConvertStatus;
  });

  const getConvertStatusMeta = (status: ConvertStatus) => {
    switch (status) {
      case ConvertStatus.READY_TO_SENT:
        return {
          label: t('project.convertStatus.readyToSent'),
          className: 'is-converted',
        };

      case ConvertStatus.CONVERT_TO_PROJECT:
        return {
          label: t('project.convertStatus.convertToProject'),
          className: 'is-converted',
        };

      case ConvertStatus.SEND_TO_CLIENT:
        return {
          label: t('project.convertStatus.sendToClient'),
          className: 'is-send-client',
        };

      case ConvertStatus.REVISE_VERSION:
        return {
          label: t('project.convertStatus.reviseVersion'),
          className: 'is-revised',
        };

      case ConvertStatus.ACCEPT_CLIENT:
        return {
          label: t('project.convertStatus.acceptClient'),
          className: 'is-converted',
        };

      case ConvertStatus.REJECT_CLIENT:
        return {
          label: t('project.convertStatus.rejectClient'),
          className: 'is-muted',
        };

      case ConvertStatus.WAITING_PRICING:
        return {
          label: t('project.convertStatus.waitingPricing'),
          className: 'is-muted',
        };
      case ConvertStatus.WAITING_PREVIEW:
        return {
          label: t('project.convertStatus.waitingPreview'),
          className: 'is-muted',
        };

      case ConvertStatus.WAITING_PREVIEW_RESULT:
        return {
          label: t('project.convertStatus.waitingPreviewResult'),
          className: 'is-muted',
        };

      default:
        return {
          label: t('project.convertStatus.pending'),
          className: 'is-pending',
        };
    }
  };

  const convertActionLabel = computed(() => {
    switch (currentConvertStatus.value) {
      case ConvertStatus.WAITING_PREVIEW:
        return t('project.convertActions.convertMeasurementToProject');

      case ConvertStatus.CONVERT_TO_PROJECT:
        return t('project.convertActions.storeVersion');

      default:
        return '';
    }
  });

  const isConvertActionDisabled = computed(() => loading.value);

  const statusActions = computed(() => {
    switch (currentConvertStatus.value) {
      case ConvertStatus.READY_TO_SENT:
      case ConvertStatus.REVISE_VERSION:
        return [
          {
            status: ConvertStatus.SEND_TO_CLIENT,
            label: getConvertStatusMeta(ConvertStatus.SEND_TO_CLIENT).label,
            tone: 'info' as const,
          },
        ];

      case ConvertStatus.SEND_TO_CLIENT:
        return [
          {
            status: ConvertStatus.ACCEPT_CLIENT,
            label: getConvertStatusMeta(ConvertStatus.ACCEPT_CLIENT).label,
            tone: 'success' as const,
          },
          {
            status: ConvertStatus.REJECT_CLIENT,
            label: getConvertStatusMeta(ConvertStatus.REJECT_CLIENT).label,
            tone: 'danger' as const,
          },
        ];

      case ConvertStatus.REJECT_CLIENT:
        return [
          {
            status: ConvertStatus.REVISE_VERSION,
            label: getConvertStatusMeta(ConvertStatus.REVISE_VERSION).label,
            tone: 'warning' as const,
          },
        ];

      default:
        return [];
    }
  });

  const getServiceTypeLabel = (type?: number | null) => {
    if (type === ServiceType.DESIGNONLY) return t('Project.service_types.designOnly');
    if (type === ServiceType.EXECUTIONONLY) return t('Project.service_types.executionOnly');
    if (type === ServiceType.BOTH) return t('Project.service_types.both');

    return valueOrEmpty(type);
  };

  const formatDate = (value?: string | null) => {
    if (!value) return emptyValue;

    const [datePart] = value.split(' ');
    const date = new Date(`${datePart}T00:00:00`);

    if (Number.isNaN(date.getTime())) return valueOrEmpty(datePart);

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (value?: string | null) => {
    if (!value) return emptyValue;

    const timePart = (value.includes(' ') ? value.split(' ')[1] : value) ?? '';
    if (!timePart) return emptyValue;

    const [hours = '0', minutes = '0'] = timePart.split(':');
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatNumber = (value?: number | string | null, fractionDigits = 2) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) return emptyValue;

    return numericValue.toLocaleString('en-US', {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
  };

  const formatArea = (value?: number | string | null) => {
    const formattedValue = formatNumber(value);

    return formattedValue === emptyValue ? emptyValue : `${formattedValue} m²`;
  };

  const getLocationBreadcrumb = (location?: NamedEntity | null) => {
    const parts: string[] = [];
    let current = location;

    while (current) {
      parts.unshift(getEntityName(current));
      current = current.parent ?? null;
    }

    return parts.filter((part) => part && part !== emptyValue).join(' > ') || emptyValue;
  };

  const getProjectPreviews = () => {
    const projectPreviews = project.value.project_previews ?? [];
    if (projectPreviews.length) return projectPreviews;

    return (project.value.project_floors ?? [])
      .map((floor) => floor.project_preview)
      .filter((projectPreview): projectPreview is NonNullable<typeof projectPreview> =>
        Boolean(projectPreview),
      );
  };

  const previews = computed(() => getProjectPreviews());
  const preview = computed(() => previews.value[0] ?? null);
  const projectFloors = computed(() => project.value.project_floors ?? []);
  const projectItems = computed(() => project.value.project_department_items ?? []);
  const projectDepartments = computed(() => project.value.project_departments ?? []);
  const projectPricing = computed(() => project.value.project_pricing ?? null);
  const projectTerms = computed(() =>
    valueOrEmpty(projectModel.value?.terms ?? project.value.terms),
  );
  const projectDepartmentItems = computed<ProjectDepartmentItemRow[]>(() => {
    return projectDepartments.value.flatMap((department) => department.items ?? []);
  });
  const attachments = computed(() => project.value.attachments ?? []);

  const flattenFloorSpaces = (floors: ProjectFloor[]) => {
    const rows = floors.flatMap((floor) =>
      (floor.spaces ?? []).map((space) => ({
        ...space,
        parentFloorNumber: floor.floor_number ?? null,
      })),
    );

    if (rows.length) return rows;

    return (project.value.project_floor_spaces ?? []).map((space) => ({
      ...space,
      parentFloorNumber: null,
    }));
  };

  const floorSpaces = computed(() => flattenFloorSpaces(projectFloors.value));

  const calculateArea = (space: FloorSpace) => {
    const length = Number(space.length);
    const width = Number(space.width);

    if (!Number.isFinite(length) || !Number.isFinite(width)) return 0;

    return length * width;
  };

  const calculateFloorArea = (floor: ProjectFloor) => {
    return (floor.spaces ?? []).reduce((total, space) => total + calculateArea(space), 0);
  };

  const getFloorHeight = (floor: ProjectFloor) => {
    const heights = (floor.spaces ?? [])
      .map((space) => Number(space.height))
      .filter((height) => Number.isFinite(height));

    return heights.length ? Math.max(...heights) : 0;
  };

  const totalArea = computed(() => {
    return floorSpaces.value.reduce((total, space) => total + calculateArea(space), 0);
  });

  const averageHeight = computed(() => {
    const floorHeights = projectFloors.value.map(getFloorHeight);

    if (!floorHeights.length) return 0;

    return floorHeights.reduce((total, height) => total + height, 0) / floorHeights.length;
  });

  const firstImage = computed(() => {
    return attachments.value.find((attachment) => {
      const file = attachment.file ?? '';

      return /\.(png|jpe?g|webp|gif)$/i.test(file);
    })?.file;
  });

  const projectTitle = computed(() => {
    const title = getLocalizedValue(project.value.title);

    return title !== emptyValue ? title : `Project #${valueOrEmpty(project.value.id)}`;
  });

  const projectInfo = computed(() => [
    {
      icon: 'pi pi-user',
      label: t('ProjectShow.client'),
      value: getEntityName(project.value.client),
      meta: valueOrEmpty(project.value.client?.phone),
    },
    {
      icon: 'pi pi-building',
      label: t('ProjectShow.organization'),
      value: getEntityName(project.value.organization),
      meta: valueOrEmpty(project.value.organization?.address),
    },
    {
      icon: 'pi pi-map-marker',
      label: t('location'),
      value: getLocationBreadcrumb(project.value.location),
    },
    {
      icon: 'pi pi-sliders-h',
      label: t('project_type_id'),
      value: getEntityName(project.value.project_type),
    },
    {
      icon: 'pi pi-user-edit',
      label: t('ProjectShow.project_manager'),
      value: getEntityName(project.value.employee),
    },
    {
      icon: 'pi pi-calendar',
      label: t('ProjectShow.project_date'),
      value: formatDate(project.value.date),
    },
    {
      icon: 'pi pi-share-alt',
      label: t('Project.service_type'),
      value: getServiceTypeLabel(project.value.service_type),
    },
    {
      icon: 'pi pi-users',
      label: t('Project.engineer'),
      value: getEntityName(preview.value?.engineer),
    },
    {
      icon: 'pi pi-sitemap',
      label: t('Project.site_description'),
      value: valueOrEmpty(project.value.site_description),
    },
    {
      icon: 'pi pi-user',
      label: t('ProjectShow.pricing_responsible'),
      value: getEntityName(preview.value?.pricing_responsible),
    },
    {
      icon: 'pi pi-info-circle',
      label: t('Project.notes'),
      value: valueOrEmpty(project.value.notes),
    },
    //     {
    //   icon: 'pi pi-shield',
    //   label: t('status'),
    //   value: getStatusMeta(project.value.status).label,
    //   badge: getStatusMeta(project.value.status).className,
    // },
  ]);

  const stats = computed(() => [
    {
      icon: 'pi pi-building',
      value: projectFloors.value.length.toString(),
      label: t('ProjectShow.floors'),
    },
    {
      icon: 'pi pi-th-large',
      value: floorSpaces.value.length.toString(),
      label: t('Project.spaces'),
    },
    {
      icon: 'pi pi-box',
      value: (projectDepartmentItems.value.length || projectItems.value.length).toString(),
      label: t('ProjectShow.items'),
    },
    {
      icon: 'pi pi-chart-line',
      value: formatArea(totalArea.value),
      label: t('ProjectShow.total_area'),
    },
  ]);

  const getPricingMethodLabel = (method?: number | null) => {
    const methodEntry = Object.entries(ProjectItemPriceEnum).find(
      ([, value]) => Number(value) === Number(method),
    );

    if (!methodEntry) return valueOrEmpty(method);

    return t(`project_item.pricing_methods.${methodEntry[0]}`);
  };

  const getDiscountTypeLabel = (type?: number | null) => {
    const discountEntry = Object.entries(ProjectPricingDiscountEnum).find(
      ([, value]) => Number(value) === Number(type),
    );

    if (!discountEntry) return valueOrEmpty(type);

    return t(`project_pricing.discount_types.${discountEntry[0]}`);
  };

  const pricingInfo = computed<ProjectInfoItem[]>(() => [
    {
      icon: 'pi pi-percentage',
      label: t('project_pricing.total_tax'),
      value: formatNumber(projectPricing.value?.total_tax),
    },
    {
      icon: 'pi pi-tag',
      label: t('project_pricing.discount_type'),
      value: getDiscountTypeLabel(projectPricing.value?.discount_type),
    },
    {
      icon: 'pi pi-minus-circle',
      label: t('project_pricing.discount_value'),
      value: formatNumber(projectPricing.value?.discount_value),
    },
    {
      icon: 'pi pi-calculator',
      label: t('project_pricing.final_total'),
      value: formatNumber(projectPricing.value?.price_after_discount),
    },
    {
      icon: 'pi pi-calendar',
      label: t('ProjectShow.created_at'),
      value: formatDate(projectPricing.value?.created_at),
    },
  ]);

  const sectionActiveClass = (sectionId: string) => ({
    'project-card--active-section': activeTab.value === sectionId,
  });

  const getFloorType = (floorNumber?: number | null) => {
    if (floorNumber === null || floorNumber === undefined) return emptyValue;
    if (floorNumber < 0) return t('ProjectShow.basement');
    if (floorNumber === 0) return t('ProjectShow.ground_floor');

    return t('ProjectShow.typical_floor');
  };

  const getFloorNumberLabel = (floorNumber?: number | null) => {
    if (floorNumber === null || floorNumber === undefined) return emptyValue;

    const floorEntry = Object.entries(FloorNumber).find(
      ([, value]) => Number(value) === Number(floorNumber),
    );

    if (!floorEntry) return valueOrEmpty(floorNumber);

    return t(`ProjectFloor.floor_numbers.${floorEntry[0]}`);
  };

  const isImageAttachment = (attachment?: Attachment | null) => {
    return /\.(png|jpe?g|webp|gif|svg)$/i.test(attachment?.file ?? '');
  };

  const goToSection = (tabId: string) => {
    activeTab.value = tabId;
    document.getElementById(tabId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const tabs = computed<TabItem[]>(() => [
    { id: 'project-data', label: t('Project.steps.project_data'), icon: 'pi pi-calendar' },
    { id: 'project-preview', label: t('Project.steps.project_preview'), icon: 'pi pi-id-card' },
    { id: 'project-floors', label: t('Project.steps.project_floors'), icon: 'pi pi-sitemap' },
    { id: 'project-items', label: t('project_department'), icon: 'pi pi-sliders-h' },
    { id: 'project-pricing', label: t('project_pricing.index.title'), icon: 'pi pi-wallet' },
    { id: 'project-terms', label: t('terms'), icon: 'pi pi-file-edit' },
  ]);

  const getPdfFileName = () => {
    const name = projectTitle.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '');

    return `${name || 'project-details'}.pdf`;
  };

  const pdfColors = {
    primary: [19, 91, 211] as [number, number, number],
    dark: [15, 23, 42] as [number, number, number],
    muted: [100, 116, 139] as [number, number, number],
    border: [226, 232, 240] as [number, number, number],
    soft: [248, 250, 252] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
  };

  const pdfMargin = 16;

  const isPdfRtl = () => locale.value.startsWith('ar');

  const pdfAlign = () => (isPdfRtl() ? 'right' : 'left');

  const pdfFontFamily = () => (isPdfRtl() ? pdfArabicFontFamily : 'helvetica');

  const setPdfFont = (pdf: jsPDF, style: PdfFontStyle = 'normal') => {
    pdf.setFont(pdfFontFamily(), style);
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = '';

    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }

    return window.btoa(binary);
  };

  const fetchPdfFont = async (fontUrl: string) => {
    const response = await fetch(fontUrl);

    return arrayBufferToBase64(await response.arrayBuffer());
  };

  const loadPdfArabicFonts = async () => {
    if (pdfArabicFontFiles) return pdfArabicFontFiles;

    const [regular, bold] = await Promise.all([
      fetchPdfFont(pdfArabicRegularFontUrl),
      fetchPdfFont(pdfArabicBoldFontUrl),
    ]);

    pdfArabicFontFiles = { regular, bold };

    return pdfArabicFontFiles;
  };

  const setupPdfDocument = async (pdf: jsPDF) => {
    if (!isPdfRtl()) {
      pdf.setR2L(false);
      return;
    }

    const fonts = await loadPdfArabicFonts();

    pdf.addFileToVFS('NotoNaskhArabic-Regular.ttf', fonts.regular);
    pdf.addFont('NotoNaskhArabic-Regular.ttf', pdfArabicFontFamily, 'normal');
    pdf.addFileToVFS('NotoNaskhArabic-Bold.ttf', fonts.bold);
    pdf.addFont('NotoNaskhArabic-Bold.ttf', pdfArabicFontFamily, 'bold');
    pdf.setR2L(false);
  };

  const formatPdfText = (pdf: jsPDF, text: string | number | null | undefined) => {
    const pdfText = valueOrEmpty(text);

    return isPdfRtl() && /[\u0600-\u06FF]/.test(pdfText) ? pdf.processArabic(pdfText) : pdfText;
  };

  const formatPdfTableCell = (pdf: jsPDF, cellData: CellHookData) => {
    if (!isPdfRtl()) return;

    cellData.cell.text = cellData.cell.text.map((line) => formatPdfText(pdf, line));
  };

  const pdfTextX = (pdf: jsPDF) => {
    const pageWidth = pdf.internal.pageSize.getWidth();

    return isPdfRtl() ? pageWidth - pdfMargin : pdfMargin;
  };

  const getLastTableY = (pdf: jsPDF, fallback: number) => {
    return (pdf as PdfTableDocument).lastAutoTable?.finalY ?? fallback;
  };

  const writePdfText = (
    pdf: jsPDF,
    text: string,
    x: number,
    y: number,
    options: { align?: 'left' | 'center' | 'right'; maxWidth?: number } = {},
  ) => {
    pdf.text(formatPdfText(pdf, text), x, y, options);
  };

  const getPdfSectionStartY = (pdf: jsPDF, requestedY: number, requiredHeight: number) => {
    const pageBottom = pdf.internal.pageSize.getHeight() - 30;

    if (requestedY + requiredHeight <= pageBottom) return requestedY;

    pdf.addPage();

    return 32;
  };

  const startPdfSection = (
    pdf: jsPDF,
    title: string,
    requestedY: number,
    contentHeight: number,
  ) => {
    const titleY = getPdfSectionStartY(pdf, requestedY, contentHeight + 11);
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setTextColor(...pdfColors.dark);
    setPdfFont(pdf, 'bold');
    pdf.setFontSize(13);
    writePdfText(pdf, title, pdfTextX(pdf), titleY, {
      align: pdfAlign(),
      maxWidth: pageWidth - pdfMargin * 2,
    });

    pdf.setDrawColor(...pdfColors.border);
    pdf.line(pdfMargin, titleY + 5, pageWidth - pdfMargin, titleY + 5);

    return titleY + 11;
  };

  const drawPdfSummaryCards = (pdf: jsPDF, startY: number) => {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const gap = 4;
    const cardWidth = (pageWidth - pdfMargin * 2 - gap * 3) / 4;

    stats.value.forEach((stat, index) => {
      const x = pdfMargin + index * (cardWidth + gap);

      pdf.setFillColor(...pdfColors.soft);
      pdf.setDrawColor(...pdfColors.border);
      pdf.roundedRect(x, startY, cardWidth, 24, 2.5, 2.5, 'FD');
      pdf.setTextColor(...pdfColors.dark);
      setPdfFont(pdf, 'bold');
      pdf.setFontSize(10);
      writePdfText(pdf, stat.value, x + 4, startY + 9, { maxWidth: cardWidth - 8 });
      pdf.setTextColor(...pdfColors.muted);
      setPdfFont(pdf);
      pdf.setFontSize(7.5);
      writePdfText(pdf, stat.label, x + 4, startY + 17, { maxWidth: cardWidth - 8 });
    });

    return startY + 34;
  };

  const drawPdfTable = (
    pdf: jsPDF,
    head: string[],
    body: RowInput[],
    startY: number,
    compact = false,
  ) => {
    autoTable(pdf, {
      startY,
      head: [head],
      body,
      theme: 'grid',
      margin: { left: pdfMargin, right: pdfMargin, bottom: 30 },
      styles: {
        font: pdfFontFamily(),
        fontSize: compact ? 7.5 : 8.5,
        cellPadding: compact ? 2.2 : 3,
        overflow: 'linebreak',
        halign: pdfAlign(),
        valign: 'top',
        lineColor: pdfColors.border,
        lineWidth: 0.1,
        textColor: pdfColors.dark,
      },
      headStyles: {
        fillColor: pdfColors.primary,
        textColor: pdfColors.white,
        fontStyle: 'bold',
        halign: pdfAlign(),
      },
      alternateRowStyles: {
        fillColor: pdfColors.soft,
      },
      didParseCell: (cellData) => formatPdfTableCell(pdf, cellData),
      rowPageBreak: 'auto',
      showHead: 'everyPage',
    });

    return getLastTableY(pdf, startY);
  };

  const drawPdfKeyValueTable = (pdf: jsPDF, rows: [string, string][], startY: number) => {
    const body = rows.map(([label, value]) => {
      return isPdfRtl() ? [value, label] : [label, value];
    });

    autoTable(pdf, {
      startY,
      body,
      theme: 'grid',
      margin: { left: pdfMargin, right: pdfMargin, bottom: 30 },
      styles: {
        font: pdfFontFamily(),
        fontSize: 8.8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: pdfAlign(),
        valign: 'top',
        lineColor: pdfColors.border,
        lineWidth: 0.1,
        textColor: pdfColors.dark,
      },
      columnStyles: isPdfRtl()
        ? {
            1: { fontStyle: 'bold', fillColor: pdfColors.soft, cellWidth: 55 },
          }
        : {
            0: { fontStyle: 'bold', fillColor: pdfColors.soft, cellWidth: 55 },
          },
      didParseCell: (cellData) => formatPdfTableCell(pdf, cellData),
    });

    return getLastTableY(pdf, startY);
  };

  const drawPdfEmpty = (pdf: jsPDF, message: string, startY: number) => {
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setDrawColor(...pdfColors.border);
    pdf.setFillColor(...pdfColors.soft);
    pdf.roundedRect(pdfMargin, startY, pageWidth - pdfMargin * 2, 32, 2.5, 2.5, 'FD');
    pdf.setTextColor(...pdfColors.muted);
    setPdfFont(pdf, 'bold');
    pdf.setFontSize(10);
    writePdfText(pdf, message, pageWidth / 2, startY + 18, { align: 'center' });

    return startY + 42;
  };

  const getPdfProjectRows = (): [string, string][] => {
    const projectRows = projectInfo.value.map((info) => {
      const parts = [info.value, info.meta].filter((part) => part && part !== emptyValue);

      return [info.label, parts.join('\n') || emptyValue];
    });

    return [[t('ProjectShow.project_code'), valueOrEmpty(project.value.id)], ...projectRows];
  };

  const getPdfPreviewRows = (): [string, string][] => [
    [t('Project.preview_date'), formatDate(preview.value?.preview_date)],
    [t('Project.preview_time'), formatTime(preview.value?.preview_time)],
    [t('Project.engineer'), valueOrEmpty(preview.value?.pricing_responsible?.name || '')],
  ];

  const createPdfBranding = (pdf: jsPDF, companyLogo: PdfPageBranding['company']['logo']) => {
    return {
      title: projectTitle.value,
      company: {
        name: company.value.name,
        logo: companyLogo,
        contactLines: companyContactLines.value,
      },
      fontFamily: pdfFontFamily(),
      formatText: (text: string) => formatPdfText(pdf, text),
    } satisfies PdfPageBranding;
  };

  const downloadProjectPdf = async () => {
    if (exportingPdf.value) return;

    exportingPdf.value = true;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const [, companyLogo] = await Promise.all([
        setupPdfDocument(pdf),
        loadFirstPdfImage([company.value.logo, fallbackCompanyLogo]),
      ]);

      let y = startPdfSection(pdf, t('ProjectShow.project_information'), 32, 34);
      y = drawPdfSummaryCards(pdf, y);
      y = drawPdfKeyValueTable(pdf, getPdfProjectRows(), y);

      y = startPdfSection(pdf, t('Project.steps.project_preview'), y + 7, 20);
      if (preview.value) {
        y = drawPdfKeyValueTable(pdf, getPdfPreviewRows(), y);
      } else {
        y = drawPdfEmpty(pdf, t('ProjectShow.no_preview'), y);
      }

      y = startPdfSection(pdf, t('ProjectShow.project_floors_summary'), y + 7, 34);
      y = drawPdfSummaryCards(pdf, y);
      if (projectFloors.value.length) {
        y = drawPdfTable(
          pdf,
          [
            t('ProjectShow.floor'),
            t('ProjectShow.type'),
            t('Project.spaces'),
            t('ProjectShow.total_area_m'),
            t('ProjectShow.total_height_m'),
            t('status'),
          ],
          projectFloors.value.map((floor) => [
            getFloorNumberLabel(floor.floor_number),
            getFloorType(floor.floor_number),
            valueOrEmpty(floor.spaces?.length ?? 0),
            formatNumber(calculateFloorArea(floor)),
            formatNumber(getFloorHeight(floor)),
            Number(floor.status) === 1 ? t('ProjectShow.completed') : t('ProjectShow.in_progress'),
          ]),
          y,
        );
      } else {
        y = drawPdfEmpty(pdf, t('ProjectShow.no_floors'), y);
      }

      y = startPdfSection(pdf, t('ProjectShow.floor_spaces_details'), y + 7, 20);
      if (floorSpaces.value.length) {
        y = drawPdfTable(
          pdf,
          [
            t('ProjectShow.floor'),
            t('ProjectFloor.space'),
            t('ProjectShow.length_m'),
            t('ProjectShow.width_m'),
            t('ProjectShow.height_m'),
            t('ProjectShow.area_m'),
            t('Project.notes'),
          ],
          floorSpaces.value.map((space) => [
            getFloorNumberLabel(space.parentFloorNumber),
            getEntityName(space.space),
            formatNumber(space.length),
            formatNumber(space.width),
            formatNumber(space.height),
            formatNumber(calculateArea(space)),
            valueOrEmpty(space.notes),
          ]),
          y,
          true,
        );
      } else {
        y = drawPdfEmpty(pdf, t('ProjectShow.no_floor_spaces'), y);
      }

      y = startPdfSection(pdf, t('Project.steps.project_department'), y + 7, 20);
      if (projectDepartments.value.length) {
        y = drawPdfTable(
          pdf,
          [
            t('id'),
            t('ProjectShow.department'),
            t('project_item.item'),
            t('project_item.quantity'),
            t('project_item.price'),
            t('ProjectShow.final_price'),
            t('project_item.pricing_method'),
            t('ProjectShow.created_at'),
          ],
          projectDepartments.value.flatMap((department) =>
            (department.items ?? []).map((item) => [
              valueOrEmpty(item.id),
              getEntityName(department.department),
              getEntityName(item.item),
              valueOrEmpty(item.quantity),
              formatNumber(item.price),
              formatNumber(item.final_price),
              getPricingMethodLabel(item.pricing_method),
              formatDate(item.created_at),
            ]),
          ),
          y,
          true,
        );
      } else if (projectItems.value.length) {
        y = drawPdfTable(
          pdf,
          [t('id'), t('title')],
          projectItems.value.map((item, index) => [
            valueOrEmpty((item as { id?: number }).id ?? index + 1),
            valueOrEmpty((item as { title?: string }).title),
          ]),
          y,
        );
      } else {
        y = drawPdfEmpty(pdf, t('ProjectShow.no_project_items'), y);
      }

      y = startPdfSection(pdf, t('project_pricing.index.title'), y + 7, 20);
      if (projectPricing.value) {
        y = drawPdfKeyValueTable(
          pdf,
          pricingInfo.value.map((item) => [item.label, item.value]),
          y,
        );
      } else {
        drawPdfEmpty(pdf, t('ProjectShow.no_project_pricing'), y);
      }

      addPdfPageBranding(pdf, createPdfBranding(pdf, companyLogo));
      pdf.save(getPdfFileName());
    } finally {
      exportingPdf.value = false;
    }
  };

  const fetchProject = async () => {
    if (!projectId.value) return;

    await projectController.fetchOne(
      new ShowProjectParams({ projectId: projectId.value, allLocales: true }),
    );
  };

  const handleConvertStatusAction = async () => {
    if (!projectId.value || loading.value) return;

    loading.value = true;

    const oldStatus = currentConvertStatus.value;

    try {
      const payload = {
        toMap: () => ({
          project_id: projectId.value,
        }),
      };

      let result;

      switch (oldStatus) {
        // case ConvertStatus.PENDING:
        //   result = await projectController.convertMeasurementToProject(payload);
        //   break;

        case ConvertStatus.CONVERT_TO_PROJECT:
          result = await projectController.storeVersion(payload);
          break;

        case ConvertStatus.SEND_TO_CLIENT:
          result = await projectController.reviseVersion(payload);
          break;

        case ConvertStatus.REVISE_VERSION:
          return;

        default:
          return;
      }

      if (!(result instanceof DataSuccess)) return;

      switch (oldStatus) {
        case ConvertStatus.PENDING:
          localConvertStatus.value = ConvertStatus.CONVERT_TO_PROJECT;
          break;

        case ConvertStatus.CONVERT_TO_PROJECT:
          localConvertStatus.value = ConvertStatus.SEND_TO_CLIENT;
          break;

        case ConvertStatus.SEND_TO_CLIENT:
          localConvertStatus.value = ConvertStatus.REVISE_VERSION;
          break;
      }

      await fetchProject();

      const refreshedStatus = Number(
        projectController.itemData.value?.convert_status ??
          projectController.itemData.value?.status,
      );

      if (Number.isFinite(refreshedStatus)) {
        localConvertStatus.value = refreshedStatus as ConvertStatus;
      }
    } finally {
      loading.value = false;
    }
  };

  const handleChangeProjectStatus = async (payload: { status: ConvertStatus; notes: string }) => {
    if (!projectId.value || loading.value) return;

    loading.value = true;

    try {
      const result = await projectController.changeProjectStatus(
        new ChangeProjectStatusParams({
          projectId: projectId.value,
          status: payload.status,
          notes: payload.notes,
        }),
      );

      if (!(result instanceof DataSuccess)) return;

      localConvertStatus.value = payload.status;
      await fetchProject();
    } finally {
      loading.value = false;
    }
  };

  const headerProps = computed(() => ({
    project: project.value,
    projectTitle: projectTitle.value,
    statusMeta: getConvertStatusMeta(currentConvertStatus.value),
    projectCodeLabel: t('ProjectShow.project_code'),
    createdAtLabel: t('ProjectShow.created_at'),
    downloadPdfLabel: t('ProjectShow.download_pdf'),
    generatingPdfLabel: t('ProjectShow.generating_pdf'),
    editProjectLabel: t('ProjectShow.edit_project'),
    historyLabel: t('ProjectShow.history'),
    actionsLabel: t('general.actions'),
    exportingPdf: exportingPdf.value,
    convertActionLabel: convertActionLabel.value,
    convertActionDisabled: isConvertActionDisabled.value,
    statusActions: statusActions.value,
    changeStatusModalTitle: t('ProjectShow.change_status_title'),
    notesLabel: t('Project.notes'),
    notesPlaceholder: t('ProjectShow.change_status_notes_placeholder'),
    cancelLabel: t('cancel'),
    saveStatusLabel: t('ProjectShow.save_status'),
    changingStatusLabel: t('ProjectShow.changing_status'),
    changeStatusLoading: loading.value,
    formatDate,
    formatTime,
  }));

  const tabsProps = computed(() => ({
    tabs: tabs.value,
    activeTab: activeTab.value,
    ariaLabel: t('ProjectShow.sections_navigation'),
  }));

  const projectInfoSectionProps = computed(() => ({
    class: sectionActiveClass('project-data'),
    title: t('ProjectShow.project_information'),
    items: projectInfo.value,
  }));

  const floorsSectionProps = computed(() => ({
    class: sectionActiveClass('project-floors'),
    title: t('ProjectShow.project_floors_summary'),
    floors: projectFloors.value,
    floorSpaces: floorSpaces.value,
    totalArea: totalArea.value,
    averageHeight: averageHeight.value,
    emptyLabel: t('ProjectShow.no_floors'),
    addFloorLabel: t('ProjectShow.add_floor'),
    addFloorTo: {
      path: '/organization/project_floor/add',
      query: {
        project_id: project.value.id,
        project_preview_id: preview.value?.id,
      },
    },
    floorLabel: t('ProjectShow.floor'),
    typeLabel: t('ProjectShow.type'),
    spacesLabel: t('Project.spaces'),
    totalAreaMeterLabel: t('ProjectShow.total_area_m'),
    totalHeightMeterLabel: t('ProjectShow.total_height_m'),
    statusLabel: t('status'),
    completedLabel: t('ProjectShow.completed'),
    inProgressLabel: t('ProjectShow.in_progress'),
    totalFloorsLabel: t('ProjectShow.total_floors'),
    totalSpacesLabel: t('ProjectShow.total_spaces'),
    totalAreaLabel: t('ProjectShow.total_area'),
    averageHeightLabel: t('ProjectShow.average_height'),
    getFloorNumberLabel,
    getFloorType,
    getStatusMeta,
    calculateFloorArea,
    getFloorHeight,
    formatNumber,
    formatArea,
  }));

  const spacesSectionProps = computed(() => ({
    title: t('ProjectShow.floor_spaces_details'),
    spaces: floorSpaces.value,
    totalArea: totalArea.value,
    emptyValue,
    emptyLabel: t('ProjectShow.no_floor_spaces'),
    floorLabel: t('ProjectShow.floor'),
    spaceLabel: t('ProjectFloor.space'),
    lengthLabel: t('ProjectShow.length_m'),
    widthLabel: t('ProjectShow.width_m'),
    heightLabel: t('ProjectShow.height_m'),
    areaLabel: t('ProjectShow.area_m'),
    notesLabel: t('Project.notes'),
    attachmentsLabel: t('ProjectShow.attachments_count'),
    totalAreaAllSpacesLabel: t('ProjectShow.total_area_all_spaces'),
    getFloorNumberLabel,
    getEntityName,
    formatNumber,
    formatArea,
    calculateArea,
    valueOrEmpty,
    isImageAttachment,
  }));

  const departmentsSectionProps = computed(() => ({
    class: sectionActiveClass('project-items'),
    title: t('ProjectShow.project_departments'),
    departments: projectDepartments.value,
    emptyLabel: t('ProjectShow.no_project_items'),
    idLabel: t('id'),
    departmentLabel: t('ProjectShow.department'),
    departmentCountLabel: t('ProjectShow.departments_count_label'),
    itemLabel: t('project_item.item'),
    itemsLabel: t('ProjectShow.items_count_label'),
    itemCountLabel: t('ProjectShow.item_count_label'),
    quantityLabel: t('project_item.quantity'),
    priceLabel: t('project_item.price'),
    unitPriceLabel: t('ProjectShow.unit_price'),
    finalPriceLabel: t('ProjectShow.final_price'),
    pricingMethodLabel: t('project_item.pricing_method'),
    floorLabel: t('ProjectShow.floor'),
    spaceLabel: t('ProjectFloor.space'),
    createdAtLabel: t('ProjectShow.created_at'),
    totalLabel: t('project_item.total_label'),
    currencyLabel: t('ProjectShow.currency_egp'),
    hintLabel: t('ProjectShow.departments_hint'),
    singleOpenHintLabel: t('ProjectShow.departments_single_open_hint'),
    valueOrEmpty,
    formatNumber,
    formatDate,
    getEntityName,
    getPricingMethodLabel,
  }));

  const itemsSectionProps = computed(() => ({
    class: sectionActiveClass('project-items'),
    addItem: t('ProjectShow.add_item'),
    addItemTo: {
      path: '/organization/project-item/add',
      query: {
        project_id: project.value.id,
        project_preview_id: preview.value?.id,
      },
    },
    title: t('Project.steps.project_items'),
    items: projectItems.value,
    emptyLabel: t('ProjectShow.no_project_items'),
    idLabel: t('id'),
    titleLabel: t('title'),
    valueOrEmpty,
  }));

  const pricingSectionProps = computed(() => ({
    class: sectionActiveClass('project-pricing'),
    title: t('project_pricing.index.title'),
    pricing: projectPricing.value,
    items: pricingInfo.value,
    emptyLabel: t('ProjectShow.no_project_pricing'),
  }));

  const sideColumnProps = computed(() => ({
    class: {
      'project-side-column--active-preview': activeTab.value === 'project-preview',
      'project-side-column--active-terms': activeTab.value === 'project-terms',
    },
    imageSource: firstImage.value || fallbackProjectImage,
    projectTitle: projectTitle.value,
    stats: stats.value,
    preview: preview.value,
    previews: previews.value,
    hasProjectFloors: projectFloors.value.length > 0,
    addItemTo: {
      path: '/organization/project_preview/add',
      query: {
        project_id: project.value.id ?? projectId.value,
      },
    },
    previewTitle: t('Project.steps.project_preview'),
    noPreviewLabel: t('ProjectShow.no_preview'),
    previewDateLabel: t('Project.preview_date'),
    previewTimeLabel: t('Project.preview_time'),
    notificationTypeLabel: t('ProjectShow.notification_type'),
    notificationMessageLabel: t('ProjectShow.notification_message'),
    siteLinkLabel: t('ProjectShow.site_link'),
    addressLabel: t('address'),
    termsLabel: t('terms'),
    terms: projectTerms.value,
    emptyValue,
    formatDate,
    formatTime,
    valueOrEmpty,
  }));

  onMounted(() => {
    void fetchProject();
  });

  return {
    t,
    projectController,
    projectDepartments,
    fetchProject,
    downloadProjectPdf,
    handleConvertStatusAction,
    handleChangeProjectStatus,
    goToSection,
    headerProps,
    tabsProps,
    projectInfoSectionProps,
    floorsSectionProps,
    spacesSectionProps,
    departmentsSectionProps,
    itemsSectionProps,
    pricingSectionProps,
    sideColumnProps,
  };
};
