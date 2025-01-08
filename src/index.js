import { NativeModules } from 'react-native';
const { RawAudioModule } = NativeModules;

export async function requestPermission() {
  return RawAudioModule.requestPermission();
}

export async function startRecording(options = {}) {
  return RawAudioModule.startRecording(options);
}

export async function stopRecording() {
  return RawAudioModule.stopRecording();
}