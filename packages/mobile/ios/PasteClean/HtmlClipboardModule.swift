import Foundation
import UIKit
import UniformTypeIdentifiers
import React

/// React Native native module that sets HTML on UIPasteboard in the same
/// format Safari uses: com.apple.webarchive + public.html + plain text.
///
/// Gmail's WKWebView compose reads com.apple.webarchive natively via WebKit's
/// built-in paste handler, which preserves all inline styles and heading tags.
/// Just setting public.html alone doesn't reliably preserve heading sizes.
@objc(HtmlClipboard)
class HtmlClipboardBridge: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool { return false }

  @objc func setHtml(_ html: String, plainText: String,
                      resolver resolve: @escaping RCTPromiseResolveBlock,
                      rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard let htmlData = html.data(using: .utf8) else {
      reject("ERR", "Failed to encode HTML", nil)
      return
    }

    // Build a com.apple.webarchive plist — the format Safari uses.
    // WebKit's paste handler in Gmail's WKWebView reads this natively.
    let webArchive: [String: Any] = [
      "WebMainResource": [
        "WebResourceData": htmlData,
        "WebResourceMIMEType": "text/html",
        "WebResourceTextEncodingName": "UTF-8",
        "WebResourceURL": "about:blank"
      ]
    ]

    var items: [String: Any] = [
      UTType.html.identifier: htmlData,
      UTType.utf8PlainText.identifier: plainText
    ]

    // Add web archive if plist serialization succeeds
    if let archiveData = try? PropertyListSerialization.data(
      fromPropertyList: webArchive,
      format: .binary,
      options: 0
    ) {
      items["com.apple.webarchive"] = archiveData
    }

    UIPasteboard.general.setItems([items])
    resolve(nil)
  }

  /// Returns the type identifiers currently on UIPasteboard as a JSON-
  /// encoded array of strings. Used by the Maestro clipboard-format flow
  /// to assert `com.apple.webarchive` is present after a Copy — the
  /// signal that distinguishes the working binary from a v1.1.0-class
  /// regression where the native module was missing from the build.
  @objc func getAvailableTypes(_ resolve: @escaping RCTPromiseResolveBlock,
                                rejecter reject: @escaping RCTPromiseRejectBlock) {
    let types = UIPasteboard.general.types
    if let data = try? JSONSerialization.data(withJSONObject: types, options: []),
       let json = String(data: data, encoding: .utf8) {
      resolve(json)
    } else {
      reject("ERR", "Failed to serialize pasteboard types", nil)
    }
  }
}
