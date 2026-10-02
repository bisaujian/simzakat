import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

/**
 * Print & Export Service for SimZakat
 * Provides rock-solid printing, PDF generation, and thermal receipt support
 * designed to work reliably across browser sandboxes, iframes, mobile devices, and desktop printers.
 */

/**
 * Helper to extract all loaded styles and fonts from the parent document
 */
function extractAppStyles(): string {
  if (typeof document === 'undefined') return '';
  let styles = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  `;

  try {
    const nodes = document.querySelectorAll('style, link[rel="stylesheet"]');
    nodes.forEach((node) => {
      styles += node.outerHTML + '\n';
    });
  } catch (err) {
    console.warn('Could not extract runtime stylesheets:', err);
  }

  return styles;
}

export interface PrintServiceOptions {
  isThermal?: boolean;
  isCompact?: boolean;
  thermalWidth?: '58mm' | '80mm';
}

/**
 * Generates an entirely self-contained HTML page with complete embedded styling,
 * Google fonts, and rock-solid print formatting identical to preview and PDF.
 */
export function generatePrintableHtml(
  contentHtml: string, 
  title: string,
  options?: PrintServiceOptions
): string {
  const isThermal = options?.isThermal || false;
  const isCompact = options?.isCompact || false;
  const thermalWidth = options?.thermalWidth || '58mm';
  const runtimeStyles = extractAppStyles();

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${runtimeStyles}
  <style>
    @page {
      size: ${isThermal ? (thermalWidth === '80mm' ? '80mm auto' : '58mm auto') : 'A4 portrait'};
      margin: ${isThermal ? '0mm' : isCompact ? '6mm 8mm' : '10mm 12mm'};
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      background: ${isThermal ? '#ffffff' : '#f1f5f9'};
      color: ${isThermal ? '#000000' : '#0f172a'};
      margin: 0;
      padding: 0;
      font-family: ${isThermal ? 'monospace, "Courier New", Courier, ui-monospace, monospace' : '\'Plus Jakarta Sans\', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'};
      font-size: ${isThermal ? (thermalWidth === '58mm' ? '12px' : '13px') : isCompact ? '12px' : '13px'};
      line-height: ${isThermal ? '1.3' : isCompact ? '1.35' : '1.5'};
      -webkit-font-smoothing: antialiased;
    }
    .font-arabic {
      font-family: 'Amiri', 'Traditional Arabic', serif !important;
      direction: rtl;
      unicode-bidi: embed;
    }
    
    /* Document page wrapper for preview & print */
    .print-wrapper {
      padding: ${isThermal ? '0' : '24px 16px'};
      display: flex;
      justify-content: center;
      min-height: ${isThermal ? 'auto' : '100vh'};
      background: ${isThermal ? '#ffffff' : '#f1f5f9'};
    }
    .print-container {
      width: 100%;
      max-width: ${isThermal ? (thermalWidth === '58mm' ? '54mm' : '76mm') : isCompact ? '720px' : '840px'};
      background: #ffffff;
      padding: ${isThermal ? '2mm 1mm' : isCompact ? '20px' : '36px'};
      border-radius: ${isThermal ? '0' : '16px'};
      box-shadow: ${isThermal ? 'none' : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'};
      border: ${isThermal ? 'none' : '1px solid #e2e8f0'};
      color: ${isThermal ? '#000000' : 'inherit'};
    }

    /* Core grid and layout reinforcements */
    .grid { display: grid !important; }
    .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
    .grid-cols-2, .md\\:grid-cols-2, .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    .grid-cols-4, .sm\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
    .grid-cols-5, .sm\\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)) !important; }
    .gap-2 { gap: 8px !important; }
    .gap-3 { gap: 12px !important; }
    .gap-4 { gap: 16px !important; }
    .gap-6 { gap: 24px !important; }
    .gap-8 { gap: 32px !important; }

    /* Flex utilities */
    .flex { display: flex !important; }
    .justify-between { justify-content: space-between !important; }
    .items-center { align-items: center !important; }
    .items-start { align-items: flex-start !important; }
    .text-center { text-align: center !important; }
    .text-right { text-align: right !important; }
    .text-left { text-align: left !important; }

    /* Typography */
    .font-bold { font-weight: 700 !important; }
    .font-black { font-weight: 900 !important; }
    .font-semibold { font-weight: 600 !important; }
    .font-medium { font-weight: 500 !important; }
    .uppercase { text-transform: uppercase !important; }
    .underline { text-decoration: underline !important; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important; }

    /* Tables */
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      text-align: left;
    }
    th, td {
      border-color: #cbd5e1;
    }

    /* Colors and backgrounds */
    .bg-white { background-color: #ffffff !important; }
    .bg-slate-50 { background-color: #f8fafc !important; }
    .bg-slate-100 { background-color: #f1f5f9 !important; }
    .bg-amber-50 { background-color: #fffbeb !important; }
    .bg-emerald-50 { background-color: #ecfdf5 !important; }
    .border { border: 1px solid #e2e8f0 !important; }
    .border-b { border-bottom: 1px solid #e2e8f0 !important; }
    .border-b-2 { border-bottom: 2px solid #0f172a !important; }
    .border-t { border-top: 1px solid #e2e8f0 !important; }
    .border-slate-100 { border-color: #f1f5f9 !important; }
    .border-slate-200 { border-color: #e2e8f0 !important; }
    .border-slate-300 { border-color: #cbd5e1 !important; }
    .border-slate-900 { border-color: #0f172a !important; }
    .border-amber-200 { border-color: #fde68a !important; }
    .border-emerald-200 { border-color: #a7f3d0 !important; }
    
    .text-slate-500 { color: #64748b !important; }
    .text-slate-600 { color: #475569 !important; }
    .text-slate-700 { color: #334155 !important; }
    .text-slate-800 { color: #1e293b !important; }
    .text-slate-900 { color: #0f172a !important; }
    .text-amber-800 { color: #92400e !important; }
    .text-amber-900 { color: #78350f !important; }
    .text-amber-950 { color: #451a03 !important; }
    .text-emerald-700 { color: #047857 !important; }
    .text-emerald-800 { color: #065f46 !important; }
    .text-emerald-900 { color: #064e3b !important; }
    .text-emerald-950 { color: #022c22 !important; }

    /* Sticky toolbar in standalone tab */
    .print-toolbar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-bottom: 1px solid #334155;
    }
    .print-btn {
      background: #059669;
      color: #ffffff;
      border: none;
      padding: 9px 18px;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    .print-btn:hover {
      background: #10b981;
    }
    .close-btn {
      background: #334155;
      color: #ffffff;
      border: none;
      padding: 9px 16px;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      font-size: 13px;
      margin-left: 10px;
    }
    .close-btn:hover {
      background: #475569;
    }

    /* Print media overrides */
    @media print {
      html, body {
        background: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }
      .no-print, .print-toolbar {
        display: none !important;
      }
      .print-wrapper {
        padding: 0 !important;
        margin: 0 !important;
        display: block !important;
        width: 100% !important;
        background: #ffffff !important;
      }
      .print-container {
        max-width: 100% !important;
        width: 100% !important;
        margin: 0 auto !important;
        padding: ${isThermal ? '1.5mm 1mm' : '0'} !important;
        box-shadow: none !important;
        border: none !important;
        color: #000000 !important;
      }
      tr, .avoid-break {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      ${isThermal ? `
      * {
        color: #000000 !important;
        border-color: #000000 !important;
        box-shadow: none !important;
        -webkit-print-color-adjust: exact !important;
      }
      .thermal-receipt-root {
        width: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }
      ` : ''}
    }
  </style>
</head>
<body>
  <div class="print-toolbar no-print">
    <div style="font-weight: 700; font-size: 14px; display: flex; items-center; gap: 8px;">
      <span>📄</span>
      <span>${title}</span>
    </div>
    <div>
      <button class="print-btn" onclick="window.print()">🖨️ Cetak Dokumen (Print / Simpan PDF)</button>
      <button class="close-btn" onclick="window.close()">Tutup</button>
    </div>
  </div>

  <div class="print-wrapper">
    <div class="print-container">
      ${contentHtml}
    </div>
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          window.focus();
          window.print();
        } catch (e) {
          console.log('Dialog print peramban siap digunakan via tombol di atas.', e);
        }
      }, 500);
    });
  </script>
</body>
</html>`;
}

/**
 * Opens the document in a dedicated new tab/window for printing.
 * This guarantees the native browser print dialog is NEVER blocked by iframe sandboxes.
 */
export function openPrintTab(
  elementId: string, 
  title: string, 
  options?: PrintServiceOptions
): boolean {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return false;
  }

  try {
    const fullHtml = generatePrintableHtml(element.innerHTML, title, options);
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    // Create link with target="_blank" and click it
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Revoke URL after reasonable time
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);

    return true;
  } catch (err) {
    console.error('Failed to open print tab:', err);
    return false;
  }
}

/**
 * Exports any DOM element to a crisp, high-resolution PDF file and initiates download.
 */
export async function exportToPdf(
  elementId: string, 
  filename: string,
  options?: PrintServiceOptions & { title?: string }
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found for PDF export`);
    return false;
  }

  try {
    // Generate high-DPI canvas with oklch support and fallback color sanitization
    const canvas = await html2canvas(element, {
      scale: 2.5, // 2.5x scale for sharp text and crisp Arabic font
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        try {
          // Normalize any oklch color values in elements
          const allEls = clonedDoc.querySelectorAll<HTMLElement>('*');
          allEls.forEach((el) => {
            const computed = window.getComputedStyle(el);
            // Replace any oklch in inline styles
            ['color', 'backgroundColor', 'borderColor', 'outlineColor', 'fill', 'stroke'].forEach((prop) => {
              const val = el.style.getPropertyValue(prop);
              if (val && val.includes('oklch')) {
                // If computed style has rgb/rgba, use it; otherwise fallback
                const compVal = computed.getPropertyValue(prop);
                if (compVal && !compVal.includes('oklch')) {
                  el.style.setProperty(prop, compVal);
                } else {
                  el.style.setProperty(prop, '#0f172a');
                }
              }
            });
          });
        } catch (cloneErr) {
          // Non-blocking sanitization
          console.warn('onclone style normalization notice:', cloneErr);
        }
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const isThermal = options?.isThermal || false;
    const isCompact = options?.isCompact || false;
    const thermalWidth = options?.thermalWidth || '58mm';

    if (isThermal) {
      // Thermal 58mm or 80mm roll format
      const pdfWidth = thermalWidth === '80mm' ? 80 : 58;
      const marginX = thermalWidth === '80mm' ? 3 : 2;
      const printableWidth = pdfWidth - marginX * 2;
      const printableHeight = (canvas.height * printableWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, Math.max(70, printableHeight + 8)],
      });
      pdf.addImage(imgData, 'PNG', marginX, 3, printableWidth, printableHeight);
      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    } else {
      // Standard or Compact A4 format
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = isCompact ? 8 : 10;
      const printableWidth = pageWidth - margin * 2;
      const printableHeight = (canvas.height * printableWidth) / canvas.width;

      if (printableHeight > pageHeight - margin * 2) {
        // Multi-page or scale-to-fit
        const scaleFactor = (pageHeight - margin * 2) / printableHeight;
        pdf.addImage(
          imgData, 
          'PNG', 
          margin + (printableWidth - printableWidth * scaleFactor) / 2, 
          margin, 
          printableWidth * scaleFactor, 
          (pageHeight - margin * 2)
        );
      } else {
        pdf.addImage(imgData, 'PNG', margin, margin, printableWidth, printableHeight);
      }

      pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
    }

    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    // Graceful fallback: Open dedicated print tab where user can Save as PDF natively
    try {
      openPrintTab(elementId, filename.replace('.pdf', ''), options);
    } catch {
      // ignore
    }
    return false;
  }
}

/**
 * Universal print trigger:
 * Prints exclusively the target element with full styles and Google Fonts via a hidden print iframe.
 * If the iframe print is prevented by sandbox policy, smoothly falls back to openPrintTab.
 */
export function printElementById(
  elementId: string, 
  documentTitle: string,
  options?: PrintServiceOptions
): boolean {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found for printing`);
    return false;
  }

  try {
    const htmlContent = generatePrintableHtml(element.innerHTML, documentTitle, options);
    
    let iframe = document.getElementById('simzakat-print-frame') as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'simzakat-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc || !iframe.contentWindow) {
      throw new Error('Cannot access print iframe document');
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      try {
        iframe?.contentWindow?.focus();
        iframe?.contentWindow?.print();
      } catch (printErr) {
        console.warn('Iframe print blocked by sandbox, opening dedicated print tab:', printErr);
        openPrintTab(elementId, documentTitle, options);
      }
    }, 450);

    return true;
  } catch (err) {
    console.warn('Direct print failed, opening dedicated print tab:', err);
    return openPrintTab(elementId, documentTitle, options);
  }
}

/**
 * Downloads a self-contained HTML file for offline printing.
 */
export function downloadHtmlFile(
  elementId: string, 
  filename: string, 
  title: string,
  options?: PrintServiceOptions
): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found for download`);
    return;
  }

  const fullHtml = generatePrintableHtml(element.innerHTML, title, options);
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
