import QRCode from 'qrcode';
import { encryptEntityId } from '@/lib/encryption';

export interface SummaryCard {
  label: string;
  value: string;
  subValue?: string;
}

export interface ReportSection {
  title?: string;
  type: 'text' | 'table' | 'kv-grid';
  content?: string | string[];
  columns?: string[];
  data?: any[][];
  kvPairs?: { label: string; value: string }[];
}

export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
  color?: [number, number, number];
}

export interface CategoryChartItem {
  label: string;
  count: number;
  color?: [number, number, number];
}

export interface GlossaryItem {
  term: string;
  definition: string;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface ReportHeaderOptions {
  title: string;
  subtitle?: string;
  author?: string;
  summaryData?: SummaryCard[];
  distributionData?: DistributionItem[];
  categoryData?: CategoryChartItem[];
  trendData?: TrendPoint[];
  statusChartTitle?: string;
  categoryChartTitle?: string;
  trendChartTitle?: string;
  glossaryItems?: GlossaryItem[];
  totalsRow?: string[];
  showAuditSignOff?: boolean;
  type?: 'property' | 'room' | 'booking' | 'inquiry' | 'review' | 'reservation' | 'general';
  reportId?: string;
  scopeTag?: 'Filtered View' | 'Complete History';
  includeSummary?: boolean;
  includeGlossary?: boolean;
  showQR?: boolean;
}

const PRIMARY_COLOR: [number, number, number] = [47, 125, 109]; // #2f7d6d
const SECONDARY_COLOR: [number, number, number] = [245, 250, 249];
const TEXT_DARK: [number, number, number] = [40, 40, 40];
const TEXT_MUTED: [number, number, number] = [120, 120, 120];

const getLogoBase64 = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };
    img.onerror = () => reject(new Error('Failed to load logo'));
    img.src = '/logo.png';
  });
};

const getBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://board-tau-rho.vercel.app';
};

const drawVerificationQR = async (doc: any, reportId: string, x: number, y: number, size: number = 20) => {
  try {
    const encryptedToken = encryptEntityId(reportId);
    const verifyUrl = `${getBaseUrl()}/verify/${encryptedToken}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      width: 100,
      color: {
        dark: '#2f7d6d',
        light: '#ffffff'
      }
    });
    doc.addImage(qrDataUrl, 'PNG', x, y, size, size);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(140);
    doc.text('SCAN TO VERIFY', x + size / 2, y + size + 3, { align: 'center' });
  } catch (err) {
    console.error('Failed to generate verification QR code:', err);
  }
};

const sanitizePdfText = (text: any): string => {
  if (text === null || text === undefined) return '';
  const str = typeof text === 'string' ? text : String(text);
  return str.replace(/₱/g, 'PHP ');
};

const addHeader = async (doc: any, options: ReportHeaderOptions) => {
  let hasLogo = false;
  try {
    const logoData = await getLogoBase64();
    doc.addImage(logoData, 'PNG', 14, 10, 12, 12);
    hasLogo = true;
  } catch (error) {
    // Graceful fallback if logo image unavailable
  }

  const reportId = options.reportId || `BTAU-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`;
  
  // Header Right: Report ID & Verification QR
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`REPORT ID: ${reportId}`, 196, 14, { align: 'right' });

  // Verification QR Stamp
  if (options.showQR !== false) {
    await drawVerificationQR(doc, reportId, 176, 17, 20);
  }

  // Header Left: Branding
  const brandX = hasLogo ? 28 : 14;
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('BoardTAU', brandX, 19);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_MUTED);
  doc.text('BoardTAU Housing & Property Platform', brandX, 24);

  // Document Title & Subtitle
  doc.setFontSize(18);
  doc.setTextColor(...TEXT_DARK);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, 14, 34);

  if (options.subtitle) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(options.subtitle, 14, 40);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(140);
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generated: ${dateStr} | Prepared By: ${options.author || 'BoardTAU Landlord Portal'}`, 14, 46);

  // Decorative Accent Line
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(0.8);
  doc.line(14, 50, 196, 50);
};

const drawSummaryCards = (doc: any, cards: SummaryCard[], startY: number) => {
  const cardCount = cards.length || 1;
  const totalAvailableWidth = 196 - 14;
  const cardGap = 4;
  const cardWidth = (totalAvailableWidth - (cardCount - 1) * cardGap) / cardCount;
  const cardHeight = 22;

  cards.forEach((card, index) => {
    const x = 14 + index * (cardWidth + cardGap);

    // Card background
    doc.setFillColor(...SECONDARY_COLOR);
    doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'F');

    // Accent line on left border
    doc.setDrawColor(...PRIMARY_COLOR);
    doc.setLineWidth(1.2);
    doc.line(x, startY, x, startY + cardHeight);

    // Labels & Values
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_MUTED);
    doc.text(sanitizePdfText(card.label).toUpperCase(), x + 4, startY + 6);

    const valText = sanitizePdfText(card.value);
    const valFontSize = valText.length > 16 ? 8.5 : 11;
    doc.setFontSize(valFontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(valText, x + 4, startY + 14);

    if (card.subValue) {
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(130);
      doc.text(sanitizePdfText(card.subValue), x + 4, startY + 19);
    }
  });

  return startY + cardHeight + 8;
};

const drawVectorDonutChart = (
  doc: any,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  slices: { label: string; count: number; percentage: number; color: [number, number, number] }[]
) => {
  const totalCount = slices.reduce((sum, s) => sum + s.count, 0);
  const totalPct = slices.reduce((sum, s) => sum + (s.percentage || 0), 0) || 100;
  let startAngle = -Math.PI / 2; // Start at 12 o'clock

  slices.forEach((slice) => {
    if (slice.percentage <= 0) return;
    const sweepAngle = (slice.percentage / totalPct) * (2 * Math.PI);
    const endAngle = startAngle + sweepAngle;

    // Draw arc sector using fine filled triangles
    const stepSize = 0.035; // ~2 deg per step
    doc.setFillColor(...slice.color);

    for (let a = startAngle; a < endAngle; a += stepSize) {
      const currentStep = Math.min(stepSize, endAngle - a);
      const nextA = a + currentStep;

      const p1x = cx + outerRadius * Math.cos(a);
      const p1y = cy + outerRadius * Math.sin(a);
      const p2x = cx + outerRadius * Math.cos(nextA);
      const p2y = cy + outerRadius * Math.sin(nextA);

      doc.triangle(cx, cy, p1x, p1y, p2x, p2y, 'F');
    }

    startAngle = endAngle;
  });

  // Inner cutout circle for donut hole
  doc.setFillColor(248, 252, 251);
  doc.circle(cx, cy, innerRadius, 'F');
  doc.setDrawColor(225, 235, 232);
  doc.setLineWidth(0.4);
  doc.circle(cx, cy, innerRadius, 'S');

  // Center text summary badge
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(`${totalCount}`, cx, cy + 1, { align: 'center' });
  doc.setFontSize(4.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_MUTED);
  doc.text('TOTAL', cx, cy + 3.8, { align: 'center' });
};

const drawVerticalBarGraph = (
  doc: any,
  x: number,
  y: number,
  width: number,
  height: number,
  items: CategoryChartItem[]
) => {
  const maxCount = Math.max(...items.map(i => i.count), 1);
  const barCount = Math.min(items.length, 6);
  const gap = 4;
  const totalBarSpace = width - (barCount - 1) * gap;
  const barWidth = Math.max(6, totalBarSpace / barCount);
  const maxBarH = height - 13;

  const barColors: [number, number, number][] = [
    [47, 125, 109],  // Teal
    [59, 130, 246],  // Blue
    [139, 92, 246],  // Purple
    [245, 158, 11],  // Amber
    [236, 72, 153],  // Pink
    [16, 185, 129]   // Emerald
  ];

  items.slice(0, barCount).forEach((cat, idx) => {
    const barX = x + idx * (barWidth + gap);
    const barH = Math.max(3, (cat.count / maxCount) * maxBarH);
    const barY = y + height - 7 - barH;

    // Track bg
    doc.setFillColor(232, 238, 236);
    doc.roundedRect(barX, y + 4, barWidth, maxBarH, 0.8, 0.8, 'F');

    // Filled bar
    const color = cat.color || barColors[idx % barColors.length];
    doc.setFillColor(...color);
    doc.roundedRect(barX, barY, barWidth, barH, 0.8, 0.8, 'F');

    // Top count badge (High Contrast, 6.5pt Bold)
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`${cat.count}`, barX + barWidth / 2, Math.max(y + 3, barY - 1.5), { align: 'center' });

    // X-axis label below bar (6pt Bold)
    const catLabel = sanitizePdfText(cat.label);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    const labelText = catLabel.length > 9 ? catLabel.slice(0, 8) + '..' : catLabel;
    doc.text(labelText, barX + barWidth / 2, y + height - 2, { align: 'center' });
  });

  // Baseline
  doc.setDrawColor(200, 210, 205);
  doc.setLineWidth(0.4);
  doc.line(x, y + height - 7, x + width, y + height - 7);
};

const drawTrendLineGraph = (
  doc: any,
  x: number,
  y: number,
  width: number,
  height: number,
  points: TrendPoint[]
) => {
  if (!points || points.length === 0) return;

  const maxVal = Math.max(...points.map(p => p.value), 1);
  const graphH = height - 12;
  const baseY = y + height - 6;
  const count = points.length;
  const stepX = count > 1 ? width / (count - 1) : width;

  // Gridlines
  doc.setDrawColor(230, 235, 233);
  doc.setLineWidth(0.3);
  doc.line(x, y + 4, x + width, y + 4);
  doc.line(x, y + 4 + graphH / 2, x + width, y + 4 + graphH / 2);
  doc.line(x, baseY, x + width, baseY);

  // Map coordinates
  const coords = points.map((p, idx) => {
    const px = x + idx * stepX;
    const py = baseY - (p.value / maxVal) * graphH;
    return { x: px, y: py, label: p.label, value: p.value };
  });

  // Shaded polygon area under curve
  doc.setFillColor(220, 240, 235);
  for (let i = 0; i < coords.length - 1; i++) {
    const c1 = coords[i];
    const c2 = coords[i + 1];
    doc.triangle(c1.x, baseY, c1.x, c1.y, c2.x, c2.y, 'F');
    doc.triangle(c1.x, baseY, c2.x, c2.y, c2.x, baseY, 'F');
  }

  // Draw trend line
  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(1.1);
  for (let i = 0; i < coords.length - 1; i++) {
    doc.line(coords[i].x, coords[i].y, coords[i + 1].x, coords[i + 1].y);
  }

  // Draw node dots & labels
  coords.forEach((pt) => {
    doc.setFillColor(...PRIMARY_COLOR);
    doc.circle(pt.x, pt.y, 1.1, 'F');

    doc.setFontSize(5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_MUTED);
    const labelText = sanitizePdfText(pt.label);
    doc.text(labelText.length > 5 ? labelText.slice(0, 5) : labelText, pt.x, baseY + 3.5, { align: 'center' });

    doc.setFontSize(5);
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(`${pt.value}`, pt.x, pt.y - 1.8, { align: 'center' });
  });
};

const drawChartsSection = (
  doc: any,
  distributionData?: DistributionItem[],
  categoryData?: CategoryChartItem[],
  trendData?: TrendPoint[],
  startY: number = 54,
  statusChartTitle?: string,
  categoryChartTitle?: string,
  trendChartTitle?: string
): number => {
  if (
    (!distributionData || distributionData.length === 0) &&
    (!categoryData || categoryData.length === 0) &&
    (!trendData || trendData.length === 0)
  ) {
    return startY;
  }

  const containerX = 14;
  const containerWidth = 182;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('VISUAL SUMMARY & CHARTS', containerX, startY);
  startY += 4;

  const sectionHeight = 36;

  // Outer shaded container for graphics
  doc.setFillColor(248, 252, 251);
  doc.setDrawColor(225, 235, 232);
  doc.setLineWidth(0.4);
  doc.roundedRect(containerX, startY, containerWidth, sectionHeight, 2, 2, 'FD');

  const hasTrend = trendData && trendData.length > 0;
  const columnCount = hasTrend ? 3 : 2;
  const colWidth = (containerWidth - (columnCount - 1) * 6 - 8) / columnCount;

  // 1. Column 1: Vector Donut Chart (Status Distribution)
  const col1X = containerX + 4;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(statusChartTitle || 'Status Overview', col1X, startY + 5);

  if (distributionData && distributionData.length > 0) {
    const donutCx = col1X + 13;
    const donutCy = startY + 20;

    const slices = distributionData.map(d => ({
      label: d.label,
      count: d.count,
      percentage: d.percentage,
      color: d.color || PRIMARY_COLOR
    }));

    drawVectorDonutChart(doc, donutCx, donutCy, 11, 6, slices);

    // Donut Legend to the right of donut ring
    let legendY = startY + 11;
    const legendX = donutCx + 14;

    distributionData.slice(0, 3).forEach((item) => {
      const color = item.color || PRIMARY_COLOR;
      doc.setFillColor(...color);
      doc.rect(legendX, legendY - 2, 2.5, 2.5, 'F');

      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEXT_DARK);
      const labelText = `${sanitizePdfText(item.label).slice(0, 10)}: ${item.count} (${item.percentage.toFixed(0)}%)`;
      doc.text(labelText, legendX + 3.5, legendY);

      legendY += 4.5;
    });
  }

  // 2. Column 2: Vertical Bar Chart Graph (Category Breakdown)
  const col2X = containerX + 4 + colWidth + 6;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text(categoryChartTitle || 'Category Breakdown', col2X, startY + 5);

  if (categoryData && categoryData.length > 0) {
    drawVerticalBarGraph(doc, col2X, startY + 7, colWidth, 25, categoryData);
  }

  // 3. Column 3: Vector Trend Line Chart Graph (Trajectory / Activity Timeline)
  if (hasTrend) {
    const col3X = containerX + 4 + (colWidth + 6) * 2;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(trendChartTitle || 'Monthly Activity', col3X, startY + 5);

    drawTrendLineGraph(doc, col3X, startY + 7, colWidth, 25, trendData!);
  }

  return startY + sectionHeight + 6;
};

const drawMetricGlossaryBox = (doc: any, customItems?: GlossaryItem[], type: string = 'general', startY: number = 200) => {
  let items: GlossaryItem[] = customItems && customItems.length > 0 ? customItems : [];

  if (!items || items.length === 0) {
    switch (type) {
      case 'property':
        items = [
          { term: 'Total Property Count', definition: 'Count of active boarding houses, transient houses, or apartments registered in your landlord portfolio.' },
          { term: 'Combined Base Rent', definition: 'Cumulative sum of base monthly rental prices across all listed properties.' },
          { term: 'Property Category', definition: 'Classification type of accommodation (e.g., Boarding House, Transient House, Apartment).' },
          { term: 'Listing Status', definition: 'Platform status — Active Listing (live for bookings), Pending Review (under admin audit), or Archived.' },
          { term: 'Shared Facilities & Amenities', definition: 'Building-wide facilities provided for residents (e.g., Fiber WiFi, Backup Generator, CCTV, Caretaker).' },
          { term: 'House Rules & Policies', definition: 'Resident guidelines regarding curfew, visitor policies, gender restrictions, and pets.' }
        ];
        break;
      case 'room':
        items = [
          { term: 'Total Room Units', definition: 'Count of individual rental units and rooms registered under your properties.' },
          { term: 'Room Occupancy & Vacancy', definition: 'Current availability state — Vacant (ready for move-in), Fully Occupied, or Under Maintenance.' },
          { term: 'Maximum Capacity', definition: 'Maximum number of tenant occupants permitted for the room unit.' },
          { term: 'Monthly Rental Rate', definition: 'Agreed monthly rental fee charged per occupant or per room unit.' },
          { term: 'Reservation Hold Fee', definition: 'Advance deposit required from prospective tenants to lock and reserve a room slot before check-in.' },
          { term: 'Bathroom Setup', definition: 'Sanitation facility arrangement — Private Bathroom (inside unit) or Shared CR (communal facility).' },
          { term: 'In-Unit Amenities', definition: 'Dedicated appliances and features inside the room (e.g., Aircon, Storage Closet, Study Desk, Hot Shower).' }
        ];
        break;
      case 'booking':
        items = [
          { term: 'Total Booking Count', definition: 'Count of confirmed tenant stay agreements recorded in the system.' },
          { term: 'Active Tenant Stays', definition: 'Count of tenants currently checked in and residing in the property.' },
          { term: 'Gross Revenue', definition: 'Cumulative sum of rental fees collected across all confirmed tenant bookings.' },
          { term: 'Booking Status', definition: 'Current lease contract status — Active (checked-in), Pending Payment, Completed (moved out), or Cancelled.' },
          { term: 'Payment Settlement', definition: 'Transaction verification state — Paid (verified deposit/rent), Pending Verification, or Unpaid.' }
        ];
        break;
      case 'reservation':
        items = [
          { term: 'Slot Reservation', definition: 'Temporary hold securing a room slot for a prospective tenant prior to move-in.' },
          { term: 'Holding Deposit Paid', definition: 'Advance reservation fee deposited by the tenant to guarantee their room slot.' },
          { term: 'Move-In Window', definition: 'Agreed timeframe within which the tenant must arrive to complete check-in and contract sign-off.' },
          { term: 'Walk-In vs Online', definition: 'Reservation source — Online (booked via BoardTAU platform) or Walk-In (registered directly onsite).' }
        ];
        break;
      case 'inquiry':
        items = [
          { term: 'Total Inquiry Count', definition: 'Total number of prospective tenant inquiries received across your property listings.' },
          { term: 'Inquiry Status', definition: 'Prospective tenant query state — Received (awaiting response), Approved (accepted by landlord), or Closed.' },
          { term: 'Target Room Unit', definition: 'Specific property room unit queried by the prospective tenant.' },
          { term: 'Occupants Count', definition: 'Intended number of guests or student roommates planning to occupy the unit.' }
        ];
        break;
      case 'review':
        items = [
          { term: 'Satisfaction Rating Score', definition: 'Tenant satisfaction score rated on a 1.0 (Lowest) to 5.0 (Highest) star scale.' },
          { term: 'Average Reputation Rating', definition: 'Mean average star score calculated across all verified tenant reviews.' },
          { term: 'Landlord Reply Rate', definition: 'Percentage of tenant reviews that have received an official landlord response.' }
        ];
        break;
      default:
        items = [
          { term: 'Dynamic Filtering', definition: 'All totals, breakdowns, and metrics update dynamically based on active search filters.' }
        ];
    }
  }

  // Measure dynamic box height with wrapped line calculations
  let totalContentHeight = 10;
  const preparedItems: { termPrefix: string; termWidth: number; lines: string[] }[] = [];

  items.forEach(item => {
    const termPrefix = `• ${sanitizePdfText(item.term)}: `;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    const termWidth = doc.getTextWidth(termPrefix);

    const availableWidthForDef = 176 - termWidth;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    const lines = doc.splitTextToSize(sanitizePdfText(item.definition), availableWidthForDef);

    preparedItems.push({ termPrefix, termWidth, lines });
    totalContentHeight += Math.max(lines.length * 3.6, 4.2) + 1.8;
  });

  const boxHeight = totalContentHeight + 4;

  // Render Background Card
  doc.setFillColor(248, 252, 251);
  doc.roundedRect(14, startY, 182, boxHeight, 2.5, 2.5, 'F');

  doc.setDrawColor(...PRIMARY_COLOR);
  doc.setLineWidth(1.0);
  doc.line(14, startY, 14, startY + boxHeight);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('DEFINITIONS & KEY TERMS', 18, startY + 6.5);

  let currentItemY = startY + 11.5;

  preparedItems.forEach(prep => {
    doc.setFontSize(7.2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(prep.termPrefix, 18, currentItemY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_DARK);

    prep.lines.forEach((line: string, lIdx: number) => {
      const lineX = lIdx === 0 ? (18 + prep.termWidth) : 22;
      doc.text(line, lineX, currentItemY + lIdx * 3.6);
    });

    currentItemY += Math.max(prep.lines.length * 3.6, 4.2) + 1.8;
  });

  return startY + boxHeight + 6;
};

const drawAuditVerificationBlock = (doc: any, reportId: string, startY: number, author?: string) => {
  const boxHeight = 24;

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(14, startY, 182, boxHeight, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('OFFICIAL SIGN-OFF & VERIFICATION', 18, startY + 5.5);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Security Verification Code: ${reportId}`, 18, startY + 10);
  doc.text(`Prepared By: ${sanitizePdfText(author || 'Authorized Landlord')}`, 18, startY + 14.5);

  doc.setFont('helvetica', 'italic');
  doc.text('Scan top-right QR code to verify report online.', 18, startY + 19);

  // Official Signature Lines (Right Column: 105mm - 188mm)
  doc.setDrawColor(160, 160, 160);
  doc.setLineWidth(0.5);

  // 1. Signature Line
  doc.line(105, startY + 13.5, 142, startY + 13.5);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_MUTED);
  const displayAuthor = author ? sanitizePdfText(author) : 'Authorized Landlord';
  doc.text(displayAuthor.length > 22 ? displayAuthor.slice(0, 21) + '..' : displayAuthor, 105, startY + 17);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Landlord / Sign-Off', 105, startY + 20.5);

  // 2. Date Line
  doc.line(152, startY + 13.5, 188, startY + 13.5);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_MUTED);
  doc.text(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), 152, startY + 17);
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Date of Stamp', 152, startY + 20.5);

  return startY + boxHeight + 6;
};

const addFooter = (doc: any, reportId?: string) => {
  const pageCount = (doc as any).internal.getNumberOfPages();
  const currentId = reportId || 'BTAU-VERIFIED';

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.4);
    doc.line(14, pageHeight - 12, 196, pageHeight - 12);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(140);
    doc.text(`© BoardTAU Platform | Official Property Report (${currentId})`, 14, pageHeight - 6);
    doc.text(`Page ${i} of ${pageCount}`, 196, pageHeight - 6, { align: 'right' });
  }
};

export const generateTablePDF = async (
  filename: string,
  columns: string[],
  data: any[][],
  options: ReportHeaderOptions
) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const reportId = options.reportId || `BTAU-${options.type?.toUpperCase().slice(0, 4) || 'RPT'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  options.reportId = reportId;

  if (options.title) options.title = sanitizePdfText(options.title);
  if (options.subtitle) options.subtitle = sanitizePdfText(options.subtitle);

  await addHeader(doc, options);

  const shouldDrawSummary = options.includeSummary !== false;
  const shouldDrawGlossary = options.includeGlossary !== false;

  let startY = 54;
  if (shouldDrawSummary) {
    if (options.summaryData && options.summaryData.length > 0) {
      startY = drawSummaryCards(doc, options.summaryData, 54);
    }

    if (
      (options.distributionData && options.distributionData.length > 0) ||
      (options.categoryData && options.categoryData.length > 0) ||
      (options.trendData && options.trendData.length > 0)
    ) {
      startY = drawChartsSection(
        doc,
        options.distributionData,
        options.categoryData,
        options.trendData,
        startY,
        options.statusChartTitle,
        options.categoryChartTitle,
        options.trendChartTitle
      );
    }
  }

  const sanitizedData = data.map(row => 
    row.map(cell => typeof cell === 'string' ? sanitizePdfText(cell) : cell)
  );

  const autoTableConfig: any = {
    startY: startY,
    head: [columns.map(c => sanitizePdfText(c))],
    body: sanitizedData,
    showFoot: 'lastPage',
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [50, 50, 50]
    },
    alternateRowStyles: {
      fillColor: [248, 252, 251]
    },
    margin: { top: 20, left: 14, right: 14, bottom: 18 }
  };

  if (options.totalsRow) {
    autoTableConfig.foot = [options.totalsRow.map(c => sanitizePdfText(c))];
    autoTableConfig.footStyles = {
      fillColor: [235, 243, 241],
      textColor: PRIMARY_COLOR,
      fontSize: 8.5,
      fontStyle: 'bold'
    };
  }

  autoTable(doc, autoTableConfig);

  let finalY = (doc as any).lastAutoTable.finalY + 6;

  if (shouldDrawGlossary) {
    if (finalY > 230) {
      doc.addPage();
      finalY = 20;
    }
    finalY = drawMetricGlossaryBox(doc, options.glossaryItems, options.type || 'general', finalY);
  }

  if (finalY > 245) {
    doc.addPage();
    finalY = 20;
  }

  drawAuditVerificationBlock(doc, reportId, finalY);

  addFooter(doc, reportId);

  // Background Report Audit Log Trigger
  try {
    const finalReportId = options.reportId || reportId;
    const pdfUri = doc.output('datauristring');
    const pdfBase64 = pdfUri ? pdfUri.split(',')[1] : null;

    fetch('/api/reports/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId: finalReportId,
        title: options.title,
        scope: options.scopeTag || 'filtered',
        totalItems: Array.isArray(sanitizedData) ? sanitizedData.length : 0,
        reportType: options.type || 'summary',
        pdfBase64: pdfBase64
      })
    }).catch(err => console.error('Failed to post report audit log:', err));
  } catch (err) {
    // Silent catch so PDF download is never blocked
  }

  // Format dynamic unique filename with date and report ID
  const dateStr = new Date().toISOString().slice(0, 10);
  const reportIdSuffix = reportId.split('-').pop() || reportId;
  let finalFilename = filename.replace(/\.(pdf|xlsx|csv)$/i, '');

  if (!finalFilename.includes(dateStr)) {
    finalFilename = `${finalFilename}_${dateStr}`;
  }
  if (!finalFilename.includes(reportIdSuffix)) {
    finalFilename = `${finalFilename}_${reportIdSuffix}`;
  }

  doc.save(`${finalFilename}.pdf`);
};

export const generateSingleItemPDF = async (
  filename: string,
  itemTitle: string,
  itemCategory: string,
  keyValuePairs: { label: string; value: string; highlight?: boolean }[],
  sections: { title: string; items?: string[]; text?: string; tableData?: { headers: string[]; rows: string[][] } }[],
  options: ReportHeaderOptions
) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  const reportId = options.reportId || `BTAU-SPEC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  options.reportId = reportId;

  itemTitle = sanitizePdfText(itemTitle);
  itemCategory = sanitizePdfText(itemCategory);
  keyValuePairs = keyValuePairs.map(kv => ({
    label: sanitizePdfText(kv.label),
    value: sanitizePdfText(kv.value),
    highlight: kv.highlight
  }));

  await addHeader(doc, {
    title: itemTitle,
    subtitle: options.subtitle || `Official Information Datasheet | Category: ${itemCategory}`,
    author: options.author || 'BoardTAU Landlord Portal',
    reportId: reportId,
    showQR: options.showQR !== undefined ? options.showQR : false
  });

  let currentY = 56;

  // 1. Group pairs into rows of 2
  const rowsOfPairs: { left: typeof keyValuePairs[0]; right?: typeof keyValuePairs[0] }[] = [];
  for (let i = 0; i < keyValuePairs.length; i += 2) {
    rowsOfPairs.push({
      left: keyValuePairs[i],
      right: keyValuePairs[i + 1] || undefined
    });
  }

  // 2. Measure required grid height dynamically
  let estimatedCardHeight = 14;
  rowsOfPairs.forEach(row => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const leftLabelStr = `${row.left.label.toUpperCase()}:`;
    const leftLabelW = doc.getTextWidth(leftLabelStr);
    const leftValX = 18 + Math.max(leftLabelW + 3, 38);
    const leftMaxW = Math.max(104 - leftValX, 20);

    const leftValStr = sanitizePdfText(row.left.value || 'N/A').replace(/,([^\s])/g, ', $1');
    doc.setFontSize(8.5);
    doc.setFont('helvetica', row.left.highlight ? 'bold' : 'normal');
    const leftLines = doc.splitTextToSize(leftValStr, leftMaxW);

    let rightLinesCount = 1;
    if (row.right) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const rightLabelStr = `${row.right.label.toUpperCase()}:`;
      const rightLabelW = doc.getTextWidth(rightLabelStr);
      const rightValX = 108 + Math.max(rightLabelW + 3, 38);
      const rightMaxW = Math.max(194 - rightValX, 20);

      const rightValStr = sanitizePdfText(row.right.value || 'N/A').replace(/,([^\s])/g, ', $1');
      doc.setFontSize(8.5);
      doc.setFont('helvetica', row.right.highlight ? 'bold' : 'normal');
      const rightLines = doc.splitTextToSize(rightValStr, rightMaxW);
      rightLinesCount = rightLines.length;
    }

    const rowMaxLines = Math.max(leftLines.length, rightLinesCount);
    estimatedCardHeight += Math.max(rowMaxLines * 4.5, 7.5);
  });

  // 3. Render Background Card with Exact Measured Height
  doc.setFillColor(...SECONDARY_COLOR);
  doc.roundedRect(14, currentY, 182, estimatedCardHeight, 2.5, 2.5, 'F');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PRIMARY_COLOR);
  doc.text('SUMMARY & KEY DETAILS', 18, currentY + 7);

  let gridY = currentY + 13;

  // 4. Render Grid Pairs
  rowsOfPairs.forEach(row => {
    // Render Left KV
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_MUTED);
    const leftLabelStr = `${row.left.label.toUpperCase()}:`;
    doc.text(leftLabelStr, 18, gridY);

    const leftLabelW = doc.getTextWidth(leftLabelStr);
    const leftValX = 18 + Math.max(leftLabelW + 3, 38);
    const leftMaxW = Math.max(104 - leftValX, 20);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', row.left.highlight ? 'bold' : 'normal');
    doc.setTextColor(
      row.left.highlight ? PRIMARY_COLOR[0] : TEXT_DARK[0],
      row.left.highlight ? PRIMARY_COLOR[1] : TEXT_DARK[1],
      row.left.highlight ? PRIMARY_COLOR[2] : TEXT_DARK[2]
    );

    const leftValStr = sanitizePdfText(row.left.value || 'N/A').replace(/,([^\s])/g, ', $1');
    const leftLines: string[] = doc.splitTextToSize(leftValStr, leftMaxW);
    leftLines.forEach((line, lineIdx) => {
      doc.text(line, leftValX, gridY + lineIdx * 4);
    });

    // Render Right KV
    let rightLinesCount = 1;
    if (row.right) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...TEXT_MUTED);
      const rightLabelStr = `${row.right.label.toUpperCase()}:`;
      doc.text(rightLabelStr, 108, gridY);

      const rightLabelW = doc.getTextWidth(rightLabelStr);
      const rightValX = 108 + Math.max(rightLabelW + 3, 38);
      const rightMaxW = Math.max(194 - rightValX, 20);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', row.right.highlight ? 'bold' : 'normal');
      doc.setTextColor(
        row.right.highlight ? PRIMARY_COLOR[0] : TEXT_DARK[0],
        row.right.highlight ? PRIMARY_COLOR[1] : TEXT_DARK[1],
        row.right.highlight ? PRIMARY_COLOR[2] : TEXT_DARK[2]
      );

      const rightValStr = sanitizePdfText(row.right.value || 'N/A').replace(/,([^\s])/g, ', $1');
      const rightLines: string[] = doc.splitTextToSize(rightValStr, rightMaxW);
      rightLinesCount = rightLines.length;
      rightLines.forEach((line, lineIdx) => {
        doc.text(line, rightValX, gridY + lineIdx * 4);
      });
    }

    const rowMaxLines = Math.max(leftLines.length, rightLinesCount);
    gridY += Math.max(rowMaxLines * 4.5, 7.5);
  });

  currentY = gridY + 6;

  // Render Detailed Sections (Amenities, House Rules, Payment Breakdown, Message Log)
  for (const sec of sections) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    const secTitle = sanitizePdfText(sec.title);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PRIMARY_COLOR);
    doc.text(secTitle.toUpperCase(), 14, currentY);

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.4);
    doc.line(14, currentY + 2, 196, currentY + 2);
    currentY += 8;

    if (sec.text) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_DARK);
      const splitText = doc.splitTextToSize(sanitizePdfText(sec.text), 182);
      doc.text(splitText, 14, currentY);
      currentY += splitText.length * 5 + 4;
    }

    if (sec.items && sec.items.length > 0) {
      // Render as badge pill list or bullet points
      let pillX = 14;
      sec.items.forEach((item) => {
        const sanitizedItem = sanitizePdfText(item);
        const itemWidth = doc.getTextWidth(sanitizedItem) + 8;
        if (pillX + itemWidth > 196) {
          pillX = 14;
          currentY += 8;
        }

        if (currentY > 260) {
          doc.addPage();
          currentY = 20;
          pillX = 14;
        }

        doc.setFillColor(240, 244, 243);
        doc.roundedRect(pillX, currentY - 4, itemWidth, 6, 1.5, 1.5, 'F');
        
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...PRIMARY_COLOR);
        doc.text(sanitizedItem, pillX + 4, currentY);

        pillX += itemWidth + 4;
      });
      currentY += 10;
    }

    if (sec.tableData) {
      const sanitizedRows = sec.tableData.rows.map(row => 
        row.map(cell => typeof cell === 'string' ? sanitizePdfText(cell) : cell)
      );
      const sanitizedHeaders = sec.tableData.headers.map(h => sanitizePdfText(h));

      const autoTableConfig: any = {
        startY: currentY,
        head: [sanitizedHeaders],
        body: sanitizedRows,
        theme: 'plain',
        headStyles: {
          fillColor: [240, 244, 243],
          textColor: PRIMARY_COLOR,
          fontSize: 8.5,
          fontStyle: 'bold',
          cellPadding: 3
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 50],
          cellPadding: 2.5
        },
        alternateRowStyles: {
          fillColor: [250, 252, 251]
        },
        tableLineWidth: 0.2,
        tableLineColor: [230, 230, 230],
        margin: { left: 14, right: 14 }
      };

      if (sanitizedHeaders.length === 6) {
        autoTableConfig.columnStyles = {
          0: { cellWidth: 26 },
          1: { cellWidth: 26 },
          2: { cellWidth: 28 },
          3: { cellWidth: 24 },
          4: { cellWidth: 20 },
          5: { cellWidth: 'auto' }
        };
      }

      autoTable(doc, autoTableConfig);
      currentY = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // Signature Block at Bottom
  if (currentY < 235) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...TEXT_MUTED);
    doc.text('OFFICIAL LANDLORD SIGN-OFF & VERIFICATION', 14, currentY + 10);

    const authorName = options.author || 'Landlord Authorized Signatory';

    doc.setDrawColor(180, 180, 180);
    doc.line(14, currentY + 24, 90, currentY + 24);
    doc.setFontSize(7);
    doc.text(`Landlord Authorized Signature (${authorName})`, 14, currentY + 28);

    doc.line(116, currentY + 24, 182, currentY + 24);
    doc.text('Date of Verification Stamp', 116, currentY + 28);
  }

  addFooter(doc, reportId);

  // Background Report Audit Log Trigger
  try {
    const finalReportId = options.reportId || reportId;
    const pdfUri = doc.output('datauristring');
    const pdfBase64 = pdfUri ? pdfUri.split(',')[1] : null;

    fetch('/api/reports/audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reportId: finalReportId,
        title: options.title || itemTitle,
        scope: options.scopeTag || 'filtered',
        totalItems: 1,
        reportType: options.type || 'single',
        pdfBase64: pdfBase64
      })
    }).catch(err => console.error('Failed to post report audit log:', err));
  } catch (err) {
    // Silent catch so PDF download is never blocked
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const reportIdSuffix = reportId.split('-').pop() || reportId;
  let finalFilename = filename.replace(/\.(pdf|xlsx|csv)$/i, '');

  if (!finalFilename.includes(dateStr)) {
    finalFilename = `${finalFilename}_${dateStr}`;
  }
  if (!finalFilename.includes(reportIdSuffix)) {
    finalFilename = `${finalFilename}_${reportIdSuffix}`;
  }

  doc.save(`${finalFilename}.pdf`);
};

export const generateVisualPDF = async (
  filename: string,
  elementId: string,
  options: ReportHeaderOptions
) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: html2canvas } = await import('html2canvas');

  const doc = new jsPDF('p', 'mm', 'a4');
  await addHeader(doc, options);

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff'
  } as any);

  const imgData = canvas.toDataURL('image/png');
  const imgProps = doc.getImageProperties(imgData);
  const pdfWidth = doc.internal.pageSize.getWidth() - 28;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  doc.addImage(imgData, 'PNG', 14, 56, pdfWidth, pdfHeight);
  addFooter(doc, options.reportId);
  doc.save(`${filename}.pdf`);
};

export const generateMultiSectionPDF = async (
  filename: string,
  sections: ReportSection[],
  options: ReportHeaderOptions
) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF();
  await addHeader(doc, options);

  let currentY = 56;

  for (const section of sections) {
    if (section.title) {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PRIMARY_COLOR);
      doc.text(section.title, 14, currentY);
      currentY += 8;
    }

    if (section.type === 'text' && section.content) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...TEXT_DARK);

      const lines = Array.isArray(section.content) ? section.content : [section.content];
      for (const line of lines) {
        if (currentY > 280) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, 14, currentY);
        currentY += 6;
      }
      currentY += 4;
    } else if (section.type === 'table' && section.columns && section.data) {
      autoTable(doc, {
        startY: currentY,
        head: [section.columns],
        body: section.data,
        theme: 'grid',
        headStyles: {
          fillColor: PRIMARY_COLOR,
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 8.5,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [248, 252, 251]
        },
        margin: { top: 20, left: 14, right: 14, bottom: 18 }
      });
      currentY = (doc as any).lastAutoTable.finalY + 12;
    }
  }

  addFooter(doc, options.reportId);
  doc.save(`${filename}.pdf`);
};

