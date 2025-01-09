import AVFoundation

class AudioEngineManager {
  static let shared = AudioEngineManager()
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

      engine.prepare()
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
    engine.inputNode.removeTap(onBus: 0)
    isRunning = false
    completion(nil)
  }

  private func convertToPCM(buffer: AVAudioPCMBuffer) -> Data? {
    // Implement conversion to PCM data
    let audioBuffer = buffer.audioBufferList.pointee.mBuffers
    let data = Data(bytes: audioBuffer.mData!, count: Int(audioBuffer.mDataByteSize))
    return data
  }
}