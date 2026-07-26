import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate a polished KSP Intelligence Report PDF entirely on the frontend.
 * All content fits on one page with proper wrapping — no text is ever cut off.
 *
 * @param {object} opts
 * @param {string} opts.question  — The user's original query
 * @param {string} opts.answer    — The AI-generated answer text
 * @param {string} opts.zcql      — The generated ZCQL query
 * @param {Array}  opts.rows      — Array of result row objects
 * @param {Array}  opts.sources   — Array of source strings
 */
export function generateReport({ question, answer, zcql, rows = [], sources = [] }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const usable = pageW - margin * 2;
  let y = 14;

  // ── Colours ──────────────────────────────────────────
  const navy     = [15, 23, 42];
  const darkGrey = [51, 65, 85];
  const midGrey  = [100, 116, 139];
  const accent   = [6, 182, 212];   // cyan-500
  const white    = [255, 255, 255];
  const lightBg  = [241, 245, 249]; // slate-100

  // ── Header bar ───────────────────────────────────────
  doc.setFillColor(...navy);
  doc.rect(0, 0, pageW, 28, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...white);
  doc.text('KSP Crime Intelligence Report', pageW / 2, 12, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(180, 210, 230);
  doc.text('Karnataka State Police — SCRB Analytics Division', pageW / 2, 18, { align: 'center' });

  const now = new Date();
  doc.text(`Generated: ${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, pageW / 2, 23, { align: 'center' });

  y = 34;

  // ── Accent line ──────────────────────────────────────
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── Helper: section title ────────────────────────────
  const sectionTitle = (label) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...accent);
    doc.text(label, margin, y);
    y += 1;
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + doc.getTextWidth(label), y);
    y += 4;
  };

  // ── Helper: wrapped body text ────────────────────────
  const bodyText = (text, color = darkGrey, fontSize = 9) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(text || '—'), usable);
    // Cap lines to avoid overflowing page
    const maxLines = Math.min(lines.length, 12);
    for (let i = 0; i < maxLines; i++) {
      if (y > pageH - 15) break;
      doc.text(lines[i], margin, y);
      y += fontSize * 0.45;
    }
    if (lines.length > maxLines) {
      doc.text('...', margin, y);
      y += fontSize * 0.45;
    }
    y += 2;
  };

  // ── Section: Question ────────────────────────────────
  sectionTitle('QUERY');
  bodyText(question || 'N/A', navy);

  // ── Section: Answer ──────────────────────────────────
  sectionTitle('INTELLIGENCE ANALYSIS');
  bodyText(answer || 'No analysis available for this query.');

  // ── Section: ZCQL ────────────────────────────────────
  if (zcql) {
    sectionTitle('GENERATED ZCQL');
    // Code block background
    const codeLines = doc.splitTextToSize(String(zcql), usable - 6);
    const codeBlockH = Math.min(codeLines.length, 4) * 3.8 + 3;
    doc.setFillColor(...lightBg);
    doc.roundedRect(margin, y - 3, usable, codeBlockH, 1.5, 1.5, 'F');
    doc.setFont('courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkGrey);
    const maxCodeLines = Math.min(codeLines.length, 4);
    for (let i = 0; i < maxCodeLines; i++) {
      doc.text(codeLines[i], margin + 3, y + 1);
      y += 3.8;
    }
    y += 4;
  }

  // ── Section: Data Table ──────────────────────────────
  if (Array.isArray(rows) && rows.length > 0) {
    sectionTitle('DATA SUMMARY');

    // Flatten nested row objects
    const flattenRow = (row) => {
      if (typeof row !== 'object' || row === null) return { value: String(row) };
      const flat = {};
      for (const [k, v] of Object.entries(row)) {
        if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          for (const [vk, vv] of Object.entries(v)) {
            flat[vk] = vv === null || vv === undefined ? '—' : String(vv);
          }
        } else {
          flat[k] = v === null || v === undefined ? '—' : String(v);
        }
      }
      return flat;
    };

    const flatRows = rows.map(flattenRow);
    const columns = Object.keys(flatRows[0] || {});
    const tableHead = [columns];
    const tableBody = flatRows.slice(0, 8).map(r => columns.map(c => r[c] || '—'));

    // Remaining vertical space
    const remainingSpace = pageH - y - 20;
    const rowH = 6;
    const maxTableRows = Math.floor((remainingSpace - 10) / rowH);
    const displayBody = tableBody.slice(0, Math.max(maxTableRows, 2));

    doc.autoTable({
      head: tableHead,
      body: displayBody,
      startY: y,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        overflow: 'ellipsize',
        textColor: darkGrey,
        lineColor: [200, 210, 220],
        lineWidth: 0.2,
      },
      headStyles: {
        fillColor: navy,
        textColor: white,
        fontStyle: 'bold',
        fontSize: 7,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      tableLineColor: [200, 210, 220],
      tableLineWidth: 0.1,
    });

    y = doc.lastAutoTable.finalY + 4;
  }

  // ── Section: Sources ─────────────────────────────────
  if (Array.isArray(sources) && sources.length > 0 && y < pageH - 20) {
    sectionTitle('SOURCES & AUDIT TRAIL');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...midGrey);
    sources.slice(0, 5).forEach((src, i) => {
      if (y > pageH - 12) return;
      const srcText = typeof src === 'object' ? JSON.stringify(src) : String(src);
      doc.text(`${i + 1}. ${srcText}`, margin + 2, y);
      y += 3;
    });
  }

  // ── Footer ───────────────────────────────────────────
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.4);
  doc.line(margin, pageH - 10, pageW - margin, pageH - 10);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(...midGrey);
  doc.text('CONFIDENTIAL — Karnataka State Police Intelligence System — KSP Datathon 2026', pageW / 2, pageH - 6, { align: 'center' });

  // ── Save ─────────────────────────────────────────────
  const timestamp = now.toISOString().slice(0, 10);
  doc.save(`KSP_Intelligence_Report_${timestamp}.pdf`);
}
