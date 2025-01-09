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
    await startRecording(this.options, (chunk) => {
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
        this.ondataavailable(chunk);
      }
    }, 200);
  }

  async stop() {
    clearInterval(this._pollId);
    this._pollId = null;
    await stopRecording();
    if (this.onstop) this.onstop();
  }
}