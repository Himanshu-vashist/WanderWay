#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
# Add any build steps here if needed
# For example, if you need to build assets:
# npm run build

# Seed the database if needed (uncomment if you want to seed on deploy)
# node seed.js
