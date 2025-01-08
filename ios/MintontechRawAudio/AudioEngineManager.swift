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