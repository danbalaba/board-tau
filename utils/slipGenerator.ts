import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { encryptEntityId } from '@/lib/encryption';

const PRIMARY_TEAL: [number, number, number] = [47, 125, 109]; // #2F7D6D
const SECONDARY_NAVY: [number, number, number] = [15, 23, 42]; // #0F172A
const ACCENT_EMERALD: [number, number, number] = [16, 185, 129]; // #10B981
const ACCENT_BLUE: [number, number, number] = [30, 58, 138]; // #1E3A8A
const TEXT_MUTED: [number, number, number] = [100, 116, 139]; // #64748B
const TEXT_DARK: [number, number, number] = [30, 41, 59]; // #1E293B
const BG_SLATE: [number, number, number] = [248, 250, 252]; // #F8FAFC
const BORDER_COLOR: [number, number, number] = [226, 232, 240]; // #E2E8F0
const MINT_BG: [number, number, number] = [236, 253, 245]; // #ECFDF5

const loadLogoImage = (): Promise<HTMLImageElement | null> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(null);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = `${window.location.origin}/logo.png`;
  });
};

const drawSectionTitle = (doc: jsPDF, title: string, y: number) => {
  doc.setFillColor(...PRIMARY_TEAL);
  doc.roundedRect(14, y - 4, 3, 5, 0.8, 0.8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...PRIMARY_TEAL);
  doc.text(title, 19, y);
};

const formatPaymentMethod = (methodRaw?: string, inquiryMethodRaw?: string): string => {
  const method = (methodRaw || inquiryMethodRaw || '').toUpperCase();
  if (method === 'STRIPE' || method === 'CREDIT_CARD' || method === 'CARD') {
    return 'Credit / Debit Card (Stripe)';
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

export const generateConfirmationSlipPDF = async (
  reservation: any,
  tenantName: string,
  tenantEmail: string,
  returnBlob: boolean = false
): Promise<Blob | void> => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const rawResId = String(reservation.id || 'BOARDING-PASS');
  const refCode = rawResId.slice(-8).toUpperCase();
  const effectiveDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let logoElement: HTMLImageElement | null = null;
  try {
    logoElement = await loadLogoImage();
  } catch (e) {
    logoElement = null;
  }

  // --- EXECUTIVE TOP HEADER BANNER ---
  doc.setFillColor(...SECONDARY_NAVY);
  doc.rect(0, 0, 210, 26, 'F');

  // Accent Line at bottom of header banner
  doc.setFillColor(...PRIMARY_TEAL);
  doc.rect(0, 26, 210, 1.2, 'F');

  // Circular White Logo Container Badge
  doc.setFillColor(255, 255, 255);
  doc.circle(21, 13, 8.5, 'F');

  if (logoElement) {
    try {
      doc.addImage(logoElement, 'PNG', 15, 7, 12, 12);
    } catch (e) {
      doc.setFillColor(...PRIMARY_TEAL);
      doc.circle(21, 13, 6, 'F');
    }
  } else {
    doc.setFillColor(...PRIMARY_TEAL);
    doc.circle(21, 13, 6, 'F');
  }

  // Brand Name & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.setTextColor(255, 255, 255);
  doc.text('BoardTAU', 33, 13.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text('HOUSING & ACCOMMODATION SYSTEM', 33, 18);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...ACCENT_EMERALD);
  doc.text(`OFFICIAL BOARDING PASS  •  ISSUED: ${effectiveDate.toUpperCase()}`, 33, 22.5);

  // Status text and styling based on reservation status
  const resStatus = String(reservation.status || 'RESERVED').toUpperCase();
  let headerBadgeText = 'VERIFIED CONFIRMATION SLIP';
  let ribbonText = 'VERIFIED PAYMENT CONFIRMED  •  RESERVATION FULLY SECURED IN SYSTEM';
  let badgeBgColor: [number, number, number] = MINT_BG;
  let badgeBorderColor: [number, number, number] = ACCENT_EMERALD;
  let badgeTextColor: [number, number, number] = PRIMARY_TEAL;

  if (resStatus === 'COMPLETED') {
    headerBadgeText = 'VERIFIED COMPLETED STAY';
    ribbonText = 'STAY FULLY COMPLETED  •  VERIFIED TENANT RECORD ARCHIVED IN SYSTEM';
    badgeBgColor = [243, 232, 255];
    badgeBorderColor = [147, 51, 234];
    badgeTextColor = [126, 34, 206];
  } else if (resStatus === 'CHECKED_IN') {
    headerBadgeText = 'VERIFIED CHECKED-IN STAY';
    ribbonText = 'ACTIVE STAY CONFIRMED  •  TENANT CURRENTLY CHECKED IN AT PROPERTY';
  } else if (resStatus === 'CANCELLED') {
    headerBadgeText = 'CANCELLED RESERVATION';
    ribbonText = 'RESERVATION CANCELLED  •  OFFICIAL RECORD INACTIVE';
    badgeBgColor = [254, 242, 242];
    badgeBorderColor = [225, 29, 72];
    badgeTextColor = [190, 18, 60];
  }

  // Header Right: Reference Hash & Status Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`REF: ${refCode}`, 196, 11, { align: 'right' });

  doc.setFillColor(...badgeBgColor);
  doc.setDrawColor(...badgeBorderColor);
  doc.roundedRect(132, 14, 64, 7.5, 1.5, 1.5, 'FD');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...badgeTextColor);
  doc.text(headerBadgeText, 164, 18.8, { align: 'center' });

  let currentY = 34;

  // --- SECTION 1: GUEST & PROPERTY DETAILS ---
  drawSectionTitle(doc, '1. GUEST & PROPERTY DETAILS', currentY);
  currentY += 5;

  const cardHeight = 22;

  // Tenant Card (Left Side)
  doc.setFillColor(...BG_SLATE);
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, currentY, 88, cardHeight, 2, 2, 'FD');

  // Primary Teal Left Indicator Stripe
  doc.setFillColor(...PRIMARY_TEAL);
  doc.roundedRect(14, currentY, 3, cardHeight, 1, 1, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_MUTED);
  doc.text('REGISTERED TENANT / GUEST', 20, currentY + 5.5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...SECONDARY_NAVY);
  const displayTenantName = (tenantName || 'Tenant Guest').trim();
  doc.text(displayTenantName, 20, currentY + 11.5);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PRIMARY_TEAL);
  doc.text(tenantEmail || 'Verified Tenant Account', 20, currentY + 16.5);

  // Property Card (Right Side)
  doc.setFillColor(...BG_SLATE);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(108, currentY, 88, cardHeight, 2, 2, 'FD');

  // Accent Blue Left Indicator Stripe
  doc.setFillColor(...ACCENT_BLUE);
  doc.roundedRect(108, currentY, 3, cardHeight, 1, 1, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_MUTED);
  doc.text('LEASED PREMISES & ROOM', 114, currentY + 5.5);

  const propTitle = reservation.listing?.title || reservation.listingTitle || 'Boarding House Property';
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...SECONDARY_NAVY);
  doc.text(doc.splitTextToSize(propTitle, 78)[0], 114, currentY + 10.5);

  const roomName = reservation.room?.name || 'Selected Room';
  const roomType = reservation.room?.roomType || reservation.room?.roomTypeDefinition?.name || reservation.listing?.propertyType?.name || 'Solo Unit';

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...ACCENT_BLUE);
  doc.text(`${roomName}  •  ${roomType}`, 114, currentY + 16.5);

  currentY += cardHeight + 8;

  // --- SECTION 2: STAY ITINERARY & SCHEDULE ---
  drawSectionTitle(doc, '2. STAY ITINERARY & SCHEDULE', currentY);
  currentY += 5;

  const moveInDate = new Date(reservation.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const moveOutDate = new Date(reservation.endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Check-In Date', 'Check-Out Date', 'Duration of Stay', 'Registered Occupants']],
    body: [
      [moveInDate, moveOutDate, `${reservation.durationInDays || 1} Nights`, `${reservation.occupantsCount || 1} Person(s)`]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_TEAL,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3.5,
    },
    bodyStyles: {
      textColor: TEXT_DARK,
      fontSize: 8.5,
      cellPadding: 3.5,
    },
    alternateRowStyles: {
      fillColor: BG_SLATE,
    },
    columnStyles: {
      0: { cellWidth: 46 },
      1: { cellWidth: 46 },
      2: { cellWidth: 45 },
      3: { cellWidth: 45 },
    },
    tableLineWidth: 0.2,
    tableLineColor: BORDER_COLOR,
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // --- SECTION 3: PAYMENT & FINANCIAL SUMMARY ---
  drawSectionTitle(doc, '3. PAYMENT & FINANCIAL SUMMARY', currentY);
  currentY += 5;

  const displayPaymentMethod = formatPaymentMethod(reservation.paymentMethod, reservation.inquiry?.paymentMethod);
  const displayPaymentReference = formatPaymentReference(reservation.paymentReference, reservation.id);
  const totalBillStr = `PHP ${Number(reservation.totalPrice || 0).toLocaleString()}`;

  autoTable(doc, {
    startY: currentY,
    head: [['Total Bill Amount', 'Amount Paid', 'Payment Method', 'Payment Reference']],
    body: [
      [totalBillStr, totalBillStr, displayPaymentMethod, displayPaymentReference]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_TEAL,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3.5,
    },
    bodyStyles: {
      textColor: TEXT_DARK,
      fontSize: 8.5,
      cellPadding: 3.5,
    },
    alternateRowStyles: {
      fillColor: BG_SLATE,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { fontStyle: 'bold', cellWidth: 42 },
      2: { cellWidth: 50 },
      3: { cellWidth: 48 },
    },
    tableLineWidth: 0.2,
    tableLineColor: BORDER_COLOR,
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // Payment Confirmation Status Ribbon
  doc.setFillColor(...badgeBgColor);
  doc.setDrawColor(...badgeBorderColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, currentY, 182, 7.5, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...badgeTextColor);
  doc.text(ribbonText, 105, currentY + 5, { align: 'center' });

  currentY += 14;

  // --- SECTION 4: CHECK-IN GUIDELINES & QR VERIFICATION ---
  drawSectionTitle(doc, '4. CHECK-IN GUIDELINES & DIGITAL VERIFICATION', currentY);
  currentY += 6;

  // Generate QR Code
  let qrDataUrl = '';
  try {
    const QRCode = (await import('qrcode')).default;
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'https://board-tau-rho.vercel.app');
    const verifyUrl = `${baseUrl}/verify/${encryptEntityId(reservation.id)}`;
    qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      margin: 1,
      color: {
        dark: '#0F172A',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('Failed to generate QR code:', error);
  }

  const guidelines = [
    'Present this Confirmation Slip (digital or printed) to the caretaker upon arrival.',
    'A valid Government ID or Student ID is required upon check-in to verify identity.',
    'Standard check-in time is typically 2:00 PM unless agreed otherwise with the landlord.',
    'Keep your payment reference and confirmation code saved for official records.',
  ];

  const guidelinesBoxWidth = 138;
  const qrBoxWidth = 40;
  const sectionHeight = 48;

  // Guidelines List (Left)
  guidelines.forEach((guide, idx) => {
    const itemY = currentY + idx * 11.5;
    const numStr = String(idx + 1).padStart(2, '0');

    doc.setFillColor(...BG_SLATE);
    doc.setDrawColor(...BORDER_COLOR);
    doc.roundedRect(14, itemY, guidelinesBoxWidth, 9.5, 1.5, 1.5, 'FD');

    // Number Pill
    doc.setFillColor(...PRIMARY_TEAL);
    doc.roundedRect(16.5, itemY + 1.5, 7, 6.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(numStr, 20, itemY + 5.8, { align: 'center' });

    // Guideline Text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_DARK);
    const splitGuide = doc.splitTextToSize(guide, 122);
    doc.text(splitGuide, 26, itemY + 5.5);
  });

  // QR Code Verification Card (Right)
  doc.setFillColor(...BG_SLATE);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(156, currentY, qrBoxWidth, sectionHeight - 2, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('SCAN TO VERIFY', 176, currentY + 5, { align: 'center' });

  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, 'PNG', 161, currentY + 7, 30, 30);
    } catch (e) {
      doc.setFillColor(255, 255, 255);
      doc.rect(161, currentY + 7, 30, 30, 'F');
    }
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...PRIMARY_TEAL);
  doc.text(`#${refCode}`, 176, currentY + 41, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Instant QR Verification', 176, currentY + 44.5, { align: 'center' });

  // --- EXECUTIVE FOOTER ---
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.4);
  doc.line(14, 282, 196, 282);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...SECONDARY_NAVY);
  doc.text('BoardTAU Housing Management System', 14, 287);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`|  Verification Reference: REF-${refCode}  |  Authentic Digital Record`, 70, 287);
  doc.text('Page 1 of 1', 196, 287, { align: 'right' });

  if (returnBlob) {
    return doc.output('blob');
  }

  doc.save(`BoardTAU_Confirmation_${refCode}.pdf`);
};
