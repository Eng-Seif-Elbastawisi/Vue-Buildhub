#!/bin/bash

# Pull from production branch
git pull origin main

# npm install package
npm install

# Run vite build
npx vite build

# Copy .htaccess to dist folder
cp .htaccess dist
