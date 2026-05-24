#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(HtmlClipboard, NSObject)

RCT_EXTERN_METHOD(setHtml:(NSString *)html
                  plainText:(NSString *)plainText
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getAvailableTypes:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
