// RawAudioModuleSpec.js
import { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

export interface Spec extends TurboModule {
  requestPermission(): Promise<boolean>;
  startRecording(options: { sampleRate: number }): Promise<void>;
  stopRecording(): Promise<void>;
  readChunk(): Promise<string>;
}

export default TurboModuleRegistry.get<Spec>('RawAudioModule');
