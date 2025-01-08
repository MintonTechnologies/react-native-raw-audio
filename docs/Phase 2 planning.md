# Phase 2 Plan: Pull-Based Chunks, Manual Bridging, No Codegen

Phase 1 is a good start to start and stop audio but now we need to be able to access the audio chunks in React Native.

### iOS File Structure

```
@mintontech/react-native-raw-audio/
├── ios/
│   └── MintontechRawAudio/
│       ├── RawAudioModule.swift
│       ├── RawAudioModule.m
│       └── AudioEngineManager.swift
├── src/
│   ├── index.js
│   └── MediaRecorder.js
├── example/
│   ├── App.js
│   ├── ios/
│   └── (RN app files...)
├── .gitignore
├── .npmignore
├── CONTRIBUTING.md
├── LICENSE
├── package.json
└── README.md
```

## Step 1: Modify ios/MintontechRawAudio/AudioEngineManager.swift
Replace its contents with the following (or update where noted):

```swift
import AVFoundation

class AudioEngineManager {
  private let engine = AVAudioEngine()
  private var isRunning = false

  // New: Provide a closure that gets each PCM chunk
  var onChunk: ((Data) -> Void)?

  func start(format: String, sampleRate: Int, completion: (Error?) -> Void) {
    guard !isRunning else {
      completion(nil)
      return
    }
    do {
      let session = AVAudioSession.sharedInstance()
      try session.setCategory(.playAndRecord, mode: .default)
      try session.setActive(true)

      let inputNode = engine.inputNode
      let inputFormat = inputNode.inputFormat(forBus: 0)

      // Install a tap to receive raw PCM data
      inputNode.installTap(onBus: 0, bufferSize: 1024, format: inputFormat) { [weak self] buffer, when in
        guard let strongSelf = self else { return }
        if let pcmData = strongSelf.convertToPCM(buffer: buffer) {
          // Forward each chunk via onChunk
          strongSelf.onChunk?(pcmData)
        }
      }

      try engine.start()
      isRunning = true
      completion(nil)
    } catch {
      completion(error)
    }
  }

  func stop(completion: (Error?) -> Void) {
    guard isRunning else {
      completion(nil)
      return
    }
    engine.inputNode.removeTap(onBus: 0)
    engine.stop()
    isRunning = false
    completion(nil)
  }

  // Convert AVAudioPCMBuffer to raw PCM bytes
  private func convertToPCM(buffer: AVAudioPCMBuffer) -> Data? {
    guard let channelData = buffer.floatChannelData?[0] else { return nil }
    let frameCount = Int(buffer.frameLength)
    let byteCount = frameCount * MemoryLayout<Float>.size
    return Data(bytes: channelData, count: byteCount)
  }
}
```
- We added var onChunk: ((Data) -> Void)? and call it inside the tap.

## Step 2: Modify ios/MintontechRawAudio/RawAudioModule.swift
Replace its contents with the following (or update where noted). This introduces a new readChunk method and accumulates data for polling:

```swift
import Foundation
import AVFoundation

@objc(RawAudioModule)
class RawAudioModule: NSObject {
  private var audioEngine = AudioEngineManager()
  private var isRecording = false
  private var chunkBuffer = Data()  // Accumulates the raw PCM data

  @objc
  func startRecording(
    _ options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard !isRecording else {
      resolve(nil)
      return
    }
    isRecording = true

    let format = options["format"] as? String ?? "wav"
    let sampleRate = options["sampleRate"] as? Int ?? 44100

    // This closure receives each PCM chunk from the manager
    audioEngine.onChunk = { [weak self] data in
      self?.chunkBuffer.append(data)
    }

    audioEngine.start(format: format, sampleRate: sampleRate) { error in
      if let err = error {
        self.isRecording = false
        reject("ERR_START", err.localizedDescription, err)
      } else {
        resolve(nil)
      }
    }
  }

  // New: readChunk returns base64 of the data since last call
  @objc
  func readChunk(
    _ resolve: RCTPromiseResolveBlock,
    reject: RCTPromiseRejectBlock
  ) {
    guard isRecording else {
      resolve("")
      return
    }
    let currentData = chunkBuffer
    chunkBuffer = Data()

    let base64String = currentData.base64EncodedString()
    resolve(base64String)
  }

  @objc
  func stopRecording(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard isRecording else {
      resolve(nil)
      return
    }
    isRecording = false

    audioEngine.stop { error in
      if let err = error {
        reject("ERR_STOP", err.localizedDescription, err)
      } else {
        self.chunkBuffer.removeAll()
        resolve(nil)
      }
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
```

- Added var chunkBuffer = Data() to accumulate audio bytes.
- Added a readChunk(...) method that returns the base64-encoded chunk and clears chunkBuffer.

## Step 3: Modify or Create ios/MintontechRawAudio/RawAudioModule.m
You already have an .m file from Phase 1, but you must add the readChunk method. It should look like this:

```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RawAudioModule, NSObject)

// Start
RCT_EXTERN_METHOD(
  startRecording:
    (NSDictionary)options
    resolve:
      (RCTPromiseResolveBlock)resolve
    reject:
      (RCTPromiseRejectBlock)reject
)

// New: readChunk
RCT_EXTERN_METHOD(
  readChunk:
    (RCTPromiseResolveBlock)resolve
    reject:
      (RCTPromiseRejectBlock)reject
)

// Stop
RCT_EXTERN_METHOD(
  stopRecording:
    (RCTPromiseResolveBlock)resolve
    reject:
      (RCTPromiseRejectBlock)reject
)

@end
```

- Added the readChunk macro reference to expose it to JS.

## Step 4: Modify src/MediaRecorder.js
Only change is adding a polling approach that calls readChunk on an interval and fires ondataavailable. For example:

```js
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
```

- Added this._pollId and calls to readChunk() on an interval.
- ondataavailable receives the base64-encoded chunk each time.

