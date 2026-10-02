#!/usr/bin/env bash
# ============================================================
# AURA Cosmetics — Render Build Script
# Render runs this automatically on every deploy
# ============================================================
set -o errexit   # exit on any error

echo "▶ Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "▶ Running database migrations..."
python manage.py migrate --noinput

echo "▶ Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Build complete."
