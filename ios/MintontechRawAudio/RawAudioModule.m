#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RawAudioModule, NSObject)

// Request permission
RCT_EXTERN_METHOD(
  requestPermission:
    (RCTPromiseResolveBlock)resolve
    reject:
      (RCTPromiseRejectBlock)reject
)

// Start recording
RCT_EXTERN_METHOD(
  startRecording:
    (NSDictionary)options
    resolve:
      (RCTPromiseResolveBlock)resolve
    reject:
      (RCTPromiseRejectBlock)reject
)

// Read chunk
RCT_EXTERN_METHOD(
  readChunk:
    (RCTPromiseResolveBlock)resolve
    reject:
      (RCTPromiseRejectBlock)reject
)

// Stop recording
RCT_EXTERN_METHOD(
  stopRecording:
    (RCTPromiseResolveBlock)resolve
    reject:
      (RCTPromiseRejectBlock)reject
)

@end