<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { jsPDF } from 'jspdf';
  import autoTable, { type RowInput } from 'jspdf-autotable';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import fallbackProjectImage from '@/assets/images/ChatGPT Image Jul 1, 2026, 11_19_16 AM.png';
  import ShowProjectParams from '../../core/params/show.project.params';
  import type ProjectShowModel from '../../core/models/project.show.model';
  import ProjectController from '../controllers/project.controller';
  import { ServiceType } from '../../core/constants/serviceType.enum';
  import { ConvertStatus } from '../../core/constants/convert.status.enum';
  import { FloorNumber } from '@/modules/MainOrganization/ProjectFloor/core/constants/floor.number.enum';
  import ProjectFloorsSection from './project_show/ProjectFloorsSection.vue';
  import ProjectInfoSection from './project_show/ProjectInfoSection.vue';
  import ProjectItemsSection from './project_show/ProjectItemsSection.vue';
  import ProjectShowHeader from './project_show/ProjectShowHeader.vue';
  import ProjectShowTabs from './project_show/ProjectShowTabs.vue';
  import ProjectSideColumn from './project_show/ProjectSideColumn.vue';
  import ProjectSpacesSection from './project_show/ProjectSpacesSection.vue';
  import type {
    Attachment,
    FloorSpace,
    LocaleEntry,
    NamedEntity,
    ProjectFloor,
    ProjectShowRaw,
    TabItem,
  } from './project_show/projectShow.types';

  const route = useRoute();
  const { locale, t } = useI18n();
  const projectController = ProjectController.getInstance();
  const activeTab = ref('project-data');
  const exportingPdf = ref(false);
  const loading = ref(false);

  const projectId = computed(() => {
    const value = Number(route.params.project_id);

    return Number.isNaN(value) ? 0 : value;
  });

  const projectModel = computed(() => projectController.itemData.value as ProjectShowModel | null);
  const project = computed<ProjectShowRaw>(() => {
    return (projectModel.value?.raw ?? projectModel.value ?? {}) as ProjectShowRaw;
  });
  const localConvertStatus = ref<ConvertStatus | null>(null);
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
  const convertActionLabel = computed(() => {
    switch (currentConvertStatus.value) {
      case ConvertStatus.PENDING:
        return 'project.convertActions.convertMeasurementToProject';

      case ConvertStatus.CONVERT_TO_PROJECT:
        return 'project.convertActions.sendToClient';

      case ConvertStatus.SEND_TO_CLIENT:
        return 'project.convertActions.reviseVersion';

      case ConvertStatus.REVISE_VERSION:
        return 'project.convertActions.completed';

      default:
        return 'project.convertActions.convertMeasurementToProject';
    }
  });

  const isConvertActionDisabled = computed(() => {
    return loading.value || currentConvertStatus.value === ConvertStatus.REVISE_VERSION;
  });

  const tabs = computed<TabItem[]>(() => [
    { id: 'project-data', label: t('Project.steps.project_data'), icon: 'pi pi-calendar' },
    { id: 'project-preview', label: t('Project.steps.project_preview'), icon: 'pi pi-id-card' },
    { id: 'project-floors', label: t('Project.steps.project_floors'), icon: 'pi pi-sitemap' },
    { id: 'project-items', label: t('Project.steps.project_items'), icon: 'pi pi-sliders-h' },
  ]);

  const emptyValue = '—';

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

      default:
        return {
          label: t('project.convertStatus.pending'),
          className: 'is-pending',
        };
    }
  };

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

  const getFirstProjectPreview = () => {
    return (
      project.value.project_floors?.find((floor) => floor.project_preview)?.project_preview ?? null
    );
  };

  const preview = computed(() => getFirstProjectPreview());
  const projectFloors = computed(() => project.value.project_floors ?? []);
  const projectItems = computed(() => project.value.project_department_items ?? []);
  const projectDepartments = computed(() => project.value.project_departments ?? []);
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

  const previewCount = computed(() => (preview.value ? 1 : 0));

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
      icon: 'pi pi-shield',
      label: t('status'),
      value: getStatusMeta(project.value.status).label,
      badge: getStatusMeta(project.value.status).className,
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
      value: projectItems.value.length.toString(),
      label: t('ProjectShow.items'),
    },
    {
      icon: 'pi pi-chart-line',
      value: formatArea(totalArea.value),
      label: t('ProjectShow.total_area'),
    },
  ]);

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

  // const shareProject = async () => {
  //   await navigator.clipboard?.writeText(window.location.href);
  // };

  const getPdfFileName = () => {
    const name = projectTitle.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-|-$/g, '');

    return `${name || 'project-details'}.pdf`;
  };

  type PdfTableDocument = jsPDF & {
    lastAutoTable?: {
      finalY?: number;
    };
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
            t('ProjectShow.attachments_count'),
          ],
          floorSpaces.value.map((space) => [
            getFloorNumberLabel(space.parentFloorNumber),
            getEntityName(space.space),
            formatNumber(space.length),
            formatNumber(space.width),
            formatNumber(space.height),
            formatNumber(calculateArea(space)),
            valueOrEmpty(space.notes),
            space.attachments?.length
              ? space.attachments.map((attachment) => attachment.file).join('\n')
              : emptyValue,
          ]),
          y,
          true,
        );
      } else {
        drawPdfEmpty(pdf, t('ProjectShow.no_floor_spaces'), y);
      }

      y = startPdfSection(pdf, t('Project.steps.project_items'), projectTitle.value);
      if (projectItems.value.length) {
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

  onMounted(() => {
    void fetchProject();
  });
</script>

<template>
  <div class="project-details-page">
    <DataStatusBuilder
      :controller="projectController.itemState.value"
      :on-retry="
        async () => {
          await fetchProject();
        }
      "
    >
      <template #loader>
        <section class="project-state-card">
          {{ t('loading') }}
        </section>
      </template>

      <template #failed="{ error }">
        <section class="project-state-card project-state-card--error">
          {{
            error?.displayMessage ||
            error?.title ||
            projectController.errorMessage.value ||
            t('no_data')
          }}
        </section>
      </template>

      <template #empty>
        <section class="project-state-card">
          {{ t('no_data') }}
        </section>
      </template>

      <template #success>
        <div class="project-pdf-content">
          <ProjectShowHeader
            :project="project"
            :project-title="projectTitle"
            :status-meta="getConvertStatusMeta(currentConvertStatus)"
            :project-code-label="t('ProjectShow.project_code')"
            :created-at-label="t('ProjectShow.created_at')"
            :download-pdf-label="t('ProjectShow.download_pdf')"
            :generating-pdf-label="t('ProjectShow.generating_pdf')"
            :edit-project-label="t('ProjectShow.edit_project')"
            :exporting-pdf="exportingPdf"
            :convert-action-label="t(convertActionLabel)"
            :convert-action-disabled="isConvertActionDisabled"
            :format-date="formatDate"
            :format-time="formatTime"
            @download-pdf="downloadProjectPdf"
            @convert-status-action="handleConvertStatusAction"
          />

          <ProjectShowTabs
            :tabs="tabs"
            :active-tab="activeTab"
            :aria-label="t('ProjectShow.sections_navigation')"
            @select="goToSection"
          />

          <main class="project-dashboard">
            <section class="project-main-column">
              <ProjectInfoSection
                :title="t('ProjectShow.project_information')"
                :items="projectInfo"
              />

              <ProjectFloorsSection
                :title="t('ProjectShow.project_floors_summary')"
                :floors="projectFloors"
                :floor-spaces="floorSpaces"
                :total-area="totalArea"
                :average-height="averageHeight"
                :empty-label="t('ProjectShow.no_floors')"
                :add-floor-label="t('ProjectShow.add_floor')"
                :add-floor-to="{
                  path: '/project_floor/add',
                  query: {
                    project_id: project.id,
                    project_preview_id: preview?.id,
                  },
                }"
                :floor-label="t('ProjectShow.floor')"
                :type-label="t('ProjectShow.type')"
                :spaces-label="t('Project.spaces')"
                :total-area-meter-label="t('ProjectShow.total_area_m')"
                :total-height-meter-label="t('ProjectShow.total_height_m')"
                :status-label="t('status')"
                :completed-label="t('ProjectShow.completed')"
                :in-progress-label="t('ProjectShow.in_progress')"
                :total-floors-label="t('ProjectShow.total_floors')"
                :total-spaces-label="t('ProjectShow.total_spaces')"
                :total-area-label="t('ProjectShow.total_area')"
                :average-height-label="t('ProjectShow.average_height')"
                :get-floor-number-label="getFloorNumberLabel"
                :get-floor-type="getFloorType"
                :get-status-meta="getStatusMeta"
                :calculate-floor-area="calculateFloorArea"
                :get-floor-height="getFloorHeight"
                :format-number="formatNumber"
                :format-area="formatArea"
              />

              <ProjectSpacesSection
                :title="t('ProjectShow.floor_spaces_details')"
                :spaces="floorSpaces"
                :total-area="totalArea"
                :empty-value="emptyValue"
                :empty-label="t('ProjectShow.no_floor_spaces')"
                :floor-label="t('ProjectShow.floor')"
                :space-label="t('ProjectFloor.space')"
                :length-label="t('ProjectShow.length_m')"
                :width-label="t('ProjectShow.width_m')"
                :height-label="t('ProjectShow.height_m')"
                :area-label="t('ProjectShow.area_m')"
                :notes-label="t('Project.notes')"
                :attachments-label="t('ProjectShow.attachments_count')"
                :total-area-all-spaces-label="t('ProjectShow.total_area_all_spaces')"
                :get-floor-number-label="getFloorNumberLabel"
                :get-entity-name="getEntityName"
                :format-number="formatNumber"
                :format-area="formatArea"
                :calculate-area="calculateArea"
                :value-or-empty="valueOrEmpty"
                :is-image-attachment="isImageAttachment"
              />

              <ProjectItemsSection
                :title="t('Project.steps.project_items')"
                :items="projectItems"
                :empty-label="t('ProjectShow.no_project_items')"
                :id-label="t('id')"
                :title-label="t('title')"
                :value-or-empty="valueOrEmpty"
              />
            </section>

            <ProjectSideColumn
              :image-source="firstImage || fallbackProjectImage"
              :project-title="projectTitle"
              :stats="stats"
              :preview="preview"
              :preview-title="t('Project.steps.project_preview')"
              :no-preview-label="t('ProjectShow.no_preview')"
              :preview-date-label="t('Project.preview_date')"
              :preview-time-label="t('Project.preview_time')"
              :notification-type-label="t('ProjectShow.notification_type')"
              :notification-message-label="t('ProjectShow.notification_message')"
              :pricing-responsible-label="t('ProjectShow.pricing_responsible')"
              :site-link-label="t('ProjectShow.site_link')"
              :address-label="t('address')"
              :empty-value="emptyValue"
              :format-date="formatDate"
              :format-time="formatTime"
              :value-or-empty="valueOrEmpty"
            />
          </main>

          <section class="project-hidden-summary" aria-hidden="true">
            {{ projectDepartments.length }} {{ previewCount }}
          </section>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style lang="scss">
  @use '../styles/project_show';
</style>
