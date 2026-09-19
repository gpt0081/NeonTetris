import { test, expect } from "@playwright/test";
import fs from "node:fs";

test("mobile game shell keeps protected controls, FEVER and ghost rival without page errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));

  await page.addInitScript(() => {
    localStorage.setItem("neon-tetris-ranking", JSON.stringify([
      {
        name: "GHOST-01",
        score: 1400,
        lines: 4,
        level: 1,
        maxStreak: 6,
        maxFeverTier: 1,
        duration: 2000,
        replay: [
          { t: 0, score: 0, lines: 0, level: 1, fever: 0, streak: 0, board: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,48,120], active: [144,145,154,155] },
          { t: 1, score: 80, lines: 0, level: 1, fever: 0, streak: 2, board: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,32,112,248], active: [134,144,145,154] },
          { t: 2, score: 180, lines: 1, level: 1, fever: 1, streak: 5, board: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,48,112,255], active: [124,125,134,135] }
        ]
      }
    ]));
  });

  await page.goto("/");
  await expect(page.locator("#playerGate")).toBeVisible();
  await page.locator("#nicknameInput").fill("CI-PLAYER");
  await expect(page.locator("#rivalSelect option")).toHaveCount(2);
  await page.locator("#rivalSelect").selectOption("0");
  await page.locator("#startGameBtn").click();
  await expect(page.locator("#playerGate")).toBeHidden();
  await expect(page.locator("#playerName")).toHaveText("CI-PLAYER");
  await expect(page.locator("#rivalPanel")).toBeVisible();
  await expect(page.locator("#rivalName")).toHaveText("GHOST-01");
  await expect(page.locator("#rivalDelta")).toContainText("EVEN");
  await expect(page.locator("#rivalBoardCanvas")).toBeVisible();
  await expect(page.locator("#rivalBoardName")).toHaveText("GHOST-01");

  await expect(page.locator("#gameCanvas")).toBeVisible();
  await expect(page.locator("#nextCanvas")).toBeVisible();
  await expect(page.locator("#holdCanvas")).toBeVisible();
  await expect(page.locator(".mobile-controls button")).toHaveCount(6);
  await expect(page.locator("#soundBtn")).toBeVisible();
  await expect(page.locator("#pauseBtn")).toBeVisible();
  await expect(page.locator("#rankBtn")).toBeVisible();
  await expect(page.locator("#settingsBtn")).toBeVisible();

  await page.locator("#settingsBtn").click();
  await expect(page.locator("#settingsModal")).toBeVisible();
  await page.locator("#bgmVolumeDial").fill("35");
  await expect(page.locator("#bgmVolumeValue")).toHaveText("35%");
  await page.locator("#sfxVolumeDial").fill("45");
  await expect(page.locator("#sfxVolumeValue")).toHaveText("45%");
  await page.locator("#lineVolumeDial").fill("55");
  await expect(page.locator("#lineVolumeValue")).toHaveText("55%");
  await page.locator("#testBgmBtn").click();
  await page.locator("#testSfxBtn").click();
  await page.locator("#testLineBtn").click();
  await page.locator("#closeSettingsBtn").click();
  await expect(page.locator("#settingsModal")).toBeHidden();
  await expect.poll(() => page.evaluate(() => localStorage.getItem("neon-tetris-bgm-volume"))).toBe("0.35");

  await page.keyboard.press("Space");
  await expect(page.locator("#dropStreakFx")).toContainText("DROP ×1");
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Space");
  await expect(page.locator("#dropStreakFx")).toContainText("DROP ×2");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Space");
  await expect(page.locator("#dropStreakFx")).toContainText("DROP ×1");
  await expect(page.locator("#feverLevel")).toHaveText("COOL");

  for (let i = 0; i < 4; i++) {
    await page.keyboard.press(i % 2 ? "ArrowLeft" : "ArrowRight");
    await page.keyboard.press("Space");
  }
  await expect(page.locator("#feverLevel")).toHaveText("HEAT");
  await expect(page.locator("#feverMultiplier")).toHaveText("×1.2");

  await page.waitForTimeout(2100);
  await expect(page.locator("#ghostRivalScore")).not.toHaveText("0");
  await expect(page.locator("#rivalLineFx")).toContainText("LINE CLEAR!");
  await expect(page.locator("#rivalComboFx")).toContainText("COMBO ×5");

  await page.locator("#rankBtn").click();
  await expect(page.locator("#rankModal")).toBeVisible();
  await page.locator("#closeRankBtn").click();
  await expect(page.locator("#rankModal")).toBeHidden();

  await page.locator("#restartBtn").click();
  await expect(page.locator("#playerGate")).toBeVisible();
  await expect(page.locator("#nicknameInput")).toHaveValue("CI-PLAYER");
  await expect(page.locator("#playerName")).toHaveText("...");
  await expect(page.locator("#rivalPanel")).toBeHidden();

  fs.mkdirSync("test-results", { recursive: true });
  await page.screenshot({ path: "test-results/mobile-current.png", fullPage: true });

  expect(errors).toEqual([]);
});
