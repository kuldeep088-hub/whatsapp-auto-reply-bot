@echo off
cd /d C:\Users\HP\Desktop\Whasapp
pm2 delete whatsapp-bot 2>nul
pm2 start index.js --name "whatsapp-bot"
pm2 save
curl -s -X POST http://localhost:3000/set -H "Content-Type: application/json" -d "{\"present\":false}"
