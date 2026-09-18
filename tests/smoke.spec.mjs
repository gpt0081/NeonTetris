import { test, expect } from "@playwright/test";
import fs from "node:fs";

test("mobile game shell keeps protected controls, nickname gate and ranking without page errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));

  await page.goto("/");
  await expect(page.locator("#playerGate")).toBeVisible();
  await page.locator("#nicknameInput").fill("CI-PLAYER");
  await page.locator("#startGameBtn").click();
  await expect(page.locator("#playerGate")).toBeHidden();
  await expect(page.locator("#playerName")).toHaveText("CI-PLAYER");

  await expect(page.locator("#gameCanvas")).toBeVisible();
  await expect(page.locator("#nextCanvas")).toBeVisible();
  await expect(page.locator("#holdCanvas")).toBeVisible();
  await expect(page.locator(".mobile-controls button")).toHaveCount(6);
  await expect(page.locator("#soundBtn")).toBeVisible();
  await expect(page.locator("#pauseBtn")).toBeVisible();
  await expect(page.locator("#rankBtn")).toBeVisible();

  await page.keyboard.press("Space");
  await expect(page.locator("#dropStreakFx")).toContainText("DROP ×1");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Space");
  await expect(page.locator("#dropStreakFx")).toContainText("DROP ×2");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(page.locator("#dropStreakFx")).toContainText("DROP ×1");

  await page.locator("#rankBtn").click();
  await expect(page.locator("#rankModal")).toBeVisible();
  await page.locator("#closeRankBtn").click();
  await expect(page.locator("#rankModal")).toBeHidden();

  fs.mkdirSync("test-results", { recursive: true });
  await page.screenshot({ path: "test-results/mobile-current.png", fullPage: true });

  expect(errors).toEqual([]);
});
