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
  func readChunk(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    AudioEngineManager.shared.readChunk { data, error in
      if let err = error {
        reject("ERR_READ_CHUNK", err.localizedDescription, err)
      } else if let chunkData = data {
        resolve(chunkData.base64EncodedString())
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