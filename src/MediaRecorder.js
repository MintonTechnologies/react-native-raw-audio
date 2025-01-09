import { requestPermission, startRecording, stopRecording, readChunk } from './index';

export default class MediaRecorder {
  constructor(options = {}) {
    this.options = options;
    this.onstart = null;
    this.ondataavailable = null;
    this.onstop = null;
    this._pollId = null;
  }

  async requestPermission() {
    return await requestPermission();
  }

  async start() {
    console.log('Starting Audio')
    await startRecording(this.options, (chunk) => {
      console.log('Audio started')
      if (this.ondataavailable) {
        this.ondataavailable(chunk);
      }
    });

    if (this.onstart) {
      this.onstart();
    }

    this._pollId = setInterval(async () => {
      const chunk = await readChunk();
      if (chunk && this.ondataavailable) {
        console.log('Audio chunk: ', chunk )
        this.ondataavailable(chunk);
      }
    }, 200);
  }

  async stop() {
    console.log('Stopping Audio')
    clearInterval(this._pollId);
    this._pollId = null;
    await stopRecording();
    if (this.onstop) this.onstop();
  }
}