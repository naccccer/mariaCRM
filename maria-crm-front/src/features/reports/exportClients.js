// این فایل منطق تولید و دانلود گزارش Excel/PDF مشتریان را نگه می‌دارد.

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import vazirmatnFontUrl from '../../assets/fonts/Vazirmatn-Regular.ttf?url';
import { DEFAULT_CLIENT_REPORT_FIELD_IDS, resolveClientReportFields } from './reportFields';

let vazirmatnBinaryPromise;

function buildTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');

  return `${year}${month}${day}-${hour}${minute}`;
}

function resolveFieldsOrDefault(fieldIds) {
  const safeFieldIds = fieldIds?.length ? fieldIds : DEFAULT_CLIENT_REPORT_FIELD_IDS;
  const resolvedFields = resolveClientReportFields(safeFieldIds);

  if (resolvedFields.length === 0) {
    return resolveClientReportFields(DEFAULT_CLIENT_REPORT_FIELD_IDS);
  }

  return resolvedFields;
}

function arrayBufferToBinaryString(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;
  let binaryString = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binaryString += String.fromCharCode(...chunk);
  }

  return binaryString;
}

function getReportGeneratedAt() {
  return new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date());
}

function getColumnStyles(fields) {
  return fields.reduce((styles, field, index) => {
    if (field.id === 'phone') {
      styles[index] = { halign: 'center', cellWidth: 98 };
      return styles;
    }

    if (field.id === 'status') {
      styles[index] = { halign: 'center', cellWidth: 74 };
      return styles;
    }

    if (field.id === 'date') {
      styles[index] = { halign: 'center', cellWidth: 84 };
      return styles;
    }

    styles[index] = { halign: 'right', minCellWidth: 96 };
    return styles;
  }, {});
}

async function getVazirmatnBinary() {
  if (!vazirmatnBinaryPromise) {
    vazirmatnBinaryPromise = fetch(vazirmatnFontUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('لود فونت فارسی برای PDF ناموفق بود.');
        }

        return response.arrayBuffer();
      })
      .then((fontBuffer) => arrayBufferToBinaryString(fontBuffer));
  }

  return vazirmatnBinaryPromise;
}

async function setupPersianPdf(doc) {
  const fontBinary = await getVazirmatnBinary();

  doc.addFileToVFS('Vazirmatn-Regular.ttf', fontBinary);
  doc.addFont('Vazirmatn-Regular.ttf', 'Vazirmatn', 'normal');
  doc.setFont('Vazirmatn', 'normal');
}

/**
 * وظیفه: تبدیل داده مشتریان به فایل اکسل و شروع دانلود.
 */
export function exportClientsToExcel(clients, fieldIds = DEFAULT_CLIENT_REPORT_FIELD_IDS) {
  const fields = resolveFieldsOrDefault(fieldIds);
  const rows = clients.map((client) => {
    const row = {};

    fields.forEach((field) => {
      row[field.label] = field.getValue(client) ?? '';
    });

    return row;
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');
  XLSX.writeFile(workbook, `clients-report-${buildTimestamp()}.xlsx`);
}

/**
 * وظیفه: تبدیل داده مشتریان به فایل PDF و شروع دانلود.
 */
export async function exportClientsToPdf(clients, fieldIds = DEFAULT_CLIENT_REPORT_FIELD_IDS) {
  const fields = resolveFieldsOrDefault(fieldIds);
  // برای نمایش RTL واقعی در جدول، ترتیب ستون‌ها را معکوس می‌کنیم تا ستون اول از راست «نام» باشد.
  const rtlOrderedFields = [...fields].reverse();
  const isLandscape = fields.length > 4;

  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  await setupPersianPdf(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const generatedAt = getReportGeneratedAt();

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('گزارش مشتریان', pageWidth - 24, 34, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`تاریخ ایجاد: ${generatedAt}`, pageWidth - 24, 52, { align: 'right' });
  doc.text(`تعداد رکوردها: ${clients.length}`, pageWidth - 24, 68, { align: 'right' });

  const tableHead = [rtlOrderedFields.map((field) => field.label)];
  const tableBody = clients.map((client) => rtlOrderedFields.map((field) => String(field.getValue(client) ?? '')));
  const columnStyles = getColumnStyles(rtlOrderedFields);

  autoTable(doc, {
    startY: 80,
    head: tableHead,
    body: tableBody,
    theme: 'grid',
    styles: {
      font: 'Vazirmatn',
      fontSize: 10,
      cellPadding: 7,
      halign: 'right',
      valign: 'middle',
      textColor: [31, 41, 55],
      lineColor: [226, 232, 240],
      lineWidth: 0.6,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [0, 96, 57],
      textColor: 255,
      fontStyle: 'normal',
      halign: 'right',
      valign: 'middle',
      lineColor: [0, 96, 57],
      lineWidth: 0.8,
      cellPadding: 8,
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles,
    margin: {
      left: 24,
      right: 24,
      bottom: 20,
    },
    didDrawPage: (data) => {
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`صفحه ${data.pageNumber}`, pageWidth - 24, pageHeight - 8, { align: 'right' });
    },
  });

  doc.save(`clients-report-${buildTimestamp()}.pdf`);
}
