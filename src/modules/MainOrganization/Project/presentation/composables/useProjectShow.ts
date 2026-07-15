import { computed, onMounted, ref } from 'vue';
import { jsPDF } from 'jspdf';
import autoTable, { type RowInput } from 'jspdf-autotable';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
import fallbackProjectImage from '@/assets/images/ChatGPT Image Jul 1, 2026, 11_19_16 AM.png';
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

export const useProjectShow = () => {
  const route = useRoute();
  const { locale, t } = useI18n();
  const projectController = ProjectController.getInstance();
  const activeTab = ref('project-data');
  const exportingPdf = ref(false);
  const loading = ref(false);
  const localConvertStatus = ref<ConvertStatus | null>(null);

  const emptyValue = '—';

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
      ConvertStatus.PENDING;

    return Number(value) as ConvertStatus;
  });

  const getConvertStatusMeta = (status: ConvertStatus) => {
    switch (status) {
      case ConvertStatus.PENDING:
        return {
          label: t('project.convertStatus.pending'),
          className: 'is-pending',
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

      default:
        return {
          label: t('project.convertStatus.pending'),
          className: 'is-pending',
        };
    }
  };

  const convertActionLabel = computed(() => {
    switch (currentConvertStatus.value) {
      case ConvertStatus.PENDING:
        return t('project.convertActions.convertMeasurementToProject');

      case ConvertStatus.CONVERT_TO_PROJECT:
        return t('project.convertActions.storeVersion');

      case ConvertStatus.SEND_TO_CLIENT:
        return t('project.convertActions.reviseVersion');

      default:
        return '';
    }
  });

  const isConvertActionDisabled = computed(() => loading.value);

  const changeStatusOptions = computed(() =>
    Object.values(ConvertStatus).map((status) => ({
      value: status,
      label: getConvertStatusMeta(status).label,
    })),
  );

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
    pdf.text(String(text), x, y, options);
  };

  const startPdfSection = (pdf: jsPDF, title: string, subtitle?: string, shouldAddPage = true) => {
    if (shouldAddPage) {
      pdf.addPage();
    }

    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setFillColor(...pdfColors.primary);
    pdf.rect(0, 0, pageWidth, 18, 'F');
    pdf.setTextColor(...pdfColors.white);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    writePdfText(pdf, 'BuildHub', pdfMargin, 11.5);
    writePdfText(
      pdf,
      `${t('ProjectShow.project_code')}: ${valueOrEmpty(project.value.id)}`,
      pageWidth - pdfMargin,
      11.5,
      {
        align: 'right',
      },
    );

    pdf.setTextColor(...pdfColors.dark);
    pdf.setFontSize(18);
    writePdfText(pdf, title, pdfTextX(pdf), 34, {
      align: pdfAlign(),
      maxWidth: pageWidth - pdfMargin * 2,
    });

    if (subtitle) {
      pdf.setTextColor(...pdfColors.muted);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      writePdfText(pdf, subtitle, pdfTextX(pdf), 42, {
        align: pdfAlign(),
        maxWidth: pageWidth - pdfMargin * 2,
      });
    }

    pdf.setDrawColor(...pdfColors.border);
    pdf.line(pdfMargin, 48, pageWidth - pdfMargin, 48);

    return 58;
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
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      writePdfText(pdf, stat.value, x + 4, startY + 9, { maxWidth: cardWidth - 8 });
      pdf.setTextColor(...pdfColors.muted);
      pdf.setFont('helvetica', 'normal');
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
      margin: { left: pdfMargin, right: pdfMargin, bottom: 18 },
      styles: {
        font: 'helvetica',
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
      margin: { left: pdfMargin, right: pdfMargin, bottom: 18 },
      styles: {
        font: 'helvetica',
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
    });

    return getLastTableY(pdf, startY);
  };

  const drawPdfEmpty = (pdf: jsPDF, message: string, startY: number) => {
    const pageWidth = pdf.internal.pageSize.getWidth();

    pdf.setDrawColor(...pdfColors.border);
    pdf.setFillColor(...pdfColors.soft);
    pdf.roundedRect(pdfMargin, startY, pageWidth - pdfMargin * 2, 32, 2.5, 2.5, 'FD');
    pdf.setTextColor(...pdfColors.muted);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    writePdfText(pdf, message, pageWidth / 2, startY + 18, { align: 'center' });

    return startY + 42;
  };

  const getPdfProjectRows = (): [string, string][] => {
    return projectInfo.value.map((info) => {
      const parts = [info.value, info.meta].filter((part) => part && part !== emptyValue);

      return [info.label, parts.join('\n') || emptyValue];
    });
  };

  const getPdfPreviewRows = (): [string, string][] => [
    [t('Project.preview_date'), formatDate(preview.value?.preview_date)],
    [t('Project.preview_time'), formatTime(preview.value?.preview_time)],
    [t('ProjectShow.notification_type'), valueOrEmpty(preview.value?.notification_type)],
    [t('ProjectShow.notification_message'), valueOrEmpty(preview.value?.notification_message)],
    [t('ProjectShow.site_link'), valueOrEmpty(preview.value?.site_link)],
    [t('address'), valueOrEmpty(preview.value?.address)],
  ];

  const addPdfFooters = (pdf: jsPDF) => {
    const pageCount = pdf.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let page = 1; page <= pageCount; page += 1) {
      pdf.setPage(page);
      pdf.setDrawColor(...pdfColors.border);
      pdf.line(pdfMargin, pageHeight - 14, pageWidth - pdfMargin, pageHeight - 14);
      pdf.setTextColor(...pdfColors.muted);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      writePdfText(pdf, projectTitle.value, pdfMargin, pageHeight - 8, { maxWidth: 120 });
      writePdfText(pdf, `${page} / ${pageCount}`, pageWidth - pdfMargin, pageHeight - 8, {
        align: 'right',
      });
    }
  };

  const downloadProjectPdf = async () => {
    if (exportingPdf.value) return;

    exportingPdf.value = true;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      let y = startPdfSection(pdf, t('ProjectShow.project_information'), projectTitle.value, false);
      y = drawPdfSummaryCards(pdf, y);
      drawPdfKeyValueTable(pdf, getPdfProjectRows(), y);

      y = startPdfSection(pdf, t('Project.steps.project_preview'), projectTitle.value);
      if (preview.value) {
        drawPdfKeyValueTable(pdf, getPdfPreviewRows(), y);
      } else {
        drawPdfEmpty(pdf, t('ProjectShow.no_preview'), y);
      }

      y = startPdfSection(pdf, t('ProjectShow.project_floors_summary'), projectTitle.value);
      y = drawPdfSummaryCards(pdf, y);
      if (projectFloors.value.length) {
        drawPdfTable(
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
        drawPdfEmpty(pdf, t('ProjectShow.no_floors'), y);
      }

      y = startPdfSection(pdf, t('ProjectShow.floor_spaces_details'), projectTitle.value);
      if (floorSpaces.value.length) {
        drawPdfTable(
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
        drawPdfEmpty(pdf, t('ProjectShow.no_floor_spaces'), y);
      }

      y = startPdfSection(pdf, t('Project.steps.project_department'), projectTitle.value);
      if (projectDepartments.value.length) {
        drawPdfTable(
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
        drawPdfTable(
          pdf,
          [t('id'), t('title')],
          projectItems.value.map((item, index) => [
            valueOrEmpty((item as { id?: number }).id ?? index + 1),
            valueOrEmpty((item as { title?: string }).title),
          ]),
          y,
        );
      } else {
        drawPdfEmpty(pdf, t('ProjectShow.no_project_items'), y);
      }

      y = startPdfSection(pdf, t('project_pricing.index.title'), projectTitle.value);
      if (projectPricing.value) {
        drawPdfKeyValueTable(
          pdf,
          pricingInfo.value.map((item) => [item.label, item.value]),
          y,
        );
      } else {
        drawPdfEmpty(pdf, t('ProjectShow.no_project_pricing'), y);
      }

      addPdfFooters(pdf);
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
        case ConvertStatus.PENDING:
          result = await projectController.convertMeasurementToProject(payload);
          break;

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
    changeStatusLabel: t('ProjectShow.change_status'),
    changeStatusModalTitle: t('ProjectShow.change_status_title'),
    statusLabel: t('status'),
    notesLabel: t('Project.notes'),
    notesPlaceholder: t('ProjectShow.change_status_notes_placeholder'),
    cancelLabel: t('cancel'),
    saveStatusLabel: t('ProjectShow.save_status'),
    changingStatusLabel: t('ProjectShow.changing_status'),
    changeStatusLoading: loading.value,
    statusOptions: changeStatusOptions.value,
    currentStatus: currentConvertStatus.value,
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
