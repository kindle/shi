import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { DataService } from '../../services/data.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-slide-share-preview',
  templateUrl: './slide-share-preview.page.html',
  styleUrls: ['./slide-share-preview.page.scss'],
})
export class SlideSharePreviewPage {
  @ViewChild('previewShell') previewShell?: ElementRef<HTMLElement>;

  previewDataUrl = '';
  isRendering = false;
  renderError = '';
  selectedStyleId = 0;
  selectedStyleBg = '';
  styleOptions = [
    { key: 0, value: '无', image: 'assets/img/bg0.jpg' },
    { key: 1, value: '经典', image: 'assets/img/bg2.jpg' },
    { key: 2, value: '波点', image: 'assets/img/bg5.jpg' },
    { key: 3, value: '水纹', image: 'assets/img/water.jpg' },
    { key: 4, value: '云纹', image: 'assets/img/dahuibg.jpeg' },
  ];

  private customBackgroundUrl = '';

  constructor(
    public data: DataService,
    public ui: UiService,
    private navCtrl: NavController,
  ) {}

  ionViewWillEnter() {
    if (!this.data.currentArticle) {
      this.navCtrl.back();
      return;
    }

    this.chooseStyle(0);
    void this.renderPreview();
  }

  goBack() {
    this.navCtrl.back();
  }

  async chooseStyle(id:any){
    const parsed = Number(id);
    this.selectedStyleId = Number.isFinite(parsed) ? parsed : 1;

    if (this.selectedStyleId === 0) {
      this.selectedStyleBg = '';
      return;
    }

    const selectedStyle = this.styleOptions.find((option) => option.key === this.selectedStyleId);
    this.selectedStyleBg = selectedStyle?.image || 'assets/img/bg0.jpg';
  }

  async chooseBackground() {
    try {
      const photo = await Camera.getPhoto({
        source: CameraSource.Photos,
        resultType: CameraResultType.Uri,
        quality: 100,
      });

      if (!photo.webPath) {
        return;
      }

      this.customBackgroundUrl = photo.webPath;
      await this.renderPreview();
    } catch (error) {
      console.error('Background choose canceled or failed', error);
    }
  }

  async saveImage() {
    if (!this.previewDataUrl) {
      return;
    }

    const composedDataUrl = await this.getComposedDataUrl();
    if (!composedDataUrl) {
      await this.ui.toast('bottom', '保存失败');
      return;
    }

    const fileName = this.getSafeFileName(this.data.currentArticle?.small_title || 'slide-preview');

    if (this.data.isHybrid()) {
      const base64Data = composedDataUrl.replace(/^data:image\/\w+;base64,/, '');

      try {
        if (this.ui.isAndroid) {
          await Filesystem.writeFile({
            path: `Pictures/${fileName}-${Date.now()}.png`,
            data: base64Data,
            directory: Directory.ExternalStorage,
          });
          await this.ui.toast('bottom', `已保存至系统相册`);
        } else {
          const savedFile = await Filesystem.writeFile({
            path: `${Date.now()}-${fileName}.png`,
            data: base64Data,
            directory: Directory.Cache,
          });
          await Share.share({
            title: '保存图片',
            text: this.data.currentArticle.small_title,
            files: [savedFile.uri],
            dialogTitle: '保存图片',
          });
          await this.ui.toast('bottom', '请在分享面板中选择“存储图像/存储到照片”');
        }
      } catch (error) {
        try {
          if (this.ui.isAndroid) {
            await Filesystem.writeFile({
              path: `${fileName}.png`,
              data: base64Data,
              directory: Directory.Documents,
            });
            await this.ui.toast('bottom', `已保存至系统相册`);
          } else {
            const fallbackFile = await Filesystem.writeFile({
              path: `${Date.now()}-${fileName}.png`,
              data: base64Data,
              directory: Directory.Cache,
            });
            await Share.share({
              title: '保存图片',
              text: this.data.currentArticle.small_title,
              files: [fallbackFile.uri],
              dialogTitle: '保存图片',
            });
            await this.ui.toast('bottom', '请在分享面板中选择“存储图像/存储到照片”');
          }
        } catch (fallbackError) {
          console.error('Save image failed', error, fallbackError);
          await this.ui.toast('bottom', '保存失败');
        }
      }
      return;
    }

    const a = document.createElement('a');
    a.href = composedDataUrl;
    a.download = `${fileName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async shareImage() {
    if (!this.previewDataUrl) {
      return;
    }

    const composedDataUrl = await this.getComposedDataUrl();
    if (!composedDataUrl) {
      await this.ui.toast('bottom', '分享失败');
      return;
    }

    if (this.data.isHybrid()) {
      const base64Data = composedDataUrl.replace(/^data:image\/\w+;base64,/, '');
      const fileName = `${Date.now()}-slide.png`;

      try {
        const savedFile = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title: this.data.currentArticle.big_title,
          text: this.data.currentArticle.small_title,
          files: [savedFile.uri],
          dialogTitle: this.data.currentArticle.big_title,
        });
      } catch (error) {
        console.error('Share failed', error);
        await this.ui.toast('bottom', '分享失败');
      }
      return;
    }

    window.open(composedDataUrl, '_blank');
  }

  private async getComposedDataUrl(): Promise<string | null> {
    if (!this.previewDataUrl) {
      return null;
    }

    const shellEl = this.previewShell?.nativeElement;
    const shellWidth = Math.max(1, Math.round(shellEl?.clientWidth || 640));
    const shellHeight = Math.max(1, Math.round(shellEl?.clientHeight || 900));

    try {
      const previewImg = await this.loadImage(this.previewDataUrl);
      const hasStyleBackground = this.selectedStyleId !== 0 && !!this.selectedStyleBg;
      const styleBgImg = hasStyleBackground ? await this.loadImage(this.selectedStyleBg) : null;

      const sourceMaxScale = Math.max(
        previewImg.width / shellWidth,
        previewImg.height / shellHeight,
        styleBgImg ? styleBgImg.width / shellWidth : 1,
        styleBgImg ? styleBgImg.height / shellHeight : 1,
      );
      const exportScale = Math.min(3, Math.max(1, Math.floor(sourceMaxScale)));

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(shellWidth * exportScale));
      canvas.height = Math.max(1, Math.round(shellHeight * exportScale));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return null;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      if (styleBgImg) {
        // Draw style background as cover to match the visible preview shell.
        const bgScale = Math.max(canvas.width / styleBgImg.width, canvas.height / styleBgImg.height);
        const bgDrawWidth = styleBgImg.width * bgScale;
        const bgDrawHeight = styleBgImg.height * bgScale;
        const bgOffsetX = (canvas.width - bgDrawWidth) / 2;
        const bgOffsetY = (canvas.height - bgDrawHeight) / 2;
        ctx.drawImage(styleBgImg, bgOffsetX, bgOffsetY, bgDrawWidth, bgDrawHeight);
      } else {
        // Style 0: plain white canvas, no style background.
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Style 0 uses full area; other styles keep the framed inner margins.
      const stylePaddingXRatio = 50 / shellWidth;
      const stylePaddingYRatio = 100 / shellHeight;
      const innerX = styleBgImg ? Math.max(0, Math.round(canvas.width * stylePaddingXRatio)) : 0;
      const innerY = styleBgImg ? Math.max(0, Math.round(canvas.height * stylePaddingYRatio)) : 0;
      const innerW = styleBgImg ? Math.max(1, canvas.width - innerX * 2) : canvas.width;
      const innerH = styleBgImg ? Math.max(1, canvas.height - innerY * 2) : canvas.height;

      // Draw generated preview image as contain inside the inner area.
      const previewScale = Math.min(innerW / previewImg.width, innerH / previewImg.height);
      const previewDrawW = previewImg.width * previewScale;
      const previewDrawH = previewImg.height * previewScale;
      const previewX = innerX + (innerW - previewDrawW) / 2;
      const previewY = innerY + (innerH - previewDrawH) / 2;
      ctx.drawImage(previewImg, previewX, previewY, previewDrawW, previewDrawH);

      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Compose preview image failed', error);
      return null;
    }
  }

  private async renderPreview() {
    this.isRendering = true;
    this.renderError = '';

    try {
      const currentFontFamilyName = this.data.getCurrentFontFamilyName();
      const bgUrl = this.customBackgroundUrl || `https://reddah.blob.core.windows.net/msjjimg/${this.data.currentArticle.bg_image}`;

      const [bgImg, iconImg, qrImg] = await Promise.all([
        this.loadImage(bgUrl, !this.customBackgroundUrl),
        this.loadImage('assets/icon/favicon.png'),
        this.loadImage('assets/icon/shi-qr.png'),
      ]);

      const canvas = document.createElement('canvas');
      const canvasWidth = bgImg.width;
      const targetHeight = Math.round(canvasWidth * 5 / 4);
      const footerHeight = Math.round(canvasWidth * 0.2);
      const mainHeight = Math.max(1, targetHeight - footerHeight);
      canvas.width = canvasWidth;
      canvas.height = mainHeight + footerHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context is null');
      }

      const bgScale = Math.max(canvas.width / bgImg.width, mainHeight / bgImg.height);
      const bgDrawWidth = bgImg.width * bgScale;
      const bgDrawHeight = bgImg.height * bgScale;
      const bgOffsetX = (canvas.width - bgDrawWidth) / 2;
      const bgOffsetY = (mainHeight - bgDrawHeight) / 2;
      ctx.drawImage(bgImg, bgOffsetX, bgOffsetY, bgDrawWidth, bgDrawHeight);

      ctx.fillStyle = 'white';
      ctx.fillRect(0, mainHeight, canvas.width, footerHeight);

      const padding = footerHeight * 0.1;
      const usefulFooterHeight = footerHeight - 2 * padding;

      const iconRatio = iconImg.width / iconImg.height;
      let iconW = usefulFooterHeight * iconRatio;
      let iconH = usefulFooterHeight;
      if (iconW > usefulFooterHeight) {
        iconW = usefulFooterHeight;
        iconH = usefulFooterHeight / iconRatio;
      }
      ctx.drawImage(iconImg, padding, mainHeight + padding + (usefulFooterHeight - iconH) / 2, iconW, iconH);

      const qrRatio = qrImg.width / qrImg.height;
      let qrW = usefulFooterHeight * qrRatio;
      let qrH = usefulFooterHeight;
      if (qrW > usefulFooterHeight) {
        qrW = usefulFooterHeight;
        qrH = usefulFooterHeight / qrRatio;
      }
      ctx.drawImage(qrImg, canvas.width - qrW - padding, mainHeight + padding + (usefulFooterHeight - qrH) / 2, qrW, qrH);

      ctx.fillStyle = 'black';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const textStartX = padding + iconW + padding;
      const textCenterY = mainHeight + footerHeight / 2;

      const titleFontSize = Math.floor(footerHeight * 0.3);
      ctx.font = `bold ${titleFontSize}px "${currentFontFamilyName}", sans-serif`;
      ctx.fillText('名诗佳句', textStartX, textCenterY - titleFontSize * 0.6);

      const subTitleFontSize = Math.floor(footerHeight * 0.2);
      ctx.font = `normal ${subTitleFontSize}px "${currentFontFamilyName}", sans-serif`;
      ctx.fillStyle = '#666666';
      ctx.fillText('长按识别二维码免费获取', textStartX, textCenterY + subTitleFontSize * 0.8);

      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'black';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'black';

      const x = 40;
      let y = 40;

      if (this.data.currentArticle.small_title) {
        const smallFontSize = Math.floor(canvas.width / 25);
        ctx.font = `bold ${smallFontSize}px "${currentFontFamilyName}", sans-serif`;
        ctx.lineWidth = 3;
        const smallTitleText = this.data.currentArticle.small_title;
        ctx.strokeText(smallTitleText, x, y);
        ctx.fillText(smallTitleText, x, y);
        y += smallFontSize * 1.4 + 20;
      }

      const bigFontSize = Math.floor(canvas.width / 15);
      ctx.font = `bold ${bigFontSize}px "${currentFontFamilyName}", sans-serif`;
      ctx.lineWidth = 5;

      const bigTitleLines = Array.isArray(this.data.currentArticle.big_title_lines)
        ? this.data.currentArticle.big_title_lines
        : `${this.data.currentArticle.big_title || ''}`.split('\n');
      const bigTitleLineHeight = bigFontSize * 1.4;

      for (const line of bigTitleLines) {
        const text = `${line ?? ''}`.trim();
        if (!text) {
          continue;
        }
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        y += bigTitleLineHeight;
      }

      this.previewDataUrl = canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Render share preview failed', error);
      this.renderError = '预览生成失败';
    } finally {
      this.isRendering = false;
    }
  }

  private loadImage(src: string, isCors = false): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (isCors) {
        img.crossOrigin = 'Anonymous';
      }
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  }

  private getSafeFileName(fileName: string) {
    return `${fileName}`
      .trim()
      .replace(/[\\/:*?"<>|]/g, '_')
      .slice(0, 80) || 'slide-preview';
  }
}
