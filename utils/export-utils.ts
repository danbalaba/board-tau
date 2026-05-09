import * as XLSX from 'xlsx';

/**
 * Utility to export data to CSV and Excel formats with Enterprise Metadata
 */
export interface ExportMetadata {
  reportTitle: string;
  reportId: string;
  summary: { label: string; value: string }[];
  author: string;
}

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Sheet1', metadata?: ExportMetadata) => {
  const workbook = XLSX.utils.book_new();
  let worksheet;

  if (metadata) {
    // 1. Create a professional header block
    const headerRows = [
      [metadata.reportTitle.toUpperCase()],
      [`REPORT ID: ${metadata.reportId}`],
      [`GENERATED ON: ${new Date().toLocaleString()}`],
      [`AUTHOR: ${metadata.author}`],
      [], // Empty row
      ['EXECUTIVE SUMMARY'],
      metadata.summary.map(s => `${s.label}: ${s.value}`),
      [], // Empty row
    ];

    worksheet = XLSX.utils.aoa_to_sheet(headerRows);
    
    // 2. Append the main data table below the header (starting at row 9)
    XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A9' });
  } else {
    worksheet = XLSX.utils.json_to_sheet(data);
  }

  // 3. Auto-size columns for professional look
  const objectMaxLength: number[] = [];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  rows.forEach((row) => {
    row.forEach((cell, i) => {
      const cellValue = cell ? cell.toString() : '';
      objectMaxLength[i] = Math.max(objectMaxLength[i] || 10, cellValue.length + 2);
    });
  });
  worksheet['!cols'] = objectMaxLength.map(w => ({ width: w }));

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToCSV = (data: any[], fileName: string, metadata?: ExportMetadata) => {
  let csvContent = '';

  if (metadata) {
    // Prepend metadata lines
    csvContent += `REPORT: ${metadata.reportTitle}\n`;
    csvContent += `REPORT ID: ${metadata.reportId}\n`;
    csvContent += `GENERATED: ${new Date().toLocaleString()}\n`;
    csvContent += `SUMMARY: ${metadata.summary.map(s => `${s.label}: ${s.value}`).join(' | ')}\n`;
    csvContent += `\n`; // Spacer
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  csvContent += XLSX.utils.sheet_to_csv(worksheet);
  
  // Create blob with UTF-8 BOM for Excel compatibility
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Helper to flatten and clean data for reports
 * This removes internal IDs, complex objects, etc.
 */
export const prepareDataForExport = (data: any[], type: 'property' | 'room' | 'booking' | 'inquiry' | 'review' | 'reservation') => {
  switch (type) {
    case 'property':
      return data.map(item => ({
        'Property Name': item.title,
        'Category': item.category,
        'Address': item.address,
        'Price': item.price,
        'Status': item.isArchived ? 'Archived' : 'Active',
        'Rooms': item.rooms?.length || 0,
        'Created At': new Date(item.createdAt).toLocaleDateString()
      }));
    
    case 'room':
      return data.map(item => ({
        'Room Name': item.title,
        'Property': item.property?.title || 'N/A',
        'Type': item.type,
        'Capacity': `${item.capacity} Pax`,
        'Price': item.price,
        'Status': item.isArchived ? 'Archived' : 'Active',
        'Created At': new Date(item.createdAt).toLocaleDateString()
      }));

    case 'booking':
      return data.map(item => ({
        'Guest': item.user?.name || 'N/A',
        'Property': item.room?.property?.title || 'N/A',
        'Room': item.room?.title || 'N/A',
        'Check-In': new Date(item.startDate).toLocaleDateString(),
        'Check-Out': new Date(item.endDate).toLocaleDateString(),
        'Amount': item.totalPrice,
        'Status': item.status,
        'Payment': item.paymentStatus
      }));

    case 'inquiry':
      return data.map(item => ({
        'Tenant': item.user?.name || 'N/A',
        'Property': item.listing?.title || 'N/A',
        'Message': item.message,
        'Status': item.status,
        'Received At': new Date(item.createdAt).toLocaleDateString()
      }));

    case 'review':
      return data.map(item => ({
        'Reviewer': item.user?.name || 'N/A',
        'Property': item.listing?.title || 'N/A',
        'Rating': `${item.rating} Stars`,
        'Comment': item.comment,
        'Status': item.status,
        'Date': new Date(item.createdAt).toLocaleDateString()
      }));

    case 'reservation':
      return data.map(item => ({
        'Guest': item.user?.name || 'N/A',
        'Room': item.room?.title || 'N/A',
        'Dates': `${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}`,
        'Amount': item.totalPrice,
        'Status': item.status,
        'Reserved At': new Date(item.createdAt).toLocaleDateString()
      }));

    default:
      return data;
  }
};
