#!/bin/bash
# Build script for Vercel

# Install frontend dependencies and build
cd frontend
npm install
npm run build
cd ..

# Install API dependencies
cd api
npm install
cd ..
