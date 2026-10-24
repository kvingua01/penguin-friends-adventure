const { defineConfig } = require("@playwright/test");
const { existsSync } = require("node:fs");
const browserPath =
  process.env.CHROMIUM_EXECUTABLE ||
  (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
module.exports = defineConfig({
  testDir: "./tests",
  timeout: 90000,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:18084",
    headless: true,
    launchOptions: browserPath ? { executablePath: browserPath } : {},
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:18084/health",
    env: { PORT: "18084" },
    reuseExistingServer: !process.env.CI,
  },
});
