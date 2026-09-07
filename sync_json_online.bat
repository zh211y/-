@echo off
title Sync Local JSON To Online
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0sync_json_online.ps1"
pause
