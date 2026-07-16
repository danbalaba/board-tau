import { exportToExcel, exportToCSV, prepareDataForExport } from '../export-utils';
import * as XLSX from 'xlsx';

jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(() => ({})),
    aoa_to_sheet: jest.fn(() => ({})),
    json_to_sheet: jest.fn(() => ({})),
    sheet_add_json: jest.fn(),
    sheet_to_json: jest.fn(() => [['a']]),
    book_append_sheet: jest.fn(),
    sheet_to_csv: jest.fn(() => 'a,b,c\n1,2,3'),
  },
  writeFile: jest.fn(),
}));

describe('export-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => 'blob:url');
  });

  const metadata = {
    reportTitle: 'Test Report',
    reportId: '123',
    summary: [{ label: 'Total', value: '10' }],
    author: 'Admin',
  };

  it('exportToExcel exports with metadata', () => {
    exportToExcel([{ id: 1, name: 'Test' }], 'test', 'Sheet1', metadata);
    expect(XLSX.utils.book_new).toHaveBeenCalled();
    expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalled();
    expect(XLSX.utils.sheet_add_json).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalledWith(expect.any(Object), 'test.xlsx');
  });

  it('exportToExcel exports without metadata', () => {
    exportToExcel([{ id: 1, name: 'Test' }], 'test');
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
    expect(XLSX.writeFile).toHaveBeenCalledWith(expect.any(Object), 'test.xlsx');
  });

  it('exportToCSV exports with metadata', () => {
    const clickMock = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    exportToCSV([{ id: 1, name: 'Test' }], 'test', metadata);
    expect(XLSX.utils.json_to_sheet).toHaveBeenCalled();
    expect(XLSX.utils.sheet_to_csv).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    clickMock.mockRestore();
  });

  it('exportToCSV exports without metadata', () => {
    const clickMock = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    exportToCSV([{ id: 1, name: 'Test' }], 'test');
    expect(XLSX.utils.sheet_to_csv).toHaveBeenCalled();
    clickMock.mockRestore();
  });

  it('prepareDataForExport prepares property data', () => {
    const result = prepareDataForExport([{ title: 'A', category: 'Cat', address: 'Add', price: 100, isArchived: false, rooms: [1], createdAt: '2026-01-01' }], 'property');
    expect(result[0]['Property Name']).toBe('A');
    expect(result[0]['Status']).toBe('Active');
  });

  it('prepareDataForExport prepares room data', () => {
    const result = prepareDataForExport([{ title: 'R1', property: { title: 'P1' }, type: 'SOLO', capacity: 2, price: 100, isArchived: true, createdAt: '2026-01-01' }], 'room');
    expect(result[0]['Room Name']).toBe('R1');
    expect(result[0]['Status']).toBe('Archived');
  });

  it('prepareDataForExport prepares booking data', () => {
    const result = prepareDataForExport([{ user: { name: 'U1' }, room: { title: 'R1', property: { title: 'P1' } }, startDate: '2026-01-01', endDate: '2026-01-02', totalPrice: 100, status: 'CONFIRMED', paymentStatus: 'PAID' }], 'booking');
    expect(result[0]['Guest']).toBe('U1');
  });

  it('prepareDataForExport prepares inquiry data', () => {
    const result = prepareDataForExport([{ user: { name: 'U1' }, listing: { title: 'L1' }, message: 'Hello', status: 'PENDING', createdAt: '2026-01-01' }], 'inquiry');
    expect(result[0]['Tenant']).toBe('U1');
  });

  it('prepareDataForExport prepares review data', () => {
    const result = prepareDataForExport([{ user: { name: 'U1' }, listing: { title: 'L1' }, rating: 5, comment: 'Good', status: 'PUBLISHED', createdAt: '2026-01-01' }], 'review');
    expect(result[0]['Reviewer']).toBe('U1');
  });

  it('prepareDataForExport prepares reservation data', () => {
    const result = prepareDataForExport([{ user: { name: 'U1' }, room: { name: 'R1' }, startDate: '2026-01-01', endDate: '2026-01-02', totalPrice: 100, status: 'CONFIRMED', createdAt: '2026-01-01' }], 'reservation');
    expect(result[0]['Guest']).toBe('U1');
  });

  it('prepareDataForExport handles unknown type', () => {
    const data = [{ id: 1 }];
    // @ts-ignore
    const result = prepareDataForExport(data, 'unknown');
    expect(result).toBe(data);
  });
});
