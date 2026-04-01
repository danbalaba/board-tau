import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

interface ReportHeaderOptions {
  title: string;
  subtitle?: string;
  author?: string;
}

export interface ReportSection {
  title?: string;
  type: 'text' | 'table';
  content?: string | string[];
  columns?: string[];
  data?: any[][];
}

const PRIMARY_COLOR = [47, 125, 109]; // #2f7d6d

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

const addHeader = async (doc: jsPDF, options: ReportHeaderOptions) => {
  let hasLogo = false;
  try {
    const logoData = await getLogoBase64();
    // Square dimensions for the logo (12x12 instead of 30x10 stretched)
    doc.addImage(logoData, 'PNG', 14, 10, 12, 12);
    hasLogo = true;
  } catch (error) {
    console.error('Logo not found, skipping...', error);
  }

  // Draw exactly "BoardTAU" branding next to the logo (or starting left if no logo)
  const brandX = hasLogo ? 29 : 14;
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  // Use our primary color #2f7d6d for the brand name
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('BoardTAU', brandX, 19);

  // Document Title
  doc.setFontSize(20);
  doc.setTextColor(40);
  doc.setFont('helvetica', 'bold');
  doc.text(options.title, 14, 32);

  if (options.subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(options.subtitle, 14, 40);
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150);
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text(`Generated on: ${date}`, 14, 45);

  if (options.author) {
    doc.text(`Author: ${options.author}`, 14, 50);
  }

  // Draw a line
  doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.setLineWidth(0.5);
  doc.line(14, 55, 196, 55);
};

export const generateTablePDF = async (
  filename: string,
  columns: string[],
  data: any[][],
  options: ReportHeaderOptions
) => {
  const doc = new jsPDF();
  
  await addHeader(doc, options);

  autoTable(doc, {
    startY: 65,
    head: [columns],
    body: data,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR as [number, number, number],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50]
    },
    alternateRowStyles: {
      fillColor: [245, 250, 249]
    },
    margin: { top: 65 }
  });

  doc.save(`${filename}.pdf`);
};

export const generateVisualPDF = async (
  filename: string,
  elementId: string,
  options: ReportHeaderOptions
) => {
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

  doc.addImage(imgData, 'PNG', 14, 65, pdfWidth, pdfHeight);
  doc.save(`${filename}.pdf`);
};

export const generateMultiSectionPDF = async (
  filename: string,
  sections: ReportSection[],
  options: ReportHeaderOptions
) => {
  const doc = new jsPDF();
  await addHeader(doc, options);

  let currentY = 65;

  for (const section of sections) {
    if (section.title) {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
      doc.text(section.title, 14, currentY);
      currentY += 8;
    }

    if (section.type === 'text' && section.content) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      
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
          fillColor: PRIMARY_COLOR as [number, number, number],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [245, 250, 249]
        },
        margin: { top: 20 },
      });
      currentY = (doc as any).lastAutoTable.finalY + 15;
    }
  }

  doc.save(`${filename}.pdf`);
};
