import { test, expect } from "@playwright/test";
import fs from "node:fs";

test("mobile game shell keeps all protected controls and runs without page errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));

  await page.goto("/");
  await expect(page.locator("#gameCanvas")).toBeVisible();
  await expect(page.locator("#nextCanvas")).toBeVisible();
  await expect(page.locator("#holdCanvas")).toBeVisible();
  await expect(page.locator(".mobile-controls button")).toHaveCount(6);
  await expect(page.locator("#soundBtn")).toBeVisible();
  await expect(page.locator("#pauseBtn")).toBeVisible();

  await page.locator("#soundBtn").click();
  await expect(page.locator("#soundBtn")).toHaveText("🔊");
  await page.locator("#soundBtn").click();
  await expect(page.locator("#soundBtn")).toHaveText("🔇");

  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowUp");

  fs.mkdirSync("test-results", { recursive: true });
  await page.screenshot({ path: "test-results/mobile-current.png", fullPage: true });

  expect(errors).toEqual([]);
});
