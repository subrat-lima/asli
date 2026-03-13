#!/bin/bash
set -e

MANIFEST="./src/manifest.json"
TYPE=${1:-patch}

if [[ ! "$TYPE" =~ ^(major|minor|patch)$ ]]; then
  echo "Usage: deno task release [major|minor|patch]"
  exit 1
fi

# 1. Run formatting
echo "Checking project status..."
deno task format

# 2. Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: You have uncommitted changes. Please commit or stash them first."
  exit 1
fi

# 3. Read and increment version
VERSION=$(jq -r .version "$MANIFEST")
IFS='.' read -r major minor patch <<< "$VERSION"

if [ "$TYPE" == "major" ]; then
  major=$((major + 1))
  minor=0
  patch=0
elif [ "$TYPE" == "minor" ]; then
  minor=$((minor + 1))
  patch=0
else
  patch=$((patch + 1))
fi

NEW_VERSION="$major.$minor.$patch"
echo "Bumping version: $VERSION -> $NEW_VERSION ($TYPE)"

# Update manifest
jq --arg v "$NEW_VERSION" '.version = $v' "$MANIFEST" > "$MANIFEST.tmp" && mv "$MANIFEST.tmp" "$MANIFEST"

# 4. Git ops
git add "$MANIFEST"
git commit -m "chore: bump version to v$NEW_VERSION"
git push origin main

# 5. Create GitHub Release
gh release create "v$NEW_VERSION" --title "Release v$NEW_VERSION" --generate-notes

echo -e "\nSuccessfully released v$NEW_VERSION!"
