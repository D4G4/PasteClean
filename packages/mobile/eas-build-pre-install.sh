#!/bin/bash
set -euo pipefail

# Build the gmail-sanitizer workspace package so dist/index.js exists
# before Metro tries to resolve it during the JS bundle step.
# EAS_BUILD_WORKINGDIR points to packages/mobile/, go up to monorepo root
cd "$(dirname "$0")/../gmail-sanitizer"
npx tsc
