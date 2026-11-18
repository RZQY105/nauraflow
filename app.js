// =========================================================================
// 0. AUTO-ICON GENERATOR
// =========================================================================
function generateAppIconPng(size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const pad = size * 0.02;
  const radius = size * 0.22;
  const bgGrad = ctx.createLinearGradient(0, 0, size, size);
  bgGrad.addColorStop(0, "#0f172a");
  bgGrad.addColorStop(0.5, "#1e1b4b");
  bgGrad.addColorStop(1, "#090a0f");

  ctx.beginPath();
  ctx.moveTo(pad + radius, pad);
  ctx.arcTo(size - pad, pad, size - pad, size - pad, radius);
  ctx.arcTo(size - pad, size - pad, pad, size - pad, radius);
  ctx.arcTo(pad, size - pad, pad, pad, radius);
  ctx.arcTo(pad, pad, size - pad, pad, radius);
  ctx.closePath();
  ctx.fillStyle = bgGrad;
  ctx.fill();

  const neonGrad = ctx.createLinearGradient(0, 0, size, size);
  neonGrad.addColorStop(0, "#38bdf8");
  neonGrad.addColorStop(0.5, "#818cf8");
  neonGrad.addColorStop(1, "#e879f9");

  ctx.strokeStyle = neonGrad;
  ctx.lineWidth = Math.max(2, size * 0.015);
  ctx.stroke();

  const cx = size / 2;
  const cy = size / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2);
  ctx.strokeStyle = neonGrad;
  ctx.lineWidth = size * 0.036;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - size * 0.055, cy - size * 0.105);
  ctx.lineTo(cx + size * 0.11, cy);
  ctx.lineTo(cx - size * 0.055, cy + size * 0.105);
  ctx.closePath();
  ctx.fillStyle = neonGrad;
  ctx.fill();

  return canvas.toDataURL("image/png");
}

try {
  const icon192 = generateAppIconPng(192);
  const icon512 = generateAppIconPng(512);
  const brandLogo = document.getElementById("appBrandLogo");
  const appleIcon = document.getElementById("dynamicAppleIcon");
  if (brandLogo) brandLogo.src = icon192;
  if (appleIcon) appleIcon.href = icon512;
} catch (_) {}

// =========================================================================
// 1. STATE & DOM ELEMENTS
// =========================================================================
let lastVideoUrl = null;

// Default 1 scene bersih (tidak ada teks contoh yang mengganggu)
let scenes = [
  {
    id: Date.now() + 1,
    sourceType: "ai",
    actionPrompt: "",
    localImage: null,
    localFileName: "",
    localDataUrl: "",
    motion: "living-sway",
    duration: 8,
    narration: ""
  }
];

const storyIdeaInput = document.getElementById("storyIdeaInput");
const visualStyleLock = document.getElementById("visualStyleLock");
const targetDurationSelect = document.getElementById("targetDurationSelect");
const btnAutoBuildStory = document.getElementById("btnAutoBuildStory");

const btnToggleProLock = document.getElementById("btnToggleProLock");
const proLockDrawer = document.getElementById("proLockDrawer");
const enableCharLock = document.getElementById("enableCharLock");
const charDnaInput = document.getElementById("charDnaInput");
const masterSeedInput = document.getElementById("masterSeedInput");
const btnRandomSeed = document.getElementById("btnRandomSeed");

const scenesContainer = document.getElementById("scenesContainer");
const btnAddScene = document.getElementById("btnAddScene");
const totalDurationBadge = document.getElementById("totalDurationBadge");

const aspectRatio = document.getElementById("aspectRatio");
const bgmPreset = document.getElementById("bgmPreset");
const voVoice = document.getElementById("voVoice");
const customAudioGroup = document.getElementById("customAudioGroup");
const voFileUpload = document.getElementById("voFileUpload");
const captionStyle = document.getElementById("captionStyle");

const btnGenerate = document.getElementById("btnGenerate");
const btnGenerateText = document.getElementById("btnGenerateText");
const renderCanvas = document.getElementById("renderCanvas");
const outputVideo = document.getElementById("outputVideo");
const loaderOverlay = document.getElementById("loaderOverlay");
const loaderStep = document.getElementById("loaderStep");
const progressBar = document.getElementById("progressBar");
const statusLabel = document.getElementById("statusLabel");
const resolutionTag = document.getElementById("resolutionTag");
const btnReplay = document.getElementById("btnReplay");
const btnDownload = document.getElementById("btnDownload");

// Modal Pengaturan
const settingsModal = document.getElementById("settingsModal");
const btnSettings = document.getElementById("btnSettings");
const btnCloseModal = document.getElementById("btnCloseModal");
const btnSaveSettings = document.getElementById("btnSaveSettings");
const hfApiKeyInput = document.getElementById("hfApiKey");
const hfModelSelect = document.getElementById("hfModelSelect");
const engineBadgeText = document.getElementById("engineBadgeText");

settingsModal.hidden = true;
loaderOverlay.hidden = true;

function updateEngineBadge() {
  const token = (localStorage.getItem("neuraflow_hf_key") || "").trim();
  engineBadgeText.textContent = token.startsWith("hf_") ? "⚡ Wan2.1 AI" : "∞ Gratis";
}

hfApiKeyInput.value = localStorage.getItem("neuraflow_hf_key") || "";
hfModelSelect.value = localStorage.getItem("neuraflow_hf_model") || "Wan-AI/Wan2.1-T2V-1.3B";
updateEngineBadge();

btnSettings.onclick = () => (settingsModal.hidden = false);
btnCloseModal.onclick = () => (settingsModal.hidden = true);
settingsModal.onclick = (e) => {
  if (e.target === settingsModal) settingsModal.hidden = true;
};
btnSaveSettings.onclick = () => {
  localStorage.setItem("neuraflow_hf_key", hfApiKeyInput.value.trim());
  localStorage.setItem("neuraflow_hf_model", hfModelSelect.value);
  updateEngineBadge();
  settingsModal.hidden = true;
};

btnToggleProLock.onclick = () => {
  proLockDrawer.hidden = !proLockDrawer.hidden;
};

btnRandomSeed.onclick = () => {
  masterSeedInput.value = Math.floor(100000 + Math.random() * 899999);
};

voVoice.onchange = () => {
  customAudioGroup.hidden = voVoice.value !== "custom";
};

// =========================================================================
// 2. PENERJEMAH BAHASA INDONESIA -> INGGRIS & AI STORYBOARD GENERATOR
// =========================================================================

// Kamus penerjemah cepat lokal (agar tetap akurat 100% walau tanpa internet tambahan)
function translateIndonesianToEnglish(text) {
  const dict = [
    [/anak kecil bernama (\w+)/gi, "a cute 7-year-old Indonesian boy named $1"],
    [/bernama (\w+)/gi, "named $1"],
    [/tertidur di ayunan/gi, "sleeping peacefully on a wooden garden swing"],
    [/tidur di ayunan/gi, "sleeping peacefully on a wooden swing"],
    [/ayunan/gi, "wooden swing under a shady tree"],
    [/balonnya goyang-goyang kena angin/gi, "holding a bright red balloon gently swaying in the breeze"],
    [/balon merah/gi, "a bright red balloon floating in the air"],
    [/balon/gi, "a colorful balloon swaying in the gentle wind"],
    [/kena angin|terkena angin/gi, "gently blowing in the soft breeze"],
    [/sore hari|senja/gi, "during warm golden hour sunset"],
    [/malam hari/gi, "at night with warm glowing lights"],
    [/pagi hari/gi, "in the bright morning sunlight"],
    [/hujan/gi, "in gentle rain with soft reflections"],
    [/bermain/gi, "playing happily"],
    [/berjalan/gi, "walking slowly"],
    [/tersenyum/gi, "smiling warmly"],
    [/taman/gi, "in a lush green park"],
    [/pantai/gi, "on a peaceful beach"],
    [/hutan/gi, "in a magical forest"]
  ];

  let result = text;
  dict.forEach(([pattern, replacement]) => {
    result = result.replace(pattern, replacement);
  });
  return result;
}

// Bangun cerita & scene otomatis dari 1 kalimat Bahasa Indonesia hingga 3 Menit (180 detik)
btnAutoBuildStory.addEventListener("click", async () => {
  const idea = storyIdeaInput.value.trim();
  if (!idea) {
    alert("Ketik ide cerita kamu dulu di kotak Langkah 1!");
    storyIdeaInput.focus();
    return;
  }

  const targetTotalSec = parseInt(targetDurationSelect.value, 10);
  // Tentukan jumlah scene & durasi per scene agar pas dengan target (hingga 180 detik / 3 menit)
  let sceneCount = 2;
  let secPerScene = 6;
  if (targetTotalSec === 12) {
    sceneCount = 2;
    secPerScene = 6;
  } else if (targetTotalSec === 30) {
    sceneCount = 3;
    secPerScene = 10;
  } else if (targetTotalSec === 60) {
    sceneCount = 4;
    secPerScene = 15;
  } else if (targetTotalSec === 120) {
    sceneCount = 6;
    secPerScene = 20;
  } else if (targetTotalSec === 180) {
    sceneCount = 6;
    secPerScene = 30;
  }

  btnAutoBuildStory.disabled = true;
  btnAutoBuildStory.textContent = "⏳ Menyusun Adegan & Menerjemahkan...";
  statusLabel.textContent = "AI sedang menyusun alur cerita...";

  try {
    // Coba panggil AI Text Generator gratis untuk memecah cerita secara cerdas
    const sysPrompt = `You are a film director. Convert this Indonesian story idea into JSON with 1 consistent English character description and ${sceneCount} sequential English visual scene prompts plus short Indonesian narration subtitles. Return ONLY valid JSON: {"character":"...","scenes":[{"prompt":"...","narration":"..."}]}. Story idea: "${idea}"`;
    const url = `https://text.pollinations.ai/${encodeURIComponent(sysPrompt)}?json=true`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) throw new Error("Fallback ke pembuat cerita lokal");
    const rawText = await res.text();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Format JSON tidak valid");

    const parsed = JSON.parse(jsonMatch[0]);
    if (!parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
      throw new Error("Scene kosong");
    }

    if (parsed.character) {
      charDnaInput.value = parsed.character;
      enableCharLock.checked = true;
    }

    const motions = ["living-sway", "dolly-in", "pan-right", "orbit-float", "dolly-out", "pan-left"];
    scenes = parsed.scenes.slice(0, sceneCount).map((sc, idx) => ({
      id: Date.now() + idx + Math.random(),
      sourceType: "ai",
      actionPrompt: sc.prompt || translateIndonesianToEnglish(idea),
      localImage: null,
      localFileName: "",
      localDataUrl: "",
      motion: motions[idx % motions.length],
      duration: secPerScene,
      narration: sc.narration || ""
    }));
  } catch (_) {
    // Fallback instan & akurat jika koneksi lambat
    const translatedBase = translateIndonesianToEnglish(idea);
    charDnaInput.value = `Consistent main character from story: ${translatedBase}`;
    enableCharLock.checked = true;

    const cameraAngles = [
      "wide establishing shot, gentle breeze blowing",
      "medium shot, warm golden sunlight filtering through leaves",
      "close-up emotional shot, soft focus background, gentle movement",
      "cinematic side angle view, peaceful atmosphere, subtle wind motion",
      "dreamy soft glow shot, twilight sky, calm serene mood",
      "ending shot slowly pulling back, peaceful sunset horizon"
    ];
    const motions = ["living-sway", "dolly-in", "pan-right", "orbit-float", "dolly-out", "pan-left"];

    scenes = Array.from({ length: sceneCount }, (_, idx) => ({
      id: Date.now() + idx + Math.random(),
      sourceType: "ai",
      actionPrompt: `${translatedBase}, ${cameraAngles[idx % cameraAngles.length]}`,
      localImage: null,
      localFileName: "",
      localDataUrl: "",
      motion: motions[idx % motions.length],
      duration: secPerScene,
      narration: idx === 0 ? idea : ""
    }));
  } finally {
    renderScenesUI();
    btnAutoBuildStory.disabled = false;
    btnAutoBuildStory.textContent = "✨ Buat Alur Scene & Terjemahkan Otomatis";
    statusLabel.textContent = `${scenes.length} Scene siap dirender (${scenes.length * secPerScene} detik)`;
  }
});

// =========================================================================
// 3. RENDER UI DAFTAR SCENE
// =========================================================================

function updateTotalDurationDisplay() {
  const totalSec = scenes.reduce((sum, s) => sum + (Number(s.duration) || 6), 0);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  totalDurationBadge.textContent =
    mins > 0 ? `Total: ${mins} Menit ${secs > 0 ? secs + " Detik" : ""}` : `Total: ${totalSec} Detik`;
}

function renderScenesUI() {
  scenesContainer.innerHTML = "";
  updateTotalDurationDisplay();

  scenes.forEach((scene, index) => {
    const card = document.createElement("div");
    card.className = "scene-card";

    card.innerHTML = `
      <div class="scene-card-head">
        <span class="scene-num">Scene ${index + 1}</span>
        <div class="scene-actions">
          <button type="button" class="mini-icon-btn toggle-src-btn" data-id="${scene.id}">
            ${scene.sourceType === "ai" ? "🖼️ Pakai Foto" : "✨ Pakai Teks"}
          </button>
          ${
            scenes.length > 1
              ? `<button type="button" class="mini-icon-btn del-scene-btn" data-id="${scene.id}">✕</button>`
              : ""
          }
        </div>
      </div>

      ${
        scene.sourceType === "photo"
          ? `
        <div style="margin-bottom:8px;">
          <input type="file" accept="image/*" class="scene-file-input" data-id="${scene.id}" />
          ${scene.localFileName ? `<small style="color:#86efac;">✓ ${scene.localFileName}</small>` : ""}
        </div>
      `
          : `
        <div class="control-item" style="margin-bottom:0;">
          <textarea
            rows="2"
            class="scene-prompt-input"
            data-id="${scene.id}"
            placeholder="Ketik adegan Scene ${index + 1} (boleh Bahasa Indonesia atau Inggris)..."
          >${scene.actionPrompt}</textarea>
        </div>
      `
      }

      <div class="scene-mini-grid">
        <div class="control-item" style="margin-bottom:0;">
          <label>Efek Gerakan</label>
          <select class="scene-motion-select" data-id="${scene.id}">
            <option value="living-sway" ${scene.motion === "living-sway" ? "selected" : ""}>🌬️ Gerak Hidup & Angin</option>
            <option value="dolly-in" ${scene.motion === "dolly-in" ? "selected" : ""}>🎥 Zoom Mendekat</option>
            <option value="dolly-out" ${scene.motion === "dolly-out" ? "selected" : ""}>🔭 Zoom Menjauh</option>
            <option value="pan-right" ${scene.motion === "pan-right" ? "selected" : ""}>↔️ Geser Kiri ke Kanan</option>
            <option value="pan-left" ${scene.motion === "pan-left" ? "selected" : ""}>↔️ Geser Kanan ke Kiri</option>
          </select>
        </div>

        <div class="control-item" style="margin-bottom:0;">
          <label>Durasi Scene</label>
          <select class="scene-dur-select" data-id="${scene.id}">
            <option value="4" ${scene.duration === 4 ? "selected" : ""}>⏱️ 4 Detik</option>
            <option value="6" ${scene.duration === 6 ? "selected" : ""}>⏱️ 6 Detik</option>
            <option value="10" ${scene.duration === 10 ? "selected" : ""}>⏱️ 10 Detik</option>
            <option value="15" ${scene.duration === 15 ? "selected" : ""}>⏱️ 15 Detik</option>
            <option value="20" ${scene.duration === 20 ? "selected" : ""}>⏱️ 20 Detik</option>
            <option value="30" ${scene.duration === 30 ? "selected" : ""}>⏱️ 30 Detik</option>
          </select>
        </div>
      </div>

      <div class="control-item" style="margin-top:8px;margin-bottom:0;">
        <input
          type="text"
          class="scene-narration-input"
          data-id="${scene.id}"
          value="${scene.narration.replace(/"/g, "&quot;")}"
          placeholder="Teks subtitle / narasi untuk Scene ${index + 1} (opsional)..."
        />
      </div>
    `;

    scenesContainer.appendChild(card);
  });

  bindSceneEvents();
}

function bindSceneEvents() {
  document.querySelectorAll(".toggle-src-btn").forEach((btn) => {
    btn.onclick = () => {
      const target = scenes.find((s) => s.id === Number(btn.dataset.id));
      if (target) {
        target.sourceType = target.sourceType === "ai" ? "photo" : "ai";
        renderScenesUI();
      }
    };
  });

  document.querySelectorAll(".del-scene-btn").forEach((btn) => {
    btn.onclick = () => {
      scenes = scenes.filter((s) => s.id !== Number(btn.dataset.id));
      renderScenesUI();
    };
  });

  document.querySelectorAll(".scene-prompt-input").forEach((el) => {
    el.oninput = () => {
      const target = scenes.find((s) => s.id === Number(el.dataset.id));
      if (target) target.actionPrompt = el.value;
    };
  });

  document.querySelectorAll(".scene-motion-select").forEach((el) => {
    el.onchange = () => {
      const target = scenes.find((s) => s.id === Number(el.dataset.id));
      if (target) target.motion = el.value;
    };
  });

  document.querySelectorAll(".scene-dur-select").forEach((el) => {
    el.onchange = () => {
      const target = scenes.find((s) => s.id === Number(el.dataset.id));
      if (target) {
        target.duration = Number(el.value);
        updateTotalDurationDisplay();
      }
    };
  });

  document.querySelectorAll(".scene-narration-input").forEach((el) => {
    el.oninput = () => {
      const target = scenes.find((s) => s.id === Number(el.dataset.id));
      if (target) target.narration = el.value;
    };
  });

  document.querySelectorAll(".scene-file-input").forEach((el) => {
    el.onchange = (e) => {
      const file = e.target.files[0];
      const target = scenes.find((s) => s.id === Number(el.dataset.id));
      if (!file || !target) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          target.localImage = img;
          target.localFileName = file.name;
          target.localDataUrl = ev.target.result;
          renderScenesUI();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
  });
}

btnAddScene.onclick = () => {
  scenes.push({
    id: Date.now() + Math.random(),
    sourceType: "ai",
    actionPrompt: "",
    localImage: null,
    localFileName: "",
    localDataUrl: "",
    motion: "living-sway",
    duration: 10,
    narration: ""
  });
  renderScenesUI();
};

function getCanvasDimensions(ratio) {
  if (ratio === "9:16") return { width: 720, height: 1280 };
  if (ratio === "16:9") return { width: 1280, height: 720 };
  return { width: 960, height: 960 };
}

aspectRatio.onchange = () => {
  const dim = getCanvasDimensions(aspectRatio.value);
  resolutionTag.textContent = `${dim.width}×${dim.height} • 30 FPS`;
};

// =========================================================================
// 4. AI VISUAL & VIDEO ENGINE (HUGGING FACE WAN2.1 + UNLIMITED HYBRID)
// =========================================================================

function buildFinalPrompt(rawAction) {
  // Otomatis terjemahkan jika user langsung mengetik Bahasa Indonesia di kotak scene
  const translatedAction = translateIndonesianToEnglish(rawAction);
  const artStyle = visualStyleLock.value;
  const charDna = enableCharLock.checked ? charDnaInput.value.trim() : "";

  const parts = [];
  if (charDna) parts.push(charDna);
  if (translatedAction) parts.push(translatedAction);
  if (artStyle) parts.push(artStyle);
  parts.push("masterpiece, high detail, consistent character");
  return parts.join(", ");
}

async function tryFetchHuggingFaceVideo(scene, sceneIndex) {
  const hfToken = (localStorage.getItem("neuraflow_hf_key") || "").trim();
  if (!hfToken || !hfToken.startsWith("hf_")) return null;

  const isPhotoScene = scene.sourceType === "photo" && scene.localDataUrl;
  const activeModel = isPhotoScene
    ? "Wan-AI/Wan2.1-I2V-14B-480P"
    : localStorage.getItem("neuraflow_hf_model") || "Wan-AI/Wan2.1-T2V-1.3B";

  const promptText = buildFinalPrompt(scene.actionPrompt.trim() || "cinematic gentle wind motion");
  const payload = isPhotoScene
    ? { inputs: scene.localDataUrl.split(",")[1], parameters: { prompt: promptText } }
    : {
        inputs: promptText,
        parameters: { seed: parseInt(masterSeedInput.value, 10) || 482910 }
      };

  const urls = [
    `https://router.huggingface.co/hf-inference/models/${activeModel}`,
    `https://api-inference.huggingface.co/models/${activeModel}`
  ];

  for (const url of urls) {
    try {
      loaderStep.textContent = `Scene ${sceneIndex + 1}: Memproses video AI Wan2.1...`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 45000);
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) continue;
      const cType = res.headers.get("content-type") || "";
      if (cType.includes("video") || cType.includes("octet-stream")) {
        const blob = await res.blob();
        if (blob.size < 5000) continue;
        const blobUrl = URL.createObjectURL(blob);
        const videoEl = document.createElement("video");
        videoEl.src = blobUrl;
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.loop = true;
        await new Promise((resolve, reject) => {
          videoEl.onloadeddata = resolve;
          videoEl.onerror = reject;
        });
        return { type: "video", element: videoEl, blobUrl };
      }
    } catch (_) {}
  }
  return null;
}

function fetchSceneImage(scene, sceneIndex, width, height) {
  if (scene.sourceType === "photo" && scene.localImage) {
    return Promise.resolve({ type: "image", element: scene.localImage });
  }

  return new Promise((resolve) => {
    const seed = enableCharLock.checked
      ? parseInt(masterSeedInput.value, 10) || 482910
      : Math.floor(Math.random() * 999999);

    const promptText = buildFinalPrompt(scene.actionPrompt.trim());
    const encoded = encodeURIComponent(promptText);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ type: "image", element: img });
    img.onerror = () => {
      const fallback = document.createElement("canvas");
      fallback.width = width;
      fallback.height = height;
      const fctx = fallback.getContext("2d");
      const grad = fctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(1, sceneIndex % 2 === 0 ? "#1e1b4b" : "#0369a1");
      fctx.fillStyle = grad;
      fctx.fillRect(0, 0, width, height);
      resolve({ type: "image", element: fallback });
    };
    img.src = url;
  });
}

async function resolveSceneMedia(scene, sceneIndex, width, height) {
  const hfVid = await tryFetchHuggingFaceVideo(scene, sceneIndex);
  if (hfVid) return hfVid;
  loaderStep.textContent = `Menggambar Scene ${sceneIndex + 1}/${scenes.length}...`;
  return await fetchSceneImage(scene, sceneIndex, width, height);
}

// =========================================================================
// 5. SUBTITLE & AUDIO LOOP (MENDUKUNG DURASI PANJANG HINGGA 3 MENIT)
// =========================================================================

function buildCaptionTimeline(rawText, startSec, activeDurationSec) {
  const clean = rawText.replace(/\s+/g, " ").trim();
  if (!clean || activeDurationSec <= 0) return [];

  const rawSentences = clean.match(/[^.!?]+[.!?]*/g) || [clean];
  const segments = [];

  rawSentences.forEach((sentence) => {
    const trimmed = sentence.trim();
    if (!trimmed) return;
    if (trimmed.length <= 50) {
      segments.push(trimmed);
    } else {
      const words = trimmed.split(" ");
      let chunk = "";
      words.forEach((w) => {
        if ((chunk + " " + w).trim().length > 46 && chunk) {
          segments.push(chunk.trim());
          chunk = w;
        } else {
          chunk = (chunk + " " + w).trim();
        }
      });
      if (chunk) segments.push(chunk);
    }
  });

  const totalChars = segments.reduce((sum, seg) => sum + seg.length, 0);
  if (totalChars === 0) return [];

  let cursor = startSec;
  return segments.map((text) => {
    const segDuration = (text.length / totalChars) * activeDurationSec;
    const entry = { text, start: cursor, end: cursor + segDuration };
    cursor += segDuration;
    return entry;
  });
}

function renderSubtitleOverlay(ctx, width, height, currentTimeSec, timeline, style) {
  if (style === "none" || !timeline || timeline.length === 0) return;

  const activeCue = timeline.find(
    (item) => currentTimeSec >= item.start && currentTimeSec <= item.end
  );
  if (!activeCue) return;

  ctx.save();
  const isPortrait = height > width;
  const fontSize = Math.round(width * (isPortrait ? 0.043 : 0.032));
  const lineHeight = Math.round(fontSize * 1.35);
  const maxTextWidth = width * 0.84;
  const bottomSafeOffset = isPortrait ? height * 0.14 : height * 0.09;

  ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const words = activeCue.text.split(" ");
  const lines = [];
  let line = "";
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxTextWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  });
  if (line) lines.push(line);

  const blockHeight = lines.length * lineHeight;
  const startY = height - bottomSafeOffset - blockHeight + lineHeight / 2;

  if (style === "cinema") {
    let maxW = 0;
    lines.forEach((l) => {
      const w = ctx.measureText(l).width;
      if (w > maxW) maxW = w;
    });
    const padX = fontSize * 0.75;
    const padY = fontSize * 0.42;
    ctx.fillStyle = "rgba(8, 11, 19, 0.76)";
    ctx.fillRect(
      (width - (maxW + padX * 2)) / 2,
      startY - lineHeight / 2 - padY * 0.8,
      maxW + padX * 2,
      blockHeight + padY * 1.6
    );
    ctx.fillStyle = "#f8fafc";
    lines.forEach((l, idx) => ctx.fillText(l, width / 2, startY + idx * lineHeight));
  } else {
    ctx.strokeStyle = "rgba(0,0,0,0.92)";
    ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.18));
    lines.forEach((l, idx) => {
      const y = startY + idx * lineHeight;
      ctx.strokeText(l, width / 2, y);
      ctx.fillStyle = idx === 0 ? "#fde047" : "#ffffff";
      ctx.fillText(l, width / 2, y);
    });
  }
  ctx.restore();
}

async function fetchTtsBuffer(audioCtx, text, voiceName) {
  if (!text || !text.trim() || voiceName === "none" || voiceName === "custom") return null;
  try {
    const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(
      voiceName
    )}&text=${encodeURIComponent(text.trim())}`;
    const res = await fetch(ttsUrl);
    if (!res.ok) return null;
    return await audioCtx.decodeAudioData(await res.arrayBuffer());
  } catch (_) {
    return null;
  }
}

function setupLongAudioSession(audioCtx, scheduledVoClips, customFullVoBuffer, totalDurationSec) {
  const dest = audioCtx.createMediaStreamDestination();
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 1.0;
  masterGain.connect(dest);
  masterGain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  const activeNodes = [];
  let hasVo = false;

  if (customFullVoBuffer) {
    hasVo = true;
    const src = audioCtx.createBufferSource();
    src.buffer = customFullVoBuffer;
    src.connect(masterGain);
    src.start(now + 0.3);
    activeNodes.push(src);
  } else {
    scheduledVoClips.forEach((clip) => {
      if (!clip.buffer) return;
      hasVo = true;
      const src = audioCtx.createBufferSource();
      src.buffer = clip.buffer;
      src.connect(masterGain);
      src.start(now + clip.startTime);
      activeNodes.push(src);
    });
  }

  const preset = bgmPreset.value;
  if (preset !== "none") {
    const bgmGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(preset === "piano" ? 1050 : 650, now);

    const level = hasVo ? 0.08 : 0.16;
    bgmGain.gain.setValueAtTime(0.001, now);
    bgmGain.gain.exponentialRampToValueAtTime(level, now + 0.5);
    bgmGain.gain.setValueAtTime(level, Math.max(now + 0.6, now + totalDurationSec - 1.0));
    bgmGain.gain.exponentialRampToValueAtTime(0.0001, now + totalDurationSec);

    filter.connect(bgmGain);
    bgmGain.connect(masterGain);

    const chords =
      preset === "piano"
        ? [
            [87.31, 174.61, 220.0, 261.63],
            [55.0, 110.0, 164.81, 246.94]
          ]
        : [
            [73.42, 146.83, 174.61, 220.0],
            [58.27, 116.54, 174.61, 261.63]
          ];

    // Loop progresi akor setiap 8 detik agar musik terus berjalan lancar walau video 3 menit
    const barDur = 8;
    const loopCount = Math.ceil(totalDurationSec / barDur);
    for (let bar = 0; bar < loopCount; bar++) {
      const chordFreqs = chords[bar % chords.length];
      const startTime = now + bar * barDur;
      const endTime = Math.min(now + totalDurationSec, startTime + barDur + 0.1);
      if (startTime >= now + totalDurationSec) break;

      chordFreqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        osc.type = idx === 0 ? "sine" : preset === "cyber" ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, startTime);

        const nLevel = idx === 0 ? 0.5 : 0.16;
        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(nLevel, startTime + 0.4);
        noteGain.gain.setValueAtTime(nLevel, Math.max(startTime + 0.5, endTime - 0.4));
        noteGain.gain.linearRampToValueAtTime(0.0001, endTime);

        osc.connect(noteGain);
        noteGain.connect(filter);
        osc.start(startTime);
        osc.stop(endTime);
        activeNodes.push(osc);
      });
    }
  }

  return {
    stream: dest.stream,
    cleanup: () => {
      activeNodes.forEach((n) => {
        try {
          n.stop();
        } catch (_) {}
      });
      if (audioCtx.state !== "closed") audioCtx.close().catch(() => {});
    }
  };
}

// =========================================================================
// 6. RENDER FRAME DENGAN EFEK GERAK HIDUP (LIVING SWAY & WIND)
// =========================================================================

function seekVideoElement(videoEl, targetTime) {
  return new Promise((resolve) => {
    if (!videoEl.duration || isNaN(videoEl.duration)) return resolve();
    const clamped = Math.min(videoEl.duration - 0.04, Math.max(0, targetTime));
    if (Math.abs(videoEl.currentTime - clamped) < 0.02) return resolve();
    const timer = setTimeout(resolve, 120);
    videoEl.onseeked = () => {
      clearTimeout(timer);
      resolve();
    };
    videoEl.currentTime = clamped;
  });
}

async function drawSceneMediaFrame(ctx, media, motion, elapsedSec, progressT, width, height, alpha = 1) {
  const sourceEl = media.element;
  const isVideo = media.type === "video";

  if (isVideo && sourceEl.duration) {
    await seekVideoElement(sourceEl, (elapsedSec % sourceEl.duration));
  }

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.filter = "contrast(1.06) saturate(1.12)";

  const srcW = isVideo ? sourceEl.videoWidth || width : sourceEl.width || width;
  const srcH = isVideo ? sourceEl.videoHeight || height : sourceEl.height || height;
  const baseScale = Math.max(width / srcW, height / srcH);
  const ease = progressT * progressT * (3 - 2 * progressT);

  let scale = isVideo ? baseScale * 1.03 : baseScale * 1.12;
  let offsetX = 0;
  let offsetY = 0;
  let tiltAngle = 0;

  if (!isVideo) {
    if (motion === "living-sway") {
      // Gerakan ayunan & hembusan angin lembut berulang setiap 4 detik
      const wave = Math.sin(elapsedSec * 1.5);
      const breathe = Math.cos(elapsedSec * 0.9);
      scale = baseScale * (1.1 + breathe * 0.03);
      offsetX = wave * width * 0.025;
      offsetY = Math.sin(elapsedSec * 1.1) * height * 0.015;
      tiltAngle = wave * 0.012; // Kemiringan lembut seperti ayunan tertiup angin
    } else if (motion === "dolly-in") {
      scale = baseScale * (1.02 + ease * 0.18);
    } else if (motion === "dolly-out") {
      scale = baseScale * (1.22 - ease * 0.18);
    } else if (motion === "pan-right") {
      scale = baseScale * 1.18;
      offsetX = (ease - 0.5) * width * 0.14;
    } else if (motion === "pan-left") {
      scale = baseScale * 1.18;
      offsetX = (0.5 - ease) * width * 0.14;
    } else if (motion === "orbit-float") {
      scale = baseScale * (1.1 + Math.sin(elapsedSec * 0.8) * 0.04);
      offsetX = Math.sin(elapsedSec * 1.2) * width * 0.03;
      offsetY = Math.cos(elapsedSec * 1.2) * height * 0.02;
    }
  }

  const drawW = srcW * scale;
  const drawH = srcH * scale;

  ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
  if (tiltAngle !== 0) ctx.rotate(tiltAngle);
  ctx.drawImage(sourceEl, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
}

// =========================================================================
// 7. EKSEKUSI RENDER VIDEO UTAMA
// =========================================================================

btnGenerate.addEventListener("click", async () => {
  const { width, height } = getCanvasDimensions(aspectRatio.value);

  // Jika Scene 1 kosong tapi user sudah mengetik di kotak Langkah 1, otomatis isi dari Langkah 1
  if (scenes.length === 1 && !scenes[0].actionPrompt.trim() && storyIdeaInput.value.trim()) {
    scenes[0].actionPrompt = storyIdeaInput.value.trim();
    renderScenesUI();
  }

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    if (s.sourceType === "photo" && !s.localImage) {
      alert(`Pilih foto dulu untuk Scene ${i + 1}!`);
      return;
    }
    if (s.sourceType === "ai" && !s.actionPrompt.trim()) {
      alert(`Isi cerita di Langkah 1 atau deskripsi Scene ${i + 1} terlebih dahulu!`);
      return;
    }
  }

  btnGenerate.disabled = true;
  btnGenerateText.textContent = "⏳ Sedang Membuat Video...";
  loaderOverlay.hidden = false;
  progressBar.style.width = "5%";

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  if (audioCtx.state === "suspended") await audioCtx.resume();

  const preparedScenes = [];

  try {
    const selectedVoice = voVoice.value;
    let customFullVoBuffer = null;
    if (selectedVoice === "custom" && voFileUpload.files[0]) {
      const buf = await voFileUpload.files[0].arrayBuffer();
      customFullVoBuffer = await audioCtx.decodeAudioData(buf);
    }

    let timelineCursor = 0;
    const scheduledVoClips = [];
    let fullCaptionTimeline = [];

    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      progressBar.style.width = `${Math.round(((i + 0.5) / scenes.length) * 40)}%`;

      const media = await resolveSceneMedia(s, i, width, height);
      const sceneVoBuffer = await fetchTtsBuffer(audioCtx, s.narration, selectedVoice);

      const minNeeded = sceneVoBuffer ? Math.ceil(sceneVoBuffer.duration + 0.6) : 0;
      const actualDuration = Math.max(s.duration, minNeeded);
      const sceneStart = timelineCursor;
      const sceneEnd = sceneStart + actualDuration;

      if (sceneVoBuffer) {
        scheduledVoClips.push({ buffer: sceneVoBuffer, startTime: sceneStart + 0.25 });
      }

      if (s.narration.trim()) {
        const speechDur = sceneVoBuffer ? sceneVoBuffer.duration : Math.max(1, actualDuration - 0.5);
        fullCaptionTimeline = fullCaptionTimeline.concat(
          buildCaptionTimeline(s.narration, sceneStart + 0.25, speechDur)
        );
      }

      preparedScenes.push({
        media,
        motion: s.motion,
        start: sceneStart,
        end: sceneEnd,
        duration: actualDuration
      });

      timelineCursor = sceneEnd;
    }

    const totalDurationSec = timelineCursor;
    renderCanvas.width = width;
    renderCanvas.height = height;
    renderCanvas.hidden = false;
    outputVideo.hidden = true;

    const ctx = renderCanvas.getContext("2d");
    // Gunakan 24 FPS untuk video panjang (>60 detik) agar render di HP tetap cepat & ringan
    const fps = totalDurationSec > 60 ? 24 : 30;
    const totalFrames = Math.ceil(totalDurationSec * fps);
    const crossfadeSec = 0.5;

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.5 + 0.8,
      vx: (Math.random() - 0.3) * 0.9, // Hembusan angin lembut ke kanan
      vy: -Math.random() * 0.6 - 0.1,
      alpha: Math.random() * 0.6 + 0.2
    }));

    const audioSession = setupLongAudioSession(
      audioCtx,
      scheduledVoClips,
      customFullVoBuffer,
      totalDurationSec
    );

    const canvasStream = renderCanvas.captureStream(fps);
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioSession.stream.getAudioTracks()
    ]);

    const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find(
      (t) => MediaRecorder.isTypeSupported(t)
    ) || "video/webm";

    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 3_500_000,
      audioBitsPerSecond: 128_000
    });

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    const recordingFinished = new Promise((resolve) => {
      recorder.onstop = () => {
        audioSession.cleanup();
        preparedScenes.forEach((sc) => {
          if (sc.media && sc.media.blobUrl) URL.revokeObjectURL(sc.media.blobUrl);
        });
        resolve(URL.createObjectURL(new Blob(chunks, { type: mimeType })));
      };
    });

    recorder.start();

    for (let frame = 0; frame <= totalFrames; frame++) {
      const currentTimeSec = frame / fps;
      let activeIdx = preparedScenes.findIndex(
        (sc) => currentTimeSec >= sc.start && currentTimeSec < sc.end
      );
      if (activeIdx === -1) activeIdx = preparedScenes.length - 1;

      const currentSc = preparedScenes[activeIdx];
      const elapsedInScene = Math.max(0, currentTimeSec - currentSc.start);
      const localProgress = Math.min(1, elapsedInScene / currentSc.duration);

      ctx.clearRect(0, 0, width, height);

      await drawSceneMediaFrame(
        ctx,
        currentSc.media,
        currentSc.motion,
        elapsedInScene,
        localProgress,
        width,
        height,
        1
      );

      // Transisi halus antar scene
      if (activeIdx < preparedScenes.length - 1) {
        const timeLeft = currentSc.end - currentTimeSec;
        if (timeLeft <= crossfadeSec) {
          const nextSc = preparedScenes[activeIdx + 1];
          await drawSceneMediaFrame(
            ctx,
            nextSc.media,
            nextSc.motion,
            0,
            0,
            width,
            height,
            1 - timeLeft / crossfadeSec
          );
        }
      }

      // Partikel cahaya & angin
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = height;
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 245, 220, ${p.alpha})`;
        ctx.fill();
      });

      renderSubtitleOverlay(
        ctx,
        width,
        height,
        currentTimeSec,
        fullCaptionTimeline,
        captionStyle.value
      );

      const pct = 40 + Math.round((frame / totalFrames) * 60);
      progressBar.style.width = `${pct}%`;
      loaderStep.textContent = `Merekam Scene ${activeIdx + 1}/${preparedScenes.length} (${Math.floor(currentTimeSec)}d / ${totalDurationSec}d)... ${pct}%`;

      await new Promise((r) => setTimeout(r, 1000 / fps));
    }

    recorder.stop();
    const videoUrl = await recordingFinished;

    if (lastVideoUrl) URL.revokeObjectURL(lastVideoUrl);
    lastVideoUrl = videoUrl;

    outputVideo.src = videoUrl;
    outputVideo.hidden = false;
    renderCanvas.hidden = true;
    outputVideo.play();

    btnDownload.href = videoUrl;
    btnDownload.classList.remove("disabled");
    btnReplay.disabled = false;
    statusLabel.textContent = `Selesai! Video ${totalDurationSec} detik siap disimpan`;
  } catch (err) {
    console.error(err);
    statusLabel.textContent = "Gagal merender video";
  } finally {
    loaderOverlay.hidden = true;
    btnGenerate.disabled = false;
    btnGenerateText.textContent = "🚀 Render & Buat Video Sekarang";
  }
});

btnReplay.onclick = () => {
  if (!lastVideoUrl) return;
  outputVideo.currentTime = 0;
  outputVideo.play();
};

renderScenesUI();
