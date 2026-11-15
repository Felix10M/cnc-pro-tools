# CNC Pro Tools v0.9 — free beta

Static website, no paid hosting or API required. Open `index.html` in a browser.

## Publish on GitHub Pages (free)
1. Create a **public** repository on GitHub (e.g. `cnc-pro-tools`).
2. Upload `index.html`, `favicon.svg`, and `.nojekyll` to the repository root.
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, `main`, `/ (root)`, then Save.
5. After deployment finishes, visit the Pages URL displayed in Settings → Pages.

A public repository makes the source code visible. Publishing and any required account setup must be performed by the owner. No public URL has been created by this package.

## Test before sharing
- Open every tab and switch RO/EN.
- Verify milling/drilling calculations against independent reference cases.
- Save and reload a project; export/import backup JSON.
- Test print-to-PDF and CSV export.
- Test on Android Chrome and desktop Chrome.
- Never rely on example CNC parameters for live machine operations without validation.

## Privacy
No accounts, payments, analytics or server database. Projects and calculation history are stored in localStorage; browser clearing can delete them. Backup regularly. Feedback is copied, not automatically submitted.
