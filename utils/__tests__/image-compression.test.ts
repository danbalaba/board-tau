import { compressImage } from '../image-compression';

describe('image-compression', () => {
  beforeEach(() => {
    // Mock URL.createObjectURL since it's not in JSDOM
    global.URL.createObjectURL = jest.fn();
    
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jest.fn(function(this: any, file) {
        setTimeout(() => {
          this.onload({ target: { result: 'data:image/png;base64,123' } });
        }, 10);
      }),
      onload: jest.fn(),
      onerror: jest.fn(),
    };
    global.FileReader = jest.fn(() => mockFileReader) as any;

    // Mock Image since it's tricky in JSDOM
    // @ts-ignore
    global.Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src: string = '';
      width: number = 2000;
      height: number = 1000;
      
      constructor() {
        setTimeout(() => {
          this.onload();
        }, 10);
      }
    };
    
    // Mock Canvas
    const mockContext = {
      drawImage: jest.fn(),
    };
    const mockCanvas = {
      getContext: jest.fn(() => mockContext),
      toBlob: jest.fn((cb) => cb(new Blob(['compressed'], { type: 'image/webp' }))),
      width: 0,
      height: 0,
    } as unknown as HTMLCanvasElement;
    jest.spyOn(document, 'createElement').mockReturnValue(mockCanvas);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns file if it is not an image', async () => {
    const file = new File(['text'], 'test.txt', { type: 'text/plain' });
    const result = await compressImage(file);
    expect(result).toBe(file);
  });

  it('returns file if it is a small webp', async () => {
    const file = new File(['webp'], 'test.webp', { type: 'image/webp' });
    Object.defineProperty(file, 'size', { value: 100 * 1024 });
    const result = await compressImage(file);
    expect(result).toBe(file);
  });

  it('compresses a large image successfully', async () => {
    const largeFile = new File(['large_image_data_that_is_bigger_than_compressed'], 'large.png', { type: 'image/png' });
    Object.defineProperty(largeFile, 'size', { value: 2000 * 1024 });
    
    const result = await compressImage(largeFile, 1000);
    expect(result.name).toBe('large.webp');
    expect(result.type).toBe('image/webp');
  });

  it('returns original file if canvas context is not available', async () => {
    jest.spyOn(document, 'createElement').mockReturnValue({
      getContext: () => null,
      width: 0,
      height: 0,
    } as any);

    const largeFile = new File(['large'], 'large.png', { type: 'image/png' });
    const result = await compressImage(largeFile);
    expect(result).toBe(largeFile);
  });
  
  it('returns original file if canvas.toBlob returns null', async () => {
    jest.spyOn(document, 'createElement').mockReturnValue({
      getContext: () => ({ drawImage: jest.fn() }),
      toBlob: jest.fn((cb) => cb(null)),
      width: 0,
      height: 0,
    } as any);

    const largeFile = new File(['large'], 'large.png', { type: 'image/png' });
    const result = await compressImage(largeFile);
    expect(result).toBe(largeFile);
  });
});
