import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRIMARY_TEAL: [number, number, number] = [47, 125, 109]; // #2F7D6D
const SECONDARY_NAVY: [number, number, number] = [15, 23, 42]; // #0F172A
const ACCENT_EMERALD: [number, number, number] = [16, 185, 129]; // #10B981
const ACCENT_BLUE: [number, number, number] = [30, 58, 138]; // #1E3A8A
const TEXT_MUTED: [number, number, number] = [100, 116, 139]; // #64748B
const TEXT_DARK: [number, number, number] = [30, 41, 59]; // #1E293B
const BG_SLATE: [number, number, number] = [248, 250, 252]; // #F8FAFC
const BORDER_COLOR: [number, number, number] = [226, 232, 240]; // #E2E8F0
const MINT_BG: [number, number, number] = [236, 253, 245]; // #ECFDF5

export interface LeaseContractData {
  contractHash: string;
  landlordName: string;
  tenantName: string;
  propertyName: string;
  roomName: string;
  propertyAddress: string;
  moveInDate: string;
  checkOutDate: string;
  depositAmount: number;
  rentAmount: number;
  moveOutNoticeDays: number;
  customClauses: string[];
  houseRules?: string[];
  landlordSignatureBase64: string;
  tenantSignatureBase64?: string;
  isAccepted?: boolean;
  isDraft?: boolean;
}

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

export const generateLeaseContractPDF = async (
  filename: string,
  data: LeaseContractData,
  returnBlob: boolean = false
): Promise<Blob | void> => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const isAccepted = Boolean(data.isAccepted);
  const rawTenant = (data.tenantName || '').trim();
  const displayTenantName = (!rawTenant || rawTenant === '[APPLICANT TENANT]')
    ? (data.isDraft ? '[Prospective Tenant Applicant]' : 'Applicant Tenant')
    : rawTenant;

  const hashLabel = data.contractHash ? data.contractHash.toUpperCase() : 'AUDIT-DRAFT';
  const effectiveDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const houseRules = data.houseRules || [];
  const customClauses = data.customClauses || [];
  const allRulesList: string[] = Array.from(new Set([...houseRules, ...customClauses])).filter(Boolean);

  let logoElement: HTMLImageElement | null = null;
  try {
    logoElement = await loadLogoImage();
  } catch (e) {
    logoElement = null;
  }

  const applyHeaderAndFooter = (pageNum: number, total: number) => {
    doc.setPage(pageNum);

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
    doc.text(`DIGITAL LEASE AGREEMENT  •  EFFECTIVE: ${effectiveDate.toUpperCase()}`, 33, 22.5);

    // Header Right: Status Badge & Verification Hash
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(226, 232, 240);
    doc.text(`HASH: ${hashLabel}`, 196, 11, { align: 'right' });

    if (isAccepted) {
      doc.setFillColor(...MINT_BG);
      doc.setDrawColor(...ACCENT_EMERALD);
      doc.roundedRect(130, 14, 66, 7.5, 1.5, 1.5, 'FD');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PRIMARY_TEAL);
      doc.text('OFFICIAL EXECUTED LEASE AGREEMENT', 163, 18.8, { align: 'center' });
    } else {
      doc.setFillColor(30, 41, 59);
      doc.setDrawColor(71, 85, 105);
      doc.roundedRect(128, 14, 68, 7.5, 1.5, 1.5, 'FD');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(203, 213, 225);
      doc.text('DRAFT LEASE AGREEMENT — PREVIEW ONLY', 162, 18.8, { align: 'center' });
    }

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
    doc.text(`|  Verification Hash: ${hashLabel}  |  Authentic Digital Record`, 70, 287);
    doc.text(`Page ${pageNum} of ${total}`, 196, 287, { align: 'right' });
  };

  // --- PAGE 1 CONTENT ---
  let currentY = 34;

  // --- SECTION 1: CONTRACT PARTIES ---
  drawSectionTitle(doc, '1. THE CONTRACT PARTIES', currentY);
  currentY += 5;

  // Landlord Card
  doc.setFillColor(...BG_SLATE);
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, currentY, 88, 18, 2, 2, 'FD');
  
  // Primary Teal Left Indicator Stripe
  doc.setFillColor(...PRIMARY_TEAL);
  doc.roundedRect(14, currentY, 3, 18, 1, 1, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_MUTED);
  doc.text('LANDLORD / PROPERTY OWNER', 20, currentY + 5.5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...SECONDARY_NAVY);
  doc.text(data.landlordName || 'Property Owner', 20, currentY + 11.5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PRIMARY_TEAL);
  doc.text('Authorized Lessor & Representative', 20, currentY + 15.5);

  // Tenant Card
  doc.setFillColor(...BG_SLATE);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(108, currentY, 88, 18, 2, 2, 'FD');

  // Accent Blue Left Indicator Stripe
  doc.setFillColor(...ACCENT_BLUE);
  doc.roundedRect(108, currentY, 3, 18, 1, 1, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_MUTED);
  doc.text('TENANT / APPLICANT', 114, currentY + 5.5);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...SECONDARY_NAVY);
  doc.text(displayTenantName, 114, currentY + 11.5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...ACCENT_BLUE);
  doc.text('Verified Prospective Lessee', 114, currentY + 15.5);

  currentY += 24;

  // --- SECTION 2: LEASED PREMISES ---
  drawSectionTitle(doc, '2. THE LEASED PREMISES & UNIT DETAILS', currentY);
  currentY += 5;

  const rawAddress = data.propertyAddress || 'Camiling, Tarlac';
  // Wrap address cleanly to width of 120mm
  const addressLines = doc.splitTextToSize(rawAddress, 120);
  const addressBlockHeight = Math.max(10, addressLines.length * 4.5);
  const totalCardHeight = 20 + addressBlockHeight;

  doc.setFillColor(...BG_SLATE);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(14, currentY, 182, totalCardHeight, 2, 2, 'FD');

  // Top Grid Row
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_MUTED);
  doc.text('PROPERTY TITLE', 19, currentY + 5.5);
  doc.text('ROOM / UNIT NAME', 112, currentY + 5.5);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...SECONDARY_NAVY);
  doc.text(data.propertyName || 'Boarding House Property', 19, currentY + 10.5);
  doc.text(data.roomName || 'Selected Unit', 112, currentY + 10.5);

  // Horizontal Divider Line inside Premises Card
  doc.setDrawColor(...BORDER_COLOR);
  doc.setLineWidth(0.2);
  doc.line(18, currentY + 13.5, 192, currentY + 13.5);

  // Bottom Address Row
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...TEXT_MUTED);
  doc.text('ADMINISTRATIVE ADDRESS', 19, currentY + 18.5);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...TEXT_DARK);
  doc.text(addressLines, 62, currentY + 18.5);

  currentY += totalCardHeight + 7;

  // --- SECTION 3: FINANCIAL SCHEDULE ---
  drawSectionTitle(doc, '3. LEASE TERM & FINANCIAL SCHEDULE', currentY);
  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [['Lease Term & Financial Parameter', 'Details & Official Terms']],
    body: [
      ['Move-In Date', data.moveInDate || 'Effective Upon Signing'],
      ['Expected Check-Out Date', data.checkOutDate || 'Per Lease Duration'],
      ['Monthly Base Rent', `PHP ${Number(data.rentAmount || 0).toLocaleString()} / month`],
      ['Security Deposit Requirement', `PHP ${Number(data.depositAmount || 0).toLocaleString()}`],
      ['Move-Out Notice Requirement', `${data.moveOutNoticeDays || 30} Days Advance Notice`],
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
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: BG_SLATE,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 78 },
      1: { cellWidth: 104 },
    },
    tableLineWidth: 0.2,
    tableLineColor: BORDER_COLOR,
    margin: { left: 14, right: 14 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // --- ALWAYS ADD PAGE BREAK FOR CLEAN 2-PAGE EXECUTIVE LAYOUT ---
  doc.addPage();
  currentY = 34;

  // --- PAGE 2: HOUSE RULES & SIGNATURES ---

  // --- SECTION 4: HOUSE RULES ---
  drawSectionTitle(doc, '4. HOUSE RULES, COMPOUND POLICIES & CLAUSES', currentY);
  currentY += 6;

  if (allRulesList.length > 0) {
    allRulesList.forEach((rule, idx) => {
      const ruleNum = String(idx + 1).padStart(2, '0');
      const splitText = doc.splitTextToSize(rule, 160);
      const ruleCardHeight = Math.max(9, splitText.length * 4.5 + 3);

      if (currentY + ruleCardHeight > 265) {
        doc.addPage();
        currentY = 34;
      }

      doc.setFillColor(...BG_SLATE);
      doc.setDrawColor(...BORDER_COLOR);
      doc.roundedRect(14, currentY - 2, 182, ruleCardHeight, 1.5, 1.5, 'FD');

      // Rule Number Pill
      doc.setFillColor(...PRIMARY_TEAL);
      doc.roundedRect(17, currentY, 8, 4.5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(ruleNum, 21, currentY + 3.2, { align: 'center' });

      // Rule Content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(...TEXT_DARK);
      doc.text(splitText, 28, currentY + 3.2);

      currentY += ruleCardHeight + 3;
    });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Standard Boarding House Regulations & Local Municipal Ordinances Apply.', 18, currentY);
    currentY += 10;
  }

  currentY += 6;

  // --- SECTION 5: SIGNATURES & ACKNOWLEDGEMENT ---
  if (currentY > 200) {
    doc.addPage();
    currentY = 34;
  }

  drawSectionTitle(doc, '5. SIGNATURES & DIGITAL ACKNOWLEDGEMENT', currentY);
  currentY += 5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('By signing below (Landlord) and digitally accepting terms upon checkout (Tenant), both parties agree to all terms set forth.', 18, currentY);
  currentY += 7;

  // Signature Boxes Container
  const sigBoxY = currentY;
  const sigBoxWidth = 88;
  const sigBoxHeight = 30;

  // --- Landlord Signature Card ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...BORDER_COLOR);
  doc.roundedRect(14, sigBoxY, sigBoxWidth, sigBoxHeight, 2, 2, 'FD');

  const isValidSig = typeof data.landlordSignatureBase64 === 'string' &&
    data.landlordSignatureBase64.trim().length > 20 &&
    (data.landlordSignatureBase64.startsWith('data:image/') ||
     data.landlordSignatureBase64.startsWith('http://') ||
     data.landlordSignatureBase64.startsWith('https://'));

  if (isValidSig) {
    try {
      doc.addImage(data.landlordSignatureBase64, 'PNG', 16, sigBoxY + 3, sigBoxWidth - 4, sigBoxHeight - 6);
    } catch (e) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('[ Official Landlord Signature On File ]', 14 + sigBoxWidth / 2, sigBoxY + 16, { align: 'center' });
    }
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('[ Official Landlord Signature On File ]', 14 + sigBoxWidth / 2, sigBoxY + 16, { align: 'center' });
  }

  // --- Tenant Digital Audit Stamp Box ---
  if (isAccepted) {
    doc.setFillColor(...MINT_BG);
    doc.setDrawColor(...PRIMARY_TEAL);
    doc.roundedRect(108, sigBoxY, sigBoxWidth, sigBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...PRIMARY_TEAL);
    doc.text('DIGITAL CONSENT STAMP RECORDED', 113, sigBoxY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Verified online via reservation checkout', 113, sigBoxY + 14);
    doc.text(`Tenant: ${displayTenantName}`, 113, sigBoxY + 19);
    doc.text(`Audit Timestamp: ${effectiveDate}`, 113, sigBoxY + 24);
  } else {
    doc.setFillColor(...BG_SLATE);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(108, sigBoxY, sigBoxWidth, sigBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text('DIGITAL CONSENT PENDING', 113, sigBoxY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text('Online checkbox consent required at checkout', 113, sigBoxY + 14);
    doc.text(`Tenant: ${displayTenantName}`, 113, sigBoxY + 19);
    doc.text('Status: Awaiting Landlord Approval & Checkout', 113, sigBoxY + 24);
  }

  // Under-Signature Name Labels
  currentY = sigBoxY + sigBoxHeight + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...SECONDARY_NAVY);
  doc.text(data.landlordName || 'Landlord', 14 + sigBoxWidth / 2, currentY, { align: 'center' });
  doc.text(displayTenantName, 108 + sigBoxWidth / 2, currentY, { align: 'center' });

  currentY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text('Landlord (Authorized Representative)', 14 + sigBoxWidth / 2, currentY, { align: 'center' });
  doc.text(isAccepted ? 'Tenant (Digital Consent Recorded)' : 'Tenant (Digital Consent Pending)', 108 + sigBoxWidth / 2, currentY, { align: 'center' });

  // Apply Page Decorations & Footer across all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    applyHeaderAndFooter(i, totalPages);
  }

  if (returnBlob) {
    return doc.output('blob');
  }

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
};

export const previewPdfBlob = async (
  blobOrUrl: Blob | string,
  _title: string = "Smart Lease Contract Preview",
  targetWindow?: Window | null
): Promise<boolean> => {
  if (!blobOrUrl) {
    if (targetWindow && !targetWindow.closed) targetWindow.close();
    return false;
  }

  let pdfUrl = "";

  try {
    if (typeof blobOrUrl === "string") {
      pdfUrl = blobOrUrl;
    } else if (blobOrUrl instanceof Blob) {
      const pdfBlob = blobOrUrl.type === "application/pdf" ? blobOrUrl : new Blob([blobOrUrl], { type: "application/pdf" });
      pdfUrl = URL.createObjectURL(pdfBlob);
    }

    if (!pdfUrl) {
      if (targetWindow && !targetWindow.closed) targetWindow.close();
      return false;
    }

    if (targetWindow && !targetWindow.closed) {
      targetWindow.location.href = pdfUrl;
    } else {
      const win = window.open(pdfUrl, "_blank");
      if (!win) {
        window.location.href = pdfUrl;
      }
    }
    return true;
  } catch (e) {
    console.error("Failed to preview PDF Blob:", e);
    if (targetWindow && !targetWindow.closed) targetWindow.close();
    return false;
  }
};
