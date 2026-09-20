import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRIMARY_COLOR = [47, 125, 109]; // #2f7d6d

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
  landlordSignatureBase64: string;
  tenantSignatureBase64: string;
}

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

export const generateLeaseContractPDF = async (
  filename: string,
  data: LeaseContractData,
  returnBlob: boolean = false
): Promise<Blob | void> => {
  const doc = new jsPDF();
  
  let hasLogo = false;
  try {
    const logoData = await getLogoBase64();
    doc.addImage(logoData, 'PNG', 14, 10, 12, 12);
    hasLogo = true;
  } catch (error) {
    console.error('Logo not found, skipping...', error);
  }

  // Contract Verification Hash
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(150);
  doc.text(`VERIFICATION HASH: ${data.contractHash}`, 196, 15, { align: 'right' });

  // Branding
  const brandX = hasLogo ? 29 : 14;
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('BoardTAU', brandX, 19);

  // Document Title
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text('DIGITAL LEASE AGREEMENT', 14, 35);
  
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Effective Date: ${date}`, 14, 42);
  
  doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.setLineWidth(0.8);
  doc.line(14, 46, 196, 46);

  let currentY = 55;

  // 1. Parties
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('1. THE PARTIES', 14, currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50);
  doc.text(`This Lease Agreement is made and entered into by and between:`, 14, currentY);
  currentY += 6;
  doc.text(`Landlord: ${data.landlordName}`, 20, currentY);
  currentY += 5;
  doc.text(`Tenant: ${data.tenantName}`, 20, currentY);
  currentY += 10;

  // 2. Premises
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('2. THE PREMISES', 14, currentY);
  currentY += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50);
  doc.text(`The Landlord agrees to lease the following property to the Tenant:`, 14, currentY);
  currentY += 6;
  doc.text(`Property Name: ${data.propertyName}`, 20, currentY);
  currentY += 5;
  doc.text(`Room: ${data.roomName}`, 20, currentY);
  currentY += 5;
  const addressLines = doc.splitTextToSize(`Address: ${data.propertyAddress}`, 170);
  doc.text(addressLines, 20, currentY);
  currentY += (addressLines.length * 5) + 5;

  // 3. Lease Term
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('3. LEASE TERM & RENT', 14, currentY);
  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    head: [['Term', 'Details']],
    body: [
      ['Move-In Date', data.moveInDate],
      ['Expected Check-Out Date', data.checkOutDate],
      ['Monthly Rent', `PHP ${data.rentAmount.toLocaleString()}`],
      ['Security Deposit', `PHP ${data.depositAmount.toLocaleString()}`],
      ['Move-Out Notice', `${data.moveOutNoticeDays} Days`]
    ],
    theme: 'grid',
    headStyles: { fillColor: PRIMARY_COLOR as [number, number, number] },
    margin: { left: 14, right: 14 }
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  // 4. Custom Clauses
  if (data.customClauses.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.text('4. ADDITIONAL HOUSE RULES & POLICIES', 14, currentY);
    currentY += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    
    data.customClauses.forEach((clause, i) => {
      const clauseLines = doc.splitTextToSize(`${i + 1}. ${clause}`, 170);
      if (currentY + (clauseLines.length * 5) > 280) {
        doc.addPage();
        currentY = 20;
      }
      doc.text(clauseLines, 14, currentY);
      currentY += (clauseLines.length * 5) + 2;
    });
    currentY += 10;
  }

  // Check page overflow for signatures
  if (currentY > 200) {
    doc.addPage();
    currentY = 20;
  }

  // 5. Signatures
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('SIGNATURES & ACKNOWLEDGEMENT', 14, currentY);
  currentY += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100);
  doc.text('By signing below, both parties agree to the terms and conditions set forth in this agreement.', 14, currentY);
  currentY += 15;

  // Signature Boxes
  doc.setDrawColor(200);
  doc.rect(14, currentY, 80, 40);
  doc.rect(106, currentY, 80, 40);

  // Add signature images
  if (data.landlordSignatureBase64) {
    try {
      doc.addImage(data.landlordSignatureBase64, 'PNG', 16, currentY + 2, 76, 36);
    } catch (e) {
      console.error("Failed to add landlord signature to PDF", e);
    }
  }
  
  if (data.tenantSignatureBase64) {
    try {
      doc.addImage(data.tenantSignatureBase64, 'PNG', 108, currentY + 2, 76, 36);
    } catch (e) {
      console.error("Failed to add tenant signature to PDF", e);
    }
  }

  currentY += 45;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40);
  
  doc.text(data.landlordName, 54, currentY, { align: 'center' });
  doc.text(data.tenantName, 146, currentY, { align: 'center' });
  
  currentY += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Landlord', 54, currentY, { align: 'center' });
  doc.text('Tenant', 146, currentY, { align: 'center' });

  // Add page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, 196, pageHeight - 10, { align: 'right' });
    doc.text(`Contract Hash: ${data.contractHash}`, 14, pageHeight - 10);
  }

  if (returnBlob) {
    return doc.output('blob');
  } else {
    doc.save(`${filename}.pdf`);
  }
};

const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Safely opens a generated PDF Blob or PDF URL (blob:, data:, or http(s):) in a new browser tab using native PDF embed stream.
 * Converts Blobs & blob: URLs to Data URLs to bypass Chromium about:blank cross-origin blob restrictions.
 */
export const previewPdfBlob = async (
  blobOrUrl: Blob | string,
  title: string = "Smart Lease Contract Preview"
): Promise<boolean> => {
  let dataUrl: string | null = null;
  let rawBlob: Blob | null = null;

  if (blobOrUrl instanceof Blob) {
    rawBlob = blobOrUrl;
  } else if (typeof blobOrUrl === "string") {
    if (blobOrUrl.startsWith("data:")) {
      dataUrl = blobOrUrl;
    } else if (blobOrUrl.startsWith("blob:")) {
      try {
        const res = await fetch(blobOrUrl);
        if (res.ok) {
          rawBlob = await res.blob();
        }
      } catch (e) {
        console.warn("Blob URL unreachable or expired:", e);
      }
    } else if (blobOrUrl.trim()) {
      dataUrl = blobOrUrl;
    }
  }

  if (rawBlob && !dataUrl) {
    try {
      dataUrl = await blobToDataURL(rawBlob);
    } catch (e) {
      console.error("Failed converting Blob to Data URL:", e);
    }
  }

  if (!dataUrl) {
    return false;
  }

  const win = window.open("", "_blank");
  if (win) {
    win.document.open();
    win.document.write(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #525659;
      }
      embed, object, iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
    </style>
  </head>
  <body>
    <embed src="${dataUrl}" type="application/pdf" width="100%" height="100%" />
  </body>
</html>`);
    win.document.close();
    return true;
  } else {
    window.open(dataUrl, "_blank");
    return true;
  }
};
