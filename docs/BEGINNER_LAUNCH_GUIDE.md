# Beginner launch guide (Windows, PowerShell first)

This guide starts from nothing and ends with the site running on your computer. Steps are for **Windows 10 or 11** and **PowerShell**. macOS and Linux users can use the same commands in a terminal.

## 1. Install the tools (once)

1. **Node.js 22 LTS** (or any version 20.9 or newer): download the Windows installer from https://nodejs.org and accept the defaults.
2. **Git**: download from https://git-scm.com and accept the defaults.
3. Open PowerShell (Start menu, type `PowerShell`, press Enter). Check both tools:

```powershell
node -v
npm -v
git --version
```

Each command should print a version number. If `node` is not found, close PowerShell and open it again.

### If PowerShell blocks `npm`

Windows may show "running scripts is disabled on this system". Run this once, then try again:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Or use `npm.cmd` in place of `npm` in every command below.

## 2. Get the project

Choose a folder, for example your Documents folder:

```powershell
cd $HOME\Documents
git clone https://github.com/OmerAftab123/jamieat-almuslim.git
cd jamieat-almuslim
git checkout arena/cd01d825-jamieat-almuslim
```

If you downloaded a ZIP instead, extract it and open PowerShell inside the extracted `jamieat-almuslim` folder.

## 3. Install the project's packages (once)

```powershell
npm ci
```

`npm ci` uses the exact versions in `package-lock.json`. It takes a minute or two. Warnings about deprecated packages are normal; errors are not.

## 4. Check that everything works

```powershell
npm run check
```

This runs data validation, the type check, lint, unit tests, and the production build. Each step prints OK or an error message. If it stops, copy the last 20 lines of output and open an issue on GitHub.

## 5. Run the site on your computer

```powershell
npm run dev
```

Open http://localhost:3000 in your browser. Press `Ctrl+C` in PowerShell to stop the server.

To run the production build, which is closer to the deployed site:

```powershell
npm run build
npm run start
```

## 6. Run the browser tests (optional)

```powershell
npx playwright install chromium
npm run build
npm run test:e2e
```

The first command downloads a browser (about 150 MB). It needs an internet connection.

## 7. Make a ZIP of the project (optional)

The easiest option is on the GitHub website: open the repository, click **Code → Download ZIP**.

To zip your own copy, first delete the large generated folders (they are rebuilt by `npm ci`), then compress:

```powershell
Remove-Item -Recurse -Force node_modules, .next -ErrorAction SilentlyContinue
cd ..
Compress-Archive -Path jamieat-almuslim -DestinationPath jamieat-almuslim.zip -Force
```

## 8. Deploy to Vercel (optional)

1. Create a free account at https://vercel.com and connect your GitHub account.
2. Click **Add New → Project** and import `jamieat-almuslim`.
3. Keep the defaults: framework **Next.js**, build command `npm run build`, output is handled automatically.
4. Optional: add `NEXT_PUBLIC_SITE_URL` with your site address. It is public, so never put a secret here.
5. Click **Deploy**. Each push to the branch creates a new preview.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `node` not recognised | Reinstall Node.js, then open a new PowerShell window. |
| Port 3000 in use | Run `npm run dev -- -p 3001` and open http://localhost:3001. |
| `npm ci` fails | Delete `node_modules`, then run `npm ci` again. Check your internet connection. |
| Page shows "Dataset integrity problems" | A file in `data/` is inconsistent. The message names the file and the problem. |
| Playwright cannot start a browser | Run `npx playwright install chromium` again, then retry. |
