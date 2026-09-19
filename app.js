(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const nextCanvas = document.getElementById("nextCanvas");
  const nextCtx = nextCanvas.getContext("2d");
  const holdCanvas = document.getElementById("holdCanvas");
  const holdCtx = holdCanvas.getContext("2d");

  const COLS = 10;
  const ROWS = 20;
  const BLOCK = 30;

  const SHAPES = {
    I: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    J: [[1,0,0],[1,1,1],[0,0,0]],
    L: [[0,0,1],[1,1,1],[0,0,0]],
    O: [[1,1],[1,1]],
    S: [[0,1,1],[1,1,0],[0,0,0]],
    T: [[0,1,0],[1,1,1],[0,0,0]],
    Z: [[1,1,0],[0,1,1],[0,0,0]]
  };

  const COLORS = {
    I: "#55e6ff",
    J: "#6177ff",
    L: "#ffad55",
    O: "#ffe35a",
    S: "#61ef9d",
    T: "#bd74ff",
    Z: "#ff667d"
  };

  const scoreEl = document.getElementById("score");
  const bestEl = document.getElementById("best");
  const linesEl = document.getElementById("lines");
  const levelEl = document.getElementById("level");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlayTitle");
  const overlayKicker = document.getElementById("overlayKicker");
  const overlayBtn = document.getElementById("overlayBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const soundBtn = document.getElementById("soundBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const homeScreen = document.getElementById("homeScreen");
  const homeStartBtn = document.getElementById("homeStartBtn");
  const homeSettingsBtn = document.getElementById("homeSettingsBtn");
  const homeRankBtn = document.getElementById("homeRankBtn");
  const quickMenuModal = document.getElementById("quickMenuModal");
  const closeQuickMenuBtn = document.getElementById("closeQuickMenuBtn");
  const menuHomeBtn = document.getElementById("menuHomeBtn");
  const menuSettingsBtn = document.getElementById("menuSettingsBtn");
  const menuRankBtn = document.getElementById("menuRankBtn");
  const settingsModal = document.getElementById("settingsModal");
  const closeSettingsBtn = document.getElementById("closeSettingsBtn");
  const soundEnabledToggle = document.getElementById("soundEnabledToggle");
  const bgmVolumeDial = document.getElementById("bgmVolumeDial");
  const sfxVolumeDial = document.getElementById("sfxVolumeDial");
  const lineVolumeDial = document.getElementById("lineVolumeDial");
  const bgmVolumeValue = document.getElementById("bgmVolumeValue");
  const sfxVolumeValue = document.getElementById("sfxVolumeValue");
  const lineVolumeValue = document.getElementById("lineVolumeValue");
  const testBgmBtn = document.getElementById("testBgmBtn");
  const testSfxBtn = document.getElementById("testSfxBtn");
  const testLineBtn = document.getElementById("testLineBtn");
  const restartBtn = document.getElementById("restartBtn");
  const boardWrap = canvas.closest(".board-wrap");
  const fxBanner = document.getElementById("fxBanner");
  const dropStreakFx = document.getElementById("dropStreakFx");
  const playerNameEl = document.getElementById("playerName");
  const playerGate = document.getElementById("playerGate");
  const nicknameForm = document.getElementById("nicknameForm");
  const nicknameInput = document.getElementById("nicknameInput");
  const nicknameError = document.getElementById("nicknameError");
  const rankBtn = document.getElementById("rankBtn");
  const rankModal = document.getElementById("rankModal");
  const rankList = document.getElementById("rankList");
  const closeRankBtn = document.getElementById("closeRankBtn");
  const feverPanel = document.getElementById("feverPanel");
  const feverLevelEl = document.getElementById("feverLevel");
  const feverMeter = document.getElementById("feverMeter");
  const feverFill = document.getElementById("feverFill");
  const feverMultiplierEl = document.getElementById("feverMultiplier");
  const feverNextEl = document.getElementById("feverNext");
  const appEl = document.querySelector(".app");
  const rivalSelect = document.getElementById("rivalSelect");
  const rivalPanel = document.getElementById("rivalPanel");
  const rivalNameEl = document.getElementById("rivalName");
  const rivalDeltaEl = document.getElementById("rivalDelta");
  const myRivalBar = document.getElementById("myRivalBar");
  const ghostRivalBar = document.getElementById("ghostRivalBar");
  const myRivalScore = document.getElementById("myRivalScore");
  const ghostRivalScore = document.getElementById("ghostRivalScore");
  const rivalStats = document.getElementById("rivalStats");
  const rivalBoardCanvas = document.getElementById("rivalBoardCanvas");
  const rivalBoardCtx = rivalBoardCanvas.getContext("2d");
  const rivalBoardName = document.getElementById("rivalBoardName");
  const rivalLineFx = document.getElementById("rivalLineFx");
  const rivalComboFx = document.getElementById("rivalComboFx");

  let board;
  let current;
  let next;
  let hold = null;
  let canHold = true;
  let bag = [];
  let score = 0;
  let lines = 0;
  let level = 1;
  let best = Number(localStorage.getItem("neon-tetris-best") || 0);
  let paused = false;
  let gameOver = false;
  let lastTime = 0;
  let dropAccumulator = 0;
  let rafId = 0;
  let particles = [];
  let shockwaves = [];
  let flash = 0;
  let fxTimer = null;
  let dropStreak = 0;
  let dropStreakTimer = null;
  let dropStreakExpiryTimer = null;
  const DROP_STREAK_TIMEOUT_MS = 10000;
  let playerName = "";
  let playerReady = false;
  let rankWasPaused = false;
  let settingsWasPaused = false;
  let quickMenuWasPaused = false;
  let settingsResumeAfterClose = false;
  let rankResumeAfterClose = false;
  let feverTier = 0;
  let feverMultiplier = 1;
  let maxDropStreak = 0;
  let maxFeverTier = 0;
  let replayTimeline = [];
  let replayClock = 0;
  let replaySampleAccumulator = 0;
  let selectedRival = null;
  let rivalLastFever = 0;
  let rivalLastScoreMilestone = 0;
  let rivalLastLines = 0;
  let rivalLastStreak = 0;
  let rivalLineFxTimer = null;
  let rivalComboFxTimer = null;
  const MAX_REPLAY_SECONDS = 600;
  const FEVER_LEVELS = [
    { min: 0,  label: "COOL",      multiplier: 1,   bpm: 118, speed: 1 },
    { min: 5,  label: "HEAT",      multiplier: 1.2, bpm: 126, speed: .94 },
    { min: 10, label: "RUSH",      multiplier: 1.5, bpm: 136, speed: .86 },
    { min: 20, label: "OVERDRIVE", multiplier: 2,   bpm: 148, speed: .76 },
    { min: 30, label: "FEVER MAX", multiplier: 3,   bpm: 164, speed: .64 }
  ];

  let audioCtx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let lineClearGain = null;
  let noiseBuffer = null;
  let musicTimer = null;
  let musicStep = 0;
  let nextMusicTime = 0;
  let soundMuted = localStorage.getItem("neon-tetris-muted") === "1";
  const MASTER_OUTPUT = 1;
  const NORMAL_MUSIC_LEVEL = .42;
  const PAUSED_MUSIC_LEVEL = .10;
  const GAME_OVER_MUSIC_LEVEL = .06;
  const SFX_BASE_LEVEL = .95;
  const LINE_BASE_LEVEL = 1;
  let musicBaseLevel = NORMAL_MUSIC_LEVEL;
  const MAX_AUDIO_LEVEL = 3;
  const readAudioLevel = (key, fallback = 1) => {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) ? Math.max(0, Math.min(MAX_AUDIO_LEVEL, value)) : fallback;
  };
  let bgmVolume = readAudioLevel("neon-tetris-bgm-volume", 1);
  let sfxVolume = readAudioLevel("neon-tetris-sfx-volume", 1);
  let lineVolume = readAudioLevel("neon-tetris-line-volume", 1);

  bestEl.textContent = best.toLocaleString();

  function setDialVisual(input, output, value) {
    const pct = Math.round(Math.max(0, Math.min(MAX_AUDIO_LEVEL, value)) * 100);
    const cycleProgress = pct === 0 ? 0 : (pct % 100 || 100);
    const hue = Math.round((pct / 300) * 300);
    const shell = input.closest(".dial-shell");
    input.value = String(pct);
    shell.style.setProperty("--dial-angle", `${cycleProgress * 3.6}deg`);
    shell.style.setProperty("--dial-rotation", `${pct * 3.6}deg`);
    shell.style.setProperty("--dial-color", `hsl(${hue} 95% 64%)`);
    output.textContent = `${pct}%`;
  }

  function attachRotaryDial(input) {
    const shell = input.closest(".dial-shell");
    let activePointer = null;
    let lastAngle = 0;
    let liveValue = Number(input.value) || 0;
    const angleAt = (event) => {
      const rect = shell.getBoundingClientRect();
      return Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2)) * 180 / Math.PI;
    };
    shell.addEventListener("pointerdown", (event) => {
      activePointer = event.pointerId;
      liveValue = Number(input.value) || 0;
      lastAngle = angleAt(event);
      shell.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    shell.addEventListener("pointermove", (event) => {
      if (event.pointerId !== activePointer) return;
      const angle = angleAt(event);
      let delta = angle - lastAngle;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      liveValue = Math.max(0, Math.min(300, liveValue + delta / 3.6));
      input.value = String(Math.round(liveValue));
      input.dispatchEvent(new Event("input", { bubbles: true }));
      lastAngle = angle;
    });
    const finish = (event) => {
      if (event.pointerId !== activePointer) return;
      activePointer = null;
      try { shell.releasePointerCapture(event.pointerId); } catch (_) {}
    };
    shell.addEventListener("pointerup", finish);
    shell.addEventListener("pointercancel", finish);
    input.addEventListener("change", () => { liveValue = Number(input.value) || 0; });
  }

  function syncAudioSettingsUI() {
    soundEnabledToggle.checked = !soundMuted;
    setDialVisual(bgmVolumeDial, bgmVolumeValue, bgmVolume);
    setDialVisual(sfxVolumeDial, sfxVolumeValue, sfxVolume);
    setDialVisual(lineVolumeDial, lineVolumeValue, lineVolume);
  }

  function normalizeNickname(value) {
    return String(value || "").trim().replace(/\s+/g, " ").slice(0, 12);
  }

  function sanitizeBoardMasks(value) {
    if (!Array.isArray(value) || value.length !== ROWS) return [];
    return value.map(mask => Math.max(0, Math.min(1023, Number(mask) | 0)));
  }

  function sanitizeActiveCells(value) {
    if (!Array.isArray(value)) return [];
    return value
      .map(cell => Number(cell) | 0)
      .filter(cell => cell >= 0 && cell < ROWS * COLS)
      .slice(0, 4);
  }

  function sanitizeReplay(value) {
    if (!Array.isArray(value)) return [];
    return value.slice(0, MAX_REPLAY_SECONDS + 1).map((snap, index) => ({
      t: Math.max(0, Math.min(MAX_REPLAY_SECONDS, Number(snap?.t) || index)),
      score: Math.max(0, Number(snap?.score) || 0),
      lines: Math.max(0, Number(snap?.lines) || 0),
      level: Math.max(1, Number(snap?.level) || 1),
      fever: Math.max(0, Math.min(4, Number(snap?.fever) || 0)),
      streak: Math.max(0, Number(snap?.streak) || 0),
      board: sanitizeBoardMasks(snap?.board),
      active: sanitizeActiveCells(snap?.active)
    })).sort((a, b) => a.t - b.t);
  }

  function loadLeaderboard() {
    try {
      const parsed = JSON.parse(localStorage.getItem("neon-tetris-ranking") || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(row => row && typeof row.name === "string" && Number.isFinite(Number(row.score)))
        .map(row => ({ name: normalizeNickname(row.name), score: Math.max(0, Number(row.score) || 0), lines: Math.max(0, Number(row.lines) || 0), level: Math.max(1, Number(row.level) || 1), maxStreak: Math.max(0, Number(row.maxStreak) || 0), maxFeverTier: Math.max(0, Math.min(4, Number(row.maxFeverTier) || 0)), replay: sanitizeReplay(row.replay), duration: Math.max(0, Number(row.duration) || 0) }))
        .filter(row => row.name)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);
    } catch (_) {
      return [];
    }
  }

  function renderLeaderboard() {
    const rows = loadLeaderboard();
    rankList.replaceChildren();
    if (!rows.length) {
      const li = document.createElement("li");
      li.className = "empty-rank";
      li.textContent = "아직 기록이 없습니다.";
      rankList.appendChild(li);
      return;
    }
    rows.slice(0, 10).forEach(row => {
      const li = document.createElement("li");
      const name = document.createElement("span");
      const value = document.createElement("strong");
      name.className = "rank-name";
      value.className = "rank-score";
      name.textContent = row.name;
      value.textContent = row.score.toLocaleString() + ` · F${row.maxFeverTier} · ×${row.maxStreak}${row.replay.length ? " · 👻" : ""}`;
      li.append(name, value);
      rankList.appendChild(li);
    });
  }

  function renderRivalOptions() {
    const rows = loadLeaderboard();
    const previous = rivalSelect.value;
    rivalSelect.replaceChildren();
    const none = document.createElement("option");
    none.value = "";
    none.textContent = "NO RIVAL";
    rivalSelect.appendChild(none);
    rows.forEach((row, index) => {
      if (row.replay.length < 2) return;
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `${row.name} · ${row.score.toLocaleString()} PTS`;
      rivalSelect.appendChild(option);
    });
    if ([...rivalSelect.options].some(option => option.value === previous)) rivalSelect.value = previous;
  }

  function recordRanking() {
    if (!playerName) return;
    const rows = loadLeaderboard();
    const key = playerName.toLocaleLowerCase();
    const existing = rows.find(row => row.name.toLocaleLowerCase() === key);
    if (existing) {
      if (score > existing.score) {
        existing.score = score;
        existing.lines = lines;
        existing.level = level;
        existing.replay = replayTimeline.slice(0, MAX_REPLAY_SECONDS + 1);
        existing.duration = Math.round(replayClock);
      }
      existing.maxStreak = Math.max(existing.maxStreak || 0, maxDropStreak);
      existing.maxFeverTier = Math.max(existing.maxFeverTier || 0, maxFeverTier);
    } else {
      rows.push({ name: playerName, score, lines, level, maxStreak: maxDropStreak, maxFeverTier, replay: replayTimeline.slice(0, MAX_REPLAY_SECONDS + 1), duration: Math.round(replayClock) });
    }
    rows.sort((a, b) => b.score - a.score);
    localStorage.setItem("neon-tetris-ranking", JSON.stringify(rows.slice(0, 20)));
    renderLeaderboard();
    renderRivalOptions();
  }

  function packBoardMasks() {
    return board.map(row => row.reduce((mask, cell, x) => cell ? mask | (1 << x) : mask, 0));
  }

  function packActiveCells() {
    if (!current) return [];
    const cells = [];
    current.shape.forEach((row, y) => row.forEach((value, x) => {
      if (!value) return;
      const bx = current.x + x;
      const by = current.y + y;
      if (bx >= 0 && bx < COLS && by >= 0 && by < ROWS) cells.push(by * COLS + bx);
    }));
    return cells.slice(0, 4);
  }

  function currentStackTopRow() {
    for (let y = 0; y < ROWS; y++) {
      if (board[y].some(Boolean)) return y;
    }
    return ROWS;
  }

  function snapshotState(t = Math.floor(replayClock / 1000)) {
    return { t, score, lines, level, fever: feverTier, streak: dropStreak, board: packBoardMasks(), active: packActiveCells() };
  }

  function beginReplayRun() {
    replayClock = 0;
    replaySampleAccumulator = 0;
    replayTimeline = [snapshotState(0)];
    rivalLastFever = 0;
    rivalLastScoreMilestone = 0;
    rivalLastLines = 0;
    rivalLastStreak = 0;
    updateRivalHUD(false);
  }

  function captureReplaySnapshot(force = false) {
    const second = Math.min(MAX_REPLAY_SECONDS, Math.floor(replayClock / 1000));
    if (second > MAX_REPLAY_SECONDS) return;
    const snap = snapshotState(second);
    const last = replayTimeline[replayTimeline.length - 1];
    if (last && last.t === second) replayTimeline[replayTimeline.length - 1] = snap;
    else if (replayTimeline.length < MAX_REPLAY_SECONDS + 1) replayTimeline.push(snap);
    if (force && second < MAX_REPLAY_SECONDS && (!last || last.t !== second)) replayTimeline.push(snap);
    updateRivalHUD(true);
  }

  function getRivalSnapshot(seconds = Math.floor(replayClock / 1000)) {
    if (!selectedRival || !selectedRival.replay.length) return null;
    let chosen = selectedRival.replay[0];
    for (const snap of selectedRival.replay) {
      if (snap.t > seconds) break;
      chosen = snap;
    }
    return chosen;
  }

  function drawRivalBoard(snapshot) {
    const context = rivalBoardCtx;
    const w = rivalBoardCanvas.width;
    const h = rivalBoardCanvas.height;
    const cellW = w / COLS;
    const cellH = h / ROWS;
    context.clearRect(0, 0, w, h);
    context.fillStyle = "#050913";
    context.fillRect(0, 0, w, h);

    context.strokeStyle = "rgba(165,178,255,.06)";
    context.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      context.beginPath();
      context.moveTo(x * cellW + .5, 0);
      context.lineTo(x * cellW + .5, h);
      context.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      context.beginPath();
      context.moveTo(0, y * cellH + .5);
      context.lineTo(w, y * cellH + .5);
      context.stroke();
    }

    if (!snapshot || !snapshot.board?.length) {
      context.fillStyle = "rgba(178,190,218,.42)";
      context.font = "7px ui-monospace, monospace";
      context.textAlign = "center";
      context.fillText("LEGACY REPLAY", w / 2, h / 2 - 3);
      context.fillText("NO BOARD DATA", w / 2, h / 2 + 8);
      return;
    }

    snapshot.board.forEach((mask, y) => {
      for (let x = 0; x < COLS; x++) {
        if (!(mask & (1 << x))) continue;
        const glow = Math.max(0, Math.min(1, snapshot.fever / 4));
        context.fillStyle = `rgba(${132 + Math.round(glow * 28)},${124 + Math.round(glow * 30)},255,${.34 + glow * .16})`;
        context.fillRect(x * cellW + 1, y * cellH + 1, Math.max(1, cellW - 2), Math.max(1, cellH - 2));
      }
    });

    snapshot.active.forEach(cell => {
      const x = cell % COLS;
      const y = Math.floor(cell / COLS);
      context.fillStyle = "#72ffe7";
      context.shadowColor = "#72ffe7";
      context.shadowBlur = 5;
      context.fillRect(x * cellW + .7, y * cellH + .7, Math.max(1, cellW - 1.4), Math.max(1, cellH - 1.4));
      context.shadowBlur = 0;
    });

    const myTop = currentStackTopRow();
    const lineY = Math.min(h - .5, Math.max(.5, myTop * cellH));
    context.strokeStyle = "rgba(255,229,106,.88)";
    context.lineWidth = 1.4;
    context.setLineDash([3, 2]);
    context.beginPath();
    context.moveTo(0, lineY);
    context.lineTo(w, lineY);
    context.stroke();
    context.setLineDash([]);
  }

  function showRivalCombo(streak) {
    if (streak <= 0) return;
    rivalComboFx.textContent = `COMBO ×${streak}`;
    rivalComboFx.classList.remove("active");
    void rivalComboFx.offsetWidth;
    rivalComboFx.classList.add("active");
    clearTimeout(rivalComboFxTimer);
    rivalComboFxTimer = window.setTimeout(() => rivalComboFx.classList.remove("active"), 740);
  }

  function showRivalLineClear(count) {
    const tier = Math.min(4, Math.max(1, count));
    const labels = ["", "LINE CLEAR!", "DOUBLE COMBO!", "TRIPLE COMBO!", "QUATTRO!"];
    rivalLineFx.textContent = labels[tier];
    rivalLineFx.classList.remove("active");
    void rivalLineFx.offsetWidth;
    rivalLineFx.classList.add("active");
    clearTimeout(rivalLineFxTimer);
    rivalLineFxTimer = window.setTimeout(() => rivalLineFx.classList.remove("active"), 820);
  }

  function flashRivalPressure(text, tier = 1) {
    dropStreakFx.textContent = text;
    dropStreakFx.dataset.tier = String(Math.max(1, Math.min(4, tier)));
    dropStreakFx.classList.remove("active");
    void dropStreakFx.offsetWidth;
    dropStreakFx.classList.add("active");
    clearTimeout(dropStreakTimer);
    dropStreakTimer = window.setTimeout(() => dropStreakFx.classList.remove("active"), 760);
    if (audioCtx && !soundMuted) {
      const t = audioCtx.currentTime;
      tone(240 + tier * 80, .08, "square", .025, t, 180 + tier * 70);
    }
  }

  function updateRivalHUD(announce = false) {
    if (!selectedRival) {
      rivalPanel.classList.add("hidden");
      rivalBoardName.textContent = "NONE";
      rivalLineFx.classList.remove("active");
      rivalComboFx.classList.remove("active");
      rivalBoardCtx.clearRect(0, 0, rivalBoardCanvas.width, rivalBoardCanvas.height);
      return;
    }
    const rival = getRivalSnapshot();
    if (!rival) return;
    rivalPanel.classList.remove("hidden");
    rivalNameEl.textContent = selectedRival.name;
    rivalBoardName.textContent = selectedRival.name;
    const delta = score - rival.score;
    rivalDeltaEl.classList.toggle("ahead", delta > 0);
    rivalDeltaEl.classList.toggle("behind", delta < 0);
    rivalDeltaEl.textContent = delta > 0 ? `+${delta.toLocaleString()} LEAD` : delta < 0 ? `-${Math.abs(delta).toLocaleString()} BEHIND` : "EVEN";
    const target = Math.max(1, selectedRival.score, score);
    myRivalBar.style.width = `${Math.min(100, score / target * 100)}%`;
    ghostRivalBar.style.width = `${Math.min(100, rival.score / target * 100)}%`;
    myRivalScore.textContent = score.toLocaleString();
    ghostRivalScore.textContent = rival.score.toLocaleString();
    rivalStats.textContent = `${rival.lines}L · F${rival.fever} · ×${rival.streak}`;
    drawRivalBoard(rival);

    if (!announce) {
      rivalLastFever = rival.fever;
      rivalLastScoreMilestone = Math.floor(rival.score / 5000);
      rivalLastLines = rival.lines;
      rivalLastStreak = rival.streak;
      return;
    }
    if (rival.lines > rivalLastLines) {
      showRivalLineClear(rival.lines - rivalLastLines);
      rivalLastLines = rival.lines;
    }
    if (rival.streak > rivalLastStreak) {
      showRivalCombo(rival.streak);
    }
    rivalLastStreak = rival.streak;
    if (rival.fever > rivalLastFever) {
      rivalLastFever = rival.fever;
      flashRivalPressure(`RIVAL ${FEVER_LEVELS[rival.fever]?.label || "FEVER"}!`, rival.fever);
    }
    const milestone = Math.floor(rival.score / 5000);
    if (milestone > rivalLastScoreMilestone && milestone > 0) {
      rivalLastScoreMilestone = milestone;
      flashRivalPressure(`RIVAL ${milestone * 5}K!`, Math.max(1, rival.fever));
    }
  }

  function showHomeScreen() {
    paused = true;
    hideOverlay();
    playerGate.classList.add("hidden");
    quickMenuModal.classList.add("hidden");
    settingsModal.classList.add("hidden");
    rankModal.classList.add("hidden");
    homeScreen.classList.remove("hidden");
    setMusicLevel(PAUSED_MUSIC_LEVEL);
  }

  function hideHomeScreen() {
    homeScreen.classList.add("hidden");
  }

  function showQuickMenu() {
    quickMenuWasPaused = paused;
    paused = true;
    setMusicLevel(PAUSED_MUSIC_LEVEL);
    quickMenuModal.classList.remove("hidden");
  }

  function hideQuickMenu(resume = true) {
    quickMenuModal.classList.add("hidden");
    if (resume && playerReady && !gameOver && !quickMenuWasPaused) {
      paused = false;
      setMusicLevel(NORMAL_MUSIC_LEVEL);
      lastTime = performance.now();
    }
  }

  function showPlayerGate() {
    paused = true;
    homeScreen.classList.add("hidden");
    playerGate.classList.remove("hidden");
    nicknameInput.value = localStorage.getItem("neon-tetris-last-player") || "";
    nicknameError.textContent = "";
    renderRivalOptions();
    window.setTimeout(() => nicknameInput.focus(), 40);
  }

  function startWithNickname() {
    const value = normalizeNickname(nicknameInput.value);
    if (!value) {
      nicknameError.textContent = "닉네임을 입력하세요.";
      nicknameInput.focus();
      return false;
    }
    playerName = value;
    playerReady = true;
    playerNameEl.textContent = value;
    const rivals = loadLeaderboard();
    const rivalIndex = rivalSelect.value === "" ? -1 : Number(rivalSelect.value);
    selectedRival = Number.isInteger(rivalIndex) && rivalIndex >= 0 && rivals[rivalIndex]?.replay?.length >= 2 ? rivals[rivalIndex] : null;
    localStorage.setItem("neon-tetris-last-player", value);
    playerGate.classList.add("hidden");
    homeScreen.classList.add("hidden");
    paused = false;
    setMusicLevel(NORMAL_MUSIC_LEVEL);
    lastTime = performance.now();
    resetDropStreak();
    beginReplayRun();
    return true;
  }

  function showSettingsModal(resumeAfterClose = false) {
    settingsWasPaused = paused;
    settingsResumeAfterClose = resumeAfterClose;
    if (!gameOver) {
      paused = true;
      setMusicLevel(PAUSED_MUSIC_LEVEL);
    }
    syncAudioSettingsUI();
    settingsModal.classList.remove("hidden");
  }

  function hideSettingsModal() {
    settingsModal.classList.add("hidden");
    if (!gameOver && playerReady && settingsResumeAfterClose) {
      paused = false;
      setMusicLevel(NORMAL_MUSIC_LEVEL);
      lastTime = performance.now();
    }
  }

  function showRankModal(resumeAfterClose = !paused && playerReady) {
    renderLeaderboard();
    rankWasPaused = paused;
    rankResumeAfterClose = resumeAfterClose;
    if (!gameOver) {
      paused = true;
      setMusicLevel(PAUSED_MUSIC_LEVEL);
    }
    rankModal.classList.remove("hidden");
  }

  function hideRankModal() {
    rankModal.classList.add("hidden");
    if (!gameOver && playerReady && rankResumeAfterClose) {
      paused = false;
      setMusicLevel(NORMAL_MUSIC_LEVEL);
      lastTime = performance.now();
    }
  }

  function getFeverTier(streak = dropStreak) {
    if (streak >= 30) return 4;
    if (streak >= 20) return 3;
    if (streak >= 10) return 2;
    if (streak >= 5) return 1;
    return 0;
  }

  function feverProgress(streak = dropStreak) {
    const tier = getFeverTier(streak);
    if (tier >= 4) return 100;
    const start = FEVER_LEVELS[tier].min;
    const end = FEVER_LEVELS[tier + 1].min;
    return Math.max(0, Math.min(100, ((streak - start) / (end - start)) * 100));
  }

  function sfxFeverUp(tier) {
    if (!audioCtx || tier <= 0) return;
    const t = audioCtx.currentTime;
    const root = [0, 440, 523.25, 659.25, 783.99][tier];
    tone(root, .13, "square", .045 + tier * .008, t, root * 1.24);
    tone(root * 1.5, .16, "triangle", .032 + tier * .007, t + .055, root * 2);
    if (tier >= 3) noise(.08, .04 + tier * .008, 4200, t);
  }

  function updateFeverState(announce = false) {
    const previous = feverTier;
    feverTier = getFeverTier();
    feverMultiplier = FEVER_LEVELS[feverTier].multiplier;
    maxFeverTier = Math.max(maxFeverTier, feverTier);
    const cfg = FEVER_LEVELS[feverTier];
    const progress = feverProgress();

    feverPanel.dataset.tier = String(feverTier);
    appEl.dataset.fever = String(feverTier);
    boardWrap.dataset.fever = String(feverTier);
    feverLevelEl.textContent = cfg.label;
    feverMultiplierEl.textContent = `×${cfg.multiplier.toFixed(1)}`;
    feverFill.style.width = `${progress}%`;
    feverMeter.setAttribute("aria-valuenow", String(Math.round(progress)));
    feverNextEl.textContent = feverTier >= 4 ? "MAXIMUM" : `${FEVER_LEVELS[feverTier + 1].min - dropStreak} DROPS`;

    if (announce && feverTier > previous) {
      sfxFeverUp(feverTier);
      dropStreakFx.textContent = feverTier === 4 ? "FEVER MAX!" : cfg.label + "!";
      dropStreakFx.dataset.tier = String(feverTier);
      dropStreakFx.classList.remove("active");
      void dropStreakFx.offsetWidth;
      dropStreakFx.classList.add("active");
      flash = Math.max(flash, .32 + feverTier * .18);
    }
  }

  function triggerFeverBurst() {
    if (feverTier < 4 || dropStreak % 5 !== 0) return;
    const bonus = 500 * level;
    score += Math.round(bonus * feverMultiplier);
    const palette = ["#ffffff", "#5ffff1", "#ff4fd8", "#ffe56a", "#7b7cff"];
    spawnFirework(canvas.width * .5, canvas.height * .45, 4.4, palette);
    spawnFirework(canvas.width * .28, canvas.height * .58, 3.6, palette, 55);
    spawnFirework(canvas.width * .72, canvas.height * .58, 3.6, palette, 90);
    dropStreakFx.textContent = `FEVER BURST +${Math.round(bonus * feverMultiplier).toLocaleString()}`;
    dropStreakFx.dataset.tier = "4";
    dropStreakFx.classList.remove("active");
    void dropStreakFx.offsetWidth;
    dropStreakFx.classList.add("active");
    impact(4.4);
    updateHUD();
  }

  function addScore(base) {
    score += Math.round(base * feverMultiplier);
  }

  function resetDropStreak() {
    dropStreak = 0;
    clearTimeout(dropStreakTimer);
    clearTimeout(dropStreakExpiryTimer);
    dropStreakExpiryTimer = null;
    dropStreakFx.classList.remove("active");
    updateFeverState(false);
  }

  function armDropStreakExpiry() {
    clearTimeout(dropStreakExpiryTimer);
    dropStreakExpiryTimer = window.setTimeout(() => {
      if (dropStreak > 0) resetDropStreak();
    }, DROP_STREAK_TIMEOUT_MS);
  }

  function registerHardDrop() {
    dropStreak += 1;
    maxDropStreak = Math.max(maxDropStreak, dropStreak);
    const previousTier = feverTier;
    updateFeverState(true);
    const visualTier = Math.max(1, feverTier);
    if (feverTier === previousTier) {
      dropStreakFx.textContent = `DROP ×${dropStreak}`;
      dropStreakFx.dataset.tier = String(visualTier);
      dropStreakFx.classList.remove("active");
      void dropStreakFx.offsetWidth;
      dropStreakFx.classList.add("active");
    }
    clearTimeout(dropStreakTimer);
    dropStreakTimer = window.setTimeout(() => dropStreakFx.classList.remove("active"), 760);
    armDropStreakExpiry();
    return dropStreak;
  }

  async function ensureAudio(playConfirmation = false) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      if (soundBtn) {
        soundBtn.textContent = "✕";
        soundBtn.setAttribute("aria-label", "이 브라우저는 Web Audio를 지원하지 않음");
      }
      return false;
    }

    if (!audioCtx) {
      audioCtx = new AudioContext();
      masterGain = audioCtx.createGain();
      musicGain = audioCtx.createGain();
      sfxGain = audioCtx.createGain();
      lineClearGain = audioCtx.createGain();
      const compressor = audioCtx.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.knee.value = 18;
      compressor.ratio.value = 5;
      compressor.attack.value = .004;
      compressor.release.value = .18;
      masterGain.gain.value = MASTER_OUTPUT;
      musicGain.gain.value = musicBaseLevel * bgmVolume;
      sfxGain.gain.value = SFX_BASE_LEVEL * sfxVolume;
      lineClearGain.gain.value = LINE_BASE_LEVEL * lineVolume;
      musicGain.connect(masterGain);
      sfxGain.connect(masterGain);
      lineClearGain.connect(masterGain);
      masterGain.connect(compressor);
      compressor.connect(audioCtx.destination);

      noiseBuffer = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * .35), audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }

    try {
      if (audioCtx.state !== "running") await audioCtx.resume();
    } catch (_) {}

    if (audioCtx.state !== "running") {
      if (soundBtn) {
        soundBtn.textContent = "🔇";
        soundBtn.setAttribute("aria-label", "탭해서 사운드 켜기");
      }
      return false;
    }

    if (!musicTimer) {
      nextMusicTime = audioCtx.currentTime + .06;
      musicStep = 0;
      musicTimer = window.setInterval(scheduleMusic, 90);
      scheduleMusic();
    }

    if (masterGain) {
      const now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(soundMuted ? .0001 : MASTER_OUTPUT, now, .025);
    }

    if (soundBtn) {
      soundBtn.textContent = soundMuted ? "🔇" : "🔊";
      soundBtn.setAttribute("aria-label", soundMuted ? "사운드 꺼짐, 탭해서 켜기" : "사운드 켜짐, 탭해서 끄기");
    }

    if (playConfirmation && !soundMuted) {
      const t = audioCtx.currentTime + .01;
      tone(660, .08, "sine", .06, t, 880);
      tone(990, .11, "triangle", .04, t + .055, 1180);
    }
    return true;
  }

  function setMusicLevel(value, ramp = .18) {
    musicBaseLevel = value;
    if (!audioCtx || !musicGain) return;
    const now = audioCtx.currentTime;
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setTargetAtTime(value * bgmVolume, now, ramp);
  }

  function applyAudioMix() {
    syncAudioSettingsUI();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    if (musicGain) {
      musicGain.gain.cancelScheduledValues(now);
      musicGain.gain.setTargetAtTime(musicBaseLevel * bgmVolume, now, .035);
    }
    if (sfxGain) {
      sfxGain.gain.cancelScheduledValues(now);
      sfxGain.gain.setTargetAtTime(SFX_BASE_LEVEL * sfxVolume, now, .035);
    }
    if (lineClearGain) {
      lineClearGain.gain.cancelScheduledValues(now);
      lineClearGain.gain.setTargetAtTime(LINE_BASE_LEVEL * lineVolume, now, .035);
    }
  }

  function saveAudioLevel(kind, value) {
    const normalized = Math.max(0, Math.min(MAX_AUDIO_LEVEL, Number(value) || 0));
    if (kind === "bgm") {
      bgmVolume = normalized;
      localStorage.setItem("neon-tetris-bgm-volume", String(normalized));
    } else if (kind === "sfx") {
      sfxVolume = normalized;
      localStorage.setItem("neon-tetris-sfx-volume", String(normalized));
    } else {
      lineVolume = normalized;
      localStorage.setItem("neon-tetris-line-volume", String(normalized));
    }
    applyAudioMix();
  }

  function playBgmTestTone() {
    if (!audioCtx || !masterGain || soundMuted) return;
    const testGain = audioCtx.createGain();
    const now = audioCtx.currentTime;
    testGain.gain.setValueAtTime(Math.max(.0001, NORMAL_MUSIC_LEVEL * bgmVolume), now);
    testGain.connect(masterGain);
    tone(440, .52, "sine", .22, now + .015, 442, testGain);
    window.setTimeout(() => {
      try { testGain.disconnect(); } catch (_) {}
    }, 700);
  }

  function setMuted(value) {
    soundMuted = value;
    localStorage.setItem("neon-tetris-muted", value ? "1" : "0");
    if (audioCtx && masterGain) {
      const now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(value ? .0001 : MASTER_OUTPUT, now, .03);
    }
    if (soundBtn) {
      soundBtn.textContent = value ? "🔇" : "🔊";
      soundBtn.setAttribute("aria-label", value ? "사운드 꺼짐, 탭해서 켜기" : "사운드 켜짐, 탭해서 끄기");
    }
    if (soundEnabledToggle) soundEnabledToggle.checked = !value;
  }

  function tone(freq, duration, type = "sine", volume = .08, when = null, endFreq = null, target = null) {
    if (!audioCtx) return;
    const t = when ?? audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), t);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), t + duration);
    gain.gain.setValueAtTime(.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001, volume), t + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
    osc.connect(gain);
    gain.connect(target || sfxGain);
    osc.start(t);
    osc.stop(t + duration + .03);
  }

  function noise(duration = .08, volume = .06, cutoff = 1800, when = null, target = null) {
    if (!audioCtx || !noiseBuffer) return;
    const t = when ?? audioCtx.currentTime;
    const src = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    src.buffer = noiseBuffer;
    filter.type = "lowpass";
    filter.frequency.value = cutoff;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(target || sfxGain);
    src.start(t);
    src.stop(t + duration + .02);
  }

  function sfxMove() {
    tone(360, .025, "square", .018, null, 300);
  }

  function sfxRotate() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    tone(430, .055, "square", .045, t, 720);
    tone(860, .04, "triangle", .018, t + .025, 1020);
  }

  function sfxHold() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    tone(280, .08, "triangle", .045, t, 420);
    tone(560, .09, "sine", .035, t + .045, 720);
  }

  function sfxLand() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    tone(105, .11, "sine", .11, t, 48);
    tone(210, .065, "triangle", .032, t, 82);
    noise(.055, .045, 720, t);
  }

  function sfxHardDrop() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    tone(150, .13, "sawtooth", .07, t, 42);
    noise(.09, .07, 1100, t);
  }

  function sfxLineClear(count) {
    if (!audioCtx) return;
    const tier = Math.min(4, Math.max(1, count));
    const roots = [0, 523.25, 587.33, 659.25, 783.99];
    const root = roots[tier];
    const t = audioCtx.currentTime;
    const notes = tier === 1 ? [1, 1.25, 1.5] : tier === 2 ? [1, 1.25, 1.5, 2] : tier === 3 ? [1, 1.2, 1.5, 1.8, 2.25] : [1, 1.25, 1.5, 2, 2.5, 3];
    notes.forEach((ratio, i) => tone(root * ratio, .16 + tier * .025, i % 2 ? "triangle" : "square", .035 + tier * .008, t + i * .035, root * ratio * 1.035, lineClearGain));
    tone(80 + tier * 12, .18, "sine", .085 + tier * .015, t, 42, lineClearGain);
    noise(.11 + tier * .02, .045 + tier * .012, 2600 + tier * 500, t, lineClearGain);
  }

  function sfxGameOver() {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    [329.63, 293.66, 246.94, 196].forEach((f, i) => tone(f, .24, "triangle", .05, t + i * .13, f * .72));
  }

  function scheduleMusic() {
    if (!audioCtx || !musicGain || audioCtx.state === "closed") return;
    const bpm = FEVER_LEVELS[feverTier].bpm;
    const stepDur = 60 / bpm / 4;
    const bass = [55,0,82.41,0,65.41,0,73.42,0,55,0,98,0,65.41,0,82.41,0];
    const melody = [
      440,0,523.25,659.25, 0,783.99,659.25,523.25,
      587.33,0,659.25,523.25, 440,0,392,523.25,
      440,0,523.25,659.25, 880,783.99,659.25,0,
      698.46,659.25,587.33,523.25, 494,0,440,0
    ];
    const harmonyRoots = [220, 196, 174.61, 196];

    while (nextMusicTime < audioCtx.currentTime + .42) {
      const step16 = musicStep % 16;
      const step32 = musicStep % 32;
      const f = bass[step16];

      if (!paused && !gameOver) {
        if (f) {
          tone(f, stepDur * 1.6, "sawtooth", .038, nextMusicTime, f * .988, musicGain);
          tone(f * 2, stepDur * .8, "triangle", .018, nextMusicTime, f * 1.99, musicGain);
        }

        const lead = melody[step32];
        if (lead) {
          tone(lead, stepDur * 1.55, "square", .038, nextMusicTime, lead * .997, musicGain);
          tone(lead * 2, stepDur * .7, "triangle", .016, nextMusicTime + .008, lead * 1.995, musicGain);
          if (step32 % 8 === 6 || step32 % 8 === 7) {
            tone(lead * .5, stepDur * 1.2, "sine", .012, nextMusicTime + stepDur * .45, lead * .498, musicGain);
          }
        }

        if (step16 % 4 === 0) {
          tone(52, .095, "sine", .06, nextMusicTime, 38, musicGain);
        }

        if (step16 % 2 === 1 && noiseBuffer) {
          const src = audioCtx.createBufferSource();
          const hp = audioCtx.createBiquadFilter();
          const g = audioCtx.createGain();
          src.buffer = noiseBuffer;
          hp.type = "highpass";
          hp.frequency.value = 5000;
          g.gain.setValueAtTime(.014, nextMusicTime);
          g.gain.exponentialRampToValueAtTime(.0001, nextMusicTime + .038);
          src.connect(hp);
          hp.connect(g);
          g.connect(musicGain);
          src.start(nextMusicTime);
          src.stop(nextMusicTime + .045);
        }

        if (step16 === 0 || step16 === 8) {
          const bar = Math.floor(musicStep / 16) % harmonyRoots.length;
          const root = harmonyRoots[bar];
          [1, 1.2, 1.5].forEach((ratio, i) => {
            tone(root * ratio, stepDur * 7, "sine", .012, nextMusicTime + i * .018, root * ratio * .999, musicGain);
          });
        }
      }

      musicStep++;
      nextMusicTime += stepDur;
    }
  }

  function makeBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function refillBag() {
    bag = Object.keys(SHAPES);
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
  }

  function takeFromBag() {
    if (!bag.length) refillBag();
    return bag.pop();
  }

  function cloneShape(shape) {
    return shape.map(row => row.slice());
  }

  function makePiece(type = takeFromBag()) {
    const shape = cloneShape(SHAPES[type]);
    return {
      type,
      shape,
      x: Math.floor((COLS - shape[0].length) / 2),
      y: -topPadding(shape)
    };
  }

  function topPadding(shape) {
    let n = 0;
    for (const row of shape) {
      if (row.some(Boolean)) break;
      n++;
    }
    return n;
  }

  function collides(piece, dx = 0, dy = 0, testShape = piece.shape) {
    for (let y = 0; y < testShape.length; y++) {
      for (let x = 0; x < testShape[y].length; x++) {
        if (!testShape[y][x]) continue;
        const bx = piece.x + x + dx;
        const by = piece.y + y + dy;
        if (bx < 0 || bx >= COLS || by >= ROWS) return true;
        if (by >= 0 && board[by][bx]) return true;
      }
    }
    return false;
  }

  function merge() {
    current.shape.forEach((row, y) => row.forEach((value, x) => {
      if (!value) return;
      const by = current.y + y;
      if (by >= 0) board[by][current.x + x] = current.type;
    }));
  }

  function rotateMatrix(shape, dir = 1) {
    const n = shape.length;
    const out = Array.from({ length: n }, () => Array(n).fill(0));
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (dir > 0) out[x][n - 1 - y] = shape[y][x];
        else out[n - 1 - x][y] = shape[y][x];
      }
    }
    return out;
  }

  function rotate(dir = 1) {
    if (paused || gameOver) return;
    const rotated = rotateMatrix(current.shape, dir);
    for (const kick of [0, -1, 1, -2, 2]) {
      if (!collides(current, kick, 0, rotated)) {
        current.x += kick;
        current.shape = rotated;
        sfxRotate();
        return;
      }
    }
  }

  function move(dx) {
    if (paused || gameOver) return;
    if (!collides(current, dx, 0)) {
      current.x += dx;
      sfxMove();
    }
  }

  function softDrop(manual = true) {
    if (paused || gameOver) return false;
    if (!collides(current, 0, 1)) {
      current.y++;
      if (manual) {
        addScore(1);
        updateHUD();
      }
      return true;
    }
    lockPiece(0);
    return false;
  }

  function hardDrop() {
    if (paused || gameOver) return;
    const chain = registerHardDrop();
    let distance = 0;
    while (!collides(current, 0, 1)) {
      current.y++;
      distance++;
    }
    addScore(distance * 2);
    sfxHardDrop();
    lockPiece(chain);
    triggerFeverBurst();
  }

  function retriggerClass(name, ms) {
    boardWrap.classList.remove("slam", "mega-slam", "line-burst");
    void boardWrap.offsetWidth;
    boardWrap.classList.add(name);
    window.setTimeout(() => boardWrap.classList.remove(name), ms);
  }

  function screenBump(strength = 1) {
    const app = document.querySelector(".app");
    const power = Math.max(1, strength);
    const amp = Math.min(24, 4 + power * 2.15);
    const duration = Math.min(360, 160 + power * 20);
    app.getAnimations().forEach(anim => {
      if (anim.effect && anim.effect.target === app) anim.cancel();
    });
    app.animate([
      { transform: "translate3d(0,0,0) scale(1)" },
      { transform: `translate3d(0,${amp}px,0) scale(${1 + Math.min(.018, power * .0018)},${1 - Math.min(.016, power * .0016)})`, offset: .18 },
      { transform: `translate3d(${-amp * .48}px,${-amp * .34}px,0) rotate(${-Math.min(1.1, power * .09)}deg)`, offset: .4 },
      { transform: `translate3d(${amp * .34}px,${amp * .12}px,0) rotate(${Math.min(.8, power * .065)}deg)`, offset: .62 },
      { transform: "translate3d(0,0,0) scale(1)" }
    ], { duration, easing: "cubic-bezier(.2,.82,.3,1)" });
  }

  function speakClear(count) {
    if (soundMuted || !("speechSynthesis" in window)) return;
    const lines = Math.min(4, Math.max(1, count));
    const words = ["", "Line clear!", "Double combo!", "Triple combo!", "Quattro!"];
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(words[lines]);
    utterance.lang = "en-US";
    utterance.rate = lines >= 4 ? .9 : .96;
    utterance.pitch = lines >= 3 ? .78 : .88;
    utterance.volume = Math.max(0, Math.min(1, .92 * lineVolume));
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /^en(-|_)/i.test(v.lang) && /Google|Samantha|Daniel|Microsoft/i.test(v.name))
      || voices.find(v => /^en(-|_)/i.test(v.lang));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }

  function impact(strength = 1) {
    const heavy = strength > 1;
    const amp = heavy ? Math.min(14, 4 + strength * 2.7) : 3;
    const duration = heavy ? Math.min(560, 260 + strength * 70) : 150;

    boardWrap.getAnimations().forEach(anim => {
      if (anim.effect && anim.effect.target === boardWrap) anim.cancel();
    });

    boardWrap.animate([
      { transform: "translate3d(0,0,0) scale(1)", filter: "brightness(1)" },
      { transform: `translate3d(0,${amp * .65}px,0) scale(1.025,.975)`, filter: `brightness(${1 + Math.min(.65, strength * .12)}) saturate(${1 + strength * .12})`, offset: .12 },
      { transform: `translate3d(${-amp}px,${-amp * .35}px,0) rotate(${-strength * .28}deg)`, offset: .25 },
      { transform: `translate3d(${amp * .85}px,${amp * .2}px,0) rotate(${strength * .22}deg)`, offset: .38 },
      { transform: `translate3d(${-amp * .55}px,${-amp * .12}px,0) rotate(${-strength * .15}deg)`, offset: .52 },
      { transform: `translate3d(${amp * .34}px,0,0) rotate(${strength * .08}deg)`, offset: .68 },
      { transform: "translate3d(0,0,0) scale(1)", filter: "brightness(1)" }
    ], { duration, easing: "cubic-bezier(.16,.86,.24,1)" });

    if (heavy) {
      boardWrap.classList.remove("line-burst");
      void boardWrap.offsetWidth;
      boardWrap.classList.add("line-burst");
      window.setTimeout(() => boardWrap.classList.remove("line-burst"), Math.min(980, duration + 240));
      flash = Math.max(flash, Math.min(1.35, .42 + strength * .24));

      if (strength >= 3) {
        document.querySelector(".app").animate([
          { filter: "brightness(1) saturate(1)" },
          { filter: `brightness(${1.08 + strength * .045}) saturate(${1.18 + strength * .08})`, offset: .15 },
          { filter: "brightness(1) saturate(1)" }
        ], { duration: Math.min(460, 240 + strength * 48), easing: "ease-out" });
      }
    } else {
      flash = Math.max(flash, .2);
    }
  }

  function spawnFirework(cx, cy, power, palette, delay = 0) {
    const sparks = Math.round(12 + power * 6);
    const spin = Math.random() * Math.PI * 2;
    for (let i = 0; i < sparks; i++) {
      const angle = spin + (Math.PI * 2 * i / sparks) + (Math.random() - .5) * .18;
      const speed = 1.7 + Math.random() * (2.2 + power * .85);
      const life = 520 + Math.random() * (430 + power * 90);
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - .7,
        size: 1.6 + Math.random() * (2.2 + power * .7),
        life,
        maxLife: life,
        color: palette[Math.floor(Math.random() * palette.length)],
        gravity: .08 + Math.random() * .08,
        drag: .982,
        trail: 3 + power * 1.3,
        glow: 4 + power * 2.2,
        delay
      });
    }
  }

  function spawnLineFx(rows) {
    const count = rows.length;
    const tier = Math.min(4, Math.max(1, count));
    const power = [0, 1, 1.7, 2.65, 3.8][tier];
    const labels = ["", "LINE CLEAR!", "DOUBLE COMBO!", "TRIPLE COMBO!", "QUATTRO!"];
    const palettes = [
      [],
      ["#ffffff", "#62ffe2", "#6ee7ff", "#ffd76a"],
      ["#ffffff", "#62ffe2", "#55a7ff", "#ff78df", "#ffd76a"],
      ["#ffffff", "#61fff0", "#5d8cff", "#ff56d8", "#ffb84f", "#ff6a3d"],
      ["#ffffff", "#5ffff1", "#4aa3ff", "#8d6cff", "#ff4fd8", "#ff4f66", "#ff9f43", "#ffe56a"]
    ];
    const palette = palettes[tier];

    fxBanner.textContent = labels[tier];
    fxBanner.dataset.tier = String(tier);
    fxBanner.classList.remove("active");
    void fxBanner.offsetWidth;
    fxBanner.classList.add("active");
    clearTimeout(fxTimer);
    fxTimer = setTimeout(() => fxBanner.classList.remove("active"), 860 + tier * 110);

    rows.forEach((row, rowIndex) => {
      const y = (row + .5) * BLOCK;
      const waves = tier === 1 ? 1 : Math.min(3, tier);
      for (let w = 0; w < waves; w++) {
        shockwaves.push({
          y,
          life: 500 + tier * 90 + w * 60,
          maxLife: 500 + tier * 90 + w * 60,
          offset: (w - waves / 2) * (3 + tier),
          power: power * (1 - w * .08)
        });
      }

      const particleCount = 24 + tier * 10;
      for (let i = 0; i < particleCount; i++) {
        const life = 500 + Math.random() * (520 + tier * 120);
        const angle = (Math.random() - .5) * Math.PI * 1.12;
        const speed = 2.8 + Math.random() * (4.7 + tier * 1.15);
        particles.push({
          x: Math.random() * canvas.width,
          y: y + (Math.random() - .5) * BLOCK,
          vx: Math.sin(angle) * speed * (Math.random() < .5 ? -1 : 1),
          vy: -Math.abs(Math.cos(angle) * speed) - Math.random() * (2.6 + tier),
          size: 2 + Math.random() * (3.5 + tier * 1.35),
          life,
          maxLife: life,
          color: palette[Math.floor(Math.random() * palette.length)],
          gravity: .13 + Math.random() * .09,
          drag: .986,
          trail: 2 + tier * 1.2,
          glow: 3 + tier * 1.8,
          delay: Math.random() * 70 * tier
        });
      }
    });

    const burstCount = 1 + tier;
    const minY = Math.max(70, Math.min(...rows) * BLOCK - 120);
    const maxY = Math.min(canvas.height - 70, Math.max(...rows) * BLOCK + 40);
    for (let b = 0; b < burstCount; b++) {
      const cx = 28 + Math.random() * (canvas.width - 56);
      const cy = minY + Math.random() * Math.max(80, maxY - minY);
      spawnFirework(cx, cy, power, palette, b * (50 + 18 * tier));
    }

    if (tier >= 3) {
      for (let side = 0; side < 2; side++) {
        for (let i = 0; i < 8 + tier * 4; i++) {
          const life = 700 + Math.random() * 500;
          particles.push({
            x: side ? canvas.width - 4 : 4,
            y: canvas.height - Math.random() * 180,
            vx: (side ? -1 : 1) * (3.5 + Math.random() * 5.5),
            vy: -5 - Math.random() * 7,
            size: 2 + Math.random() * 4,
            life,
            maxLife: life,
            color: palette[Math.floor(Math.random() * palette.length)],
            gravity: .12,
            drag: .988,
            trail: 5 + tier * 1.5,
            glow: 5 + tier * 2,
            delay: Math.random() * 150
          });
        }
      }
    }

    flash = Math.max(flash, .65 + tier * .38);
  }

  function clearLines() {
    let cleared = 0;
    const clearedRows = [];
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every(Boolean)) {
        clearedRows.push(y);
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        y++;
      }
    }
    if (!cleared) return;
    const table = [0, 100, 300, 500, 800];
    const capped = Math.min(4, cleared);
    const overflowBonus = cleared > 4 ? (cleared - 4) * 500 : 0;
    addScore((table[capped] + overflowBonus) * level);
    lines += cleared;
    level = Math.floor(lines / 10) + 1;
    sfxLineClear(cleared);
    speakClear(cleared);
    spawnLineFx(clearedRows);
    impact(1.55 + capped * .7);
  }

  function lockPiece(dropPower = 0) {
    merge();
    sfxLand();
    screenBump(dropPower || 1);
    impact(dropPower ? .65 + Math.min(3.2, dropPower * .32) : .65);
    clearLines();
    current = next;
    next = makePiece();
    current.x = Math.floor((COLS - current.shape[0].length) / 2);
    current.y = -topPadding(current.shape);
    canHold = true;
    dropAccumulator = 0;
    if (collides(current, 0, 0)) endGame();
    updateHUD();
  }

  function holdPiece() {
    if (paused || gameOver || !canHold) return;
    const outgoing = current.type;
    if (hold === null) {
      hold = outgoing;
      current = next;
      next = makePiece();
    } else {
      const incoming = hold;
      hold = outgoing;
      current = makePiece(incoming);
    }
    current.x = Math.floor((COLS - current.shape[0].length) / 2);
    current.y = -topPadding(current.shape);
    canHold = false;
    sfxHold();
    drawPreview(holdCtx, hold);
    drawPreview(nextCtx, next.type);
  }

  function getGhostY() {
    let dy = 0;
    while (!collides(current, 0, dy + 1)) dy++;
    return current.y + dy;
  }

  function drawCell(context, px, py, color, alpha = 1, size = BLOCK) {
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = color;
    context.fillRect(px + 1, py + 1, size - 2, size - 2);
    context.fillStyle = "rgba(255,255,255,.16)";
    context.fillRect(px + 3, py + 3, size - 6, 3);
    context.fillStyle = "rgba(0,0,0,.18)";
    context.fillRect(px + 3, py + size - 6, size - 6, 3);
    context.restore();
  }

  function drawBoard(delta = 16) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#070a10";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,.035)";
    ctx.lineWidth = 1;
    for (let x = 1; x < COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK + .5, 0);
      ctx.lineTo(x * BLOCK + .5, canvas.height);
      ctx.stroke();
    }
    for (let y = 1; y < ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK + .5);
      ctx.lineTo(canvas.width, y * BLOCK + .5);
      ctx.stroke();
    }

    board.forEach((row, y) => row.forEach((type, x) => {
      if (type) drawCell(ctx, x * BLOCK, y * BLOCK, COLORS[type]);
    }));

    if (!gameOver) {
      const ghostY = getGhostY();

      if (feverTier >= 1) {
        const trails = feverTier >= 4 ? 4 : feverTier;
        for (let trail = trails; trail >= 1; trail--) {
          current.shape.forEach((row, y) => row.forEach((v, x) => {
            if (!v) return;
            const by = current.y + y - trail;
            if (by >= 0) drawCell(ctx, (current.x + x) * BLOCK, by * BLOCK, COLORS[current.type], .035 + feverTier * .018);
          }));
        }
      }
      current.shape.forEach((row, y) => row.forEach((v, x) => {
        if (!v) return;
        const by = ghostY + y;
        if (by >= 0) {
          ctx.save();
          ctx.strokeStyle = COLORS[current.type];
          ctx.globalAlpha = .32;
          ctx.lineWidth = 2;
          ctx.strokeRect((current.x + x) * BLOCK + 3, by * BLOCK + 3, BLOCK - 6, BLOCK - 6);
          ctx.restore();
        }
      }));

      current.shape.forEach((row, y) => row.forEach((v, x) => {
        if (!v) return;
        const by = current.y + y;
        if (by >= 0) drawCell(ctx, (current.x + x) * BLOCK, by * BLOCK, COLORS[current.type]);
      }));
    }

    drawEffects(delta);
  }

  function drawEffects(delta) {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    shockwaves = shockwaves.filter(w => {
      w.life -= delta;
      if (w.life <= 0) return false;
      const t = 1 - w.life / w.maxLife;
      const power = w.power || 1;
      const alpha = Math.min(1, (1 - t) * (.62 + power * .16));
      const half = 18 + t * (190 + power * 28);
      const thickness = Math.max(1, (7 + power * 3.3) * (1 - t));
      const gradient = ctx.createLinearGradient(canvas.width / 2 - half, 0, canvas.width / 2 + half, 0);
      gradient.addColorStop(0, "rgba(255,90,180,0)");
      gradient.addColorStop(.18, `rgba(255,90,190,${alpha * .35})`);
      gradient.addColorStop(.38, `rgba(98,255,226,${alpha * .72})`);
      gradient.addColorStop(.5, `rgba(255,255,255,${alpha})`);
      gradient.addColorStop(.62, `rgba(255,225,90,${alpha * .72})`);
      gradient.addColorStop(.82, `rgba(113,133,255,${alpha * .4})`);
      gradient.addColorStop(1, "rgba(113,133,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(canvas.width / 2 - half, w.y - thickness / 2 + w.offset, half * 2, thickness);
      return true;
    });

    particles = particles.filter(p => {
      if ((p.delay || 0) > 0) {
        p.delay -= delta;
        return true;
      }

      p.life -= delta;
      if (p.life <= 0) return false;
      const step = delta / 16.67;
      const oldX = p.x;
      const oldY = p.y;
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.vy += (p.gravity ?? .16) * step;
      p.vx *= Math.pow(p.drag ?? .985, step);
      const alpha = Math.min(1, p.life / (p.maxLife * .36));

      ctx.globalAlpha = alpha;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = Math.min(8, p.glow || 0);
      ctx.strokeStyle = p.color;
      ctx.fillStyle = p.color;

      if (p.trail) {
        const dx = p.x - oldX;
        const dy = p.y - oldY;
        const mag = Math.hypot(dx, dy) || 1;
        ctx.lineWidth = Math.max(1, p.size * .55);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - dx / mag * p.trail, p.y - dy / mag * p.trail);
        ctx.stroke();
      }

      ctx.fillRect(p.x - p.size * .5, p.y - p.size * .5, p.size, p.size);
      ctx.shadowBlur = 0;
      return true;
    });

    if (flash > 0) {
      ctx.globalAlpha = Math.min(.72, flash * .55);
      const g = ctx.createRadialGradient(canvas.width / 2, canvas.height * .72, 10, canvas.width / 2, canvas.height * .72, canvas.width * .75);
      g.addColorStop(0, "rgba(255,255,255,.92)");
      g.addColorStop(.28, "rgba(98,255,226,.5)");
      g.addColorStop(1, "rgba(80,100,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      flash = Math.max(0, flash - delta / 260);
    }

    ctx.restore();
  }

  function drawPreview(context, type) {
    context.clearRect(0, 0, 120, 120);
    context.fillStyle = "rgba(0,0,0,.12)";
    context.fillRect(0, 0, 120, 120);
    if (!type) return;
    const shape = SHAPES[type];
    const cells = [];
    shape.forEach((row, y) => row.forEach((v, x) => { if (v) cells.push({ x, y }); }));
    const minX = Math.min(...cells.map(c => c.x));
    const maxX = Math.max(...cells.map(c => c.x));
    const minY = Math.min(...cells.map(c => c.y));
    const maxY = Math.max(...cells.map(c => c.y));
    const s = 24;
    const w = (maxX - minX + 1) * s;
    const h = (maxY - minY + 1) * s;
    const ox = (120 - w) / 2 - minX * s;
    const oy = (120 - h) / 2 - minY * s;
    cells.forEach(({ x, y }) => drawCell(context, ox + x * s, oy + y * s, COLORS[type], 1, s));
  }

  function updateHUD() {
    if (score > best) {
      best = score;
      localStorage.setItem("neon-tetris-best", String(best));
    }
    scoreEl.textContent = score.toLocaleString();
    bestEl.textContent = best.toLocaleString();
    linesEl.textContent = lines;
    levelEl.textContent = level;
    drawPreview(nextCtx, next.type);
    drawPreview(holdCtx, hold);
  }

  function dropInterval() {
    const base = Math.max(90, 850 - (level - 1) * 65);
    return Math.max(58, base * FEVER_LEVELS[feverTier].speed);
  }

  function frame(time = 0) {
    const delta = Math.min(50, time - lastTime || 0);
    lastTime = time;
    if (!paused && !gameOver) {
      replayClock += delta;
      replaySampleAccumulator += delta;
      if (replaySampleAccumulator >= 1000) {
        replaySampleAccumulator %= 1000;
        captureReplaySnapshot(false);
      }
      dropAccumulator += delta;
      if (dropAccumulator >= dropInterval()) {
        softDrop(false);
        dropAccumulator = 0;
      }
    }
    drawBoard(delta);
    rafId = requestAnimationFrame(frame);
  }

  function showOverlay(kicker, title, buttonText) {
    overlayKicker.textContent = kicker;
    overlayTitle.textContent = title;
    overlayBtn.textContent = buttonText;
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function togglePause(force) {
    if (gameOver) return;
    paused = typeof force === "boolean" ? force : !paused;
    pauseBtn.textContent = paused ? "▶" : "Ⅱ";
    setMusicLevel(paused ? .055 : .24);
    if (paused) showOverlay("PAUSED", "게임 일시정지", "계속하기");
    else {
      hideOverlay();
      lastTime = performance.now();
    }
  }

  function endGame() {
    gameOver = true;
    setMusicLevel(GAME_OVER_MUSIC_LEVEL);
    sfxGameOver();
    updateHUD();
    captureReplaySnapshot(true);
    const rivalResult = selectedRival ? (score > selectedRival.score ? "RIVAL DOWN" : score < selectedRival.score ? "RIVAL WINS" : "DRAW") : "GAME OVER";
    const rivalSuffix = selectedRival ? " // " + selectedRival.name : " // " + (playerName || "PLAYER");
    recordRanking();
    showOverlay(rivalResult + rivalSuffix, score.toLocaleString() + "점", "다시 시작");
  }

  function goHome() {
    playerReady = false;
    playerName = "";
    selectedRival = null;
    playerNameEl.textContent = "...";
    rivalSelect.value = "";
    rivalPanel.classList.add("hidden");
    rivalBoardCtx.clearRect(0, 0, rivalBoardCanvas.width, rivalBoardCanvas.height);
    resetGame(true);
  }

  function restartWithPlayerSetup() {
    playerReady = false;
    playerName = "";
    selectedRival = null;
    playerNameEl.textContent = "...";
    rivalSelect.value = "";
    rivalPanel.classList.add("hidden");
    rivalBoardCtx.clearRect(0, 0, rivalBoardCanvas.width, rivalBoardCanvas.height);
    resetGame();
  }

  function resetGame(toHome = false) {
    board = makeBoard();
    bag = [];
    hold = null;
    score = 0;
    lines = 0;
    level = 1;
    paused = false;
    gameOver = false;
    canHold = true;
    current = makePiece();
    next = makePiece();
    dropAccumulator = 0;
    lastTime = performance.now();
    particles = [];
    shockwaves = [];
    flash = 0;
    clearTimeout(fxTimer);
    clearTimeout(dropStreakTimer);
    clearTimeout(dropStreakExpiryTimer);
    dropStreakExpiryTimer = null;
    dropStreak = 0;
    feverTier = 0;
    feverMultiplier = 1;
    maxDropStreak = 0;
    maxFeverTier = 0;
    replayClock = 0;
    replaySampleAccumulator = 0;
    replayTimeline = [];
    rivalLastFever = 0;
    rivalLastScoreMilestone = 0;
    rivalLastLines = 0;
    rivalLastStreak = 0;
    clearTimeout(rivalLineFxTimer);
    clearTimeout(rivalComboFxTimer);
    rivalLineFx.classList.remove("active");
    rivalComboFx.classList.remove("active");
    fxBanner.classList.remove("active");
    dropStreakFx.classList.remove("active");
    boardWrap.classList.remove("slam", "mega-slam", "line-burst");
    updateFeverState(false);
    setMusicLevel(NORMAL_MUSIC_LEVEL);
    pauseBtn.textContent = "Ⅱ";
    hideOverlay();
    updateHUD();
    drawBoard(16);
    if (!playerReady) {
      rivalPanel.classList.add("hidden");
      if (toHome) showHomeScreen();
      else showPlayerGate();
    } else {
      beginReplayRun();
    }
  }

  function perform(action) {
    if (!["left", "right", "rotate", "drop"].includes(action)) resetDropStreak();
    switch (action) {
      case "left": move(-1); break;
      case "right": move(1); break;
      case "down": softDrop(true); break;
      case "rotate": rotate(1); break;
      case "drop": hardDrop(); break;
      case "hold": holdPiece(); break;
    }
  }

  const handledKeys = new Set(["ArrowLeft","ArrowRight","ArrowDown","ArrowUp","Space","KeyX","KeyZ","KeyC","KeyP","Escape","KeyR"]);
  const streakSafeKeys = new Set(["ArrowLeft","ArrowRight","ArrowUp","Space","KeyX","KeyZ"]);
  window.addEventListener("pointerdown", () => { ensureAudio(false); }, { capture: true, once: true });
  window.addEventListener("keydown", () => { ensureAudio(false); }, { capture: true, once: true });
  window.addEventListener("keydown", (e) => {
    ensureAudio();
    if (handledKeys.has(e.code)) e.preventDefault();
    if (handledKeys.has(e.code) && !streakSafeKeys.has(e.code)) resetDropStreak();
    if (e.repeat && ["Space","KeyC","KeyP","Escape","KeyR"].includes(e.code)) return;
    switch (e.code) {
      case "ArrowLeft": move(-1); break;
      case "ArrowRight": move(1); break;
      case "ArrowDown": softDrop(true); break;
      case "ArrowUp":
      case "KeyX": rotate(1); break;
      case "KeyZ": rotate(-1); break;
      case "Space": hardDrop(); break;
      case "KeyC": holdPiece(); break;
      case "KeyP":
      case "Escape": togglePause(); break;
      case "KeyR": restartWithPlayerSetup(); break;
    }
  }, { passive: false });

  let repeatTimer = null;
  function clearRepeat() {
    clearTimeout(repeatTimer);
    clearInterval(repeatTimer);
    repeatTimer = null;
  }

  document.querySelectorAll(".mobile-controls button").forEach(btn => {
    const action = btn.dataset.action;
    btn.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      ensureAudio();
      perform(action);
      if (["left","right","down"].includes(action)) {
        repeatTimer = setTimeout(() => {
          repeatTimer = setInterval(() => perform(action), action === "down" ? 65 : 95);
        }, 220);
      }
    });
    btn.addEventListener("pointerup", clearRepeat);
    btn.addEventListener("pointercancel", clearRepeat);
    btn.addEventListener("pointerleave", clearRepeat);
  });

  settingsBtn.addEventListener("click", () => {
    resetDropStreak();
    showQuickMenu();
  });
  closeQuickMenuBtn.addEventListener("click", () => hideQuickMenu(true));
  quickMenuModal.addEventListener("click", (e) => {
    if (e.target === quickMenuModal) hideQuickMenu(true);
  });
  menuHomeBtn.addEventListener("click", () => {
    hideQuickMenu(false);
    goHome();
  });
  menuSettingsBtn.addEventListener("click", () => {
    const resume = !quickMenuWasPaused;
    hideQuickMenu(false);
    showSettingsModal(resume);
  });
  menuRankBtn.addEventListener("click", () => {
    const resume = !quickMenuWasPaused;
    hideQuickMenu(false);
    showRankModal(resume);
  });
  homeStartBtn.addEventListener("click", () => {
    hideHomeScreen();
    showPlayerGate();
  });
  homeSettingsBtn.addEventListener("click", () => showSettingsModal(false));
  homeRankBtn.addEventListener("click", () => showRankModal(false));
  closeSettingsBtn.addEventListener("click", hideSettingsModal);
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) hideSettingsModal();
  });
  soundEnabledToggle.addEventListener("change", async () => {
    if (soundEnabledToggle.checked) await ensureAudio(false);
    setMuted(!soundEnabledToggle.checked);
  });
  bgmVolumeDial.addEventListener("input", () => saveAudioLevel("bgm", Number(bgmVolumeDial.value) / 100));
  sfxVolumeDial.addEventListener("input", () => saveAudioLevel("sfx", Number(sfxVolumeDial.value) / 100));
  lineVolumeDial.addEventListener("input", () => saveAudioLevel("line", Number(lineVolumeDial.value) / 100));
  [bgmVolumeDial, sfxVolumeDial, lineVolumeDial].forEach(attachRotaryDial);
  testBgmBtn.addEventListener("click", async () => {
    if (!await ensureAudio(false) || soundMuted) return;
    playBgmTestTone();
  });
  testSfxBtn.addEventListener("click", async () => {
    if (!await ensureAudio(false) || soundMuted) return;
    sfxRotate();
    window.setTimeout(sfxLand, 90);
  });
  testLineBtn.addEventListener("click", async () => {
    if (!await ensureAudio(false) || soundMuted) return;
    sfxLineClear(2);
    speakClear(2);
  });

  soundBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    resetDropStreak();

    if (!audioCtx || audioCtx.state !== "running") {
      soundMuted = false;
      localStorage.setItem("neon-tetris-muted", "0");
      await ensureAudio(true);
      setMuted(false);
      return;
    }

    const nextMuted = !soundMuted;
    setMuted(nextMuted);
    if (!nextMuted) {
      const t = audioCtx.currentTime + .01;
      tone(660, .07, "sine", .05, t, 880);
      tone(990, .09, "triangle", .035, t + .05, 1180);
    }
  });
  pauseBtn.addEventListener("click", () => {
    resetDropStreak();
    togglePause();
  });
  restartBtn.addEventListener("click", () => {
    resetDropStreak();
    restartWithPlayerSetup();
  });
  overlayBtn.addEventListener("click", () => {
    resetDropStreak();
    if (gameOver) restartWithPlayerSetup();
    else togglePause(false);
  });
  rankBtn.addEventListener("click", () => {
    resetDropStreak();
    showRankModal();
  });
  closeRankBtn.addEventListener("click", hideRankModal);
  rankModal.addEventListener("click", (e) => {
    if (e.target === rankModal) hideRankModal();
  });
  nicknameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    ensureAudio(false);
    startWithNickname();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !gameOver) togglePause(true);
  });

  syncAudioSettingsUI();
  resetGame(true);
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(frame);
})();