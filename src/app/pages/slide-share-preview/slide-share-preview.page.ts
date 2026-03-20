import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

import { DataService } from '../../services/data.service';
import { UiService } from '../../services/ui.service';
import { renderStandard1Preview } from 'src/app/pages/slide-share-preview/standard1';
import { renderStandard2Preview } from 'src/app/pages/slide-share-preview/standard2';
import { renderStandard3Preview } from 'src/app/pages/slide-share-preview/standard3';
import { renderStandard4Preview } from 'src/app/pages/slide-share-preview/standard4';
import { renderStandard5Preview } from 'src/app/pages/slide-share-preview/standard5';
import { renderStandard6Preview } from 'src/app/pages/slide-share-preview/standard6';
import { renderStandard7Preview } from 'src/app/pages/slide-share-preview/standard7';

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
  selectedStyleId = 1;
  selectedStyleBg = '';
  editableSmallTitle = '';
  editableBigTitle = '';
  styleOptions = [
    { key: 2, value: '标准2', image: 'assets/img/bg0.jpg', preview: 'assets/img/std2.png' },
    { key: 7, value: '标准4', image: 'assets/img/bg0.jpg', preview: 'assets/img/std4.png' },
    { key: 3, value: '标准3', image: 'assets/img/bg0.jpg', preview: 'assets/img/std3.png' },
    { key: 1, value: '标准1', image: 'assets/img/bg0.jpg', preview: 'assets/img/std1.png' },
    { key: 4, value: '胶片1', image: 'assets/img/bg0.jpg', preview: 'assets/img/black1.png' },
    { key: 5, value: '右侧1', image: 'assets/img/bg0.jpg', preview: 'assets/img/right1.png' },
    { key: 6, value: '右侧2', image: 'assets/img/bg0.jpg', preview: 'assets/img/right2.png' },
    
    
    
  ];

  private customBackgroundUrl = '';
  private titleRenderTimer: ReturnType<typeof setTimeout> | null = null;

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

    this.editableSmallTitle = this.data.currentArticle.small_title || '';
    this.editableBigTitle = Array.isArray(this.data.currentArticle.big_title_lines)
      ? this.data.currentArticle.big_title_lines.join('|')
      : `${this.data.currentArticle.big_title || ''}`;
    this.chooseStyle(2, false);
    void this.renderPreview();
  }

  goBack() {
    this.navCtrl.back();
  }

  onSmallTitleInput(event: any) {
    this.editableSmallTitle = `${event?.detail?.value ?? ''}`;
    if (this.titleRenderTimer) {
      clearTimeout(this.titleRenderTimer);
    }
    this.titleRenderTimer = setTimeout(() => {
      void this.renderPreview();
    }, 120);
  }

  onBigTitleInput(event: any) {
    this.editableBigTitle = `${event?.detail?.value ?? ''}`;
    if (this.titleRenderTimer) {
      clearTimeout(this.titleRenderTimer);
    }
    this.titleRenderTimer = setTimeout(() => {
      void this.renderPreview();
    }, 120);
  }

  async chooseStyle(id:any, shouldRender = true){
    const parsed = Number(id);
    this.selectedStyleId = Number.isFinite(parsed) ? parsed : 1;

    // All current styles use no shell background.
    this.selectedStyleBg = '';
    if (shouldRender) {
      await this.renderPreview();
    }
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

    const fileName = this.getSafeFileName(this.editableSmallTitle || this.data.currentArticle?.small_title || 'slide-preview');

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
            text: this.editableSmallTitle || this.data.currentArticle.small_title,
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
              text: this.editableSmallTitle || this.data.currentArticle.small_title,
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
          text: this.editableSmallTitle || this.data.currentArticle.small_title,
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

      const sourceMaxScale = Math.max(
        previewImg.width / shellWidth,
        previewImg.height / shellHeight,
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

      // Remaining styles are plain-shell exports without shell background.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const innerX = 0;
      const innerY = 0;
      const innerW = canvas.width;
      const innerH = canvas.height;

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
      const bigTitleLines = this.getEditableBigTitleLines();
      const previewOptions = {
        loadImage: this.loadImage.bind(this),
        bgUrl,
        useCorsForBg: !this.customBackgroundUrl,
        currentFontFamilyName,
        editableSmallTitle: this.editableSmallTitle,
        bigTitleLines,
      };

      switch (this.selectedStyleId) {
        case 1:
          this.previewDataUrl = await renderStandard1Preview(previewOptions);
          return;
        case 2:
          this.previewDataUrl = await renderStandard2Preview(previewOptions);
          return;
        case 3:
          this.previewDataUrl = await renderStandard3Preview(previewOptions);
          return;
        case 4:
          this.previewDataUrl = await renderStandard4Preview(previewOptions);
          return;
        case 5:
          this.previewDataUrl = await renderStandard5Preview(previewOptions);
          return;
        case 6:
          this.previewDataUrl = await renderStandard6Preview(previewOptions);
          return;
        case 7:
          this.previewDataUrl = await renderStandard7Preview(previewOptions);
          return;
        default:
          this.previewDataUrl = await renderStandard5Preview(previewOptions);
          return;
      }
    } catch (error) {
      console.error('Render share preview failed', error);
      this.renderError = '预览生成失败';
    } finally {
      this.isRendering = false;
    }
  }

  private getEditableSmallTitleLines() {
    const text = `${this.editableSmallTitle || ''}`.trim();
    if (!text) {
      return [];
    }

    return text
      .replace(/\|/g, '\n')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => !!line);
  }

  private getEditableBigTitleLines() {
    if (`${this.editableBigTitle || ''}`.trim()) {
      return `${this.editableBigTitle || ''}`
        .replace(/\|/g, '\n')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => !!line);
    }

    if (Array.isArray(this.data.currentArticle?.big_title_lines)) {
      return this.data.currentArticle.big_title_lines
        .map((line: any) => `${line ?? ''}`.trim())
        .filter((line: string) => !!line);
    }

    return `${this.data.currentArticle?.big_title || ''}`
      .replace(/\|/g, '\n')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => !!line);
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
