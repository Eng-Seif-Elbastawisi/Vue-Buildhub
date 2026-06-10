<script setup lang="ts">
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ExportIcon from '@/shared/icons/ExportIcon.vue'

const exportPDF = async () => {
  const tableElement = document.querySelector(".table-responsive");

  if (!tableElement) {
    console.error("Table element not found.");
    return;
  }

  try {
    // Capture the table as an image
    const canvas = await html2canvas(tableElement as HTMLElement, {
      scale: 2, // Higher scale for better resolution
    });

    const imgData = canvas.toDataURL("image/png");

    // Initialize jsPDF
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add image to PDF
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Save the PDF
    pdf.save("table.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
</script>

<template>
  <button class="btn btn-secondary ms-2" type="button" @click="exportPDF">
    Export PDF
    <ExportIcon />
  </button>
</template>

<style scoped></style>
