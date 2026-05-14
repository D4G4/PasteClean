# Maestro E2E flows

On-device end-to-end tests for the mobile app. These drive the real WebView /
toolbar / clipboard against a running simulator, covering the surface area
Jest can't reach (text actually appearing inside TenTap's ProseMirror,
toolbar buttons producing real format toggles, clipboard handoff to Gmail).

## Setup (one-time)

```sh
# Install Maestro CLI
curl -fsSL "https://get.maestro.mobile.dev" | bash

# Make sure the iOS dev-client app is installed on a booted simulator.
# This needs a current native build; if you've just changed deps, run:
cd packages/mobile && pnpm exec expo run:ios
```

## Run all flows

```sh
maestro test .maestro/
```

`.maestro/config.yaml` declares the canonical execution order:

1. `01_onboarding_to_editor.yaml` — boots fresh state, skips through 5 onboarding pages
2. `02_typing_basic.yaml` — types a string into the editor, asserts it appears
3. `03_formatting_bold.yaml` — bold-toggle round-trip
4. `04_link_regression.yaml` — the link-insertion regression we patched (see `hooks/useEditorLinkPatch.ts`)
5. `05_copy_to_gmail.yaml` — copy button, post-copy toast, screenshot

## Run a single flow

```sh
maestro test .maestro/04_link_regression.yaml
```

## What we test here vs Jest

| Surface | Where it's tested |
|---|---|
| Link patch logic (cursor + stored marks) | Jest: `hooks/__tests__/useEditorLinkPatch.test.tsx` |
| Bridge customization contract (`inclusive: false`) | Jest: `__tests__/bridgeExtensions.test.ts` |
| Copy-for-Gmail handler logic | Jest: `hooks/__tests__/useCopyForGmail.test.tsx` |
| HTML sanitization | Jest: `packages/gmail-sanitizer` (74 tests) |
| **Typing actually produces text in the WebView** | **Maestro: `02_typing_basic`** |
| **Bold toolbar button actually toggles bold** | **Maestro: `03_formatting_bold`** |
| **Link insert leaves cursor outside the link on a real device** | **Maestro: `04_link_regression`** |
| **Clipboard handoff round-trips through real expo-clipboard** | **Maestro: `05_copy_to_gmail`** |

## Limitations

- We can't programmatically read clipboard contents from inside Maestro
  without a custom shim, so the copy flow asserts the **UI affordances**
  (the "Copied!" chip and the handoff toast) rather than clipboard bytes.
- Maestro's WebView text matching uses iOS accessibility tree, which TenTap
  populates by default. If TenTap stops emitting accessibility text, the
  `assertVisible` calls inside the editor will need a different strategy.
- Toolbar buttons are targeted by accessibility text ("B", "Link", etc.).
  If we ever swap in a custom toolbar, retarget those `tapOn` lines.
