import { jsPDF } from 'jspdf';
import { encryptEntityId } from '@/lib/encryption';
import { drawCode128InPdf } from '@/utils/barcode';

const INK_BLACK: [number, number, number] = [17, 24, 39]; // #111827
const INK_MUTED: [number, number, number] = [75, 85, 99]; // #4B5563
const INK_LIGHT: [number, number, number] = [156, 163, 175]; // #9CA3AF

const formatPaymentMethod = (methodRaw?: string, inquiryMethodRaw?: string): string => {
  const method = (methodRaw || inquiryMethodRaw || '').toUpperCase();
  if (method === 'STRIPE' || method === 'CREDIT_CARD' || method === 'CARD') {
    return 'Credit/Debit Card (Stripe)';
  }
  if (method === 'GCASH') {
    return 'GCash E-Wallet';
  }
  if (method === 'MAYA') {
    return 'Maya Wallet';
  }
  if (method === 'CASH') {
    return 'Cash Payment';
  }
  if (method === 'BANK_TRANSFER') {
    return 'Bank Transfer';
  }
  return 'Online Payment';
};

const formatPaymentReference = (ref?: string, resId?: string): string => {
  if (ref && ref.trim() && ref.trim().toUpperCase() !== 'N/A') {
    return ref.trim();
  }
  if (resId) {
    return `REF-${resId.slice(-8).toUpperCase()}`;
  }
  return 'N/A';
};

// Helper to draw serrated paper receipt tear edges
const drawSerratedEdge = (doc: jsPDF, y: number, isTop: boolean) => {
  const toothWidth = 3.2;
  const toothHeight = 1.8;
  const totalWidth = 80;
  const count = Math.ceil(totalWidth / toothWidth);

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.1);

  for (let i = 0; i < count; i++) {
    const startX = i * toothWidth;
    const midX = startX + toothWidth / 2;
    const endX = startX + toothWidth;

    if (isTop) {
      doc.triangle(startX, 0, midX, toothHeight, endX, 0, 'FD');
    } else {
      doc.triangle(startX, y, midX, y - toothHeight, endX, y, 'FD');
    }
  }
};



// Helper to generate faint BoardTAU logo watermark (clean, no circles, large)
const generateWatermarkDataUrl = async (logoUrl: string = '/BoardTAU_Main_Logo.png'): Promise<string> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return '';
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const size = 500;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }

        ctx.clearRect(0, 0, size, size);

        // Large clean high-res faint grayscale BoardTAU logo icon in center
        ctx.save();
        ctx.globalAlpha = 0.09;
        ctx.filter = 'grayscale(100%) contrast(115%)';
        const logoSize = 460;
        ctx.drawImage(img, (size - logoSize) / 2, (size - logoSize) / 2, logoSize, logoSize);
        ctx.restore();

        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = logoUrl;
  });
};

export const generateConfirmationSlipPDF = async (
  reservation: any,
  tenantName: string,
  tenantEmail: string,
  returnBlob: boolean = false
): Promise<Blob | void> => {
  // Standard 80mm thermal receipt roll dimensions with comfortable spacing (80mm width x 270mm length)
  const PAGE_HEIGHT = 270;
  const doc = new jsPDF({
    unit: 'mm',
    format: [80, PAGE_HEIGHT],
  });

  const rawResId = String(reservation.id || 'BOARDING-PASS');
  const refCode = rawResId.slice(-8).toUpperCase();
  const resStatus = String(reservation.status || 'RESERVED').toUpperCase();

  const effectiveDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const effectiveTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const moveInDate = new Date(reservation.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const moveOutDate = new Date(reservation.endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const displayPaymentMethod = formatPaymentMethod(reservation.paymentMethod, reservation.inquiry?.paymentMethod);
  const displayPaymentReference = formatPaymentReference(reservation.paymentReference, reservation.id);
  const totalBillStr = `PHP ${Number(reservation.totalPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Generate QR Code & Watermark concurrently
  let qrDataUrl = '';
  let watermarkDataUrl = '';
  try {
    const [qrResult, wmResult] = await Promise.all([
      (async () => {
        const QRCode = (await import('qrcode')).default;
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL ||
          process.env.NEXTAUTH_URL ||
          (typeof window !== 'undefined' ? window.location.origin : 'https://board-tau-rho.vercel.app');
        const verifyUrl = `${baseUrl}/verify/slip/${encryptEntityId(reservation.id)}`;
        return await QRCode.toDataURL(verifyUrl, {
          margin: 1,
          width: 256,
          color: {
            dark: '#111827',
            light: '#FFFFFF',
          },
        });
      })(),
      generateWatermarkDataUrl('/BoardTAU_Main_Logo.png'),
    ]);
    qrDataUrl = qrResult;
    watermarkDataUrl = wmResult;
  } catch (error) {
    console.error('Failed to generate receipt visual assets:', error);
  }

  // Draw Top Serrated Paper Tear
  drawSerratedEdge(doc, 0, true);

  // Draw Official BoardTAU Background Watermark (No circle, large & visible)
  if (watermarkDataUrl) {
    try {
      const watermarkSize = 60; // 60mm width (75% of 80mm roll width)
      const watermarkX = (80 - watermarkSize) / 2;
      const watermarkY = 92; // Optical center of receipt body
      doc.addImage(watermarkDataUrl, 'PNG', watermarkX, watermarkY, watermarkSize, watermarkSize);
    } catch (e) {
      console.error('Failed to draw watermark in PDF:', e);
    }
  }

  let curY = 9;

  // Header Title
  doc.setFont('courier', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...INK_BLACK);
  doc.text('B O A R D T A U', 40, curY, { align: 'center' });

  curY += 4.5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...INK_MUTED);
  doc.text('HOUSING & ACCOMMODATION SYSTEM', 40, curY, { align: 'center' });

  curY += 3.5;
  doc.setFontSize(6.5);
  doc.text('CAMILING, TARLAC, PHILIPPINES', 40, curY, { align: 'center' });

  // Double Divider
  curY += 4.5;
  doc.setDrawColor(...INK_BLACK);
  doc.setLineWidth(0.3);
  doc.line(5, curY, 75, curY);
  doc.line(5, curY + 0.6, 75, curY + 0.6);

  // Subtitle
  curY += 4.5;
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...INK_BLACK);
  doc.text('OFFICIAL BOARDING PASS', 40, curY, { align: 'center' });
  curY += 3.5;
  doc.setFontSize(7.5);
  doc.text('& STAY CONFIRMATION SLIP', 40, curY, { align: 'center' });

  curY += 3.5;
  doc.line(5, curY, 75, curY);
  doc.line(5, curY + 0.6, 75, curY + 0.6);

  // Metadata / Status
  curY += 4.5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(...INK_BLACK);
  doc.text(`DATE/TIME : ${effectiveDate} ${effectiveTime}`, 5, curY);
  curY += 3.8;
  doc.text(`BOOKING REF: #${refCode}`, 5, curY);
  curY += 3.8;

  let statusText = '[ RESERVATION CONFIRMED ]';
  if (resStatus === 'COMPLETED') statusText = '[ COMPLETED STAY ]';
  else if (resStatus === 'CHECKED_IN') statusText = '[ CHECKED IN ]';
  else if (resStatus === 'CANCELLED') statusText = '[ CANCELLED ]';
  else if (resStatus === 'PENDING_PAYMENT') statusText = '[ PAYMENT PENDING ]';

  doc.setFont('courier', 'bold');
  doc.text(`STATUS    : ${statusText}`, 5, curY);

  // Dotted Line Helper
  const drawDottedLine = (yPos: number) => {
    doc.setLineDashPattern([0.8, 0.8], 0);
    doc.setDrawColor(...INK_LIGHT);
    doc.setLineWidth(0.2);
    doc.line(5, yPos, 75, yPos);
    doc.setLineDashPattern([], 0); // reset
  };

  // --- SECTION: GUEST DETAILS ---
  curY += 4;
  drawDottedLine(curY);
  curY += 4;

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_BLACK);
  doc.text('TENANT / GUEST DETAILS', 5, curY);

  curY += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.8);
  const safeTenantName = (tenantName || 'Tenant Guest').trim();
  doc.text(`NAME   : ${safeTenantName.toUpperCase()}`, 5, curY);
  curY += 3.6;
  doc.text(`ACCOUNT: ${tenantEmail || 'Verified Tenant Account'}`, 5, curY);
  curY += 3.6;
  doc.text(`GUESTS : ${reservation.occupantsCount || 1} PERSON(S)`, 5, curY);

  // --- SECTION: PREMISES ---
  curY += 4;
  drawDottedLine(curY);
  curY += 4;

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.text('LEASED PREMISES & UNIT', 5, curY);

  curY += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.8);
  const propTitle = (reservation.listing?.title || reservation.listingTitle || 'Boarding House Property').toUpperCase();
  const wrappedProp = doc.splitTextToSize(`PROPERTY: ${propTitle}`, 70);
  doc.text(wrappedProp, 5, curY);
  curY += (wrappedProp.length * 3.6);

  const roomName = (reservation.room?.name || 'Selected Room').toUpperCase();
  const roomType = (reservation.room?.roomType || reservation.room?.roomTypeDefinition?.name || reservation.listing?.propertyType?.name || 'Standard Unit').toUpperCase();
  doc.text(`ROOM    : ${roomName}`, 5, curY);
  curY += 3.6;
  doc.text(`UNIT TYP: ${roomType}`, 5, curY);

  // --- SECTION: ITINERARY ---
  curY += 4;
  drawDottedLine(curY);
  curY += 4;

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.text('STAY SCHEDULE & ITINERARY', 5, curY);

  curY += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.8);
  doc.text(`CHECK-IN : ${moveInDate.toUpperCase()} (AFTER 02:00 PM)`, 5, curY);
  curY += 3.6;
  doc.text(`CHECK-OUT: ${moveOutDate.toUpperCase()} (BEFORE 12:00 PM)`, 5, curY);
  curY += 3.6;
  doc.text(`DURATION : ${reservation.durationInDays || 1} NIGHTS`, 5, curY);

  // --- SECTION: FINANCIAL BREAKDOWN ---
  curY += 4;
  doc.setDrawColor(...INK_BLACK);
  doc.setLineWidth(0.2);
  doc.line(5, curY, 75, curY);
  curY += 4;

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.text('PAYMENT SUMMARY & RECEIPT', 5, curY);

  curY += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.8);
  doc.text('Holding Fee / Bill', 5, curY);
  doc.text(totalBillStr, 75, curY, { align: 'right' });

  curY += 3.6;
  doc.text(`Period (${reservation.durationInDays || 1} Nights)`, 5, curY);
  doc.text('INCLUDED', 75, curY, { align: 'right' });

  curY += 3.4;
  drawDottedLine(curY);
  curY += 4;

  doc.setFont('courier', 'bold');
  doc.text('TOTAL BILLED', 5, curY);
  doc.text(totalBillStr, 75, curY, { align: 'right' });

  curY += 3.6;
  doc.text('AMOUNT PAID', 5, curY);
  doc.text(totalBillStr, 75, curY, { align: 'right' });

  curY += 3.6;
  doc.text('BALANCE DUE', 5, curY);
  doc.text('PHP 0.00', 75, curY, { align: 'right' });

  curY += 3.6;
  doc.setFont('courier', 'normal');
  doc.text(`PAY METHOD : ${displayPaymentMethod.toUpperCase()}`, 5, curY);
  curY += 3.6;
  doc.text(`PAY REF NO : ${displayPaymentReference}`, 5, curY);

  // --- SECTION: CARETAKER GUIDELINES ---
  curY += 4;
  drawDottedLine(curY);
  curY += 4;

  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  doc.text('CARETAKER CHECK-IN GUIDELINES', 5, curY);

  curY += 4;
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.2);
  const guidelines = [
    '[1] Present slip (mobile or paper) upon arrival.',
    '[2] Present valid Student / Gov ID for verification.',
    '[3] Standard check-in starts at 2:00 PM.',
    `[4] Retain reference #${refCode} for your record.`
  ];
  guidelines.forEach((g) => {
    doc.text(g, 5, curY);
    curY += 3.4;
  });

  // --- SECTION: QR CODE & DIGITAL VERIFICATION ---
  curY += 2;
  doc.setDrawColor(...INK_BLACK);
  doc.setLineWidth(0.3);
  doc.line(5, curY, 75, curY);
  curY += 4.5;

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.text('DIGITAL SCAN VERIFICATION', 40, curY, { align: 'center' });
  curY += 3.5;

  if (qrDataUrl) {
    try {
      const qrSize = 25; // 25x25mm
      const qrX = (80 - qrSize) / 2; // 27.5mm centered
      
      // Subtle framed border box around QR code matching modal UI
      doc.setDrawColor(215, 215, 215);
      doc.setLineWidth(0.2);
      doc.rect(qrX - 1.5, curY - 0.5, qrSize + 3, qrSize + 3);

      doc.addImage(qrDataUrl, 'PNG', qrX, curY + 1, qrSize, qrSize);
      
      // Advance curY past QR box with 4.5mm breathing clearance before baseline
      curY += qrSize + 7.5;
    } catch {
      curY += 6;
    }
  } else {
    curY += 6;
  }

  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...INK_BLACK);
  doc.text(`* * ${refCode} * *`, 40, curY, { align: 'center' });
  curY += 4;

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...INK_MUTED);
  doc.text('SCAN TO VERIFY WITH CARETAKER', 40, curY, { align: 'center' });

  // Real Standards-Compliant Code 128 Barcode with quiet zones
  curY += 4.5;
  const barcodeWidth = 56;
  const barcodeHeight = 7.5;
  const barcodeX = (80 - barcodeWidth) / 2; // 12mm centered
  drawCode128InPdf(doc, `RES-${refCode}`, barcodeX, curY, barcodeWidth, barcodeHeight, INK_BLACK);
  
  // Advance curY past barcode height + breathing room for baseline
  curY += barcodeHeight + 4.5;

  doc.setFont('courier', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...INK_BLACK);
  doc.text(`*RES-${refCode}*`, 40, curY, { align: 'center' });

  curY += 4.5;
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(...INK_MUTED);
  doc.text('AUTHENTIC DIGITAL RECORD', 40, curY, { align: 'center' });
  curY += 3.5;
  doc.text('*** THANK YOU FOR CHOOSING BOARDTAU ***', 40, curY, { align: 'center' });

  // Draw Bottom Serrated Paper Tear
  drawSerratedEdge(doc, PAGE_HEIGHT, false);

  if (returnBlob) {
    return doc.output('blob');
  }

  doc.save(`BoardTAU_Receipt_${refCode}.pdf`);
};
