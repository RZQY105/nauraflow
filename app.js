// =========================================================================
// 0. AUTO-ICON GENERATOR & DYNAMIC PWA MANIFEST
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
  ctx.save();
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = size * 0.05;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2);
  ctx.strokeStyle = neonGrad;
  ctx.lineWidth = size * 0.036;
  ctx.stroke();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.21, 0, Math.PI * 2);
  ctx.fillStyle = "#0b0f19";
  ctx.fill();
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = Math.max(1.5, size * 0.008);
  ctx.stroke();

  ctx.save();
  ctx.shadowColor = "#e879f9";
  ctx.shadowBlur = size * 0.04;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.055, cy - size * 0.105);
  ctx.lineTo(cx + size * 0.11, cy);
  ctx.lineTo(cx - size * 0.055, cy + size * 0.105);
  ctx.closePath();
  ctx.fillStyle = neonGrad;
  ctx.fill();
  ctx.restore();

  return canvas.toDataURL("image/png");
}

function initAutoAppIcon() {
  try {
    const icon192 = generateAppIconPng(192);
    const icon512 = generateAppIconPng(512);

    const brandLogo = document.getElementById("appBrandLogo");
    const appleIcon = document.getElementById("dynamicAppleIcon");
    const manifestTag = document.getElementById("dynamicManifest");

    if (brandLogo) brandLogo.src = icon192;
    if (appleIcon) appleIcon.href = icon512;

    if (manifestTag) {
      const baseUrl = window.location.href.split("#")[0].split("?")[0];
      const manifestData = {
        name: "NeuraFlow AI Video Studio",
        short_name: "NeuraFlow",
        description: "Studio Text-to-Video & Photo-to-Video cerdas tanpa batas kredit.",
        start_url: baseUrl,
        display: "standalone",
        background_color: "#090a0f",
        theme_color: "#090a0f",
        icons: [
          { src: icon192, sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: icon512, sizes: "512x512", type: "image/png", purpose: "any maskable" }
        ]
      };
      const blob = new Blob([JSON.stringify(manifestData)], {
        type: "application/manifest+json"
      });
      manifestTag.href = URL.createObjectURL(blob);
    }
  } catch (err) {
    console.warn("Auto-icon fallback aktif:", err);
  }
}

initAutoAppIcon();

// =========================================================================
// STATE & ELEMEN DOM
// =========================================================================
let lastVideoUrl = null;
let characterReferenceImage = null;

let scenes = [
  {
    id: Date.now() + 1,
    sourceType: "ai",
    actionPrompt: "walking through a neon-lit rainy Jakarta street at night, reflections on wet asphalt",
    localImage: null,
    localFileName: "",
    localDataUrl: "",
    motion: "dolly-in",
    duration: 4,
    narration: "Every great story begins in the quiet rain."
  },
  {
    id: Date.now() + 2,
    sourceType: "ai",
    actionPrompt: "sitting by a warm coffee shop window looking outside at city lights, close-up portrait",
    localImage: null,
    localFileName: "",
    localDataUrl: "",
    motion: "pan-right",
    duration: 4,
    narration: "Where vision meets technology without limits."
  }
];

const characterLockBox = document.getElementById("characterLockBox");
const enableCharLock = document.getElementById("enableCharLock");
const lockIcon = document.getElementById("lockIcon");
const lockStatusBadge = document.getElementById("lockStatusBadge");
const lockBody = document.getElementById("lockBody");
const charDnaInput = document.getElementById("charDnaInput");
const btnPresetChar = document.getElementById("btnPresetChar");
const visualStyleLock = document.getElementById("visualStyleLock");
const masterSeedInput = document.getElementById("masterSeedInput");
const btnRandomSeed = document.getElementById("btnRandomSeed");
const charRefUpload = document.getElementById("charRefUpload");
const btnUploadRef = document.getElementById("btnUploadRef");
const refPhotoLabel = document.getElementById("refPhotoLabel");
const btnClearRef = document.getElementById("btnClearRef");

const scenesContainer = document.getElementById("scenesContainer");
const btnAddScene = document.getElementById("btnAddScene");

const aspectRatio = document.getElementById("aspectRatio");
const colorGrade = document.getElementById("colorGrade");
const enableParticles = document.getElementById("enableParticles");
const bgmPreset = document.getElementById("bgmPreset");
const voVoice = document.getElementById("voVoice");
const customAudioGroup = document.getElementById("customAudioGroup");
const voFileUpload = document.getElementById("voFileUpload");
const captionStyle = document.getElementById("captionStyle");
const bgmVolume = document.getElementById("bgmVolume");
const voVolume = document.getElementById("voVolume");
const bgmVolLabel = document.getElementById("bgmVolLabel");
const voVolLabel = document.getElementById("voVolLabel");

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

// Modal Pengaturan Hugging Face Wan2.1
const settingsModal = document.getElementById("settingsModal");
const btnSettings = document.getElementById("btnSettings");
const btnCloseModal = document.getElementById("btnCloseModal");
const btnSaveSettings = document.getElementById("btnSaveSettings");
const hfApiKeyInput = document.getElementById("hfApiKey");
const hfModelSelect = document.getElementById("hfModelSelect");
const engineBadgeText = document.getElementById("engineBadgeText");

function updateEngineBadge() {
  const token = (localStorage.getItem("neuraflow_hf_key") || "").trim();
  if (token.startsWith("hf_")) {
    engineBadgeText.textContent = "⚡ Wan2.1 + ∞ Hybrid";
  } else {
    engineBadgeText.textContent = "∞ Unlimited";
  }
}

hfApiKeyInput.value = localStorage.getItem("neuraflow_hf_key") || "";
hfModelSelect.value =
  localStorage.getItem("neuraflow_hf_model") || "Wan-AI/Wan2.1-T2V-1.3B";
updateEngineBadge();

btnSettings.onclick = () => (settingsModal.hidden = false);
btnCloseModal.onclick = () => (settingsModal.hidden = true);
btnSaveSettings.onclick = () => {
  localStorage.setItem("neuraflow_hf_key", hfApiKeyInput.value.trim());
  localStorage.setItem("neuraflow_hf_model", hfModelSelect.value);
  updateEngineBadge();
  settingsModal.hidden = true;
  statusLabel.textContent = hfApiKeyInput.value.trim()
    ? "Token HF aktif! Wan2.1 AI Video siap digunakan"
    : "Mode Unlimited Hybrid aktif!";
};

// =========================================================================
// LOGIKA CHARACTER & VISUAL CONSISTENCY LOCK
// =========================================================================

charDnaInput.value =
  "Same consistent character: 27-year-old Indonesian man, neat black comma hair, sharp jawline, wearing matte black leather jacket over dark crewneck shirt";

enableCharLock.addEventListener("change", () => {
  const locked = enableCharLock.checked;
  characterLockBox.classList.toggle("unlocked", !locked);
  lockIcon.textContent = locked ? "🔒" : "🔓";
  lockStatusBadge.textContent = locked ? "AKTIF" : "NONAKTIF";
  lockBody.style.opacity = locked ? "1" : "0.55";
  renderScenesUI();
});

btnPresetChar.addEventListener("click", () => {
  const presets = [
    "Same consistent character: 27-year-old Indonesian man, neat black comma hair, sharp jawline, wearing matte black leather jacket and silver wristwatch",
    "Same consistent character: Young Asian woman with shoulder-length dark hair, round glasses, beige trench coat, warm expressive eyes",
    "Same consistent character: Futuristic cyber-samurai traveler wearing sleek obsidian visor hood and glowing cyan tactical jacket"
  ];
  charDnaInput.value = presets[Math.floor(Math.random() * presets.length)];
});

btnRandomSeed.addEventListener("click", () => {
  masterSeedInput.value = Math.floor(100000 + Math.random() * 899999);
});

btnUploadRef.addEventListener("click", () => charRefUpload.click());

charRefUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      characterReferenceImage = img;
      refPhotoLabel.textContent = `Terkunci: ${file.name}`;
      btnClearRef.hidden = false;
      statusLabel.textContent = "Foto referensi karakter terkunci!";
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

btnClearRef.addEventListener("click", () => {
  characterReferenceImage = null;
  charRefUpload.value = "";
  refPhotoLabel.textContent = "Tambah Foto Referensi Karakter (Opsional)";
  btnClearRef.hidden = true;
});

// =========================================================================
// RENDER UI MULTI-SCENE STORYBOARD
// =========================================================================

function renderScenesUI() {
  const isLocked = enableCharLock.checked;
  scenesContainer.innerHTML = "";

  scenes.forEach((scene, index) => {
    const card = document.createElement("div");
    card.className = "scene-card";

    card.innerHTML = `
      <div class="scene-card-head">
        <div class="scene-badge-group">
          <span class="scene-num">Scene ${index + 1}</span>
          ${isLocked ? `<span class="scene-lock-tag">🔒 Karakter Terkunci</span>` : ""}
        </div>
        <div class="scene-actions">
          <button type="button" class="mini-icon-btn toggle-src-btn" data-id="${scene.id}">
            ${scene.sourceType === "ai" ? "🖼️ Pakai Foto" : "✨ Pakai AI"}
          </button>
          ${
            scenes.length > 1
              ? `<button type="button" class="mini-icon-btn danger del-scene-btn" data-id="${scene.id}">✕</button>`
              : ""
          }
        </div>
      </div>

      ${
        scene.sourceType === "photo"
          ? `
        <div class="scene-photo-picker">
          <input type="file" accept="image/*" class="scene-file-input" data-id="${scene.id}" />
          ${
            scene.localFileName
              ? `<small style="color:#86efac;display:block;margin-top:4px;">✓ ${scene.localFileName}</small>`
              : ""
          }
          <input
            type="text"
            class="scene-prompt-input"
            data-id="${scene.id}"
            style="margin-top:6px;"
            value="${scene.actionPrompt.replace(/"/g, "&quot;")}"
            placeholder="Gerakan yang diinginkan untuk foto ini (opsional untuk Wan2.1 I2V)..."
          />
        </div>
      `
          : `
        <div class="control-item" style="margin-bottom:0;">
          <label>Aksi & Latar Adegan ${index + 1}</label>
          <textarea
            rows="2"
            class="scene-prompt-input"
            data-id="${scene.id}"
            placeholder="Contoh: berjalan di tepi pantai saat matahari terbenam..."
          >${scene.actionPrompt}</textarea>
        </div>
      `
      }

      <div class="scene-mini-grid">
        <div class="control-item" style="margin-bottom:0;">
          <label>Gerakan Kamera</label>
          <select class="scene-motion-select" data-id="${scene.id}">
            <option value="dolly-in" ${scene.motion === "dolly-in" ? "selected" : ""}>🎥 Push-In (Zoom In)</option>
            <option value="dolly-out" ${scene.motion === "dolly-out" ? "selected" : ""}>🔭 Pull-Out (Zoom Out)</option>
            <option value="pan-right" ${scene.motion === "pan-right" ? "selected" : ""}>↔️ Pan Kiri ke Kanan</option>
            <option value="pan-left" ${scene.motion === "pan-left" ? "selected" : ""}>↔️ Pan Kanan ke Kiri</option>
            <option value="orbit-float" ${scene.motion === "orbit-float" ? "selected" : ""}>🌊 Drone Float</option>
          </select>
        </div>

        <div class="control-item" style="margin-bottom:0;">
          <label>Durasi Scene</label>
          <select class="scene-dur-select" data-id="${scene.id}">
            <option value="3" ${scene.duration === 3 ? "selected" : ""}>⏱️ 3 Detik</option>
            <option value="4" ${scene.duration === 4 ? "selected" : ""}>⏱️ 4 Detik</option>
            <option value="5" ${scene.duration === 5 ? "selected" : ""}>⏱️ 5 Detik</option>
            <option value="6" ${scene.duration === 6 ? "selected" : ""}>⏱️ 6 Detik</option>
          </select>
        </div>
      </div>

      <div class="control-item" style="margin-top:8px;margin-bottom:0;">
        <label>Narasi Voiceover & Subtitle Scene ${index + 1}</label>
        <input
          type="text"
          class="scene-narration-input"
          data-id="${scene.id}"
          value="${scene.narration.replace(/"/g, "&quot;")}"
          placeholder="Teks narasi untuk adegan ini..."
        />
      </div>
    `;

    scenesContainer.appendChild(card);
  });

  bindSceneCardEvents();
}

function bindSceneCardEvents() {
  document.querySelectorAll(".toggle-src-btn").forEach((btn) => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const target = scenes.find((s) => s.id === id);
      if (target) {
        target.sourceType = target.sourceType === "ai" ? "photo" : "ai";
        renderScenesUI();
      }
    };
  });

  document.querySelectorAll(".del-scene-btn").forEach((btn) => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      scenes = scenes.filter((s) => s.id !== id);
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
      if (target) target.duration = Number(el.value);
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

btnAddScene.addEventListener("click", () => {
  const motions = ["dolly-in", "pan-right", "dolly-out", "pan-left", "orbit-float"];
  const nextMotion = motions[scenes.length % motions.length];

  scenes.push({
    id: Date.now() + Math.random(),
    sourceType: "ai",
    actionPrompt: "standing on a rooftop overlooking the glowing city skyline at dusk, medium shot",
    localImage: null,
    localFileName: "",
    localDataUrl: "",
    motion: nextMotion,
    duration: 4,
    narration: ""
  });
  renderScenesUI();
});

bgmVolume.addEventListener("input", () => {
  bgmVolLabel.textContent = `${bgmVolume.value}%`;
});
voVolume.addEventListener("input", () => {
  voVolLabel.textContent = `${voVolume.value}%`;
});
voVoice.addEventListener("change", () => {
  customAudioGroup.hidden = voVoice.value !== "custom";
});

function getCanvasDimensions(ratio) {
  if (ratio === "9:16") return { width: 720, height: 1280 };
  if (ratio === "16:9") return { width: 1280, height: 720 };
  return { width: 960, height: 960 };
}

aspectRatio.addEventListener("change", () => {
  const dim = getCanvasDimensions(aspectRatio.value);
  resolutionTag.textContent = `${dim.width}×${dim.height} • 30 FPS`;
});

// =========================================================================
// HUGGING FACE WAN2.1 AI VIDEO GENERATOR + UNLIMITED HYBRID FALLBACK
// =========================================================================

function buildConsistentPrompt(sceneAction) {
  const isLocked = enableCharLock.checked;
  if (!isLocked) return sceneAction;

  const charDna = charDnaInput.value.trim();
  const artStyle = visualStyleLock.value;

  const parts = [];
  if (charDna) parts.push(`${charDna}`);
  if (sceneAction) parts.push(`${sceneAction}`);
  if (artStyle) parts.push(`${artStyle}`);
  parts.push("consistent character, smooth cinematic motion, high detail");

  return parts.join(", ");
}

// Panggil Hugging Face Inference API (Wan2.1) jika token tersedia
async function tryFetchHuggingFaceVideo(scene, sceneIndex) {
  const hfToken = (localStorage.getItem("neuraflow_hf_key") || "").trim();
  if (!hfToken || !hfToken.startsWith("hf_")) return null;

  const selectedModel =
    localStorage.getItem("neuraflow_hf_model") || "Wan-AI/Wan2.1-T2V-1.3B";
  const promptText = buildConsistentPrompt(
    scene.actionPrompt.trim() || "cinematic camera motion, natural movement"
  );

  // Pilih model Image-to-Video otomatis jika user mengunggah foto pada scene tersebut
  const isPhotoScene = scene.sourceType === "photo" && scene.localDataUrl;
  const activeModel = isPhotoScene ? "Wan-AI/Wan2.1-I2V-14B-480P" : selectedModel;

  const endpoints = [
    `https://router.huggingface.co/hf-inference/models/${activeModel}`,
    `https://api-inference.huggingface.co/models/${activeModel}`
  ];

  let payload;
  if (isPhotoScene) {
    const base64Data = scene.localDataUrl.split(",")[1];
    payload = {
      inputs: base64Data,
      parameters: { prompt: promptText }
    };
  } else {
    payload = {
      inputs: promptText,
      parameters: {
        seed: enableCharLock.checked
          ? parseInt(masterSeedInput.value, 10) || 482910
          : Math.floor(Math.random() * 999999)
      }
    };
  }

  for (const url of endpoints) {
    try {
      loaderStep.textContent = `Scene ${sceneIndex + 1}: Memanggil AI Video (${activeModel.split("/")[1]})...`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // Timeout 45 detik

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("video") || contentType.includes("octet-stream")) {
        const videoBlob = await response.blob();
        if (videoBlob.size < 5000) continue;

        const blobUrl = URL.createObjectURL(videoBlob);
        const videoEl = document.createElement("video");
        videoEl.src = blobUrl;
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.loop = true;

        await new Promise((resolve, reject) => {
          videoEl.onloadeddata = () => resolve();
          videoEl.onerror = () => reject(new Error("Gagal decode video HF"));
        });

        return {
          type: "video",
          element: videoEl,
          blobUrl
        };
      }
    } catch (err) {
      console.warn(`HF endpoint fallback (${url}):`, err.message);
    }
  }

  return null;
}

// Fallback Visual Image (Pollinations Flux + Foto Lokal)
function fetchFallbackSceneImage(scene, sceneIndex, width, height) {
  if (scene.sourceType === "photo" && scene.localImage) {
    return Promise.resolve({ type: "image", element: scene.localImage });
  }

  if (enableCharLock.checked && characterReferenceImage && !scene.actionPrompt.trim()) {
    return Promise.resolve({ type: "image", element: characterReferenceImage });
  }

  return new Promise((resolve) => {
    const isLocked = enableCharLock.checked;
    const baseSeed = parseInt(masterSeedInput.value, 10) || 482910;
    const seed = isLocked ? baseSeed : Math.floor(Math.random() * 999999);

    const fullPrompt = buildConsistentPrompt(scene.actionPrompt.trim());
    const encoded = encodeURIComponent(fullPrompt || "cinematic scene 8k");
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve({ type: "image", element: img });
    img.onerror = () => {
      if (characterReferenceImage) {
        resolve({ type: "image", element: characterReferenceImage });
        return;
      }
      const fallback = document.createElement("canvas");
      fallback.width = width;
      fallback.height = height;
      const fctx = fallback.getContext("2d");
      const grad = fctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(0.5, sceneIndex % 2 === 0 ? "#312e81" : "#1e3a8a");
      grad.addColorStop(1, "#0284c7");
      fctx.fillStyle = grad;
      fctx.fillRect(0, 0, width, height);
      resolve({ type: "image", element: fallback });
    };
    img.src = url;
  });
}

async function resolveSceneMedia(scene, sceneIndex, width, height) {
  // 1. Coba generate video AI nyata lewat Hugging Face Wan2.1 jika token terpasang
  const hfVideoMedia = await tryFetchHuggingFaceVideo(scene, sceneIndex);
  if (hfVideoMedia) return hfVideoMedia;

  // 2. Jika token kosong / kuota HF habis, langsung pakai Unlimited Hybrid Engine
  loaderStep.textContent = `Melukis Scene ${sceneIndex + 1}/${scenes.length} (Unlimited Engine)...`;
  return await fetchFallbackSceneImage(scene, sceneIndex, width, height);
}

// =========================================================================
// AUTO-CAPTION / SUBTITLE TIMELINE & RENDERER
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
      words.forEach((word) => {
        if ((chunk + " " + word).trim().length > 46 && chunk) {
          segments.push(chunk.trim());
          chunk = word;
        } else {
          chunk = (chunk + " " + word).trim();
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

function wrapCanvasText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

function fillRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
  ctx.fill();
}

function renderSubtitleOverlay(ctx, width, height, currentTimeSec, timeline, style) {
  if (style === "none" || !timeline || timeline.length === 0) return;

  const activeCue = timeline.find(
    (item) => currentTimeSec >= item.start && currentTimeSec <= item.end
  );
  if (!activeCue) return;

  const fadeTime = 0.14;
  const elapsed = currentTimeSec - activeCue.start;
  const remaining = activeCue.end - currentTimeSec;
  const alpha = Math.min(1, elapsed / fadeTime, remaining / fadeTime);

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  const isPortrait = height > width;
  const fontSize = Math.round(width * (isPortrait ? 0.043 : 0.032));
  const lineHeight = Math.round(fontSize * 1.35);
  const maxTextWidth = width * 0.84;
  const bottomSafeOffset = isPortrait ? height * 0.15 : height * 0.09;

  ctx.font =
    style === "tiktok"
      ? `800 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
      : `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = wrapCanvasText(ctx, activeCue.text, maxTextWidth);
  const blockHeight = lines.length * lineHeight;
  const startY = height - bottomSafeOffset - blockHeight + lineHeight / 2;

  let maxLineW = 0;
  lines.forEach((line) => {
    const w = ctx.measureText(line).width;
    if (w > maxLineW) maxLineW = w;
  });

  if (style === "cinema") {
    const padX = fontSize * 0.75;
    const padY = fontSize * 0.42;
    const boxW = maxLineW + padX * 2;
    const boxH = blockHeight + padY * 1.6;
    const boxX = (width - boxW) / 2;
    const boxY = startY - lineHeight / 2 - padY * 0.8;

    ctx.fillStyle = "rgba(8, 11, 19, 0.74)";
    fillRoundedRect(ctx, boxX, boxY, boxW, boxH, 14);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#f8fafc";
    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, startY + idx * lineHeight);
    });
  } else if (style === "tiktok") {
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(0, 0, 0, 0.92)";
    ctx.lineWidth = Math.max(4, Math.round(fontSize * 0.18));
    ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 3;

    lines.forEach((line, idx) => {
      const y = startY + idx * lineHeight;
      ctx.strokeText(line, width / 2, y);
      ctx.fillStyle = idx === 0 ? "#fde047" : "#ffffff";
      ctx.fillText(line, width / 2, y);
    });
  } else if (style === "minimal") {
    ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = "#ffffff";

    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, startY + idx * lineHeight);
    });
  }

  ctx.restore();
}

// =========================================================================
// AUDIO ENGINE (TTS PER SCENE / CUSTOM AUDIO + CINEMATIC BGM)
// =========================================================================

async function fetchTtsBuffer(audioCtx, text, voiceName) {
  if (!text || !text.trim()) return null;
  try {
    const ttsUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(
      voiceName
    )}&text=${encodeURIComponent(text.trim())}`;
    const res = await fetch(ttsUrl);
    if (!res.ok) return null;
    const arrBuf = await res.arrayBuffer();
    return await audioCtx.decodeAudioData(arrBuf);
  } catch (_) {
    return null;
  }
}

function setupMultiSceneAudio(audioCtx, scheduledVoClips, customFullVoBuffer, totalDurationSec) {
  const dest = audioCtx.createMediaStreamDestination();
  const masterGain = audioCtx.createGain();
  masterGain.gain.value = 1.0;

  masterGain.connect(dest);
  masterGain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;
  const activeNodes = [];
  const voGainLevel = parseInt(voVolume.value, 10) / 100;

  let hasAnyVo = false;

  if (customFullVoBuffer && voGainLevel > 0) {
    hasAnyVo = true;
    const src = audioCtx.createBufferSource();
    src.buffer = customFullVoBuffer;
    const gain = audioCtx.createGain();
    gain.gain.value = voGainLevel;
    src.connect(gain);
    gain.connect(masterGain);
    src.start(now + 0.3);
    activeNodes.push(src);
  } else if (scheduledVoClips.length > 0 && voGainLevel > 0) {
    scheduledVoClips.forEach((clip) => {
      if (!clip.buffer) return;
      hasAnyVo = true;
      const src = audioCtx.createBufferSource();
      src.buffer = clip.buffer;
      const gain = audioCtx.createGain();
      gain.gain.value = voGainLevel;
      src.connect(gain);
      gain.connect(masterGain);
      src.start(now + clip.startTime);
      activeNodes.push(src);
    });
  }

  const preset = bgmPreset.value;
  const baseBgmGain = (parseInt(bgmVolume.value, 10) / 100) * 0.28;

  if (preset !== "none" && baseBgmGain > 0.005) {
    const bgmGain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";

    const effectiveGain = hasAnyVo ? baseBgmGain * 0.45 : baseBgmGain;
    bgmGain.gain.setValueAtTime(0.001, now);
    bgmGain.gain.exponentialRampToValueAtTime(effectiveGain, now + 0.4);
    bgmGain.gain.setValueAtTime(effectiveGain, Math.max(now + 0.5, now + totalDurationSec - 0.8));
    bgmGain.gain.exponentialRampToValueAtTime(0.0001, now + totalDurationSec);

    filter.connect(bgmGain);
    bgmGain.connect(masterGain);

    let chords = [];
    let waveType = "sawtooth";
    let cutoffFreq = 750;

    if (preset === "ambient") {
      chords = [
        [73.42, 146.83, 174.61, 220.0, 261.63, 329.63],
        [58.27, 116.54, 174.61, 220.0, 261.63, 349.23]
      ];
      waveType = "sawtooth";
      cutoffFreq = 620;
    } else if (preset === "cyber") {
      chords = [
        [65.41, 130.81, 155.56, 196.0, 233.08],
        [51.91, 103.83, 155.56, 207.65, 261.63]
      ];
      waveType = "square";
      cutoffFreq = 520;
    } else if (preset === "piano") {
      chords = [
        [87.31, 174.61, 220.0, 261.63, 329.63],
        [55.0, 110.0, 164.81, 196.0, 246.94]
      ];
      waveType = "triangle";
      cutoffFreq = 1100;
    } else if (preset === "lofi") {
      chords = [
        [82.41, 164.81, 196.0, 246.94, 293.66],
        [55.0, 110.0, 164.81, 196.0, 220.0]
      ];
      waveType = "triangle";
      cutoffFreq = 680;
    }

    filter.frequency.setValueAtTime(cutoffFreq, now);

    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    lfo.frequency.value = preset === "cyber" ? 2.5 : 0.25;
    lfoGain.gain.value = preset === "cyber" ? 220 : 180;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);
    activeNodes.push(lfo);

    const halfDur = totalDurationSec / 2;
    chords.forEach((chordFreqs, idx) => {
      const startTime = now + idx * halfDur;
      const endTime = startTime + halfDur + 0.15;

      chordFreqs.forEach((freq, noteIndex) => {
        const osc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();

        osc.type = noteIndex === 0 ? "sine" : waveType;
        osc.frequency.setValueAtTime(freq, startTime);
        osc.detune.setValueAtTime((noteIndex % 2 === 0 ? 1 : -1) * 6, startTime);

        const noteLevel = noteIndex === 0 ? 0.55 : 0.18;
        noteGain.gain.setValueAtTime(0.001, startTime);
        noteGain.gain.linearRampToValueAtTime(noteLevel, startTime + 0.45);
        noteGain.gain.setValueAtTime(noteLevel, Math.max(startTime + 0.5, endTime - 0.45));
        noteGain.gain.linearRampToValueAtTime(0.0001, endTime);

        osc.connect(noteGain);
        noteGain.connect(filter);

        osc.start(startTime);
        osc.stop(endTime);
        activeNodes.push(osc);
      });
    });
  }

  return {
    stream: dest.stream,
    cleanup: () => {
      activeNodes.forEach((node) => {
        try {
          node.stop();
        } catch (_) {}
      });
      if (audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
    }
  };
}

// =========================================================================
// SEEK VIDEO HELPER & RENDER FRAME ADEGAN (MENDUKUNG KLIP VIDEO WAN2.1 & GAMBAR)
// =========================================================================

function seekVideoElement(videoEl, targetTime) {
  return new Promise((resolve) => {
    if (!videoEl.duration || isNaN(videoEl.duration)) {
      resolve();
      return;
    }
    const clampedTime = Math.min(videoEl.duration - 0.04, Math.max(0, targetTime));
    if (Math.abs(videoEl.currentTime - clampedTime) < 0.02) {
      resolve();
      return;
    }
    const timer = setTimeout(resolve, 120);
    videoEl.onseeked = () => {
      clearTimeout(timer);
      resolve();
    };
    videoEl.currentTime = clampedTime;
  });
}

async function drawSceneMediaFrame(ctx, media, motion, grade, progressT, width, height, alpha = 1) {
  const sourceEl = media.element;
  const isVideo = media.type === "video";

  if (isVideo && sourceEl.duration) {
    const vidTime = (progressT * sourceEl.duration) % sourceEl.duration;
    await seekVideoElement(sourceEl, vidTime);
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  if (grade === "cyber") ctx.filter = "contrast(1.15) saturate(1.3) hue-rotate(-10deg)";
  else if (grade === "warm") ctx.filter = "contrast(1.08) sepia(0.22) saturate(1.25)";
  else if (grade === "noir") ctx.filter = "grayscale(1) contrast(1.35)";
  else ctx.filter = "contrast(1.05) saturate(1.1)";

  const srcW = isVideo ? sourceEl.videoWidth || width : sourceEl.width || width;
  const srcH = isVideo ? sourceEl.videoHeight || height : sourceEl.height || height;
  const baseScale = Math.max(width / srcW, height / srcH);
  const ease = progressT * progressT * (3 - 2 * progressT);

  // Jika sumber sudah berupa klip video AI Wan2.1, gunakan zoom halus agar gerakan asli tetap natural
  let scale = isVideo ? baseScale * 1.03 : baseScale * 1.12;
  let offsetX = 0;
  let offsetY = 0;

  if (!isVideo) {
    if (motion === "dolly-in") {
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
      scale = baseScale * (1.1 + Math.sin(progressT * Math.PI) * 0.06);
      offsetX = Math.sin(progressT * Math.PI * 2) * width * 0.03;
      offsetY = Math.cos(progressT * Math.PI * 2) * height * 0.025;
    }
  }

  const drawW = srcW * scale;
  const drawH = srcH * scale;
  const drawX = (width - drawW) / 2 + offsetX;
  const drawY = (height - drawH) / 2 + offsetY;

  ctx.drawImage(sourceEl, drawX, drawY, drawW, drawH);
  ctx.restore();
}

// =========================================================================
// PIPELINE RENDER UTAMA MULTI-SCENE
// =========================================================================

btnGenerate.addEventListener("click", async () => {
  const dim = getCanvasDimensions(aspectRatio.value);
  const { width, height } = dim;

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    if (s.sourceType === "photo" && !s.localImage) {
      alert(`Scene ${i + 1} memakai mode Foto, silakan pilih fotonya terlebih dahulu!`);
      return;
    }
    if (s.sourceType === "ai" && !s.actionPrompt.trim() && !characterReferenceImage) {
      alert(`Isi deskripsi adegan untuk Scene ${i + 1} terlebih dahulu!`);
      return;
    }
  }

  btnGenerate.disabled = true;
  btnGenerateText.textContent = "⏳ Memproses Multi-Scene...";
  loaderOverlay.hidden = false;
  progressBar.style.width = "5%";

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioCtx();
  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }

  const preparedScenes = [];

  try {
    const selectedVoice = voVoice.value;
    const isCustomAudio = selectedVoice === "custom";

    let customFullVoBuffer = null;
    if (isCustomAudio && voFileUpload.files[0]) {
      loaderStep.textContent = "Memuat rekaman suara lokal...";
      const buf = await voFileUpload.files[0].arrayBuffer();
      customFullVoBuffer = await audioCtx.decodeAudioData(buf);
    }

    let timelineCursor = 0;
    const scheduledVoClips = [];
    let fullCaptionTimeline = [];
    let usedWanCount = 0;

    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      const basePct = Math.round(((i + 0.5) / scenes.length) * 45);
      progressBar.style.width = `${basePct}%`;

      const media = await resolveSceneMedia(s, i, width, height);
      if (media.type === "video") usedWanCount++;

      let sceneVoBuffer = null;
      if (!isCustomAudio && s.narration.trim()) {
        loaderStep.textContent = `Membuat Voiceover Scene ${i + 1}/${scenes.length}...`;
        sceneVoBuffer = await fetchTtsBuffer(audioCtx, s.narration, selectedVoice);
      }

      const minNeeded = sceneVoBuffer ? Math.ceil(sceneVoBuffer.duration + 0.6) : 0;
      const actualDuration = Math.max(s.duration, minNeeded);

      const sceneStart = timelineCursor;
      const sceneEnd = sceneStart + actualDuration;

      if (sceneVoBuffer) {
        scheduledVoClips.push({
          buffer: sceneVoBuffer,
          startTime: sceneStart + 0.25
        });
      }

      if (s.narration.trim()) {
        const speechDur = sceneVoBuffer ? sceneVoBuffer.duration : Math.max(1, actualDuration - 0.5);
        const sceneCues = buildCaptionTimeline(s.narration, sceneStart + 0.25, speechDur);
        fullCaptionTimeline = fullCaptionTimeline.concat(sceneCues);
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

    statusLabel.textContent =
      usedWanCount > 0
        ? `Merender ${usedWanCount} klip Wan2.1 AI Video...`
        : `Merender ${preparedScenes.length} Scene (Unlimited Engine)...`;

    const totalDurationSec = timelineCursor;

    renderCanvas.width = width;
    renderCanvas.height = height;
    renderCanvas.hidden = false;
    outputVideo.hidden = true;

    const ctx = renderCanvas.getContext("2d");
    const fps = 30;
    const totalFrames = Math.ceil(totalDurationSec * fps);
    const crossfadeSec = 0.45;

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.6 + 0.8,
      vx: (Math.random() - 0.5) * 0.7,
      vy: -Math.random() * 0.9 - 0.2,
      alpha: Math.random() * 0.65 + 0.2
    }));

    const audioSession = setupMultiSceneAudio(
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

    const supportedMimes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ];
    const mimeType =
      supportedMimes.find((type) => MediaRecorder.isTypeSupported(type)) || "video/webm";

    const recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 4_500_000,
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
        const blob = new Blob(chunks, { type: mimeType });
        resolve(URL.createObjectURL(blob));
      };
    });

    recorder.start();

    const grade = colorGrade.value;
    const withParticles = enableParticles.checked;
    const selectedCaptionStyle = captionStyle.value;

    for (let frame = 0; frame <= totalFrames; frame++) {
      const currentTimeSec = frame / fps;

      let activeIdx = preparedScenes.findIndex(
        (sc) => currentTimeSec >= sc.start && currentTimeSec < sc.end
      );
      if (activeIdx === -1) activeIdx = preparedScenes.length - 1;

      const currentSc = preparedScenes[activeIdx];
      const localProgress = Math.min(
        1,
        Math.max(0, (currentTimeSec - currentSc.start) / currentSc.duration)
      );

      ctx.clearRect(0, 0, width, height);

      await drawSceneMediaFrame(
        ctx,
        currentSc.media,
        currentSc.motion,
        grade,
        localProgress,
        width,
        height,
        1
      );

      if (withParticles && activeIdx < preparedScenes.length - 1) {
        const timeLeftInScene = currentSc.end - currentTimeSec;
        if (timeLeftInScene <= crossfadeSec) {
          const nextSc = preparedScenes[activeIdx + 1];
          const fadeAlpha = 1 - timeLeftInScene / crossfadeSec;
          await drawSceneMediaFrame(
            ctx,
            nextSc.media,
            nextSc.motion,
            grade,
            0,
            width,
            height,
            fadeAlpha
          );
        }
      }

      if (withParticles) {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < 0) p.y = height;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 245, 220, ${p.alpha})`;
          ctx.fill();
        });
      }

      const vig = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.3,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, "rgba(0,0,0,0.42)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);

      renderSubtitleOverlay(
        ctx,
        width,
        height,
        currentTimeSec,
        fullCaptionTimeline,
        selectedCaptionStyle
      );

      const renderPct = 45 + Math.round((frame / totalFrames) * 55);
      progressBar.style.width = `${renderPct}%`;
      loaderStep.textContent = `Merekam Scene ${activeIdx + 1}/${preparedScenes.length}... ${renderPct}%`;

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
    statusLabel.textContent = `Selesai! ${preparedScenes.length} Scene siap disimpan`;
  } catch (err) {
    console.error(err);
    statusLabel.textContent = "Terjadi kesalahan saat merender";
  } finally {
    loaderOverlay.hidden = true;
    btnGenerate.disabled = false;
    btnGenerateText.textContent = "🚀 Generate Semua Scene Jadi Video";
  }
});

btnReplay.addEventListener("click", () => {
  if (!lastVideoUrl) return;
  outputVideo.currentTime = 0;
  outputVideo.play();
});

renderScenesUI();
