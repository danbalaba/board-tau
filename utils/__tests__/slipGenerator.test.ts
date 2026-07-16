import { generateConfirmationSlipPDF } from '../slipGenerator';

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
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    line: jest.fn(),
    setFillColor: jest.fn(),
    roundedRect: jest.fn(),
    rect: jest.fn(),
    save: jest.fn(),
    lastAutoTable: { finalY: 100 }
  }));
});

jest.mock('jspdf-autotable', () => jest.fn());

describe('slipGenerator', () => {
  it('generates a confirmation slip PDF', async () => {
    const mockReservation = {
      id: 'res_12345678',
      listing: { title: 'Dorm', region: 'Tarlac', country: 'PH' },
      room: { roomType: 'SOLO', name: 'Room 1' },
      startDate: '2026-01-01',
      endDate: '2026-06-01',
      durationInDays: 150,
      totalPrice: 15000
    };

    await expect(
      generateConfirmationSlipPDF(mockReservation, 'John Doe', 'john@test.com')
    ).resolves.toBeUndefined();
  });
});
