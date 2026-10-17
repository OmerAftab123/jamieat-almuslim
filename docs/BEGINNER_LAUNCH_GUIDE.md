# Beginner launch guide (Windows and PowerShell first)

This guide takes you from a blank Windows computer to a running copy of the site, and then to a published one. Follow the steps in order. Every command is typed into **Windows PowerShell**.

You do not need to know programming. If a step fails, read the "If something goes wrong" note under it.

---

## Part 1: Install the tools (one time)

### 1.1 Install Git for Windows

1. Go to <https://git-scm.com/download/win> and download the installer.
2. Run it. Accept the defaults.
3. Check it works. Open **Windows PowerShell** (press the Start key, type `PowerShell`, press Enter) and type:

```powershell
git --version
```

You should see something like `git version 2.4x.x`.

### 1.2 Install Node.js 22 LTS

1. Go to <https://nodejs.org> and download the **LTS** version (22.x).
2. Run the installer. Accept the defaults, and keep **"Automatically install the necessary tools"** unticked.
3. **Close PowerShell and open it again**, so the new program is found.
4. Check:

```powershell
node --version
npm --version
```

Node should show `v22.x.x` (20.9 or newer also works).

> **If PowerShell says "running scripts is disabled on this system":** this is a safety setting. Run this once, then answer `Y`:
>
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```
>
> Alternatively, type `npm.cmd` instead of `npm` in every command below.

### 1.3 Create a GitHub account (only if you want to publish)

Sign up at <https://github.com>. You do not need it to run the site on your own computer.

---

## Part 2: Get the project onto your computer

Choose a folder for your projects, for example `Documents\Projects`:

```powershell
cd $HOME\Documents
mkdir Projects -ErrorAction SilentlyContinue
cd Projects
git clone https://github.com/OmerAftab123/jamieat-almuslim.git
cd jamieat-almuslim
```

You are now inside the project folder. Every command from here on is run in this folder.

To confirm, run:

```powershell
dir
```

You should see files such as `package.json`, `README.md`, `app`, `data` and `docs`.

---

## Part 3: Install and run

### 3.1 Install the project's packages

```powershell
npm ci
```

This downloads the exact versions listed in `package-lock.json`. It takes a few minutes the first time. Warnings about deprecated packages are normal. An error in red is not.

> **If something goes wrong:** delete the `node_modules` folder (`Remove-Item -Recurse -Force node_modules`), then run `npm ci` again.

### 3.2 Start the website

```powershell
npm run dev
```

Wait until you see `Ready`. Then open a browser and go to:

**<http://localhost:3000>**

To stop the website, go back to PowerShell and press **Ctrl + C**.

> **If port 3000 is busy:** Next.js will offer another port, for example 3001. Use the address it prints.

### 3.3 Check that everything passes

Run the full check. It validates the data, checks types and style, runs the unit tests, and builds the site:

```powershell
npm run check
```

You should see each step finish without an error. The last lines should mention a successful build.

### 3.4 Run the browser tests (optional but recommended)

The browser tests open the site in a real browser. They run against the **built** site, so build first:

```powershell
npm run build
npx playwright install chromium
npm run test:e2e
```

- `npx playwright install chromium` downloads a browser (a large download) the first time only.
- You should see 8 tests passed.

> **If the browser download fails** (for example, behind a school or office network): skip this step. The rest of the project still works. Report the message in a GitHub issue.

### 3.5 Look at the built site without developer tools

```powershell
npm run serve
```

Open <http://127.0.0.1:3100/>. This serves the same files that GitHub Pages will publish. Press **Ctrl + C** to stop.

---

## Part 4: Make a change safely

1. Open the project folder in a text editor. Visual Studio Code (<https://code.visualstudio.com>) is a good free choice.
2. Data files are in `data/`. They are plain JSON. Keep the same structure, keep quotes and commas, and add a source and a date for any new value.
3. After any change, run:

```powershell
npm run validate:data
npm run check
```

If `validate:data` reports an error, it names the file and the problem. Fix that before going further.

4. Save your work in Git:

```powershell
git status
git add -A
git commit -m "Describe what you changed"
```

Do not commit real passwords or API keys. The project does not need any. Environment files named `.env` are ignored by Git on purpose.

---

## Part 5: Publish on GitHub Pages (free)

This publishes a copy of the site at a public web address.

### 5.1 Push the code to GitHub

If you cloned the repository from GitHub and do not have write access, make a copy first: on GitHub, click **Fork**, then point your local copy at your fork with `git remote set-url origin <your-fork-url>`.

```powershell
git push origin main
```

### 5.2 Turn on Pages (one time, by the repository owner)

1. On GitHub, open the repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Save.

### 5.3 Run the deployment

The workflow `.github/workflows/pages.yml` runs on every push to `main`. You can also start it manually: go to the **Actions** tab, choose **Deploy to GitHub Pages**, and select **Run workflow**.

When the run is green, the site address is shown on the workflow run page. For this repository it should be:

**<https://omeraftab123.github.io/jamieat-almuslim/>**

> **Status note:** the workflow is written in this repository. It does **not** go live until Pages is enabled in Settings, as in step 5.2. Until then, the workflow fails at the setup step with a message about Pages not being enabled. Check the Actions tab after enabling it.

> **If the page shows without styles:** make sure the address ends with `/jamieat-almuslim/` and that the workflow used `BASE_PATH`. Do not open pages from the `out/` folder directly.

---

## Part 6: Deploy on Vercel (optional)

1. Go to <https://vercel.com> and sign in with GitHub.
2. Choose **Add New → Project**, select this repository, and accept the detected **Next.js** settings.
3. Click **Deploy**.

Vercel does not need `BASE_PATH`. No environment variables are required. Vercel deployments are not created by this repository; this step has to be done by you.

---

## Part 7: Make a ZIP of the project

To send the project to someone else without Git:

```powershell
cd $HOME\Documents\Projects
Compress-Archive -Path jamieat-almuslim -DestinationPath jamieat-almuslim.zip -Force
```

Exclude `node_modules` and `out` if the ZIP is too big. Those folders are rebuilt with `npm ci` and `npm run build`.

---

## If something goes wrong

| Symptom | Likely cause | What to do |
|---|---|---|
| `node` or `npm` not recognised | Node not installed, or PowerShell not reopened | Reopen PowerShell. If it still fails, reinstall Node LTS. |
| `running scripts is disabled` | PowerShell safety setting | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use `npm.cmd`. |
| `EADDRINUSE` / port in use | Another program uses the port | Stop the other program, or use the port Next.js suggests. |
| `validate:data` reports an error | A data file has a typo or a broken reference | Read the file and line in the message and fix it. |
| `npm run build` fails on types | An edit broke a TypeScript rule | Run `npm run typecheck` to see the exact line. |
| Browser tests cannot start Chromium | Browser not downloaded, or blocked network | Run `npx playwright install chromium` again, or skip the browser tests. |
| Pages address shows a 404 | Pages not enabled, or the first deploy has not finished | Enable Pages (step 5.2), then re-run the workflow. |

---

## Reporting problems

Open an issue at <https://github.com/OmerAftab123/jamieat-almuslim/issues>. Include:

1. What you were doing,
2. The exact command and the last 20 lines of the error,
3. Your Windows version and `node --version`.

Never paste personal information or passwords into an issue.
