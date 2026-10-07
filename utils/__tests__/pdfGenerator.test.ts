import { generateTablePDF, generateMultiSectionPDF, generateVisualPDF } from '../pdfGenerator';

beforeAll(() => {
  // @ts-ignore
  global.Image = class {
    onload: any;
    onerror: any;
    src: string = '';
    width = 100;
    height = 100;
    constructor() {
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 0);
    }
  };

  // @ts-ignore
  global.document.createElement = jest.fn((tag) => {
    if (tag === 'canvas') {
      return {
        width: 100,
        height: 100,
        getContext: () => ({ drawImage: jest.fn() }),
        toDataURL: () => 'data:image/png;base64,mock',
      };
    }
    return {};
  });
});

jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    getTextWidth: jest.fn().mockReturnValue(20),
    getStringUnitWidth: jest.fn().mockReturnValue(20),
    splitTextToSize: jest.fn().mockImplementation((text: string) => Array.isArray(text) ? text : [text]),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    line: jest.fn(),
    setFillColor: jest.fn(),
    roundedRect: jest.fn(),
    rect: jest.fn(),
    circle: jest.fn(),
    triangle: jest.fn(),
    setPage: jest.fn(),
    addPage: jest.fn(),
    internal: {
      getNumberOfPages: jest.fn().mockReturnValue(1),
      pageSize: {
        height: 297,
        getWidth: jest.fn().mockReturnValue(210),
      }
    },
    save: jest.fn(),
    lastAutoTable: { finalY: 100 },
    getImageProperties: jest.fn().mockReturnValue({ width: 100, height: 100 })
  }));
});

jest.mock('jspdf-autotable', () => jest.fn());

jest.mock('html2canvas', () => jest.fn().mockResolvedValue({
  toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mock')
}));

describe('pdfGenerator', () => {
  const mockOptions = {
    title: 'Test Report',
    author: 'Admin',
    summaryData: [{ label: 'Total', value: '10' }]
  };

  it('generates a table PDF', async () => {
    await expect(generateTablePDF('test', ['Col 1'], [['Row 1']], mockOptions)).resolves.toBeUndefined();
  });

  it('generates a visual PDF', async () => {
    document.body.innerHTML = '<div id="test-id">Content</div>';
    await expect(generateVisualPDF('test', 'test-id', mockOptions)).resolves.toBeUndefined();
  });

  it('generates a multi-section PDF', async () => {
    const sections = [
      { type: 'text', title: 'Text Section', content: 'Hello World' },
      { type: 'table', title: 'Table Section', columns: ['A'], data: [['B']] }
    ];
    await expect(generateMultiSectionPDF('test', sections as any, mockOptions)).resolves.toBeUndefined();
  });
});
