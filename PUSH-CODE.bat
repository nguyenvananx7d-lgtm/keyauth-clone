@echo off
echo Pushing code to GitHub...
cd /d "%~dp0"
git add .
git commit -m "Fix start script for Render deployment"
git push origin main
echo Done!
pause
