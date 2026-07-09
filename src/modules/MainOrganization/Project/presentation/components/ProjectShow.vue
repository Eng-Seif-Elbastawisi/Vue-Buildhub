<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { jsPDF } from 'jspdf';
  import autoTable, { type RowInput } from 'jspdf-autotable';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import fallbackProjectImage from '@/assets/images/ChatGPT Image Jul 1, 2026, 11_19_16 AM.png';
  import ShowProjectParams from '../../core/params/show.project.params';
  import type ProjectShowModel from '../../core/models/project.show.model';
  import ProjectController from '../controllers/project.controller';
  import Image from 'primevue/image';
  import { ServiceType } from '../../core/constants/serviceType.enum';
  import { FloorNumber } from '@/modules/MainOrganization/ProjectFloor/core/constants/floor.number.enum';

  type LocaleEntry = {
    locale?: string;
    title?: string | null;
    description?: string | null;
  };

  type NamedEntity = {
    id?: number;
    name?: string | null;
    title?: string | LocaleEntry[] | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    parent?: NamedEntity | null;
  };

  type Attachment = {
    id?: number;
    file?: string;
    alt?: string | null;
    file_size?: string | null;
    type?: string | number | null;
  };

  type FloorSpace = {
    id?: number;
    space?: NamedEntity | null;
    length?: string | number | null;
    width?: string | number | null;
    height?: string | number | null;
    notes?: string | null;
    attachments?: Attachment[];
    parentFloorNumber?: number | null;
  };

  type ProjectPreview = {
    id?: number;
    engineer?: NamedEntity | null;
    pricing_responsible?: NamedEntity | null;
    notification_type?: number | string | null;
    notification_message?: string | null;
    preview_date?: string | null;
    preview_time?: string | null;
    site_link?: string | null;
    address?: string | null;
  };

  type ProjectFloor = {
    id?: number;
    floor_number?: number | null;
    status?: number | null;
    project_preview?: ProjectPreview | null;
    spaces?: FloorSpace[];
    created_at?: string | null;
  };

  type ProjectShowRaw = {
    id?: number;
    organization?: NamedEntity | null;
    employee?: NamedEntity | null;
    client?: NamedEntity | null;
    project_type?: NamedEntity | null;
    location?: NamedEntity | null;
    service_type?: number | null;
    status?: number | null;
    title?: string | LocaleEntry[] | null;
    description?: LocaleEntry[] | null;
    date?: string | null;
    parent_id?: number | null;
    notes?: string | null;
    site_description?: string | null;
    technical_general_notes?: string | null;
    inspection_recommendations?: string | null;
    expected_design_duration?: string | number | null;
    payment_method?: string | number | null;
    allowed_revision_count?: string | number | null;
    selected_version?: string | number | null;
    project_floors?: ProjectFloor[];
    project_floor_spaces?: FloorSpace[];
    project_departments?: unknown[];
    project_department_items?: unknown[];
    attachments?: Attachment[];
    created_at?: string | null;
  };

  type TabItem = {
    id: string;
    label: string;
    icon: string;
  };

  const route = useRoute();
  const { locale, t } = useI18n();
  const projectController = ProjectController.getInstance();
  const activeTab = ref('project-data');
  const exportingPdf = ref(false);

  const projectId = computed(() => {
    const value = Number(route.params.project_id);

    return Number.isNaN(value) ? 0 : value;
  });

  const projectModel = computed(() => projectController.itemData.value as ProjectShowModel | null);
  const project = computed<ProjectShowRaw>(() => {
    return (projectModel.value?.raw ?? projectModel.value ?? {}) as ProjectShowRaw;
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
    return project.value.project_floors?.find((floor) => floor.project_preview)?.project_preview ?? null;
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

    const floorEntry = Object.entries(FloorNumber).find(([, value]) => Number(value) === Number(floorNumber));

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
    writePdfText(pdf, `${t('ProjectShow.project_code')}: ${valueOrEmpty(project.value.id)}`, pageWidth - pdfMargin, 11.5, {
      align: 'right',
    });

    pdf.setTextColor(...pdfColors.dark);
    pdf.setFontSize(18);
    writePdfText(pdf, title, pdfTextX(pdf), 34, { align: pdfAlign(), maxWidth: pageWidth - pdfMargin * 2 });

    if (subtitle) {
      pdf.setTextColor(...pdfColors.muted);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      writePdfText(pdf, subtitle, pdfTextX(pdf), 42, { align: pdfAlign(), maxWidth: pageWidth - pdfMargin * 2 });
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

  const drawPdfTable = (pdf: jsPDF, head: string[], body: RowInput[], startY: number, compact = false) => {
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
      writePdfText(pdf, `${page} / ${pageCount}`, pageWidth - pdfMargin, pageHeight - 8, { align: 'right' });
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
            space.attachments?.length ? space.attachments.map((attachment) => attachment.file).join('\n') : emptyValue,
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

    await projectController.fetchOne(new ShowProjectParams({ projectId: projectId.value, allLocales: true }));
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
          {{ error?.displayMessage || error?.title || projectController.errorMessage.value || t('no_data') }}
        </section>
      </template>

      <template #empty>
        <section class="project-state-card">
          {{ t('no_data') }}
        </section>
      </template>

      <template #success>
        <div class="project-pdf-content">
          <header class="project-hero">
            <div class="project-hero__body">
              <div class="project-hero__content">
                <div class="project-title-row">
                  <h1>{{ projectTitle }}</h1>
                  <span class="status-badge" :class="getStatusMeta(project.status).className">
                    {{ getStatusMeta(project.status).label }}
                  </span>
                </div>

                <div class="project-meta-row">
                  <span><i class="pi pi-id-card"></i>{{ t('ProjectShow.project_code') }}: {{ project.id }}</span>
                  <span><i class="pi pi-calendar"></i>{{ formatDate(project.date) }}</span>
                  <span><i class="pi pi-clock"></i>{{ t('ProjectShow.created_at') }} {{ formatTime(project.created_at) }}</span>
                </div>
              </div>

              <div class="project-actions">
                <!-- <button class="project-action-btn" type="button" @click="shareProject">
                  <i class="pi pi-share-alt"></i>
                  {{ t('ProjectShow.share') }}
                </button> -->

                <button
                  class="project-action-btn"
                  type="button"
                  :disabled="exportingPdf"
                  @click="downloadProjectPdf"
                >
                  <i class="pi pi-download"></i>
                  {{ exportingPdf ? t('ProjectShow.generating_pdf') : t('ProjectShow.download_pdf') }}
                </button>

                <RouterLink
                  class="project-action-btn project-action-btn--primary"
                  :to="{ name: 'edit-project', params: { project_id: project.id } }"
                >
                  <i class="pi pi-pencil"></i>
                  {{ t('ProjectShow.edit_project') }}
                </RouterLink>

              </div>
            </div>
          </header>

        <nav class="project-tabs" aria-label="Project sections">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="project-tab"
            :class="{ active: activeTab === tab.id }"
            type="button"
            @click="goToSection(tab.id)"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </nav>

        <main class="project-dashboard">
          <section class="project-main-column">
            <article id="project-data" class="project-card project-info-card">
              <div class="card-title">
                <i class="pi pi-building"></i>
                <h2>{{ t('ProjectShow.project_information') }}</h2>
              </div>

              <div class="project-info-grid">
                <div v-for="info in projectInfo" :key="info.label" class="info-item">
                  <i :class="info.icon" aria-hidden="true"></i>
                  <div class="project-info-contant">
                    <span>{{ info.label }}</span>
                    <strong v-if="!info.badge">{{ info.value }}</strong>
                    <strong v-if="info.meta">{{ info.meta }}</strong>
                    <span v-if="info.badge" class="status-badge status-badge--inline" :class="info.badge">
                      {{ info.value }}
                    </span>
                  </div>
                </div>
              </div>
            </article>

            <article id="project-floors" class="project-card">
              <div class="card-title">
                <i class="pi pi-clipboard"></i>
                <h2>{{ t('ProjectShow.project_floors_summary') }}</h2>
              </div>

              <div v-if="!projectFloors.length" class="empty-panel">
                {{ t('ProjectShow.no_floors') }}
              </div>

              <div v-else class="floors-summary-layout">
                <div class="table-wrap">
                  <table class="project-table">
                    <thead>
                      <tr>
                        <th>{{ t('ProjectShow.floor') }}</th>
                        <th>{{ t('ProjectShow.type') }}</th>
                        <th>{{ t('Project.spaces') }}</th>
                        <th>{{ t('ProjectShow.total_area_m') }}</th>
                        <th>{{ t('ProjectShow.total_height_m') }}</th>
                        <th>{{ t('status') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="floor in projectFloors" :key="floor.id">
                        <td>{{ getFloorNumberLabel(floor.floor_number) }}</td>
                        <td>{{ getFloorType(floor.floor_number) }}</td>
                        <td>{{ floor.spaces?.length ?? 0 }}</td>
                        <td>{{ formatNumber(calculateFloorArea(floor)) }}</td>
                        <td>{{ formatNumber(getFloorHeight(floor)) }}</td>
                        <td>
                          <span class="status-badge status-badge--inline" :class="getStatusMeta(floor.status).className">
                            {{ Number(floor.status) === 1 ? t('ProjectShow.completed') : t('ProjectShow.in_progress') }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <aside class="summary-panel">
                  <div class="summary-cube">
                    <i class="pi pi-building"></i>
                  </div>
                  <div>
                    <span>{{ t('ProjectShow.total_floors') }}</span>
                    <strong>{{ projectFloors.length }}</strong>
                  </div>
                  <div>
                    <span>{{ t('ProjectShow.total_spaces') }}</span>
                    <strong>{{ floorSpaces.length }}</strong>
                  </div>
                  <div>
                    <span>{{ t('ProjectShow.total_area') }}</span>
                    <strong>{{ formatArea(totalArea) }}</strong>
                  </div>
                  <div>
                    <span>{{ t('ProjectShow.average_height') }}</span>
                    <strong>{{ formatNumber(averageHeight) }} m</strong>
                  </div>
                </aside>
              </div>
            </article>

            <article class="project-card">
              <div class="card-title">
                <i class="pi pi-file"></i>
                <h2>{{ t('ProjectShow.floor_spaces_details') }}</h2>
              </div>

              <div v-if="!floorSpaces.length" class="empty-panel">
                {{ t('ProjectShow.no_floor_spaces') }}
              </div>

              <div v-else class="table-wrap">
                <table class="project-table project-table--spaces">
                  <thead>
                    <tr>
                      <th>{{ t('ProjectShow.floor') }}</th>
                      <th>{{ t('ProjectFloor.space') }}</th>
                      <th>{{ t('ProjectShow.length_m') }}</th>
                      <th>{{ t('ProjectShow.width_m') }}</th>
                      <th>{{ t('ProjectShow.height_m') }}</th>
                      <th>{{ t('ProjectShow.area_m') }}</th>
                      <th>{{ t('Project.notes') }}</th>
                      <th>{{ t('ProjectShow.attachments_count') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="space in floorSpaces" :key="space.id">
                      <td>{{ getFloorNumberLabel(space.parentFloorNumber) }}</td>
                      <td>{{ getEntityName(space.space) }}</td>
                      <td>{{ formatNumber(space.length) }}</td>
                      <td>{{ formatNumber(space.width) }}</td>
                      <td>{{ formatNumber(space.height) }}</td>
                      <td>{{ formatNumber(calculateArea(space)) }}</td>
                      <td>{{ valueOrEmpty(space.notes) }}</td>
                      <td>
                        <div v-if="space.attachments?.length" class="space-attachments">
                          <template v-for="attachment in space.attachments" :key="attachment.id ?? attachment.file">
                            <Image
                              v-if="isImageAttachment(attachment)"
                              class="space-attachment space-attachment--image"
                              :src="attachment.file"
                              :alt="attachment.alt || getEntityName(space.space)"
                              preview
                              image-class="space-attachment__image"
                            />
                            <a
                              v-else
                              class="space-attachment"
                              :href="attachment.file"
                              target="_blank"
                              rel="noopener"
                            >
                              <span>
                                <i class="pi pi-paperclip"></i>
                              </span>
                            </a>
                          </template>
                        </div>
                        <span v-else>{{ emptyValue }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <strong class="total-line">
                {{ t('ProjectShow.total_area_all_spaces') }}: {{ formatArea(totalArea) }}
              </strong>
            </article>

            <article id="project-items" class="project-card">
              <div class="card-title">
                <i class="pi pi-box"></i>
                <h2>{{ t('Project.steps.project_items') }}</h2>
              </div>

              <div v-if="!projectItems.length" class="empty-panel">
                {{ t('ProjectShow.no_project_items') }}
              </div>

              <div v-else class="table-wrap">
                <table class="project-table">
                  <thead>
                    <tr>
                      <th>{{ t('id') }}</th>
                      <th>{{ t('title') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in projectItems" :key="index">
                      <td>{{ (item as { id?: number }).id ?? index + 1 }}</td>
                      <td>{{ valueOrEmpty((item as { title?: string }).title) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          </section>

          <aside class="project-side-column">
            <article class="image-card">
              <img :src="firstImage || fallbackProjectImage" :alt="projectTitle" />
              <div class="stats-grid">
                <div v-for="stat in stats" :key="stat.label" class="stat-item">
                  <i :class="stat.icon"></i>
                  <strong>{{ stat.value }}</strong>
                  <span>{{ stat.label }}</span>
                </div>
              </div>
            </article>

            <article id="project-preview" class="project-card preview-card">
              <div class="card-title">
                <i class="pi pi-calendar"></i>
                <h2>{{ t('Project.steps.project_preview') }}</h2>
              </div>

              <div v-if="!preview" class="empty-panel">
                {{ t('ProjectShow.no_preview') }}
              </div>

              <div v-else class="preview-grid">
                <div class="side-info">
                  <i class="pi pi-calendar"></i>
                  <span>{{ t('Project.preview_date') }}</span>
                  <strong>{{ formatDate(preview.preview_date) }}</strong>
                </div>
                <div class="side-info">
                  <i class="pi pi-bell"></i>
                  <span>{{ t('ProjectShow.notification_type') }}</span>
                  <strong>{{ valueOrEmpty(preview.notification_type) }}</strong>
                </div>
                <div class="side-info">
                  <i class="pi pi-clock"></i>
                  <span>{{ t('Project.preview_time') }}</span>
                  <strong>{{ formatTime(preview.preview_time) }}</strong>
                </div>
                <div class="side-info">
                  <i class="pi pi-comment"></i>
                  <span>{{ t('ProjectShow.notification_message') }}</span>
                  <strong>{{ valueOrEmpty(preview.notification_message) }}</strong>
                </div>
                <div class="side-info side-info--wide">
                  <i class="pi pi-link"></i>
                  <span>{{ t('ProjectShow.site_link') }}</span>
                  <a v-if="preview.site_link" :href="preview.site_link" target="_blank" rel="noopener">
                    {{ preview.site_link }}
                  </a>
                  <strong v-else>{{ emptyValue }}</strong>
                </div>
                <div class="side-info side-info--wide">
                  <i class="pi pi-map-marker"></i>
                  <span>{{ t('address') }}</span>
                  <strong>{{ valueOrEmpty(preview.address) }}</strong>
                </div>
              </div>
            </article>

            <!-- <article class="project-card">
              <div class="card-title">
                <i class="pi pi-sparkles"></i>
                <h2>{{ t('ProjectShow.additional_information') }}</h2>
              </div>

              <dl class="info-list">
                <div v-for="item in additionalInfo" :key="item.label">
                  <dt>{{ item.label }}</dt>
                  <dd>{{ item.value }}</dd>
                </div>
              </dl>
            </article> -->

            <!-- <article class="project-card attachments-card">
              <div class="card-title">
                <i class="pi pi-file"></i>
                <h2>{{ t('Project.attachments') }}</h2>
              </div>

              <div v-if="!attachments.length" class="attachment-empty">
                <span><i class="pi pi-inbox"></i>{{ t('ProjectShow.no_attachments') }}</span>
                <button type="button">
                  <i class="pi pi-cloud-upload"></i>
                  {{ t('ProjectShow.upload_attachment') }}
                </button>
              </div>

              <ul v-else class="attachment-list">
                <li v-for="attachment in attachments" :key="attachment.id ?? attachment.file">
                  <i class="pi pi-paperclip"></i>
                  <a :href="attachment.file" target="_blank" rel="noopener">
                    {{ attachment.alt || attachment.file }}
                  </a>
                  <span>{{ valueOrEmpty(attachment.file_size) }}</span>
                </li>
              </ul>
            </article> -->
          </aside>
        </main>

        <section class="project-hidden-summary" aria-hidden="true">
          {{ projectDepartments.length }} {{ previewCount }}
        </section>
        </div>
      </template>
    </DataStatusBuilder>
  </div>
</template>

<style scoped lang="scss">
  .project-info-contant {
    display: flex;
    flex-direction: column;
    align-items: start;
  }

  .project-details-page {
    display: flex;
    flex-direction: column;
    gap: 1.35rem;
    color: var(--gray-900);
  }

  .project-pdf-content {
    display: flex;
    flex-direction: column;
    gap: 1.35rem;
    // background: var(--bg-body);
  }

  .project-state-card,
  .project-card,
  .image-card {
    border: 1px solid var(--border-weak);
    border-radius: 16px;
    background: var(--white);
    box-shadow: var(--shadow-sm);
  }

  .project-state-card {
    display: grid;
    min-height: 160px;
    place-items: center;
    padding: 1.5rem;
    color: var(--gray-600);
    font-family: 'Medium';
  }

  .project-state-card--error {
    border-color: var(--danger-light);
    background: var(--danger-light);
    color: var(--danger-dark);
  }

  .project-hero {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    padding-bottom: 1.1rem;
    border-bottom: 1px solid var(--border-weak);
  }

  .project-breadcrumb,
  .project-meta-row,
  .project-actions,
  .project-title-row {
    display: flex;
    align-items: center;
  }

  .project-breadcrumb {
    gap: 0.75rem;
    color: var(--gray-600);
    font-size: var(--sm-size);
  }

  .project-breadcrumb i,
  .project-breadcrumb strong {
    color: var(--gray-900);
  }

  .project-hero__body {
    display: flex;
    justify-content: space-between;
    gap: 1.25rem;
  }

  .project-hero__content {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.8rem;
  }

  .project-title-row {
    gap: 1rem;
  }

  .project-title-row h1 {
    margin: 0;
    color: var(--gray-900);
    font-family: 'Bold';
    font-size: 1.9rem;
    line-height: 1.15;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    min-height: 26px;
    padding: 0.25rem 0.8rem;
    border-radius: 999px;
    background: var(--success-light, var(--PrimaryColor-light));
    color: var(--success-dark, var(--PrimaryColor));
    font-family: 'Bold';
    font-size: var(--xs-size);
    white-space: nowrap;
  }

  .status-badge.is-muted,
  .status-badge.is-progress {
    background: var(--warning-light, var(--gray-100));
    color: var(--warning-dark, var(--gray-700));
  }

  .status-badge--inline {
    min-height: 24px;
    padding: 0.2rem 0.65rem;
    font-size: 0.72rem;
  }

  .project-meta-row {
    flex-wrap: wrap;
    gap: 0.8rem 1.2rem;
    color: var(--gray-700);
    font-family: 'Medium';
    font-size: 0.95rem;
  }

  .project-meta-row span {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  .project-meta-row i,
  .card-title i,
  .info-item > i,
  .side-info i,
  .stat-item i {
    color: var(--PrimaryColor);
  }

  .project-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.75rem;
  }

  .project-action-btn,
  .project-icon-btn,
  .attachment-empty button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 46px;
    border: 1px solid var(--border-weak);
    border-radius: 8px;
    background: var(--white);
    color: var(--gray-900);
    cursor: pointer;
    font-family: 'Bold';
    font-size: var(--sm-size);
    text-decoration: none;
  }

  .project-action-btn {
    gap: 0.55rem;
    padding: 0 1.2rem;
  }

  .project-action-btn--primary {
    border-color: var(--PrimaryColor);
    background: var(--PrimaryColor);
    color: var(--white);
  }

  .project-action-btn:disabled {
    cursor: wait;
    opacity: 0.72;
  }

  .project-icon-btn {
    width: 46px;
  }

  .project-tabs {
    display: flex;
    gap: 1.4rem;
    overflow-x: auto;
    // border-bottom: 1px solid var(--border-weak);
  }

  .project-tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    min-height: 52px;
    border: 0;
    background: transparent;
    color: var(--gray-700);
    cursor: pointer;
    font-family: 'Bold';
    font-size: 0.95rem;
    white-space: nowrap;
  }

  .project-tab::after {
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 3px;
    border-radius: 999px;
    background: transparent;
    content: '';
  }

  .project-tab.active {
    color: var(--PrimaryColor);
  }

  .project-tab.active::after {
    background: var(--PrimaryColor);
  }

  .project-dashboard {
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(360px, 1fr);
    gap: 1.35rem;
    align-items: start;
  }

  .project-main-column,
  .project-side-column {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 1.35rem;
  }

  .project-card {
    padding: 1.25rem;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.2rem;
  }

  .card-title h2 {
    margin: 0;
    color: var(--gray-900);
    font-family: 'Bold';
    font-size: 1rem;
  }

  .project-info-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .info-item {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr);
    gap: 0.4rem;
    min-height: 76px;
    padding: 0.85rem 1rem;
    border-bottom: 1px solid var(--border-weak);
  }

  .info-item:not(:nth-child(3n)) {
    border-inline-end: 1px solid var(--border-weak);
  }

  .info-item span,
  .side-info span,
  .summary-panel span,
  .stat-item span,
  .info-list dt {
    color: var(--gray-600);
    font-family: 'Medium';
    font-size: var(--xs-size);
  }

  .info-item strong,
  .side-info strong,
  .side-info a,
  .summary-panel strong,
  .info-list dd {
    display: block;
    margin-top: 0.25rem;
    color: var(--gray-900);
    font-family: 'Bold';
    font-size: 0.9rem;
    overflow-wrap: anywhere;
  }

  .floors-summary-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 210px;
    gap: 1rem;
  }

  .table-wrap {
    width: 100%;
    overflow-x: auto;
    border: 1px solid var(--border-weak);
    border-radius: 10px;
  }

  .project-table {
    width: 100%;
    min-width: 720px;
    border-collapse: collapse;
  }

  .project-table--spaces {
    min-width: 980px;
  }

  .project-table th,
  .project-table td {
    padding: 0.85rem 1rem;
    text-align: start;
    white-space: nowrap;
  }

  .project-table th {
    background: var(--gray-50);
    color: var(--gray-700);
    font-family: 'Medium';
    font-size: var(--xs-size);
  }

  .project-table td {
    border-top: 1px solid var(--border-weak);
    color: var(--gray-900);
    font-family: 'Bold';
    font-size: 0.88rem;
  }

  .space-attachments {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    min-width: 96px;
  }

  .space-attachment {
    display: inline-grid;
    width: 38px;
    height: 38px;
    place-items: center;
    overflow: hidden;
    border: 1px solid var(--border-weak);
    border-radius: 8px;
    background: var(--gray-50);
    color: var(--PrimaryColor);
    text-decoration: none;
  }

  .space-attachment :deep(.space-attachment__image) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .space-attachment--image {
    padding: 0;
    border: 1px solid var(--border-weak);
    color: transparent;
  }

  .space-attachment--image :deep(.p-image),
  .space-attachment--image :deep(.p-image-preview) {
    width: 100%;
    height: 100%;
  }

  .space-attachment--image :deep(.p-image-preview-icon) {
    width: 100%;
    height: 100%;
  }

  .space-attachment img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .summary-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    justify-content: center;
    padding: 1rem;
    border-radius: 12px;
    background: var(--PrimaryColor-light);
  }

  .summary-cube {
    display: grid;
    width: 56px;
    height: 56px;
    place-items: center;
    border-radius: 12px;
    background: var(--white);
    color: var(--PrimaryColor);
    font-size: 1.5rem;
  }

  .total-line {
    display: block;
    margin-top: 1rem;
    color: var(--gray-900);
    font-family: 'Bold';
  }

  .image-card {
    overflow: hidden;
  }

  .image-card img {
    display: block;
    width: 100%;
    height: 230px;
    object-fit: cover;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .stat-item {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 0.15rem 0.55rem;
    align-items: center;
    min-height: 76px;
    padding: 0.85rem;
    border-inline-end: 1px solid var(--border-weak);
  }

  .stat-item:last-child {
    border-inline-end: 0;
  }

  .stat-item i {
    grid-row: span 2;
    display: grid;
    width: 32px;
    height: 32px;
    place-items: center;
    border-radius: 8px;
    background: var(--PrimaryColor-light);
  }

  .stat-item strong {
    color: var(--gray-900);
    font-family: 'Bold';
    font-size: 1.05rem;
  }

  .preview-card {
    background: var(--white);
  }

  .preview-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .side-info {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr);
    gap: 0.15rem 0.75rem;
  }

  .side-info i {
    grid-row: span 2;
  }

  .side-info--wide {
    grid-column: 1 / -1;
    padding-top: 1rem;
    border-top: 1px solid var(--border-weak);
  }

  .side-info a {
    color: var(--PrimaryColor);
    text-decoration: none;
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    margin: 0;
  }

  .info-list div {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 90px;
    gap: 1rem;
  }

  .info-list dd {
    margin: 0;
  }

  .attachment-empty {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(170px, 1fr);
    gap: 0.75rem;
  }

  .attachment-empty span,
  .attachment-empty button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    min-height: 48px;
    border: 1px solid var(--border-weak);
    border-radius: 8px;
    color: var(--gray-700);
    font-family: 'Medium';
    font-size: var(--sm-size);
  }

  .attachment-empty button {
    border-style: dashed;
    color: var(--PrimaryColor);
  }

  .attachment-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .attachment-list li {
    display: grid;
    grid-template-columns: 22px minmax(0, 1fr) auto;
    gap: 0.75rem;
    align-items: center;
    padding: 0.75rem;
    border: 1px solid var(--border-weak);
    border-radius: 8px;
  }

  .attachment-list a {
    color: var(--PrimaryColor);
    text-decoration: none;
    overflow-wrap: anywhere;
  }

  .empty-panel {
    display: grid;
    min-height: 88px;
    place-items: center;
    border: 1px dashed var(--border-weak);
    border-radius: 10px;
    color: var(--gray-600);
    font-family: 'Medium';
    text-align: center;
  }

  .project-hidden-summary {
    display: none;
  }

  @media (max-width: 1280px) {
    .project-dashboard {
      grid-template-columns: 1fr;
    }

    .project-side-column {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 980px) {
    .project-hero__body,
    .floors-summary-layout,
    .project-side-column {
      grid-template-columns: 1fr;
    }

    .project-hero__body {
      flex-direction: column;
    }

    .project-actions {
      justify-content: flex-start;
    }

    .project-info-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .info-item:not(:nth-child(3n)) {
      border-inline-end: 0;
    }

    .info-item:not(:nth-child(2n)) {
      border-inline-end: 1px solid var(--border-weak);
    }
  }

  @media (max-width: 640px) {
    .project-info-grid,
    .preview-grid,
    .stats-grid,
    .attachment-empty {
      grid-template-columns: 1fr;
    }

    .info-item,
    .info-item:not(:nth-child(2n)) {
      border-inline-end: 0;
    }

    .project-action-btn {
      width: 100%;
    }

    .project-icon-btn {
      width: 100%;
    }
  }
</style>
