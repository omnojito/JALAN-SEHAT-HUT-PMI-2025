# Pendaftaran Peserta Jalan Sehat (Google Sheets backend)

This package contains a static front-end (index.html, style.css, script.js) that connects to a Google Sheets backend through a Google Apps Script Web App.

## Files
- index.html — main page
- style.css — styles
- script.js — frontend logic (replace API_URL with your Web App URL)
- apps_script.gs — Google Apps Script code to paste into your Google Sheet's Apps Script editor

## Setup Guide
1. Create a new Google Sheet. Put headers in row 1: `Nama | Alamat | NIK | Instansi | Kupon`.
2. Open `Extensions -> Apps Script` and paste the contents of `apps_script.gs` into the editor.
3. Save project. Deploy -> New deployment -> select **Web app**.
   - Set **Execute as**: Me
   - Set **Who has access**: Anyone
   - Click Deploy and copy the Web App URL.
4. Edit `script.js` and replace `PASTE_YOUR_WEB_APP_URL_HERE` with the Web App URL.
5. Upload `index.html`, `style.css`, and `script.js` to your GitHub Pages repository (or open locally), then open the page.

## Notes
- The Apps Script returns `row` numbers starting from 2 (because headers are row 1). Deleting rows shifts following row numbers.
- For editing we implement a simple flow: the app deletes the existing row and creates a new one when the user edits and saves.
- Make sure your Web App is deployed with "Anyone" access.

If you want, I can deploy the Apps Script for you if you share access, or guide you step-by-step during deployment.
