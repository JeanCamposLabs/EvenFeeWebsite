#!/usr/bin/env bash
#
# configure.sh — rebrand the EvenFee template in one command.
#
# Replaces the placeholder brand name, contact email, and site URL across all
# source files. Uses Python for safe, literal (non-regex) string replacement,
# so special characters in your values are handled correctly.
#
# Usage:
#   ./configure.sh "Brand Name" "you@yourdomain.com" "https://yourdomain.com"
#
# Notes:
#   - Pass the site URL WITHOUT a trailing slash.
#     GitHub Pages project site example: https://YOURUSER.github.io/YOURREPO
#     Custom domain example:             https://yourdomain.com
#   - Run from the repository root. Commit your work first so you can review the diff.
#
set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "Usage: ./configure.sh \"Brand Name\" \"you@yourdomain.com\" \"https://yourdomain.com\"" >&2
  exit 1
fi

command -v python3 >/dev/null 2>&1 || { echo "Error: python3 is required." >&2; exit 1; }

NEW_BRAND="$1"
NEW_EMAIL="$2"
NEW_URL="${3%/}"   # strip any trailing slash

# Current placeholders baked into the template:
OLD_BRAND="EvenFee"
OLD_EMAIL="hello@evenfee.com"
OLD_URL="https://evenfee.com"

FILES=(index.html privacy.html terms.html 404.html robots.txt sitemap.xml site.webmanifest README.md)

NEW_BRAND="$NEW_BRAND" NEW_EMAIL="$NEW_EMAIL" NEW_URL="$NEW_URL" \
OLD_BRAND="$OLD_BRAND" OLD_EMAIL="$OLD_EMAIL" OLD_URL="$OLD_URL" \
python3 - "${FILES[@]}" <<'PY'
import os, sys

ob, nb = os.environ["OLD_BRAND"], os.environ["NEW_BRAND"]
oe, ne = os.environ["OLD_EMAIL"], os.environ["NEW_EMAIL"]
ou, nu = os.environ["OLD_URL"],   os.environ["NEW_URL"]

# Order matters: replace the longest/most-specific strings first.
pairs = [(ou, nu), (oe, ne), (ob, nb)]

for path in sys.argv[1:]:
    if not os.path.exists(path):
        print(f"  skip (not found): {path}")
        continue
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    original = text
    for old, new in pairs:
        text = text.replace(old, new)
    if text != original:
        with open(path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"  updated: {path}")
    else:
        print(f"  no change: {path}")
PY

echo ""
echo "Done. Replaced:"
echo "  Brand:  $OLD_BRAND  ->  $NEW_BRAND"
echo "  Email:  $OLD_EMAIL  ->  $NEW_EMAIL"
echo "  URL:    $OLD_URL  ->  $NEW_URL"
echo ""
echo "Next steps:"
echo "  1. Review the changes:        git diff"
echo "  2. Update assets/favicon.svg + regenerate the icons/OG image if your brand changed."
echo "  3. Confirm the hosting sub-processor named in privacy.html (search for 'AWS')."
