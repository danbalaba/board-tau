import { isPdfUrl } from '../utils';

describe('isPdfUrl', () => {
  it('should return false for null, undefined, or empty strings', () => {
    expect(isPdfUrl(null)).toBe(false);
    expect(isPdfUrl(undefined)).toBe(false);
    expect(isPdfUrl('')).toBe(false);
    expect(isPdfUrl('   ')).toBe(false);
  });

  it('should return false for base64 images even if payload contains /pdf', () => {
    // Simulated base64 data URL with /pdf embedded
    const base64JpgWithPdf = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYMBQY/pdf/sampledata==';
    const base64PngWithPdf = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA/PDF/test==';
    expect(isPdfUrl(base64JpgWithPdf)).toBe(false);
    expect(isPdfUrl(base64PngWithPdf)).toBe(false);
  });

  it('should return false for blob image URLs', () => {
    expect(isPdfUrl('blob:http://localhost:3000/pdf-uuid-1234')).toBe(false);
  });

  it('should return false for remote images even if path or name contains pdf', () => {
    expect(isPdfUrl('https://files.edgestore.dev/bucket/pdf_room_1.jpg')).toBe(false);
    expect(isPdfUrl('https://res.cloudinary.com/demo/image/upload/pdf-test.png')).toBe(false);
    expect(isPdfUrl('https://example.com/uploads/pdf/facade.webp')).toBe(false);
    expect(isPdfUrl('https://example.com/uploads/pdf/facade.jpg?token=pdf123')).toBe(false);
  });

  it('should return true for explicit PDF data URLs', () => {
    expect(isPdfUrl('data:application/pdf;base64,JVBERi0xLjQKJ...')).toBe(true);
  });

  it('should return true for remote PDF documents', () => {
    expect(isPdfUrl('https://files.edgestore.dev/bucket/lease-contract.pdf')).toBe(true);
    expect(isPdfUrl('https://files.edgestore.dev/bucket/permit.pdf?token=abc123')).toBe(true);
    expect(isPdfUrl('https://example.com/documents/contract.PDF#page=2')).toBe(true);
  });

  it('should correctly inspect wrapped /api/documents/view URLs', () => {
    expect(isPdfUrl('/api/documents/view?url=https%3A%2F%2Ffiles.edgestore.dev%2Fbucket%2Fpermit.pdf')).toBe(true);
    expect(isPdfUrl('/api/documents/view?url=https%3A%2F%2Ffiles.edgestore.dev%2Fbucket%2Froom.jpg')).toBe(false);
  });
});
