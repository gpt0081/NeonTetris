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
  assert.match(js, /const bpm = 118/);
  assert.match(js, /const melody = \[/);
  assert.match(js, /neon-tetris-muted/);
  assert.match(js, /AudioContext|webkitAudioContext/);
});

test("sound control stays a persistent toggle", () => {
  assert.match(js, /soundBtn\.addEventListener\(["']click["']/);
  assert.match(js, /const nextMuted = !soundMuted/);
  assert.match(js, /localStorage\.setItem\(["']neon-tetris-muted["']/);
});
