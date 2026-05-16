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

  selectedImageId = 1;
  imageOptions = [
    { key: 0, value: '自定义', image: 'assets/img/bg0.jpg', preview: 'assets/img/bgadd.jpg' },
    { key: 1, value: 'def1', image: 'assets/img/bg0.jpg', preview: 'assets/img/template/定格秋天.jpg' },
    { key: 2, value: 'def1', image: 'assets/img/bg0.jpg', preview: 'assets/img/template/国庆.jpg' },
    { key: 3, value: 'def1', image: 'assets/img/bg0.jpg', preview: 'assets/img/template/带我去月球.jpg' },
    { key: 4, value: 'def1', image: 'assets/img/bg0.jpg', preview: 'assets/img/template/张大千荷花.jpg' },
    { key: 5, value: 'def1', image: 'assets/img/bg0.jpg', preview: 'assets/img/template/海钓.jpg' },
    { key: 11, value: 'def1', image: 'assets/img/bg0.jpg', preview: 'assets/img/game2_国画/1.JPG' },
    { key: 12, value: 'def2', image: 'assets/img/bg0.jpg', preview: 'assets/img/game2_国画/2.JPG' },
    { key: 13, value: 'def3', image: 'assets/img/bg0.jpg', preview: 'assets/img/game2_国画/3.JPG' },
    { key: 14, value: 'def4', image: 'assets/img/bg0.jpg', preview: 'assets/img/game2_国画/4.JPG' },
    { key: 15, value: 'def5', image: 'assets/img/bg0.jpg', preview: 'assets/img/game2_国画/5.JPG' },
    { key: 16, value: 'def6', image: 'assets/img/bg0.jpg', preview: 'assets/img/game2_国画/6.JPG' },
    { key: 17, value: 'def7', image: 'assets/img/bg0.jpg', preview: 'assets/img/game2_国画/7.JPG' },
    { key: 18, value: 'def8', image: 'assets/img/bg0.jpg', preview: 'assets/img/game2_国画/8.JPG' },
    { key: 19, value: 'def9', image: 'assets/img/bg0.jpg', preview: 'assets/img/game2_国画/9.JPG' },
    { key: 20, value: 'def10', image: 'assets/img/bg0.jpg', preview: 'assets/img/game2_国画/10.JPG' },
    { key: 21, value: 'def11', image: 'assets/img/bg0.jpg', preview: 'assets/img/game2_国画/11.JPG' },
  ];

  private customBackgroundUrl = '';
  private titleRenderTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public data: DataService,
    public ui: UiService,
    private navCtrl: NavController,
  ) {}

  private get shareArticle() {
    return this.data.currentShareArticle || this.data.currentArticle;
  }

  ionViewWillEnter() {
    const shareArticle = this.shareArticle;

    if (!shareArticle) {
      this.navCtrl.back();
      return;
    }

    const currentBg = shareArticle.bg_image;
    let targetSrc = '';

    if (currentBg) {
      targetSrc = currentBg.indexOf('msjjpoet') > -1 || currentBg.indexOf('msjjimg') > -1 ?
        currentBg :
        `https://reddah.blob.core.windows.net/msjjimg/${currentBg}`;
    } else if (this.data.currentItem && this.data.currentItem.src) {
      targetSrc = this.data.currentItem.src;
    }

    if (targetSrc) {
      this.imageOptions = this.imageOptions.filter(o => o.key !== 100);
      const exists = this.imageOptions.some(o => o.preview === targetSrc);
      if (!exists) {
        this.imageOptions.splice(1, 0, {
          key: 100,
          value: '当前',
          image: 'assets/img/bg0.jpg',
          preview: targetSrc
        });
      }
      this.chooseImage(100);
    }

    this.editableSmallTitle = (shareArticle.small_title || '').substring(0, 50);
    this.editableBigTitle = (Array.isArray(shareArticle.big_title_lines)
      ? shareArticle.big_title_lines.join('')
      : this.removePipe(`${shareArticle.big_title || ''}`)).substring(0, 50);
    this.chooseStyle(2, false);
    void this.renderPreview();
  }

  ionViewWillLeave() {
    this.data.currentShareArticle = null;
  }

  goback() {
    this.navCtrl.back();
  }

  async viewPreviewImage() {
    if (this.isRendering || !this.previewDataUrl) {
      return;
    }

    const composedDataUrl = await this.getComposedDataUrl();
    await this.ui.imageviewer(composedDataUrl || this.previewDataUrl);
  }

  onSmallTitleInput(event: any) {
    this.editableSmallTitle = `${event?.detail?.value ?? ''}`.substring(0, 50);
    if (this.titleRenderTimer) {
      clearTimeout(this.titleRenderTimer);
    }
    this.titleRenderTimer = setTimeout(() => {
      void this.renderPreview();
    }, 120);
  }

  onBigTitleInput(event: any) {
    this.editableBigTitle = this.removePipe(`${event?.detail?.value ?? ''}`).substring(0, 50);
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

  async chooseImage(id:any, shouldRender = true){
    const parsed = Number(id);
    this.selectedImageId = Number.isFinite(parsed) ? parsed : 1;

    if (this.selectedImageId === 0) {
      await this.chooseBackground();
      return;
    }

    //console.log(this.imageOptions)
    const selectedImage = this.imageOptions.find((option) => option.key === this.selectedImageId);
    if (!selectedImage?.preview) {
      return;
    }

    this.customBackgroundUrl = selectedImage.preview;
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

    const fileName = this.getSafeFileName(this.editableSmallTitle || this.shareArticle?.small_title || 'slide-preview');

    if (this.data.isHybrid()) {
      const base64Data = composedDataUrl.replace(/^data:image\/\w+;base64,/, '');

      try {
        if (this.ui.isAndroid) //android save
        {
          await Filesystem.writeFile({
            path: `Pictures/${fileName}-${Date.now()}.png`,
            data: base64Data,
            directory: Directory.ExternalStorage,
          });
          await this.ui.toast('bottom', `已保存至系统相册`);
        } 
        else //ios save
        {
          const savedFile = await Filesystem.writeFile({
            path: `${Date.now()}-${fileName}.png`,
            data: base64Data,
            directory: Directory.Cache,
          });
          await Share.share({
            title: '保存图片',
            text: this.editableSmallTitle || this.shareArticle?.small_title,
            files: [savedFile.uri],
            dialogTitle: '保存图片',
          });
          await this.ui.toast('bottom', '已保存至相册');
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
              text: this.editableSmallTitle || this.shareArticle?.small_title,
              files: [fallbackFile.uri],
              dialogTitle: '保存图片',
            });
            await this.ui.toast('bottom', '已保存至相册');
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
          title: this.shareArticle?.big_title,
          text: this.editableSmallTitle || this.shareArticle?.small_title,
          files: [savedFile.uri],
          dialogTitle: this.shareArticle?.big_title,
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
    const fallbackBgUrl = 'assets/img/default.jpg';

    try {
      const shareArticle = this.shareArticle;
      if (!shareArticle) {
        this.renderError = '预览生成失败';
        return;
      }

      const currentFontFamilyName = this.data.getCurrentFontFamilyName();
      const resolvedArticleBg = shareArticle.bg_image ?
        (shareArticle.bg_image.indexOf('msjjpoet') > -1 ?
          shareArticle.bg_image :
          `https://reddah.blob.core.windows.net/msjjimg/${shareArticle.bg_image}`) :
        fallbackBgUrl;
      const bgUrl = this.customBackgroundUrl || resolvedArticleBg;
      const bigTitleLines = this.getEditableBigTitleLines();
      const basePreviewOptions = {
        loadImage: this.loadImage.bind(this),
        currentFontFamilyName,
        editableSmallTitle: this.editableSmallTitle,
        bigTitleLines,
      };

      const renderByStyle = async (previewOptions: any) => {
        switch (this.selectedStyleId) {
          case 1:
            return renderStandard1Preview(previewOptions);
          case 2:
            return renderStandard2Preview(previewOptions);
          case 3:
            return renderStandard3Preview(previewOptions);
          case 4:
            return renderStandard4Preview(previewOptions);
          case 5:
            return renderStandard5Preview(previewOptions);
          case 6:
            return renderStandard6Preview(previewOptions);
          case 7:
            return renderStandard7Preview(previewOptions);
          default:
            return renderStandard5Preview(previewOptions);
        }
      };

      try {
        this.previewDataUrl = await renderByStyle({
          ...basePreviewOptions,
          bgUrl,
          useCorsForBg: !this.customBackgroundUrl || this.customBackgroundUrl.startsWith('http'),
        });
      } catch (primaryError) {
        console.error('Render share preview failed with source background, fallback to default.jpg', primaryError);
        this.previewDataUrl = await renderByStyle({
          ...basePreviewOptions,
          bgUrl: fallbackBgUrl,
          useCorsForBg: false,
        });
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
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => !!line);
    }

    if (Array.isArray(this.shareArticle?.big_title_lines)) {
      return this.shareArticle.big_title_lines
        .map((line: any) => `${line ?? ''}`.trim())
        .filter((line: string) => !!line);
    }

    const fallbackTitle = this.removePipe(`${this.shareArticle?.big_title || ''}`);
    return fallbackTitle ? [fallbackTitle] : [];
  }

  private removePipe(text: string) {
    return `${text || ''}`.replace(/\|/g, '');
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
