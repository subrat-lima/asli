#!/bin/bash
set -e

DIST_DIR="./dist"

echo "Preparing $DIST_DIR..."
mkdir -p "$DIST_DIR"

echo "Copying extension assets from src/ to dist/..."
cp -r src/* "$DIST_DIR/"

echo "App Build Success."
