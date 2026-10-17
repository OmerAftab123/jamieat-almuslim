import { defineConfig, devices } from '@playwright/test';

// Set CHROMIUM_PATH only when you need to use a browser you already have installed.
// Normal setup: `npx playwright install chromium` (see docs/BEGINNER_LAUNCH_GUIDE.md).
const executablePath = process.env.CHROMIUM_PATH || undefined;
const PORT = Number(process.env.E2E_PORT ?? 3100);

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    launchOptions: executablePath ? { executablePath, args: ['--no-sandbox'] } : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Serves the static export in ./out. Run `npm run build` first.
    command: `node scripts/serve-static.mjs`,
    env: { PORT: String(PORT), HOST: '127.0.0.1' },
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
