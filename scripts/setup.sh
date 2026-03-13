#!/bin/bash
set -e

HOOK_SRC="./hooks/pre-commit"
HOOK_DEST="./.git/hooks/pre-commit"

if [ ! -d ".git" ]; then
    echo "Error: .git directory not found. Are you in the project root?"
    exit 1
fi

if [ -f "$HOOK_SRC" ]; then
    mkdir -p .git/hooks
    cp "$HOOK_SRC" "$HOOK_DEST"
    chmod +x "$HOOK_DEST"
    echo "Success: Pre-commit hooks installed."
else
    echo "Error: $HOOK_SRC not found."
    exit 1
fi
