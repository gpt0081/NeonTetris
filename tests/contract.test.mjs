import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("index.html", "utf8");
const css = fs.readFileSync("style.css", "utf8");
const js = fs.readFileSync("app.js", "utf8");

test("critical DOM anchors remain present", () => {
  for (const id of [
    "gameCanvas","nextCanvas","holdCanvas","score","best","lines","level",
    "pauseBtn","restartBtn","soundBtn","fxBanner"
  ]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
});

test("mobile control contract remains intact", () => {
  for (const action of ["left","right","down","rotate","drop","hold"]) {
    assert.match(html, new RegExp(`data-action=["']${action}["']`));
  }
  assert.match(html, /class=["'][^"']*dpad/);
  assert.match(html, /class=["'][^"']*action-pad/);
  assert.match(css, /\.mobile-controls/);
  assert.match(css, /\.dpad/);
  assert.match(css, /\.action-pad/);
});

test("seven tetrominoes and seven-bag logic remain", () => {
  for (const piece of ["I","J","L","O","S","T","Z"]) {
    assert.match(js, new RegExp(`\\b${piece}:\\s*\\[`));
  }
  assert.match(js, /bag\s*=\s*Object\.keys\(SHAPES\)/);
});

test("core gameplay systems remain", () => {
  for (const symbol of [
    "holdPiece","getGhostY","hardDrop","softDrop","rotateMatrix",
    "clearLines","lockPiece","togglePause","resetGame"
  ]) {
    assert.match(js, new RegExp(`function\\s+${symbol}\\b`));
  }
});

test("score and persistence contract remains", () => {
  assert.match(js, /neon-tetris-best/);
  assert.match(js, /scoreEl/);
  assert.match(js, /linesEl/);
  assert.match(js, /levelEl/);
});

test("line-clear voice contract remains exact", () => {
  for (const phrase of ["Line clear!","Double combo!","Triple combo!","Quattro!"]) {
    assert.ok(js.includes(phrase), `missing voice phrase: ${phrase}`);
  }
  assert.match(js, /speechSynthesis/);
  assert.match(js, /SpeechSynthesisUtterance/);
});

test("effects contract remains", () => {
  for (const symbol of ["screenBump","spawnLineFx","spawnFirework","impact","drawEffects"]) {
    assert.match(js, new RegExp(`function\\s+${symbol}\\b`));
  }
  assert.match(js, /particles/);
  assert.match(js, /shockwaves/);
});

test("audio and melody contract remains", () => {
  for (const symbol of [
    "ensureAudio","sfxMove","sfxRotate","sfxHold","sfxLand",
    "sfxHardDrop","sfxLineClear","sfxGameOver","scheduleMusic","setMuted"
  ]) {
    assert.match(js, new RegExp(`function\\s+${symbol}\\b`));
  }
  assert.match(js, /bpm:\s*118/);
  assert.match(js, /FEVER_LEVELS\[feverTier\]\.bpm/);
  assert.match(js, /const melody = \[/);
  assert.match(js, /neon-tetris-muted/);
  assert.match(js, /AudioContext|webkitAudioContext/);
});

test("sound control stays a persistent toggle", () => {
  assert.match(js, /soundBtn\.addEventListener\(["']click["']/);
  assert.match(js, /const nextMuted = !soundMuted/);
  assert.match(js, /localStorage\.setItem\(["']neon-tetris-muted["']/);
});


test("nickname gate and local ranking remain", () => {
  for (const id of ["playerGate","nicknameInput","startGameBtn","rankBtn","rankModal","rankList","playerName"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  assert.match(js, /neon-tetris-ranking/);
  assert.match(js, /neon-tetris-last-player/);
  assert.match(js, /function\s+recordRanking\b/);
  assert.match(js, /function\s+startWithNickname\b/);
});

test("hard drop streak escalation remains", () => {
  assert.match(html, /id=["']dropStreakFx["']/);
  assert.match(js, /let\s+dropStreak\s*=\s*0/);
  assert.match(js, /function\s+registerHardDrop\b/);
  assert.match(js, /DROP ×/);
  assert.match(js, /streakSafeKeys/);
  assert.match(js, /screenBump\(dropPower \|\| 1\)/);
});


test("FEVER overdrive contract remains", () => {
  for (const id of ["feverPanel","feverLevel","feverMeter","feverFill","feverMultiplier","feverNext"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  assert.match(js, /const\s+FEVER_LEVELS\s*=\s*\[/);
  for (const threshold of ["min: 5","min: 10","min: 20","min: 30"]) assert.ok(js.includes(threshold));
  for (const multiplier of ["multiplier: 1.2","multiplier: 1.5","multiplier: 2","multiplier: 3"]) assert.ok(js.includes(multiplier));
  assert.match(js, /function\s+updateFeverState\b/);
  assert.match(js, /function\s+triggerFeverBurst\b/);
  assert.match(js, /FEVER_LEVELS\[feverTier\]\.bpm/);
  assert.match(js, /FEVER_LEVELS\[feverTier\]\.speed/);
  assert.match(js, /maxDropStreak/);
  assert.match(js, /maxFeverTier/);
});


test("ghost rival replay contract remains", () => {
  for (const id of ["rivalSelect","rivalPanel","rivalName","rivalDelta","myRivalBar","ghostRivalBar","rivalStats"]) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  for (const symbol of ["sanitizeReplay","renderRivalOptions","beginReplayRun","captureReplaySnapshot","getRivalSnapshot","updateRivalHUD"]) {
    assert.match(js, new RegExp(`function\\s+${symbol}\\b`));
  }
  assert.match(js, /MAX_REPLAY_SECONDS\s*=\s*600/);
  assert.match(js, /replayTimeline/);
  assert.match(js, /selectedRival/);
  assert.match(js, /RIVAL DOWN|RIVAL WINS/);
  assert.match(js, /5000/);
});


test("ghost rival mini board contract remains", () => {
  assert.match(html, /id=["']rivalBoardCanvas["']/);
  for (const symbol of ["sanitizeBoardMasks","sanitizeActiveCells","packBoardMasks","packActiveCells","currentStackTopRow","drawRivalBoard"]) {
    assert.match(js, new RegExp(`function\\s+${symbol}\\b`));
  }
  assert.match(js, /board:\s*packBoardMasks\(\)/);
  assert.match(js, /active:\s*packActiveCells\(\)/);
  assert.match(js, /LEGACY REPLAY/);
  assert.match(css, /#rivalBoardCanvas/);
});
