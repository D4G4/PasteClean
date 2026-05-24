#!/usr/bin/env bash
# Pre-submit gate. Runs the test suite (with coverage thresholds enforced
# via Jest config) before letting EAS build + auto-submit fire. The
# coverage threshold in packages/mobile/package.json#jest is the actual
# fail-loud line; if statements/branches/functions/lines regress below
# the lock-in numbers, this script aborts and EAS never touches anything.
#
# Use this instead of running `eas build --auto-submit` directly.
#
# Usage:
#   scripts/safe-submit.sh ios            # default profile = production
#   scripts/safe-submit.sh ios preview    # explicit profile
set -euo pipefail

PLATFORM="${1:-ios}"
PROFILE="${2:-production}"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

echo "▶ Pre-submit gate: building gmail-sanitizer + running Jest with coverage threshold"
pnpm --filter @pasteclean/gmail-sanitizer build
pnpm --filter @pasteclean/gmail-sanitizer test

cd "$REPO_ROOT/packages/mobile"
npx jest --coverage

echo "✓ Tests green. Proceeding to EAS build + auto-submit (platform=$PLATFORM, profile=$PROFILE)."
npx eas-cli build \
  --platform "$PLATFORM" \
  --profile "$PROFILE" \
  --non-interactive \
  --auto-submit
