#!/bin/bash
set -euo pipefail

# Build the gmail-sanitizer workspace package so dist/index.js exists
# before Metro tries to resolve it during the JS bundle step.
cd "$EAS_BUILD_WORKINGDIR/packages/gmail-sanitizer"
npx tsc
