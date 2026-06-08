#!/usr/bin/env bash
set -euo pipefail

# Mobile depends on workspace packages via file:../packages/* — EAS uploads the git
# repo; fail fast if those paths are missing from the archive.
for pkg in api-client shared; do
  if [ ! -f "../packages/${pkg}/package.json" ]; then
    echo "error: ../packages/${pkg} not found. Run EAS from mobile/ with the full repo."
    exit 1
  fi
done

# eas.json no longer supports installCommand (EAS CLI 16+). Mobile is outside the root
# pnpm workspace, but we still install explicitly so flags stay predictable on CI.
pnpm install --ignore-workspace --no-frozen-lockfile
