/**
 * Pure TypeScript Code 128 (Subset B) Barcode Generator
 * Generates standards-compliant, 100% scannable 1D barcodes for POS scanners,
 * barcode scanner guns, and mobile camera scanners (Google Lens, Zebra, ZXing).
 */

// Official ISO/IEC 15417 Code 128 Character Patterns (Symbol widths: 3 bars, 3 spaces = 11 modules)
// Pattern 106 (STOP) has 4 bars, 3 spaces = 13 modules
export const CODE128_PATTERNS: number[][] = [
  [2, 1, 2, 2, 2, 2], // 0 ' '
  [2, 2, 2, 1, 2, 2], // 1 '!'
  [2, 2, 2, 2, 2, 1], // 2 '"'
  [1, 2, 1, 2, 2, 3], // 3 '#'
  [1, 2, 1, 3, 2, 2], // 4 '$'
  [1, 3, 1, 2, 2, 2], // 5 '%'
  [1, 2, 2, 2, 1, 3], // 6 '&'
  [1, 2, 2, 3, 1, 2], // 7 '''
  [1, 3, 2, 2, 1, 2], // 8 '('
  [2, 2, 1, 2, 1, 3], // 9 ')'
  [2, 2, 1, 3, 1, 2], // 10 '*'
  [2, 3, 1, 2, 1, 2], // 11 '+'
  [1, 1, 2, 2, 3, 2], // 12 ','
  [1, 2, 2, 1, 3, 2], // 13 '-'
  [1, 2, 2, 2, 3, 1], // 14 '.'
  [1, 1, 3, 2, 2, 2], // 15 '/'
  [1, 2, 3, 1, 2, 2], // 16 '0'
  [1, 2, 3, 2, 2, 1], // 17 '1'
  [2, 2, 3, 2, 1, 1], // 18 '2'
  [2, 2, 1, 1, 3, 2], // 19 '3'
  [2, 2, 1, 2, 3, 1], // 20 '4'
  [2, 1, 3, 2, 1, 2], // 21 '5'
  [2, 2, 3, 1, 1, 2], // 22 '6'
  [3, 1, 2, 1, 3, 1], // 23 '7'
  [3, 1, 1, 2, 2, 2], // 24 '8'
  [3, 2, 1, 1, 2, 2], // 25 '9'
  [3, 2, 1, 2, 2, 1], // 26 ':'
  [3, 1, 2, 2, 1, 2], // 27 ';'
  [3, 2, 2, 1, 1, 2], // 28 '<'
  [3, 2, 2, 2, 1, 1], // 29 '='
  [2, 1, 2, 1, 2, 3], // 30 '>'
  [2, 1, 2, 3, 2, 1], // 31 '?'
  [2, 3, 2, 1, 2, 1], // 32 '@'
  [1, 1, 1, 3, 2, 3], // 33 'A'
  [1, 3, 1, 1, 2, 3], // 34 'B'
  [1, 3, 1, 3, 2, 1], // 35 'C'
  [1, 1, 2, 3, 1, 3], // 36 'D'
  [1, 3, 2, 1, 1, 3], // 37 'E'
  [1, 3, 2, 3, 1, 1], // 38 'F'
  [2, 1, 1, 3, 1, 3], // 39 'G'
  [2, 3, 1, 1, 1, 3], // 40 'H'
  [2, 3, 1, 3, 1, 1], // 41 'I'
  [1, 1, 2, 1, 3, 3], // 42 'J'
  [1, 1, 2, 3, 3, 1], // 43 'K'
  [1, 3, 2, 1, 3, 1], // 44 'L'
  [1, 1, 3, 1, 2, 3], // 45 'M'
  [1, 1, 3, 3, 2, 1], // 46 'N'
  [1, 3, 3, 1, 2, 1], // 47 'O'
  [3, 1, 3, 1, 2, 1], // 48 'P'
  [2, 1, 1, 3, 3, 1], // 49 'Q'
  [2, 3, 1, 1, 3, 1], // 50 'R'
  [2, 1, 3, 1, 1, 3], // 51 'S'
  [2, 1, 3, 3, 1, 1], // 52 'T'
  [2, 1, 3, 1, 3, 1], // 53 'U'
  [3, 1, 1, 1, 2, 3], // 54 'V'
  [3, 1, 1, 3, 2, 1], // 55 'W'
  [3, 3, 1, 1, 2, 1], // 56 'X'
  [3, 1, 2, 1, 1, 3], // 57 'Y'
  [3, 1, 2, 3, 1, 1], // 58 'Z'
  [3, 3, 2, 1, 1, 1], // 59 '['
  [3, 1, 4, 1, 1, 1], // 60 '\'
  [2, 2, 1, 4, 1, 1], // 61 ']'
  [4, 3, 1, 1, 1, 1], // 62 '^'
  [1, 1, 1, 2, 2, 4], // 63 '_'
  [1, 1, 1, 4, 2, 2], // 64 '`'
  [1, 2, 1, 1, 2, 4], // 65 'a'
  [1, 2, 1, 4, 2, 1], // 66 'b'
  [1, 4, 1, 1, 2, 2], // 67 'c'
  [1, 4, 1, 2, 2, 1], // 68 'd'
  [1, 1, 2, 2, 1, 4], // 69 'e'
  [1, 1, 2, 4, 1, 2], // 70 'f'
  [1, 2, 2, 1, 1, 4], // 71 'g'
  [1, 2, 2, 4, 1, 1], // 72 'h'
  [1, 4, 2, 1, 1, 2], // 73 'i'
  [1, 4, 2, 2, 1, 1], // 74 'j'
  [2, 4, 1, 2, 1, 1], // 75 'k'
  [2, 2, 1, 1, 1, 4], // 76 'l'
  [4, 1, 3, 1, 1, 1], // 77 'm'
  [2, 4, 1, 1, 1, 2], // 78 'n'
  [1, 3, 4, 1, 1, 1], // 79 'o'
  [1, 1, 1, 2, 4, 2], // 80 'p'
  [1, 2, 1, 1, 4, 2], // 81 'q'
  [1, 2, 1, 2, 4, 1], // 82 'r'
  [1, 1, 4, 2, 1, 2], // 83 's'
  [1, 2, 4, 1, 1, 2], // 84 't'
  [1, 2, 4, 2, 1, 1], // 85 'u'
  [4, 1, 1, 2, 1, 2], // 86 'v'
  [4, 2, 1, 1, 1, 2], // 87 'w'
  [4, 2, 1, 2, 1, 1], // 88 'x'
  [2, 1, 2, 1, 4, 1], // 89 'y'
  [2, 1, 4, 1, 2, 1], // 90 'z'
  [4, 1, 2, 1, 2, 1], // 91 '{'
  [1, 1, 1, 1, 4, 3], // 92 '|'
  [1, 1, 1, 3, 4, 1], // 93 '}'
  [1, 3, 1, 1, 4, 1], // 94 '~'
  [1, 1, 4, 1, 1, 3], // 95 DEL
  [1, 1, 4, 3, 1, 1], // 96 FNC3
  [4, 1, 1, 1, 1, 3], // 97 FNC2
  [4, 1, 1, 3, 1, 1], // 98 SHIFT
  [1, 1, 3, 1, 4, 1], // 99 CODE C
  [1, 1, 4, 1, 3, 1], // 100 CODE B
  [3, 1, 1, 1, 4, 1], // 101 FNC4
  [4, 1, 1, 1, 3, 1], // 102 FNC1
  [2, 1, 1, 4, 1, 2], // 103 START A
  [2, 1, 1, 2, 1, 4], // 104 START B
  [2, 1, 1, 2, 3, 2], // 105 START C
  [2, 3, 3, 1, 1, 1, 2] // 106 STOP (4 bars, 3 spaces)
];

const START_B = 104;
const STOP = 106;

export interface Code128BarcodeData {
  widths: number[];
  totalUnits: number;
  encodedText: string;
}

/**
 * Encodes ASCII text into authentic Code 128 Subset B alternating bar/space widths.
 * Format: [bar1, space1, bar2, space2, ...]
 */
export function encodeCode128(text: string): Code128BarcodeData {
  const sanitized = text.replace(/[^\x20-\x7E]/g, ''); // ASCII 32 to 126
  const widths: number[] = [];

  // 1. Quiet zone on left: 10 units of space (we handle as layout or first space)
  // 2. START Code B (index 104)
  widths.push(...CODE128_PATTERNS[START_B]);
  let checksum = START_B;

  // 3. Characters & Checksum
  for (let i = 0; i < sanitized.length; i++) {
    const charCode = sanitized.charCodeAt(i) - 32;
    widths.push(...CODE128_PATTERNS[charCode]);
    checksum = (checksum + (i + 1) * charCode) % 103;
  }

  // 4. Checksum pattern
  widths.push(...CODE128_PATTERNS[checksum]);

  // 5. STOP pattern (index 106)
  widths.push(...CODE128_PATTERNS[STOP]);

  const totalUnits = widths.reduce((sum, w) => sum + w, 0);

  return {
    widths,
    totalUnits,
    encodedText: sanitized,
  };
}

/**
 * Generates an SVG Data URL of a Code 128 barcode with quiet zones.
 * Can be used directly as an <img src="..." /> in React/HTML.
 */
export function generateCode128SvgDataUrl(
  text: string,
  options: {
    height?: number;
    barColor?: string;
    bgColor?: string;
    quietZoneModules?: number;
  } = {}
): string {
  const {
    height = 50,
    barColor = '#111827',
    bgColor = '#FFFFFF',
    quietZoneModules = 10,
  } = options;

  const { widths, totalUnits } = encodeCode128(text);
  const fullWidth = totalUnits + quietZoneModules * 2;

  let rects = '';
  let currentX = quietZoneModules;

  for (let i = 0; i < widths.length; i++) {
    const width = widths[i];
    const isBar = i % 2 === 0;
    if (isBar) {
      rects += `<rect x="${currentX}" y="0" width="${width}" height="${height}" fill="${barColor}" />`;
    }
    currentX += width;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fullWidth} ${height}" width="100%" height="100%" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${bgColor}"/>${rects}</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Draws standards-compliant Code 128 barcode bars into a jsPDF document.
 */
export function drawCode128InPdf(
  doc: any,
  text: string,
  x: number,
  y: number,
  targetWidth: number,
  targetHeight: number,
  color: [number, number, number] = [17, 24, 39]
) {
  const { widths, totalUnits } = encodeCode128(text);
  const unitWidth = targetWidth / totalUnits;

  doc.setFillColor(...color);

  let currentX = x;
  for (let i = 0; i < widths.length; i++) {
    const width = widths[i];
    const isBar = i % 2 === 0;
    const barWidth = width * unitWidth;

    if (isBar) {
      doc.rect(currentX, y, barWidth, targetHeight, 'F');
    }
    currentX += barWidth;
  }
}
