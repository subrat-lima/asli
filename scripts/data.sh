#!/bin/bash
set -e

DIST_DIR="./dist"
DATA_DIR="./data"

# Check for jq
if ! command -v jq &> /dev/null; then
    echo "Error: 'jq' is not installed."
    exit 1
fi

mkdir -p "$DIST_DIR"

echo "Merging data..."

merge_folder() {
  local folder=$1
  local result="[]"
  
  if [ -d "$DATA_DIR/$folder" ]; then
    # Iterate through json files safely
    for file in "$DATA_DIR/$folder"/*.json; do
      [ -e "$file" ] || continue
      name=$(basename "$file" .json)
      entry=$(jq -c --arg id "$name" '{i: $id, d: .domains, k: .keywords}' "$file")
      result=$(echo "$result" | jq -c ". += [$entry]")
    done
  fi
  echo "$result"
}

RED_DATA=$(merge_folder "dead")
YELLOW_DATA=$(merge_folder "apps")
GREEN_DATA=$(merge_folder "root")

# Final minified JSON
echo "{\"red\":$RED_DATA,\"yellow\":$YELLOW_DATA,\"green\":$GREEN_DATA}" > "$DIST_DIR/data.min.json"

# Generate metadata with millisecond timestamp
TIMESTAMP=$(date +%s%3N)
echo "{\"timestamp\":$TIMESTAMP}" > "$DIST_DIR/metadata.json"

echo "Data Build Success: data.min.json and metadata.json are ready."
