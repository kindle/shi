export interface RenderStandard3PreviewOptions {
  loadImage: (src: string, isCors?: boolean) => Promise<HTMLImageElement>;
  bgUrl: string;
  useCorsForBg: boolean;
  currentFontFamilyName: string;
  editableSmallTitle: string;
  bigTitleLines: string[];
}

export async function renderStandard3Preview(options: RenderStandard3PreviewOptions): Promise<string> {
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
  const footerHeight = Math.round(canvasHeight * 0.2);
  const mainHeight = Math.max(1, canvasHeight - footerHeight);
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context is null');
  }

  // Standard2: shrink top image to 90%, keep bottom aligned, leave white on top/sides.
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, mainHeight);
  const whiteMargin = Math.round(canvas.width * 0.05);
  const imageBoxWidth = Math.max(1, canvas.width - whiteMargin * 2);
  const imageBoxHeight = Math.max(1, mainHeight - whiteMargin);
  const imageBoxX = whiteMargin;
  const imageBoxY = whiteMargin;

  const bgScale = Math.max(imageBoxWidth / bgImg.width, imageBoxHeight / bgImg.height);
  const bgDrawWidth = bgImg.width * bgScale;
  const bgDrawHeight = bgImg.height * bgScale;
  const bgOffsetX = imageBoxX + (imageBoxWidth - bgDrawWidth) / 2;
  const bgOffsetY = imageBoxY + (imageBoxHeight - bgDrawHeight) / 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(imageBoxX, imageBoxY, imageBoxWidth, imageBoxHeight);
  ctx.clip();
  ctx.drawImage(bgImg, bgOffsetX, bgOffsetY, bgDrawWidth, bgDrawHeight);
  ctx.restore();

  ctx.fillStyle = 'white';
  ctx.fillRect(0, mainHeight, canvas.width, footerHeight);

  const horizontalPadding = whiteMargin;
  const verticalPadding = footerHeight * 0.1;
  const usefulFooterHeight = footerHeight - 2 * verticalPadding;
  const iconTargetHeight = usefulFooterHeight * 0.72;
  const iconRatio = iconImg.width / iconImg.height;
  let iconW = iconTargetHeight * iconRatio;
  if (iconW > iconTargetHeight) {
    iconW = iconTargetHeight;
  }

  drawWhiteBorderFooter(ctx, {
    canvasWidth: canvas.width,
    mainHeight,
    footerHeight,
    horizontalPadding,
    verticalPadding,
    iconW,
    currentFontFamilyName,
    smallText: `${editableSmallTitle || ''}`.trim(),
    bigText: bigTitleLines.join('|'),
  });

  return canvas.toDataURL('image/png');
}

function drawWhiteBorderFooter(
  ctx: CanvasRenderingContext2D,
  options: {
    canvasWidth: number;
    mainHeight: number;
    footerHeight: number;
    horizontalPadding: number;
    verticalPadding: number;
    iconW: number;
    currentFontFamilyName: string;
    smallText: string;
    bigText: string;
  }
) {
  const { canvasWidth, mainHeight, footerHeight, horizontalPadding, verticalPadding, iconW, currentFontFamilyName, smallText, bigText } = options;
  const centerY = mainHeight + footerHeight / 2;
  const dateText = formatDateYmd(new Date());
  const usefulFooterHeight = footerHeight - 2 * verticalPadding;
  const qrDateLineGap = Math.max(2, Math.floor(footerHeight * 0.1));

  const dateFontSize = Math.floor(footerHeight * 0.14);//日期字体大小
  const qrSize = Math.max(16, Math.floor(usefulFooterHeight * 0.52 * 0.8));
  const rightBlockHeight = qrSize + qrDateLineGap + dateFontSize;
  const rightBlockTop = centerY - rightBlockHeight / 2;
  const qrY = rightBlockTop;

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#b3b3b3';
  ctx.font = `normal ${dateFontSize}px "${currentFontFamilyName}", sans-serif`;
  const dateY = centerY;
  ctx.fillText(dateText, canvasWidth - horizontalPadding, dateY);
  const dateTextWidth = ctx.measureText(dateText).width;
  const rightBlockWidth = Math.max(qrSize, dateTextWidth);

  const textStartX = horizontalPadding;
  const textEndX = canvasWidth - horizontalPadding - rightBlockWidth - horizontalPadding;
  const availableWidth = Math.max(20, textEndX - textStartX);
  const smallLines = `${smallText || ''}`
    .replace(/\|/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => !!line);
  const bigSingleLine = `${bigText || ''}`
    .replace(/\|/g, ' ')
    .replace(/\n/g, ' ')
    .trim();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#111111';
  const smallFontSize = Math.floor(footerHeight * 0.14); //作者诗名 small text
  const bigFontSize = Math.floor(footerHeight * 0.18);   //诗句 big text
  const smallTextLineGap = Math.max(2, Math.floor(footerHeight * 0.08)); //small text 行间距变量
  const bigTextLineGap = Math.max(2, Math.floor(footerHeight * 0.15));   //big text 行间距变量
  const textDownOffset = Math.max(2, Math.floor(footerHeight * 0.03));   //small/big text 整体下移
  const smallLine = smallLines[0] || '名诗佳句';
  const bigLine = bigSingleLine;
  const textAnchorDateBottomY = qrY + qrSize + qrDateLineGap + dateFontSize;
  const smallY = textAnchorDateBottomY - smallTextLineGap - smallFontSize + textDownOffset;

  if (bigLine) {
    const bigY = smallY - bigTextLineGap - bigFontSize;
    ctx.fillStyle = '#111111';
    ctx.font = `${bigFontSize}px "${currentFontFamilyName}", sans-serif`;
    ctx.fillText(bigLine, textStartX, bigY, availableWidth);
    ctx.fillStyle = '#666666';
    ctx.font = `${smallFontSize}px "${currentFontFamilyName}", sans-serif`;
    ctx.fillText(smallLine, textStartX, smallY, availableWidth);
    return;
  }

  ctx.fillStyle = '#666666';
  ctx.font = `${smallFontSize}px "${currentFontFamilyName}", sans-serif`;
  ctx.fillText(smallLine, textStartX, smallY, availableWidth);
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
  //return `${hh}:${min} | ${yyyy}.${mm}.${dd}`;
  return `${yyyy}.${mm}.${dd}`;
}
