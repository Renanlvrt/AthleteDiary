// ============================================================
// ios-widget/swift/native-module/WidgetBridge.m
//
// Objective-C bridge header that exposes the Swift WidgetBridge
// class to React Native's NativeModules system.
// This file goes in the MAIN APP target (not the extension).
// ============================================================

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(WidgetBridge, NSObject)

RCT_EXTERN_METHOD(
  setWidgetData:(NSString *)jsonString
  resolve:(RCTPromiseResolveBlock)resolve
  reject:(RCTPromiseRejectBlock)reject
)

@end
