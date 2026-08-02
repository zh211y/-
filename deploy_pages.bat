@echo off
title Deploy WildGuard Pages
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy_pages.ps1"
pause
