<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { jsPDF } from 'jspdf';
  import autoTable, { type RowInput } from 'jspdf-autotable';
  import { DataSuccess } from '@/base/Core/NetworkStructure/Resources/dataState/dataState';
  import DataStatusBuilder from '@/shared/DataStatues/DataStatusBuilder.vue';
  import { dialogManager } from '@/base/Presentation/Dialogs/dialog.manager';
  import fallbackCompanyLogo from '@/assets/images/BuildHubLogo.jpg';
  import { loadFirstPdfImage } from '@/shared/Pdf/loadPdfImage';
  import {
    addPdfPageBranding,
    PDF_TABLE_MARGIN,
    type PdfPageBranding,
  } from '@/shared/Pdf/pdfPageBranding';
  import { useUserStore } from '@/stores/user';
  import { useSystemIdentityTheme } from '@/modules/shared/SystemIdentity/presentation/composables/useSystemIdentityTheme';
  import { getSystemIdentityCompany } from '@/modules/shared/SystemIdentity/presentation/utils/systemIdentityCompany';
  import { InvoicePaymentMethodEnum } from '@/modules/MainOrganization/InvoicePayment/core/constant/invoice.payment.method.enum';
  import type InvoicePaymentModel from '@/modules/MainOrganization/InvoicePayment/core/models/invoice.payment.model';
  import type AddInvoicePaymentParams from '@/modules/MainOrganization/InvoicePayment/core/params/add.invoice.payment.params';
  import InvoicePaymentController from '@/modules/MainOrganization/InvoicePayment/presentation/controllers/invoice.payment.controller';
  import {
    InvoiceStatusEnum,
    InvoiceStatusLabelKeys,
    type InvoiceStatusEnum as InvoiceStatusEnumType,
  } from '../../core/constant/invoice.status.enum';
  import type InvoiceShowModel from '../../core/models/invoice.show.model';
  import InvoiceController from '../controllers/invoice.controller';
  import AddInvoicePaymentDialog from './invoice_show/AddInvoicePaymentDialog.vue';
  import InvoiceChildrenCard from './invoice_show/InvoiceChildrenCard.vue';
  import InvoiceClientProjectCard from './invoice_show/InvoiceClientProjectCard.vue';
  // import InvoiceItemsCard from './invoice_show/InvoiceItemsCard.vue';
  import InvoiceNotesCard from './invoice_show/InvoiceNotesCard.vue';
  import InvoicePaymentSummary from './invoice_show/InvoicePaymentSummary.vue';
  import InvoicePaymentsCard from './invoice_show/InvoicePaymentsCard.vue';
  import InvoiceShowHeader from './invoice_show/InvoiceShowHeader.vue';
  import InvoiceShowSkeleton from './invoice_show/InvoiceShowSkeleton.vue';
  import InvoiceStatusOverview from './invoice_show/InvoiceStatusOverview.vue';
  import InvoiceTimelineCard from './invoice_show/InvoiceTimelineCard.vue';

  const route = useRoute();
  const { t } = useI18n();
  const { user } = useUserStore();
  const { currentPalette } = useSystemIdentityTheme();
  const invoiceController = InvoiceController.getInstance();
  const paymentController = InvoicePaymentController.getInstance();

  const invoiceState = computed(() => invoiceController.itemState.value);
  const invoice = computed(() => invoiceController.itemData.value);
  const loadedPayments = ref<InvoicePaymentModel[]>([]);
  const paymentDialogOpen = ref(false);
  const paymentInvoiceId = ref(0);
  const paymentRemainingAmount = ref<number>();
  const creatingPayment = ref(false);
  const exportingPdf = ref(false);
  const exportingInvoice = ref(false);

  const paletteStyle = computed(() => ({
    '--palette-primary': currentPalette.value.primary,
    '--palette-secondary': currentPalette.value.secondary,
    '--palette-accent': currentPalette.value.accent,
  }));

  const emptyValue = '-';

  const invoiceId = computed(() => {
    const rawId = route.params.id ?? route.params.invoice_id;
    const value = Number(Array.isArray(rawId) ? rawId[0] : rawId);

    return Number.isFinite(value) ? value : 0;
  });

  const indexPath = computed(() => (user?.type === 1 ? '/admin/invoice' : '/organization/invoice'));
  const editPath = computed(() => `${indexPath.value}/edit/${invoiceId.value}`);

  const payments = computed(() => loadedPayments.value);

  const currency = computed(() => invoice.value?.currency || 'EGP');
  const totalAmount = computed(() => Number(invoice.value?.invoice_amount ?? 0));
  const paymentsPaidAmount = computed(() =>
    payments.value.reduce((total, payment) => total + Number(payment.payment_amount ?? 0), 0),
  );
  const paidAmount = computed(() => invoice.value?.paid_amount ?? paymentsPaidAmount.value);
  const remainingAmount = computed(
    () => invoice.value?.remaining_amount ?? Math.max(totalAmount.value - paidAmount.value, 0),
  );
  const isInvoicePaid = computed(() => totalAmount.value > 0 && remainingAmount.value <= 0.009);

  const inferredInvoiceStatus = computed<InvoiceStatusEnumType>(() => {
    if (paidAmount.value > totalAmount.value && totalAmount.value > 0) {
      return InvoiceStatusEnum.EXTRA_PAID;
    }

    if (isInvoicePaid.value) return InvoiceStatusEnum.PAID;
    if (paidAmount.value > 0) return InvoiceStatusEnum.PARTIAL;

    return InvoiceStatusEnum.UNPAID;
  });

  const valueOrEmpty = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return emptyValue;

    return String(value);
  };

  const humanize = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return emptyValue;

    return String(value).replace(/_/g, ' ');
  };

  const formatAmount = (value?: number | string | null) => {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) return emptyValue;

    return numericValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return emptyValue;

    const normalized = value.includes('T')
      ? value
      : value.includes(' ')
        ? value.replace(' ', 'T')
        : `${value}T00:00:00`;
    const date = new Date(normalized);
    const hasTime = value.includes(':') || value.includes('T');

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: hasTime ? '2-digit' : undefined,
      minute: hasTime ? '2-digit' : undefined,
    }).format(date);
  };

  const entityTitle = (entity?: { name?: string; title?: string; id?: number } | null) => {
    return entity?.name || entity?.title || (entity?.id ? `#${entity.id}` : emptyValue);
  };

  const projectTitle = computed(() => {
    return (
      invoice.value?.project?.title ||
      invoice.value?.project?.name ||
      valueOrEmpty(invoice.value?.project_id)
    );
  });

  const createdByName = computed(() => entityTitle(invoice.value?.created_by_employee));
  const clientName = computed(() => entityTitle(invoice.value?.client));
  const clientPhone = computed(() => valueOrEmpty(invoice.value?.client?.phone));
  const clientEmail = computed(() => valueOrEmpty(invoice.value?.client?.email));
  const organizationName = computed(() => entityTitle(invoice.value?.organization));
  const company = computed(() => getSystemIdentityCompany(user, t('buildhub')));
  const companyContactLines = computed(() => {
    return [
      `${t('email')}: ${company.value.email || emptyValue} | ${t('phone')}: ${
        company.value.phone || emptyValue
      }`,
      `${t('address')}: ${company.value.address || emptyValue}`,
    ];
  });
  const createdAtLabel = computed(() =>
    formatDateTime(invoice.value?.created_at || invoice.value?.invoice_date),
  );
  const invoiceDateLabel = computed(() => formatDateTime(invoice.value?.invoice_date));
  const dueDateLabel = computed(() => formatDateTime(invoice.value?.due_date));

  const normalizeInvoiceStatus = (
    value?: string | number | null,
  ): InvoiceStatusEnumType | undefined => {
    const numericValue = Number(value);

    if (
      numericValue === InvoiceStatusEnum.UNPAID ||
      numericValue === InvoiceStatusEnum.PARTIAL ||
      numericValue === InvoiceStatusEnum.PAID ||
      numericValue === InvoiceStatusEnum.EXTRA_PAID
    ) {
      return numericValue;
    }

    const normalizedValue = String(value ?? '')
      .trim()
      .toLowerCase();

    if (normalizedValue === 'unpaid') return InvoiceStatusEnum.UNPAID;
    if (normalizedValue === 'partial') return InvoiceStatusEnum.PARTIAL;
    if (normalizedValue === 'paid') return InvoiceStatusEnum.PAID;
    if (normalizedValue === 'extra_paid' || normalizedValue === 'extra paid') {
      return InvoiceStatusEnum.EXTRA_PAID;
    }

    return undefined;
  };

  const currentInvoiceStatus = computed(
    () => normalizeInvoiceStatus(invoice.value?.status) ?? inferredInvoiceStatus.value,
  );

  const statusLabel = computed(() => t(InvoiceStatusLabelKeys[currentInvoiceStatus.value]));

  const statusClass = computed(() => {
    if (currentInvoiceStatus.value === InvoiceStatusEnum.PAID) return 'is-paid';
    if (currentInvoiceStatus.value === InvoiceStatusEnum.EXTRA_PAID) return 'is-extra-paid';
    if (currentInvoiceStatus.value === InvoiceStatusEnum.PARTIAL) return 'is-partial';

    return 'is-unpaid';
  });

  const exportStatusLabel = computed(() => {
    if (!invoice.value?.export_status) return t('invoice_show.not_exported');

    return humanize(invoice.value.export_status);
  });

  const paymentMethodLabel = (value?: number | null) => {
    if (value === InvoicePaymentMethodEnum.BANK_TRANSFER) {
      return t('invoice_show.payment_method_bank_transfer');
    }

    if (value === InvoicePaymentMethodEnum.CASH) return t('invoice_show.payment_method_cash');
    if (value === InvoicePaymentMethodEnum.CHEQUE) return t('invoice_show.payment_method_cheque');
    if (value === InvoicePaymentMethodEnum.WALLET) return t('invoice_show.payment_method_wallet');

    return value ? `#${value}` : emptyValue;
  };

  const fetchInvoice = async () => {
    if (!invoiceId.value) return;

    await invoiceController.fetchInvoiceById(invoiceId.value);
  };

  const fetchPayments = async () => {
    if (!invoiceId.value) return;

    const result = await paymentController.fetchInvoicePayments(invoiceId.value);

    if (result instanceof DataSuccess) {
      loadedPayments.value = result.data ?? [];
    }
  };

  const refreshInvoice = async () => {
    await fetchInvoice();
    await fetchPayments();
  };

  const openPaymentDialog = (
    targetInvoiceId: number = invoiceId.value,
    targetRemainingAmount?: number,
  ) => {
    if (!targetInvoiceId) return;

    paymentInvoiceId.value = targetInvoiceId;
    paymentRemainingAmount.value =
      targetRemainingAmount ??
      (targetInvoiceId === invoiceId.value ? remainingAmount.value : undefined);
    paymentDialogOpen.value = true;
  };

  const handleAddPayment = async (params: AddInvoicePaymentParams) => {
    if (!paymentInvoiceId.value) return;

    creatingPayment.value = true;

    try {
      const result = await paymentController.createInvoicePayment(paymentInvoiceId.value, params);

      if (result instanceof DataSuccess) {
        paymentDialogOpen.value = false;
        await refreshInvoice();
      }
    } finally {
      creatingPayment.value = false;
    }
  };

  const shareInvoice = async () => {
    if (!window.location?.href || !navigator.clipboard) return;

    await navigator.clipboard.writeText(window.location.href);
    dialogManager.toastSuccess(t('invoice_show.link_copied'));
  };

  const getInvoicePdfFileName = () => {
    const number = invoice.value?.invoice_number || invoice.value?.id || 'invoice';

    return `${String(number).replace(/[^a-z0-9]+/gi, '-')}.pdf`;
  };

  const createPdfBranding = async (title: string): Promise<PdfPageBranding> => {
    return {
      title,
      company: {
        name: company.value.name,
        logo: await loadFirstPdfImage([company.value.logo, fallbackCompanyLogo]),
        contactLines: companyContactLines.value,
      },
    };
  };

  const downloadInvoicePdf = async () => {
    if (!invoice.value || exportingPdf.value) return;

    exportingPdf.value = true;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const branding = await createPdfBranding(t('invoice_show.pdf_title'));
      const rows: [string, string][] = [
        [t('invoice.invoice_number'), valueOrEmpty(invoice.value.invoice_number)],
        [t('invoice.invoice_date'), invoiceDateLabel.value],
        [t('invoice_show.status'), statusLabel.value],
        [t('invoice_show.export_status'), exportStatusLabel.value],
        [t('invoice.project'), projectTitle.value],
        [t('invoice_show.client'), clientName.value],
        [t('invoice_show.organization'), organizationName.value],
        [t('invoice_show.created_by'), createdByName.value],
        [t('invoice_show.total_amount'), `${formatAmount(totalAmount.value)} ${currency.value}`],
        [t('invoice_show.paid_amount'), `${formatAmount(paidAmount.value)} ${currency.value}`],
        [
          t('invoice_show.remaining_amount'),
          `${formatAmount(remainingAmount.value)} ${currency.value}`,
        ],
      ];

      autoTable(pdf, {
        startY: PDF_TABLE_MARGIN.top,
        body: rows,
        theme: 'grid',
        styles: { font: 'helvetica', fontSize: 9 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 55 } },
        margin: PDF_TABLE_MARGIN,
      });

      const itemRows: RowInput[] = invoice.value.items.map((item, index) => [
        index + 1,
        item.description,
        item.quantity,
        formatAmount(item.unit_price),
        formatAmount(item.total),
      ]);
      const lastTableY = (pdf as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable
        ?.finalY;

      autoTable(pdf, {
        startY: lastTableY ? lastTableY + 10 : 110,
        head: [
          [
            t('invoice_show.table_number'),
            t('invoice_show.description'),
            t('invoice_show.quantity'),
            t('invoice_show.unit_price'),
            t('invoice_show.total'),
          ],
        ],
        body: itemRows.length
          ? itemRows
          : [[emptyValue, t('invoice_show.no_items'), emptyValue, emptyValue, emptyValue]],
        theme: 'striped',
        styles: { font: 'helvetica', fontSize: 8 },
        margin: PDF_TABLE_MARGIN,
      });

      addPdfPageBranding(pdf, branding);
      pdf.save(getInvoicePdfFileName());
    } finally {
      exportingPdf.value = false;
    }
  };

  const exportInvoice = async () => {
    if (!invoiceId.value || exportingInvoice.value) return;

    exportingInvoice.value = true;

    try {
      const result = await invoiceController.exportInvoice(invoiceId.value);

      if (result instanceof DataSuccess) {
        dialogManager.toastSuccess(t('invoice_show.export_success'));
        await fetchInvoice();
      }
    } finally {
      exportingInvoice.value = false;
    }
  };

  const downloadPaymentReceipt = async (payment: InvoicePaymentModel) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const branding = await createPdfBranding(t('invoice_show.receipt_title'));

    autoTable(pdf, {
      startY: PDF_TABLE_MARGIN.top,
      body: [
        [t('invoice.invoice_number'), valueOrEmpty(invoice.value?.invoice_number)],
        [t('invoice_show.reference_no'), payment.id ? `#${payment.id}` : emptyValue],
        [
          t('invoice_payment.payment_amount'),
          `${formatAmount(payment.payment_amount)} ${currency.value}`,
        ],
        [t('invoice_payment.payment_date'), formatDateTime(payment.payment_date)],
        [t('invoice_payment.payment_method'), paymentMethodLabel(payment.payment_method)],
        [t('invoice_payment.notes'), valueOrEmpty(payment.notes)],
      ],
      theme: 'grid',
      styles: { font: 'helvetica', fontSize: 9 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
      margin: PDF_TABLE_MARGIN,
    });

    addPdfPageBranding(pdf, branding);
    pdf.save(`payment-${payment.id ?? invoiceId.value}.pdf`);
  };

  onMounted(() => {
    void refreshInvoice();
  });
</script>

<template>
  <DataStatusBuilder :controller="invoiceState" :on-retry="refreshInvoice">
    <template #success="{ data }">
      <div v-if="data" class="invoice-show-page" :style="paletteStyle">
        <InvoiceShowHeader
          :invoice="data as InvoiceShowModel"
          :status-label="statusLabel"
          :status-class="statusClass"
          :created-at-label="createdAtLabel"
          :created-by-label="createdByName"
          :index-path="indexPath"
          :edit-path="editPath"
          :exporting-pdf="exportingPdf"
          :exporting-invoice="exportingInvoice"
          @download="downloadInvoicePdf"
          @export-invoice="exportInvoice"
          @share="shareInvoice"
        >
          <InvoiceStatusOverview
            :invoice-date="invoiceDateLabel"
            :due-date="dueDateLabel"
            :status-label="statusLabel"
            :export-status-label="exportStatusLabel"
            :currency="currency"
          />
        </InvoiceShowHeader>

        <div class="invoice-show-layout">
          <main class="invoice-show-main">
            <!-- <InvoiceItemsCard
              :items="(data as InvoiceShowModel).items"
              :currency="currency"
              :format-amount="formatAmount"
            /> -->
            <InvoiceClientProjectCard
              :client-name="clientName"
              :client-phone="clientPhone"
              :client-email="clientEmail"
              :project-name="projectTitle"
              :organization-name="organizationName"
              :created-by-name="createdByName"
            />
            <InvoicePaymentsCard
              :payments="payments"
              :currency="currency"
              :format-amount="formatAmount"
              :format-date-time="formatDateTime"
              :payment-method-label="paymentMethodLabel"
              :invoice="data as InvoiceShowModel"
              @add="openPaymentDialog()"
              @download="downloadPaymentReceipt"
            />
            <InvoiceChildrenCard
              :children="(data as InvoiceShowModel).children"
              :currency="currency"
              :format-amount="formatAmount"
              @pay="openPaymentDialog"
            />
          </main>

          <aside class="invoice-show-side">
            <InvoicePaymentSummary
              :total-amount="totalAmount"
              :paid-amount="paidAmount"
              :remaining-amount="remainingAmount"
              :currency="currency"
              :is-paid="isInvoicePaid"
              :format-amount="formatAmount"
            />
            <InvoiceTimelineCard
              :invoice="data as InvoiceShowModel"
              :payments="payments"
              :is-paid="isInvoicePaid"
              :format-date-time="formatDateTime"
              :payment-method-label="paymentMethodLabel"
            />
            <InvoiceNotesCard :notes="(data as InvoiceShowModel).notes" />
          </aside>
        </div>

        <AddInvoicePaymentDialog
          :visible="paymentDialogOpen"
          :invoice-id="paymentInvoiceId"
          :remaining-amount="paymentRemainingAmount"
          :loading="creatingPayment"
          @close="paymentDialogOpen = false"
          @submit="handleAddPayment"
        />
      </div>
    </template>

    <template #loader>
      <InvoiceShowSkeleton />
    </template>

    <template #initial>
      <InvoiceShowSkeleton />
    </template>

    <template #empty>
      <div class="invoice-show-error">
        <p>{{ $t('invoice_show.empty') }}</p>
      </div>
    </template>

    <template #failed="{ retry }">
      <div class="invoice-show-error">
        <p>{{ $t('invoice_show.load_failed') }}</p>
        <button class="invoice-show-btn invoice-show-btn--primary" type="button" @click="retry">
          {{ $t('try_again') }}
        </button>
      </div>
    </template>
  </DataStatusBuilder>
</template>
