import { startRecording, readChunk, stopRecording } from './index';

export default class MediaRecorder {
  constructor(options = {}) {
    this.options = options;
    this.onstart = null;
    this.onstop = null;
    this.ondataavailable = null;
    this._pollId = null;
  }

  async start() {
    await startRecording(this.options);
    if (this.onstart) this.onstart();

    // Poll for chunks every 200 ms
    this._pollId = setInterval(async () => {
      const base64Chunk = await readChunk();
      if (base64Chunk && base64Chunk.length > 0 && this.ondataavailable) {
        this.ondataavailable(base64Chunk);
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