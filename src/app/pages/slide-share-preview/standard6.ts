export interface RenderStandard6PreviewOptions {
  loadImage: (src: string, isCors?: boolean) => Promise<HTMLImageElement>;
  bgUrl: string;
  useCorsForBg: boolean;
  currentFontFamilyName: string;
  editableSmallTitle: string;
  bigTitleLines: string[];
}

export async function renderStandard6Preview(options: RenderStandard6PreviewOptions): Promise<string> {
  const {
    loadImage,
    bgUrl,
    useCorsForBg,
    currentFontFamilyName,
    editableSmallTitle,
    bigTitleLines,
  } = options;

  const [bgImg, iconImg] = await Promise.all([
    loadImage(bgUrl, useCorsForBg),
    loadImage('assets/icon/favicon.png'),
  ]);

  const canvas = document.createElement('canvas');
  const canvasWidth = bgImg.width;
  const canvasHeight = canvasWidth;
  const mainHeight = canvasHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context is null');
  }

  const rightStripWidth = Math.round(canvas.width * 0.22);
  const leftImageWidth = Math.max(1, canvas.width - rightStripWidth);

  // Leave white margins for the left image area: top, bottom and left.
  const leftImagePaddingLeft = Math.max(8, Math.round(canvas.width * 0.035));
  const leftImagePaddingTop = Math.max(8, Math.round(mainHeight * 0.045));
  const leftImagePaddingBottom = Math.max(8, Math.round(mainHeight * 0.045));
  const leftImageDrawX = leftImagePaddingLeft;
  const leftImageDrawY = leftImagePaddingTop;
  const leftImageDrawWidth = Math.max(1, leftImageWidth - leftImagePaddingLeft);
  const leftImageDrawHeight = Math.max(1, mainHeight - leftImagePaddingTop - leftImagePaddingBottom);

  const bgScale = Math.max(leftImageDrawWidth / bgImg.width, leftImageDrawHeight / bgImg.height);
  const bgDrawWidth = bgImg.width * bgScale;
  const bgDrawHeight = bgImg.height * bgScale;
  const bgOffsetX = (leftImageDrawWidth - bgDrawWidth) / 2;
  const bgOffsetY = (leftImageDrawHeight - bgDrawHeight) / 2;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.beginPath();
  ctx.rect(leftImageDrawX, leftImageDrawY, leftImageDrawWidth, leftImageDrawHeight);
  ctx.clip();
  ctx.drawImage(
    bgImg,
    leftImageDrawX + bgOffsetX,
    leftImageDrawY + bgOffsetY,
    bgDrawWidth,
    bgDrawHeight
  );
  ctx.restore();

  ctx.fillStyle = 'white';
  ctx.fillRect(leftImageWidth, 0, rightStripWidth, mainHeight);

  drawRightSideVerticalStrip(ctx, {
    rightStripX: leftImageWidth,
    rightStripWidth,
    mainHeight,
    textTopY: leftImageDrawY,
    imageBottomY: leftImageDrawY + leftImageDrawHeight,
    iconImg,
    currentFontFamilyName,
    bigText: bigTitleLines.join('|'),
    smallText: `${editableSmallTitle || ''}`.trim(),
    dateText: formatDateYmd(new Date()),
  });

  return canvas.toDataURL('image/png');
}

function drawRightSideVerticalStrip(
  ctx: CanvasRenderingContext2D,
  options: {
    rightStripX: number;
    rightStripWidth: number;
    mainHeight: number;
    textTopY: number;
    imageBottomY: number;
    iconImg: HTMLImageElement;
    currentFontFamilyName: string;
    bigText: string;
    smallText: string;
    dateText: string;
  }
) {
  const { rightStripX, rightStripWidth, mainHeight, textTopY, imageBottomY, iconImg, currentFontFamilyName, bigText, smallText, dateText } = options;
  const stripPadding = Math.max(8, Math.floor(rightStripWidth * 0.14));

  const dateFontSize = Math.max(12, Math.floor(rightStripWidth * 0.11));
  const dateTopY = Math.max(0, Math.min(mainHeight - dateFontSize, imageBottomY - dateFontSize));
  const textXCenter = rightStripX + rightStripWidth / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#666666';
  ctx.font = `normal ${dateFontSize}px "${currentFontFamilyName}", sans-serif`;
  ctx.fillText(dateText, textXCenter, dateTopY);

  const iconSize = Math.max(16, Math.floor(rightStripWidth * 0.42));
  const iconX = rightStripX + (rightStripWidth - iconSize) / 2;
  const iconY = dateTopY - stripPadding - iconSize;
  ctx.drawImage(iconImg, iconX, iconY, iconSize, iconSize);

  const verticalBigText = normalizeVerticalText(bigText);
  const verticalSmallText = normalizeVerticalText(smallText);

  const textTop = Math.max(0, textTopY);
  const textBottomY = Math.max(textTop, iconY - stripPadding);
  const textHeight = Math.max(1, textBottomY - textTop);

  const gapBetweenColumns = Math.max(6, Math.floor(rightStripWidth * 0.1));
  const totalTextWidth = rightStripWidth - stripPadding * 2;
  const columnWidth = Math.max(10, Math.floor((totalTextWidth - gapBetweenColumns) / 2));

  const smallX = rightStripX + stripPadding + Math.floor(columnWidth / 2);
  const bigX = smallX + columnWidth + gapBetweenColumns;

  drawVerticalColumnText(ctx, {
    text: verticalBigText,
    x: bigX,
    topY: textTop,
    textHeight,
    baseFontSize: Math.max(16, Math.floor(columnWidth * 0.72)),
    color: '#111111',
    currentFontFamilyName,
  });

  drawVerticalColumnText(ctx, {
    text: verticalSmallText,
    x: smallX,
    topY: textTop,
    textHeight,
    baseFontSize: Math.max(11, Math.floor(columnWidth * 0.6 * 0.8)), //诗名 small title
    color: '#555555',
    currentFontFamilyName,
    verticalAlign: 'bottom',
  });
}

function drawVerticalColumnText(
  ctx: CanvasRenderingContext2D,
  options: {
    text: string;
    x: number;
    topY: number;
    textHeight: number;
    baseFontSize: number;
    color: string;
    currentFontFamilyName: string;
    verticalAlign?: 'top' | 'bottom';
  }
) {
  const { text, x, topY, textHeight, baseFontSize, color, currentFontFamilyName, verticalAlign = 'top' } = options;
  if (!text) {
    return;
  }

  let fontSize = baseFontSize;
  let lineStep = Math.max(fontSize + 2, Math.floor(fontSize * 1.06));
  let maxGlyphs = Math.max(1, Math.floor(textHeight / lineStep));

  if (text.length < maxGlyphs) {
    const desired = Math.max(1, text.length);
    lineStep = Math.max(1, Math.floor(textHeight / desired));
    fontSize = Math.max(12, Math.min(fontSize, lineStep - 2));
    lineStep = Math.max(fontSize + 2, Math.floor(fontSize * 1.06));
    maxGlyphs = Math.max(1, Math.floor(textHeight / lineStep));
  }

  const glyphs = text.slice(0, maxGlyphs).split('');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px "${currentFontFamilyName}", sans-serif`;
  const startY = verticalAlign === 'bottom'
    ? topY + Math.max(0, textHeight - glyphs.length * lineStep)
    : topY;
  glyphs.forEach((glyph, idx) => {
    const baseY = startY + idx * lineStep;
    if (/[，。]/.test(glyph)) {
      const punctFontSize = Math.max(10, Math.floor(fontSize * 0.72));
      const punctX = x + Math.floor(fontSize * 0.26);
      const punctY = baseY - Math.floor(fontSize * 0.2);
      ctx.font = `${punctFontSize}px "${currentFontFamilyName}", sans-serif`;
      ctx.fillText(glyph, punctX, punctY);
      ctx.font = `${fontSize}px "${currentFontFamilyName}", sans-serif`;
      return;
    }
    ctx.fillText(glyph, x, baseY);
  });
}

function normalizeVerticalText(value: string): string {
  return `${value || ''}`
    .replace(/[《》]/g, (match) => (match === '《' ? '︽' : '︾'))
    .replace(/[（）]/g, (match) => (match === '（' ? '︵' : '︶'))
    .replace(/[“”]/g, (match) => (match === '“' ? '﹁' : '﹂'))
    //.replace(/[，。]/g, ' ')
    .replace(/\|/g, '')
    .replace(/\n/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function formatDateYmd(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');
  const hh = `${date.getHours()}`.padStart(2, '0');
  const min = `${date.getMinutes()}`.padStart(2, '0');
  //return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
  //return `${yyyy}.${mm}.${dd}`;
  //return `${mm}-${dd}`;
  return `${yyyy}/${mm}/${dd}`;
}
