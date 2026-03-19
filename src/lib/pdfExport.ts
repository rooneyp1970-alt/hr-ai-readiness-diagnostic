import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AssessmentState, DraftScore } from './types';
import { CANONICAL_QUESTIONS, CATEGORIES, RATING_LABELS, CATEGORY_DESCRIPTIONS } from './questions';
import { getMaturityBand } from './scoring';
import { generateImplications } from './implications';

// Shore GTM brand colors (from Brand Guidelines)
const NAVY = [13, 34, 56] as const;         // #0D2238 Sound Navy
const SLATE = [65, 87, 106] as const;       // #41576A Breakwater Slate
const TEAL = [109, 183, 174] as const;      // #6DB7AE Signal Teal
const TIDEFOAM = [183, 221, 214] as const;  // #B7DDD6 Tidefoam
const MIST = [238, 243, 245] as const;      // #EEF3F5 Horizon Mist
const CHARCOAL = [30, 43, 54] as const;     // #1E2B36 Current Charcoal
const CORAL = [212, 119, 91] as const;      // #D4775B Coral Signal
const WHITE = [255, 255, 255] as const;
const GRAY_600 = [75, 85, 99] as const;

function addHeader(doc: jsPDF) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setFillColor(...TEAL);
  doc.rect(0, 28, pageW, 1.5, 'F');

  doc.setTextColor(...WHITE);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Shore GTM', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('HR AI Readiness and Opportunity Diagnostic', 14, 20);

  const dateStr = new Date().toLocaleDateString(undefined, { dateStyle: 'long' });
  doc.setFontSize(8);
  doc.text(dateStr, pageW - 14, 20, { align: 'right' });
}

function addFooter(doc: jsPDF, pageNum: number) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...MIST);
  doc.rect(0, pageH - 12, pageW, 12, 'F');
  doc.setTextColor(...NAVY);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Shore GTM — HR AI Readiness and Opportunity Diagnostic', 14, pageH - 4);
  doc.text(`Page ${pageNum}`, pageW - 14, pageH - 4, { align: 'right' });
}

function addNewPage(doc: jsPDF): number {
  doc.addPage();
  addHeader(doc);
  return 36;
}

function checkPageBreak(doc: jsPDF, y: number, needed: number, pageNum: { val: number }): number {
  const pageH = doc.internal.pageSize.getHeight();
  if (y + needed > pageH - 20) {
    addFooter(doc, pageNum.val);
    pageNum.val++;
    return addNewPage(doc);
  }
  return y;
}

function bandColor(score: number): readonly [number, number, number] {
  if (score <= 25) return CORAL;
  if (score <= 50) return [180, 140, 60]; // amber
  if (score <= 75) return TEAL;
  return [40, 120, 80]; // green
}

export function generatePDF(state: AssessmentState, draftScore: DraftScore): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;
  const pageNum = { val: 1 };

  addHeader(doc);
  let y = 36;

  // ─── Title ────────────────────────────────────────────────────────
  doc.setTextColor(...NAVY);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('HR AI Readiness and Opportunity Diagnostic', pageW / 2, y + 4, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SLATE);
  doc.text('Executive Assessment Report', pageW / 2, y + 11, { align: 'center' });
  y += 20;

  // ─── Score Summary ────────────────────────────────────────────────
  const overall = state.finalSnapshot?.overallScore ?? draftScore.overall;

  // Overall score box
  doc.setFillColor(...MIST);
  doc.roundedRect(margin, y, contentW, 26, 3, 3, 'F');
  doc.setDrawColor(...TEAL);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentW, 26, 3, 3, 'S');
  doc.setTextColor(...NAVY);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(`${overall}`, pageW / 2, y + 14, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_600);
  doc.text(`Overall HR AI Readiness Score (out of 100) — ${getMaturityBand(overall)}`, pageW / 2, y + 22, { align: 'center' });
  y += 32;

  // Three summary tiles
  const tileW = (contentW - 8) / 3;
  const tiles = [
    { label: 'Readiness', value: overall, color: bandColor(overall) },
    { label: 'Top Opportunity', value: Math.max(...draftScore.opportunityScores.map((o) => o.overallOpportunity)), color: TEAL },
    { label: 'Risk of Inaction', value: draftScore.riskOfInaction.overall, color: CORAL },
  ];

  tiles.forEach((tile, i) => {
    const tx = margin + i * (tileW + 4);
    doc.setFillColor(...(tile.color as [number, number, number]));
    doc.roundedRect(tx, y, tileW, 20, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`${tile.value}`, tx + tileW / 2, y + 10, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(tile.label, tx + tileW / 2, y + 16, { align: 'center' });
  });
  y += 26;

  // Completion
  doc.setTextColor(...GRAY_600);
  doc.setFontSize(7);
  doc.text(
    `${draftScore.answeredCount}/${draftScore.totalCount} questions answered | ${state.finalSnapshot ? 'Final' : 'Draft'} | ${new Date().toLocaleDateString()}`,
    pageW / 2, y, { align: 'center' }
  );
  y += 6;

  // ─── Category Scores Table ────────────────────────────────────────
  y = checkPageBreak(doc, y, 60, pageNum);
  doc.setFillColor(...NAVY);
  doc.rect(margin, y, contentW, 8, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Functional Scorecard', margin + 4, y + 5.5);
  y += 10;

  const scoreTableData = draftScore.categoryScores.map((cs) => {
    const opp = draftScore.opportunityScores.find((o) => o.category === cs.category);
    return [
      cs.category,
      `${cs.normalizedScore}`,
      cs.maturityBand,
      `${opp?.overallOpportunity ?? '-'}`,
      opp?.recommendedPace ?? '-',
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['HR Function', 'Readiness', 'Maturity Band', 'AI Opportunity', 'Recommended Pace']],
    body: scoreTableData,
    headStyles: {
      fillColor: [...SLATE] as [number, number, number],
      textColor: [...WHITE] as [number, number, number],
      fontSize: 7.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 51, 51],
      cellPadding: 2,
    },
    alternateRowStyles: { fillColor: [245, 248, 252] },
    columnStyles: {
      0: { cellWidth: 52 },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 28 },
      3: { cellWidth: 24, halign: 'center' },
      4: { cellWidth: 'auto' },
    },
    theme: 'grid',
    styles: { lineColor: [220, 220, 220], lineWidth: 0.2 },
  });

  y = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? y + 50;
  y += 8;

  // ─── Implications ─────────────────────────────────────────────────
  const impl = generateImplications(state, draftScore);

  // Executive Summary
  y = checkPageBreak(doc, y, 30, pageNum);
  doc.setFillColor(...TEAL);
  doc.rect(margin, y, contentW, 8, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin + 4, y + 5.5);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...CHARCOAL);
  const summaryLines = doc.splitTextToSize(impl.executiveSummary, contentW);
  y = checkPageBreak(doc, y, summaryLines.length * 4, pageNum);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 3.5 + 6;

  // Category Detail
  for (const ci of impl.categoryImplications) {
    y = checkPageBreak(doc, y, 40, pageNum);
    doc.setFillColor(...NAVY);
    doc.rect(margin, y, contentW, 7, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${ci.category} — ${ci.score}/100 (${ci.band})`, margin + 4, y + 5);
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...CHARCOAL);
    const narrativeLines = doc.splitTextToSize(ci.narrative, contentW);
    y = checkPageBreak(doc, y, narrativeLines.length * 3.5, pageNum);
    doc.text(narrativeLines, margin, y);
    y += narrativeLines.length * 3 + 3;

    // AI Opportunity
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEAL);
    doc.text('AI Opportunity:', margin, y);
    y += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...CHARCOAL);
    const oppLines = doc.splitTextToSize(ci.aiOpportunity, contentW);
    y = checkPageBreak(doc, y, oppLines.length * 3.5, pageNum);
    doc.text(oppLines, margin, y);
    y += oppLines.length * 3 + 4;
  }

  // ─── Risk of Inaction ─────────────────────────────────────────────
  y = checkPageBreak(doc, y, 25, pageNum);
  doc.setFillColor(...CORAL);
  doc.rect(margin, y, contentW, 8, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Risk of Inaction', margin + 4, y + 5.5);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...CHARCOAL);
  for (const block of impl.riskOfInactionNarrative) {
    const lines = doc.splitTextToSize(block, contentW);
    y = checkPageBreak(doc, y, lines.length * 4, pageNum);
    doc.text(lines, margin, y);
    y += lines.length * 3.5 + 4;
  }

  // ─── Prioritized Recommendations ──────────────────────────────────
  y = checkPageBreak(doc, y, 25, pageNum);
  doc.setFillColor(...NAVY);
  doc.rect(margin, y, contentW, 8, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Priority Recommendations', margin + 4, y + 5.5);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  impl.prioritizedRecommendations.forEach((rec, i) => {
    const text = `${i + 1}. ${rec}`;
    const lines = doc.splitTextToSize(text, contentW - 4);
    y = checkPageBreak(doc, y, lines.length * 4, pageNum);
    doc.setTextColor(...NAVY);
    doc.text(lines, margin + 2, y);
    y += lines.length * 3.5 + 3;
  });

  // ─── 30-60-90 Roadmap ─────────────────────────────────────────────
  y = checkPageBreak(doc, y, 25, pageNum);
  doc.setFillColor(...SLATE);
  doc.rect(margin, y, contentW, 8, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('30-60-90 Day Roadmap', margin + 4, y + 5.5);
  y += 12;

  for (const phase of impl.roadmap) {
    y = checkPageBreak(doc, y, 20, pageNum);
    doc.setTextColor(...NAVY);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${phase.label} — ${phase.timeframe}`, margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...CHARCOAL);
    for (const action of phase.actions) {
      const lines = doc.splitTextToSize(`• ${action}`, contentW - 6);
      y = checkPageBreak(doc, y, lines.length * 3.5, pageNum);
      doc.text(lines, margin + 3, y);
      y += lines.length * 3 + 2;
    }
    y += 3;
  }

  // ─── Immediate Next Steps ─────────────────────────────────────────
  y = checkPageBreak(doc, y, 25, pageNum);
  doc.setFillColor(...NAVY);
  doc.rect(margin, y, contentW, 8, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Immediate Next Steps', margin + 4, y + 5.5);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  impl.immediateNextSteps.forEach((step, i) => {
    const text = `${i + 1}. ${step}`;
    const lines = doc.splitTextToSize(text, contentW - 4);
    y = checkPageBreak(doc, y, lines.length * 4, pageNum);
    doc.setTextColor(...NAVY);
    doc.text(lines, margin + 2, y);
    y += lines.length * 3.5 + 3;
  });

  // Final footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i);
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Shore-GTM-HR-AI-Readiness-Diagnostic-${dateStr}.pdf`);
}
