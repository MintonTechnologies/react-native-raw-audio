import { NativeModules } from 'react-native';
const { RawAudioModule } = NativeModules;

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
 * @returns {Promise<void>}
 */
export async function startRecording(options = {}) {
  return RawAudioModule.startRecording(options);
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
  return RawAudioModule.stopRecording();
}
