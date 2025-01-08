# iOS File Structure

For the first revision, I am aiming for a simpler project with this file structure:

```
@mintontech/react-native-raw-audio/
├── ios/
│   ├── RawAudio.podspec
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
│   └── (...RN app files...)
├── .gitignore
├── .npmignore
├── CONTRIBUTING.md
├── LICENSE
├── package.json
└── README.md
```

```bash
mkdir -p ios/MintontechRawAudio
touch ios/RawAudio.podspec
touch ios/MintontechRawAudio/RawAudioModule.swift
touch ios/MintontechRawAudio/RawAudioModule.m
touch ios/MintontechRawAudio/AudioEngineManager.swift
mkdir -p src
touch src/index.js
touch src/MediaRecorder.js
mkdir -p example/ios
touch example/App.js
touch .gitignore
touch .npmignore
touch CONTRIBUTING.md
touch LICENSE
touch package.json
touch README.md
```

## Step 1: Initialize and Install
```bash
mkdir react-native-raw-audio
cd react-native-raw-audio
npm init -y
npm install react-native
```
- You now have a basic package.json.
- react-native is installed locally (so your Swift bridging can reference RN headers).

## Step 2: Create ios/RawAudio.podspec
```ruby
# ios/RawAudio.podspec
Pod::Spec.new do |s|
  s.name         = "MintontechRawAudio"
  s.version      = "1.0.0"
  s.summary      = "iOS Swift module for raw audio capture."
  s.homepage     = "https://github.com/mintontech/react-native-raw-audio"
  s.license      = "MIT"
  s.author       = { "MintonTech" => "info@mintontech.com" }
  s.ios.deployment_target = "14.0"
  s.source       = { :git => "https://github.com/mintontech/react-native-raw-audio.git", :tag => s.version }
  s.source_files = "MintontechRawAudio/**/*.{swift,h,m}"
  s.dependency "React-Core"
end
```
This allows Cocoapods to integrate your Swift module with React Native apps.

## Step 3: Swift Bridging—RawAudioModule.swift
Create ios/MintontechRawAudio/RawAudioModule.swift:

```swift
import Foundation
import AVFoundation
import React

@objc(RawAudioModule)
class RawAudioModule: NSObject {

  @objc
  func requestPermission(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    AVAudioSession.sharedInstance().requestRecordPermission { granted in
      resolve(granted)
    }
  }

  @objc
  func startRecording(
    _ options: NSDictionary,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    AudioEngineManager.shared.start(format: "wav", sampleRate: 44100) { error in
      if let err = error {
        reject("ERR_START", err.localizedDescription, err)
      } else {
        resolve(nil)
      }
    }
  }

  @objc
  func stopRecording(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    AudioEngineManager.shared.stop { error in
      if let err = error {
        reject("ERR_STOP", err.localizedDescription, err)
      } else {
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
## Step 4: Objective-C Bridge—RawAudioModule.m
Create ios/MintontechRawAudio/RawAudioModule.m:

```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RawAudioModule, NSObject)

RCT_EXTERN_METHOD(
  requestPermission:
    (RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  startRecording:
    (NSDictionary)options
    resolve:(RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  stopRecording:
    (RCTPromiseResolveBlock)resolve
    reject:(RCTPromiseRejectBlock)reject
)

@end
```

This file “exposes” the Swift methods to React Native’s old architecture. If your app is on the new architecture, you could adapt accordingly. Most RN apps still use this approach.

## Step 5: Audio Engine—AudioEngineManager.swift
Create ios/MintontechRawAudio/AudioEngineManager.swift:

```swift
import AVFoundation

class AudioEngineManager {
  static let shared = AudioEngineManager()
  private let engine = AVAudioEngine()
  private var isRunning = false

  func start(format: String, sampleRate: Int, completion: (Error?) -> Void) {
    guard !isRunning else {
      completion(nil)
      return
    }

    let session = AVAudioSession.sharedInstance()
    do {
      try session.setCategory(.playAndRecord, mode: .default)
      try session.setActive(true)
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
    engine.stop()
    isRunning = false
    completion(nil)
  }
}
```
For now, it just starts/stops AVAudioEngine. You can install a tap or add additional logic here later.

## Step 6: JavaScript Interface
src/index.js

```js
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
```
src/MediaRecorder.js

```js
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
```
## Step 7: Root Files
Create or edit these minimal files at the root level (no special content required to make the module functional, but recommended for a complete project):

- package.json: Add a version, description, etc.
- .gitignore
- .npmignore
- CONTRIBUTING.md
- LICENSE
- README.md

## Step 8: Pod Install in a Host RN App
If another RN app consumes this library, it’ll appear in that app’s node_modules. Then, in the host app’s ios/ folder:

```bash
pod install
```
Cocoapods picks up RawAudio.podspec and includes your Swift module.

## Step 9: Example App
In your `example/` folder, create a fresh RN app (`npx react-native init ExampleApp`).
`npm install ../` to link this local library.
In example/App.js:
```js
import React, { useRef } from 'react';
import { View, Text, Button } from 'react-native';
import MediaRecorder from 'react-native-raw-audio/src/MediaRecorder';

export default function App() {
  const recorderRef = useRef(null);

  function onStart() {
    recorderRef.current = new MediaRecorder();
    recorderRef.current.onstart = () => console.log('Recording started...');
    recorderRef.current.onstop = () => console.log('Recording stopped.');
    recorderRef.current.start();
  }

  function onStop() {
    if (recorderRef.current) {
      recorderRef.current.stop();
    }
  }

  return (
    <View style={{ marginTop: 60 }}>
      <Text>Raw Audio Demo</Text>
      <Button title="Start Recording" onPress={onStart} />
      <Button title="Stop Recording" onPress={onStop} />
    </View>
  );
}
```

In the example folder, run:

```bash
cd ios/
pod install
cd ..
npx react-native run-ios
```
