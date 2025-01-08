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