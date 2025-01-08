import { startRecording, stopRecording } from './index';

export default class MediaRecorder {
  constructor(stream, options = {}) {
    this.options = options;
    this.onstart = null;
    this.onstop = null;
  }

  async start() {
    await startRecording(this.options);
    if (this.onstart) this.onstart();
  }

  async stop() {
    await stopRecording();
    if (this.onstop) this.onstop();
  }
}