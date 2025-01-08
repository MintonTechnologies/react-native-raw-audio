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