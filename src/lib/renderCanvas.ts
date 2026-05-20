import { wrapText } from "./wrapText";

const CANVAS_SIZE = 1024;
const PREVIEW_CANVAS_SIZE = 512;
const EXPORT_CANVAS_SIZE = 2048;
const MIN_FONT_SIZE = 20;
const MAX_FONT_SIZE = 180;
export const DEFAULT_PADDING = 72;
const LINE_HEIGHT_RATIO = 1.0;
const BASE_CANVAS_SIZE = 1024;
const BLUR_RADIUS_AT_BASE_SIZE = 6;
const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export interface RenderResult {
  blob: Blob;
  dataUrl: string;
}

export interface RenderOptions {
  padding: number;
}

interface DrawCanvasOptions {
  size: number;
  pixelRatio: number;
  renderOptions: RenderOptions;
}

export const DEFAULT_RENDER_OPTIONS: RenderOptions = {
  padding: DEFAULT_PADDING,
};

function findBestFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
): number {
  const preferredMaxLines = getPreferredMaxLines(text);
  let best = MIN_FONT_SIZE;
  for (let s = MIN_FONT_SIZE; s <= MAX_FONT_SIZE; s += 2) {
    ctx.font = `400 ${s}px ${FONT_FAMILY}`;
    const lines = wrapText(ctx, text, maxWidth);
    const height = lines.length * s * LINE_HEIGHT_RATIO;
    const width = Math.max(...lines.map((line) => line.width));
    if (
      width <= maxWidth &&
      height <= maxHeight &&
      lines.length <= preferredMaxLines
    ) {
      best = s;
    } else {
      break;
    }
  }
  return best;
}

function getPreferredMaxLines(text: string): number {
  if (text.includes("\n")) return Number.POSITIVE_INFINITY;

  const normalized = text.replace(/\s+/g, " ").trim();
  const wordCount = normalized.split(" ").filter(Boolean).length;

  if (normalized.length <= 10) return 1;
  if (normalized.length <= 24 && wordCount <= 5) return 2;
  if (normalized.length <= 60) return 3;
  return Number.POSITIVE_INFINITY;
}

function drawLine(
  ctx: CanvasRenderingContext2D,
  line: string,
  x: number,
  y: number,
  maxWidth: number,
  shouldJustify: boolean,
): void {
  const words = line.trim().split(/\s+/);
  if (!shouldJustify || words.length < 2) {
    ctx.fillText(line, x, y);
    return;
  }

  const wordsWidth = words.reduce(
    (total, word) => total + ctx.measureText(word).width,
    0,
  );
  const gap = (maxWidth - wordsWidth) / (words.length - 1);

  let currentX = x;
  for (const word of words) {
    ctx.fillText(word, currentX, y);
    currentX += ctx.measureText(word).width + gap;
  }
}

function drawCanvas(
  text: string,
  { size, pixelRatio, renderOptions }: DrawCanvasOptions,
): HTMLCanvasElement | null {
  if (!text.trim()) return null;

  const canvas = document.createElement("canvas");
  const dpr = pixelRatio;
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.scale(dpr, dpr);

  // Pure white background to match reference
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  const padding = renderOptions.padding * (size / CANVAS_SIZE);
  const maxWidth = size - padding * 2;
  const maxHeight = size - padding * 2;

  const fontSize = findBestFontSize(ctx, text, maxWidth, maxHeight);
  ctx.font = `400 ${fontSize}px ${FONT_FAMILY}`;

  const lines = wrapText(ctx, text, maxWidth);

  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  const totalHeight = lines.length * lineHeight;
  const startY = padding + (maxHeight - totalHeight) / 2;
  const startX = Math.max(padding, (size - maxWidth) / 2 - size * 0.03);

  // Keep the raw brat-style softness visible after high-res export/downscaling.
  const blurRadius =
    (size / BASE_CANVAS_SIZE) * BLUR_RADIUS_AT_BASE_SIZE * dpr;
  ctx.filter = `blur(${blurRadius}px)`;
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "top";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const y = startY + i * lineHeight;
    drawLine(ctx, line.text, startX, y, maxWidth, lines.length > 1);
  }

  return canvas;
}

export function renderCanvasPreview(
  text: string,
  renderOptions: RenderOptions = DEFAULT_RENDER_OPTIONS,
): string | null {
  const canvas = drawCanvas(text, {
    size: PREVIEW_CANVAS_SIZE,
    pixelRatio: 1,
    renderOptions,
  });
  return canvas?.toDataURL("image/png") ?? null;
}

export function renderCanvas(
  text: string,
  size: number = EXPORT_CANVAS_SIZE,
  renderOptions: RenderOptions = DEFAULT_RENDER_OPTIONS,
): RenderResult | null {
  const canvas = drawCanvas(text, {
    size: PREVIEW_CANVAS_SIZE,
    pixelRatio: size / PREVIEW_CANVAS_SIZE,
    renderOptions,
  });
  if (!canvas) return null;

  const dataUrl = canvas.toDataURL("image/png");

  const byteString = atob(dataUrl.split(",")[1]);
  const mimeString = dataUrl.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeString });

  return { blob, dataUrl };
}

export async function renderCanvasBlob(
  text: string,
  size: number = EXPORT_CANVAS_SIZE,
  renderOptions: RenderOptions = DEFAULT_RENDER_OPTIONS,
): Promise<Blob | null> {
  const canvas = drawCanvas(text, {
    size: PREVIEW_CANVAS_SIZE,
    pixelRatio: size / PREVIEW_CANVAS_SIZE,
    renderOptions,
  });
  if (!canvas) return null;

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export function downloadPNG(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard?.write || !("ClipboardItem" in window)) {
    return false;
  }

  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": Promise.resolve(blob) }),
      ]);
      return true;
    } catch {
      return false;
    }
  }
}
