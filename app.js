import * as webllm from "https://esm.run/@mlc-ai/web-llm";

const chatEl = document.getElementById("chat");
const inputEl = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const loadBtn = document.getElementById("loadBtn");
const clearBtn = document.getElementById("clearBtn");
const modelSelect = document.getElementById("modelSelect");
const statusEl = document.getElementById("status");
const barEl = document.getElementById("bar");
const gpuBadge = document.getElementById("gpuBadge");
const tempEl = document.getElementById("temp");
const tempVal = document.getElementById("tempVal");

tempEl.addEventListener("input", () => (tempVal.textContent = tempEl.value));

let engine = null;
let messages = [
  { role: "system", content: "You are a helpful AI assistant. Answer in Turkish unless the user asks otherwise." }
];

function setStatus(text, progress = null) {
  statusEl.textContent = text;
  if (progress === null) return;
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
  barEl.style.width = pct + "%";
}

function addMsg(role, text) {
  const div = document.createElement("div");
  div.className = `msg ${role === "user" ? "user" : "ai"}`;
  div.textContent = text;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight;
  return div;
}

function setUIEnabled(enabled) {
  inputEl.disabled = !enabled;
  sendBtn.disabled = !enabled;
  modelSelect.disabled = !enabled;
  loadBtn.disabled = !enabled;
  tempEl.disabled = !enabled;
}

function detectWebGPU() {
  const ok = !!navigator.gpu;
  gpuBadge.textContent = ok ? "WebGPU: Var ✅" : "WebGPU: Yok ⚠️ (daha yavaş olabilir)";
  gpuBadge.style.color = ok ? "#a7f3d0" : "#fca5a5";
}

detectWebGPU();

clearBtn.addEventListener("click", () => {
  chatEl.innerHTML = "";
  messages = [messages[0]];
  setStatus("Sohbet temizlendi.");
});

loadBtn.addEventListener("click", async () => {
  try {
    setUIEnabled(false);
    setStatus("Model yükleniyor… (ilk sefer uzun sürebilir)", 0);

    const selectedModel = modelSelect.value;

    const initProgressCallback = (p) => {
      // p = {progress, text, timeElapsed, ...}
      setStatus(`Model indiriliyor/yükleniyor… ${p.text ?? ""}`.trim(), p.progress ?? 0);
    };

    engine = await webllm.CreateMLCEngine(selectedModel, { initProgressCallback });

    setStatus("Model hazır ✅", 1);
    setUIEnabled(true);
    addMsg("ai", "Selam! Hazırım. Ne yapmak istiyorsun?");
  } catch (err) {
    console.error(err);
    setStatus("Hata: Model yüklenemedi. Konsolu (F12) kontrol et.");
    setUIEnabled(true);
  }
});

async function send() {
  const text = inputEl.value.trim();
  if (!text) return;
  if (!engine) {
    setStatus("Önce 'Modeli Yükle'ye bas.");
    return;
  }

  inputEl.value = "";
  addMsg("user", text);
  messages.push({ role: "user", content: text });

  const aiBubble = addMsg("assistant", "…");
  aiBubble.textContent = "";

  setUIEnabled(false);
  setStatus("Yanıt üretiliyor…");

  try {
    const temperature = Number(tempEl.value);

    const chunks = await engine.chat.completions.create({
      messages,
      stream: true,
      temperature,
      stream_options: { include_usage: true },
    });

    let reply = "";
    let usage = null;

    for await (const chunk of chunks) {
      const delta = chunk.choices?.[0]?.delta?.content || "";
      reply += delta;
      aiBubble.textContent = reply || "…";
      chatEl.scrollTop = chatEl.scrollHeight;

      if (chunk.usage) usage = chunk.usage;
    }

    messages.push({ role: "assistant", content: reply });

    if (usage) {
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `tokens: prompt=${usage.prompt_tokens}, completion=${usage.completion_tokens}, total=${usage.total_tokens}`;
      aiBubble.appendChild(meta);
    }

    setStatus("Hazır.");
  } catch (err) {
    console.error(err);
    aiBubble.textContent = "Hata oldu. Tekrar dene.";
    setStatus("Hata: Yanıt üretilemedi.");
  } finally {
    setUIEnabled(true);
  }
}

sendBtn.addEventListener("click", send);

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});
