import { Injectable } from '@angular/core';
import { LoadingController, AlertController } from '@ionic/angular';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import * as lamejs from '@breezystack/lamejs';

@Injectable({
  providedIn: 'root'
})
export class ConvertService {

  public downloadUrl: string | null = null;
  public downloadName: string = '';
  public currentBlob: Blob | any = null;
  private audioPlayer: HTMLAudioElement | null = null;

  constructor(
    private loadingCtrl: LoadingController,
    private alertController: AlertController
  ) { }

  selectVideoAndConvert() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.style.display = 'none';
    
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        await this.convertVideoToAudio(file);
      }
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  async convertVideoToAudio(file: File) {
    // Reset previous download
    this.downloadUrl = null;
    this.downloadName = '';

    const loading = await this.loadingCtrl.create({
      message: 'Converting Video to Audio... Please wait',
    });
    await loading.present();
    let loadingDismissed = false;

    try {
      const fileName = file.name.substring(0, file.name.lastIndexOf('.')) + '.mp3';
      
      // Use the internal conversion logic
      const mp3Blob = await this.convertVideoToMp3(file);

      // Dismiss loading BEFORE showing success alert to avoid conflicts
      await loading.dismiss();
      loadingDismissed = true;

      await this.saveAndShareFile(mp3Blob, fileName);
      
    } catch (error: any) {
      if (!loadingDismissed) {
        await loading.dismiss();
      }
      console.error('Conversion failed', error);
      
      let errorMessage = 'Unknown Error';

      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error instanceof Error) {
        errorMessage = error.name + ': ' + error.message;
      } else if (error && typeof error === 'object') {
        errorMessage = JSON.stringify(error);
        if (errorMessage === '{}') {
           errorMessage = error.message || error.code || error.name || 'DOMException or Safari limitation.';
        }
      }

      if (errorMessage.includes('EncodingError') || errorMessage.includes('Decoding failed')) {
         errorMessage += '\n\n(iOS Hint: Safari cannot decode some video formats like .MOV directly in the browser. Try an MP4.)';
      }

      // Use window.alert as a failsafe if Ionic Alert fails
      setTimeout(() => {
        alert("Detailed Error: " + errorMessage); 
      }, 500);

    }
  }

  async saveAndShareFile(blob: Blob, fileName: string) {
    if (blob.size < 100) {
      alert("Error: Generated file is empty (" + blob.size + " bytes).");
      return;
    }

    // Web Platform (Mobile Safari/Chrome via ionic serve)
    if (Capacitor.getPlatform() === 'web' || Capacitor.getPlatform() === 'ios') {
        const sizeKB = (blob.size/1024).toFixed(1);
        
        // METHOD 3: The "In-Page" Button Strategy
        this.downloadName = fileName;
        this.currentBlob = blob;
        this.downloadUrl = "ready"; // Signal to show button

        const alert = await this.alertController.create({
          header: 'Conversion Success',
          message: `MP3 Created (${sizeKB} KB).\n\nYou can now Play it immediately or Download it.`,
          buttons: ['OK']
        });
        await alert.present();
       return;
    }

    // Native Platform (Runtime App)
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const result = reader.result as string;
        const base64data = result.split(',')[1];
        
        if (base64data) {
          try {
            const savedFile = await Filesystem.writeFile({
              path: fileName,
              data: base64data,
              directory: Directory.Cache,
              recursive: true
            });

            const alert = await this.alertController.create({
              header: 'Conversion Complete',
              message: `MP3 Ready (${(blob.size/1024).toFixed(1)} KB).`,
              buttons: [
                {
                  text: 'Share / Save',
                  handler: async () => {
                     try {
                       await Share.share({
                        title: 'Converted Audio',
                        text: 'Here is your converted MP3 audio.',
                        url: savedFile.uri,
                        dialogTitle: 'Save Audio'
                      });
                     } catch (err: any) {
                       console.error('Share error', err);
                     }
                  }
                },
                {
                  text: 'Cancel',
                  role: 'cancel'
                }
              ]
            });
            await alert.present();
            resolve(); // Success

          } catch (e: any) {
               console.error('File save error', e);
               const alert = await this.alertController.create({
                 header: 'Error',
                 message: 'Could not save file. Error: ' + (e.message || JSON.stringify(e)),
                 buttons: ['OK']
               });
               await alert.present();
               resolve(); // Handled error
          }
        } else {
           resolve(); // No data
        }
      };
      reader.onerror = (e) => {
         console.error("FileReader error", e);
         reject(e);
      };
    });
  }

  async downloadCurrentFile() {
    if (!this.currentBlob || !this.downloadName) return;

    // Strategy: Direct Download (Anchor Tag)
    // This works on Desktop and Android. 
    // On iOS Safari, it may open the file, allowing "Save to Files".
    const url = URL.createObjectURL(this.currentBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.downloadName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
  }

  playConvertedAudio() {
    if (!this.currentBlob) {
        alert("No converted audio found.");
        return;
    }
    
    // Safety check for blob size
    if (this.currentBlob.size === 0) {
        alert("Audio file is empty.");
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(this.currentBlob);
    
    reader.onload = () => {
        const base64data = reader.result as string; 
        
        // Clean up previous instance
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer.src = "";
            this.audioPlayer = null;
        }

        try {
            this.audioPlayer = new Audio(base64data);
            
            // Critical for iOS: Set volume and load
            this.audioPlayer.volume = 1.0;
            this.audioPlayer.load();

            const playPromise = this.audioPlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Playback failed", error);
                    alert("Playback failed: " + error.message + "\n\n(Check if device is muted)");
                });
            }
        } catch (e: any) {
             alert("Audio Init Error: " + e.message);
        }
    };
    
    reader.onerror = (e) => {
        alert("Error reading file: " + reader.error);
    };
  }

  /**
   * Converts a video file (File object) to an MP3 Blob.
   * This handles reading, decoding (via Web Audio API), and MP3 encoding.
   */
  async convertVideoToMp3(file: File): Promise<Blob> {
    // Step 1: Read File
    const arrayBuffer = await file.arrayBuffer();

    // Step 2: Decode
    // Use webkitAudioContext for broader compatibility (Safari)
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Step 3: Encode
    return this.audioBufferToMp3(audioBuffer);
  }

  private audioBufferToMp3(audioBuffer: AudioBuffer): Blob {
    // Force mono or stereo (lamejs limitation)
    const channels = audioBuffer.numberOfChannels >= 2 ? 2 : 1;
    const sampleRate = audioBuffer.sampleRate;
    
    // lamejs: Mono = 1, Stereo = 2. 
    // Note: lamejs might have issues with non-standard sample rates, but usually 44100/48000 work.
    const kbps = 128; 
    const mp3Encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
    
    const sampleBlockSize = 1152;
    const mp3Data:any = [];

    // Helper to convert Float32 to Int16
    const convertBuffer = (arrayBuffer: Float32Array) => {
      const data = new Int16Array(arrayBuffer.length);
      for (let i = 0; i < arrayBuffer.length; i++) {
        // Clamp the value between -1 and 1
        let s = Math.max(-1, Math.min(1, arrayBuffer[i]));
        // Scale to 16-bit integer range
        data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      return data;
    };

    const left = convertBuffer(audioBuffer.getChannelData(0));
    const right = channels === 2 ? convertBuffer(audioBuffer.getChannelData(1)) : undefined;

    let remaining = left.length;
    for (let i = 0; i < remaining; i += sampleBlockSize) {
      const leftChunk = left.subarray(i, i + sampleBlockSize);
      let mp3buf;
      
      if (channels === 2 && right) {
        const rightChunk = right.subarray(i, i + sampleBlockSize);
        mp3buf = mp3Encoder.encodeBuffer(leftChunk, rightChunk);
      } else {
        mp3buf = mp3Encoder.encodeBuffer(leftChunk);
      }
      
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }
    }

    const mp3buf = mp3Encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }
    
    console.log("MP3 Data parts:", mp3Data.length);
    const blob = new Blob(mp3Data, { type: 'audio/mp3' });
    console.log("Gen Blob size:", blob.size);
    return blob;
  }
}
