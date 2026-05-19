export interface WrappedLine {
  text: string;
  width: number;
}

/**
 * Wrap text into lines that fit within maxWidth.
 * Preserves explicit line breaks.
 * Trims trailing spaces per line but preserves leading spaces.
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): WrappedLine[] {
  const lines: WrappedLine[] = [];
  const rawLines = text.split("\n");

  for (const rawLine of rawLines) {
    // If the whole line fits, keep it
    const wholeWidth = ctx.measureText(rawLine).width;
    if (wholeWidth <= maxWidth) {
      lines.push({ text: rawLine, width: wholeWidth });
      continue;
    }

    // Otherwise, wrap word by word
    const words = rawLine.split(" ");
    let currentLine = "";
    let currentWidth = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? currentLine + " " + word : word;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth <= maxWidth) {
        currentLine = testLine;
        currentWidth = testWidth;
      } else {
        // Flush current line
        if (currentLine) {
          lines.push({ text: currentLine, width: currentWidth });
        }
        // Start new line with this word
        const wordWidth = ctx.measureText(word).width;
        if (wordWidth > maxWidth) {
          // Single word is too long, force-break it (unlikely with auto-fit)
          lines.push({ text: word, width: wordWidth });
          currentLine = "";
          currentWidth = 0;
        } else {
          currentLine = word;
          currentWidth = wordWidth;
        }
      }
    }

    if (currentLine) {
      lines.push({ text: currentLine, width: currentWidth });
    }
  }

  return lines;
}
