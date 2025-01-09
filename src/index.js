import { NativeModules } from 'react-native';
const { RawAudioModule } = NativeModules;

let pollId = null;

/**
 * Requests permission to access the microphone.
 * @returns {Promise<boolean>} - Resolves to `true` if permission is granted, otherwise `false`.
 */
export async function requestPermission() {
  return RawAudioModule.requestPermission();
}

/**
 * Starts audio recording.
 * @param {Object} options - Recording options (e.g., format, sampleRate).
 * @param {function} onDataAvailable - Callback function to handle audio data.
 * @returns {Promise<void>}
 */
export async function startRecording(options = {}, onDataAvailable) {
  await RawAudioModule.startRecording(options);

  // Start polling for audio chunks
  pollId = setInterval(async () => {
    const chunk = await readChunk();
    if (chunk && onDataAvailable) {
      onDataAvailable(chunk);
    }
  }, 200); // Adjust the interval as needed
}

/**
 * Reads the next available chunk of raw audio data.
 * @returns {Promise<string>} - Resolves to a base64-encoded string of PCM data.
 */
export async function readChunk() {
  return RawAudioModule.readChunk();
}

/**
 * Stops audio recording.
 * @returns {Promise<void>}
 */
export async function stopRecording() {
  if (pollId) {
    clearInterval(pollId);
    pollId = null;
  }
  return RawAudioModule.stopRecording();
}
