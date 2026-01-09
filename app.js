// ===== Firebase CDN (kurulumsuz) =====
// Firebase CDN module import formatı (alternate setup) Firebase docs'ta var. :contentReference[oaicite:5]{index=5}
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  reload
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// ========= 1) Firebase config (BURAYI DOLDUR) =========
const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// ========= App init =========
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ========= UI helpers =========
const $ = (sel) => document.querySelector(sel);

function toast(msg, ms = 2400) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("hidden"), ms);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function autoGrowTextarea(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 160) + "px";
}

// ========= Local settings (API key vs) =========
const LS_KEY = "ai_chat_settings_v1";
function loadSettings() {
  const raw = localStorage.getItem(LS_KEY);
  const base = {
    apiKey: "",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    model: "gpt-5.2",
    temperature: 0.7,
    systemPrompt: ""
  };
  if (!raw) return base;
  try { return { ...base, ...JSON.parse(raw) }; } catch { return base; }
}
function saveSettings(s) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

let settings = loadSettings();

// ========= State =========
let currentUser = null;
let activeConvId = null;
let aborter = null;

// ========= Views =========
const authView = $("#authView");
const mainView = $("#mainView");
const verifyBox = $("#verifyBox");

function showAuth() {
  authView.classList.remove("hidden");
  mainView.classList.add("hidden");
}
function showMain() {
  authView.classList.add("hidden");
  mainView.classList.remove("hidden");
}

function setModelLabel() {
  $("#modelLabel").textContent = `Model: ${settings.model || "—"}`;
}

// ========= Auth tabs =========
$("#tabLogin").onclick = () => {
  $("#tabLogin").classList.add("active");
  $("#tabRegister").classList.remove("active");
  $("#loginForm").classList.remove("hidden");
  $("#registerForm").classList.add("hidden");
};

$("#tabRegister").onclick = () => {
  $("#tabRegister").classList.add("active");
  $("#tabLogin").classList.remove("active");
  $("#registerForm").classList.remove("hidden");
  $("#loginForm").classList.add("hidden");
};

// ========= Register / Login =========
$("#btnRegister").onclick = async () => {
  const email = $("#regEmail").value.trim();
  const p1 = $("#regPass").value;
  const p2 = $("#regPass2").value;
  if (!email || !p1) return toast("Email ve şifre lazım.");
  if (p1.length < 6) return toast("Şifre en az 6 karakter olmalı.");
  if (p1 !== p2) return toast("Şifreler aynı değil.");

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, p1);

    // Email verification (Firebase resmi örnek) :contentReference[oaicite:6]{index=6}
    await sendEmailVerification(cred.user, {
      url: window.location.origin, // verify sonrası geri dönsün
      handleCodeInApp: false
    });

    toast("Doğrulama maili gönderildi.");
    verifyBox.classList.remove("hidden");
  } catch (e) {
    toast(e.message || "Kayıt hatası.");
  }
};

$("#btnLogin").onclick = async () => {
  const email = $("#loginEmail").value.trim();
  const pass = $("#loginPass").value;
  if (!email || !pass) return toast("Email ve şifre lazım.");

  try {
    await signInWithEmailAndPassword(auth, email, pass);
  } catch (e) {
    toast(e.message || "Giriş hatası.");
  }
};

$("#btnForgot").onclick = async () => {
  const email = $("#loginEmail").value.trim();
  if (!email) return toast("Önce email yaz.");
  try {
    await sendPasswordResetEmail(auth, email);
    toast("Şifre sıfırlama maili gönderildi.");
  } catch (e) {
    toast(e.message || "Gönderilemedi.");
  }
};

$("#btnResendVerify").onclick = async () => {
  try {
    if (!auth.currentUser) return;
    await sendEmailVerification(auth.currentUser, { url: window.location.origin });
    toast("Tekrar gönderildi.");
  } catch (e) {
    toast(e.message || "Gönderilemedi.");
  }
};

$("#btnIverif").onclick = async () => {
  try {
    if (!auth.currentUser) return;
    await reload(auth.currentUser);
    if (auth.currentUser.emailVerified) {
      toast("Doğrulandı ✅");
      verifyBox.classList.add("hidden");
      await afterLoginReady();
    } else {
      toast("Hâlâ doğrulanmamış görünüyor. Maildeki linke tıkla.");
    }
  } catch (e) {
    toast("Kontrol edemedim.");
  }
};

$("#btnLogoutFromVerify").onclick = async () => {
  await signOut(auth);
};

// ========= Main buttons =========
$("#btnLogout").onclick = async () => { await signOut(auth); };

$("#btnNewChat").onclick = async () => { await createConversationAndOpen(); };

$("#btnSettings").onclick = () => openSettings();
$("#btnCloseSettings").onclick = () => closeSettings();
$("#modalBackdrop").onclick = () => closeSettings();

$("#btnSaveSettings").onclick = () => {
  settings.apiKey = $("#apiKey").value.trim();
  settings.apiUrl = $("#apiUrl").value.trim();
  settings.model = $("#model").value.trim();
  settings.temperature = Number($("#temp").value || 0.7);
  settings.systemPrompt = $("#systemPrompt").value;
  saveSettings(settings);
  setModelLabel();
  toast("Kaydedildi.");
  closeSettings();
};

$("#btnClearLocal").onclick = () => {
  settings.apiKey = "";
  saveSettings(settings);
  $("#apiKey").value = "";
  toast("Bu cihazdaki key silindi.");
};

function openSettings() {
  $("#apiKey").value = settings.apiKey || "";
  $("#apiUrl").value = settings.apiUrl || "";
  $("#model").value = settings.model || "";
  $("#temp").value = String(settings.temperature ?? 0.7);
  $("#systemPrompt").value = settings.systemPrompt || "";

  $("#modalBackdrop").classList.remove("hidden");
  $("#settingsModal").classList.remove("hidden");
}
function closeSettings() {
  $("#modalBackdrop").classList.add("hidden");
  $("#settingsModal").classList.add("hidden");
}

// ========= Chat input =========
const input = $("#input");
input.addEventListener("input", () => autoGrowTextarea(input));
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    $("#btnSend").click();
  }
});

$("#btnSend").onclick = async () => {
  const text = input.value.trim();
  if (!text) return;

  if (!activeConvId) {
    await createConversationAndOpen();
  }

  input.value = "";
  autoGrowTextarea(input);

  await sendMessage(text);
};

// ========= Firestore paths =========
function userDocRef(uid) { return doc(db, "users", uid); }
function convColRef(uid) { return collection(db, "users", uid, "conversations"); }
function convDocRef(uid, cid) { return doc(db, "users", uid, "conversations", cid); }
function msgColRef(uid, cid) { return collection(db, "users", uid, "conversations", cid, "messages"); }

// ========= Data ops =========
async function ensureUserDoc(u) {
  const ref = userDocRef(u.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: u.email || "",
      createdAt: serverTimestamp()
    });
  }
}

async function loadConversations() {
  const listEl = $("#chatList");
  listEl.innerHTML = "";

  const q = query(convColRef(currentUser.uid), orderBy("updatedAt", "desc"), limit(50));
  const snap = await getDocs(q);

  const items = [];
  snap.forEach(d => items.push({ id: d.id, ...d.data() }));

  if (items.length === 0) {
    listEl.innerHTML = `<div class="hint">Henüz sohbet yok. “Yeni sohbet”e bas.</div>`;
    return;
  }

  for (const c of items) {
    const div = document.createElement("div");
    div.className = "chat-item" + (c.id === activeConvId ? " active" : "");
    const title = c.title || "Yeni sohbet";
    const sub = (c.lastPreview || "").slice(0, 60);
    div.innerHTML = `
      <div class="t">${escapeHtml(title)}</div>
      <div class="s">${escapeHtml(sub || "—")}</div>
    `;
    div.onclick = () => openConversation(c.id);
    listEl.appendChild(div);
  }
}

async function createConversationAndOpen() {
  const ref = await addDoc(convColRef(currentUser.uid), {
    title: "Yeni sohbet",
    lastPreview: "",
    model: settings.model || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  await openConversation(ref.id);
}

async function openConversation(cid) {
  activeConvId = cid;
  await loadConversations();

  $("#messages").innerHTML = "";

  const q = query(msgColRef(currentUser.uid, cid), orderBy("createdAt", "asc"), limit(200));
  const snap = await getDocs(q);
  const msgs = [];
  snap.forEach(d => msgs.push({ id: d.id, ...d.data() }));

  for (const m of msgs) renderMessage(m.role, m.content || "", m.id);

  scrollToBottom();
}

function scrollToBottom() {
  const box = $("#messages");
  box.scrollTop = box.scrollHeight;
}

// ========= Render messages =========
function renderMessage(role, content, id = "") {
  const box = $("#messages");
  const wrap = document.createElement("div");
  wrap.className = `msg ${role === "user" ? "user" : "assistant"}`;
  wrap.dataset.mid = id;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `<span>${role === "user" ? "Sen" : "AI"}</span>`;

  if (role !== "user") {
    const copy = document.createElement("button");
    copy.className = "copy";
    copy.textContent = "Kopyala";
    copy.onclick = async () => {
      await navigator.clipboard.writeText(content || "");
      toast("Kopyalandı.");
    };
    meta.appendChild(copy);
  }

  const body = document.createElement("div");
  body.className = "body";
  body.innerHTML = formatText(content);

  wrap.appendChild(meta);
  wrap.appendChild(body);
  box.appendChild(wrap);
  scrollToBottom();

  return wrap;
}

function updateMessage(mid, newContent) {
  const el = document.querySelector(`.msg[data-mid="${mid}"] .body`);
  if (el) el.innerHTML = formatText(newContent);
}

function formatText(t) {
  // Basit: HTML escape + \n -> <br>
  return escapeHtml(t).replace(/\n/g, "<br>");
}

function renderThinkingBubble() {
  const box = $("#messages");
  const wrap = document.createElement("div");
  wrap.className = "msg assistant";
  wrap.dataset.thinking = "1";
  wrap.innerHTML = `
    <div class="meta"><span>AI</span></div>
    <div class="body">
      <span class="thinking"><i></i><i></i><i></i></span>
    </div>
  `;
  box.appendChild(wrap);
  scrollToBottom();
  return wrap;
}

function removeThinkingBubble() {
  const el = document.querySelector(`.msg[data-thinking="1"]`);
  if (el) el.remove();
}

// ========= AI call (OpenAI uyumlu Chat Completions) =========
// Chat Completions + stream paramı OpenAI dokümanında var. :contentReference[oaicite:7]{index=7}
async function callChatCompletionsStream({ apiKey, url, model, messages, temperature, signal, onDelta }) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream: true
    }),
    signal
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`API hata: ${res.status} ${errText}`.slice(0, 300));
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buf = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    const lines = buf.split("\n");
    buf = lines.pop() || "";

    for (let line of lines) {
      line = line.trim();
      if (!line.startsWith("data:")) continue;

      const data = line.slice(5).trim();
      if (data === "[DONE]") return;

      let j;
      try { j = JSON.parse(data); } catch { continue; }

      const delta = j?.choices?.[0]?.delta?.content;
      if (delta) onDelta(delta);
    }
  }
}

// ========= Send message flow =========
async function sendMessage(text) {
  // Settings check
  if (!settings.apiKey) {
    toast("Önce Ayarlar’dan API Key gir.");
    openSettings();
    return;
  }
  if (!settings.apiUrl) return toast("Endpoint boş olamaz.");

  // 1) Firestore: user msg
  const uid = currentUser.uid;
  const cid = activeConvId;

  const userMsgRef = await addDoc(msgColRef(uid, cid), {
    role: "user",
    content: text,
    createdAt: serverTimestamp()
  });

  renderMessage("user", text, userMsgRef.id);

  // 2) Firestore: assistant placeholder (tek seferlik doc)
  const assistantRef = await addDoc(msgColRef(uid, cid), {
    role: "assistant",
    content: "",
    createdAt: serverTimestamp()
  });

  const thinkingEl = renderThinkingBubble();

  // UI Stop
  $("#btnStop").classList.remove("hidden");
  aborter = new AbortController();

  // 3) Build messages for API (son 20 mesaj)
  const recent = await getDocs(query(msgColRef(uid, cid), orderBy("createdAt", "asc"), limit(50)));
  const msgs = [];
  recent.forEach(d => {
    const m = d.data();
    if (m?.role && typeof m?.content === "string") {
      msgs.push({ role: m.role, content: m.content });
    }
  });

  if (settings.systemPrompt?.trim()) {
    msgs.unshift({ role: "system", content: settings.systemPrompt.trim() });
  }

  // 4) Stream call
  let full = "";
  let lastSaveAt = 0;

  try {
    await callChatCompletionsStream({
      apiKey: settings.apiKey,
      url: settings.apiUrl,
      model: settings.model,
      messages: msgs,
      temperature: settings.temperature,
      signal: aborter.signal,
      onDelta: (chunk) => {
        full += chunk;

        // düşünme bubble kalksın, gerçek mesaj render edilsin
        if (thinkingEl) removeThinkingBubble();

        // İlk kez render et
        const existing = document.querySelector(`.msg[data-mid="${assistantRef.id}"]`);
        if (!existing) {
          renderMessage("assistant", full, assistantRef.id);
        } else {
          updateMessage(assistantRef.id, full);
        }

        // Firestore’a her token yazmak pahalı -> throttle (2sn)
        const now = Date.now();
        if (now - lastSaveAt > 2000) {
          lastSaveAt = now;
          updateDoc(doc(db, "users", uid, "conversations", cid, "messages", assistantRef.id), {
            content: full
          }).catch(() => {});
        }
      }
    });

    // final save
    await updateDoc(doc(db, "users", uid, "conversations", cid, "messages", assistantRef.id), {
      content: full
    });

    // conversation metadata update
    const title = (text || "Yeni sohbet").slice(0, 40);
    await updateDoc(convDocRef(uid, cid), {
      title: title,
      lastPreview: full.slice(0, 80),
      updatedAt: serverTimestamp(),
      model: settings.model || ""
    });

    await loadConversations();
  } catch (e) {
    removeThinkingBubble();
    // assistant msg’i sil veya hata yaz
    await updateDoc(doc(db, "users", uid, "conversations", cid, "messages", assistantRef.id), {
      content: `⚠️ Hata: ${e.message || e}`
    }).catch(async () => {
      // olmazsa sil
      await deleteDoc(doc(db, "users", uid, "conversations", cid, "messages", assistantRef.id)).catch(() => {});
    });
    renderMessage("assistant", `⚠️ Hata: ${e.message || e}`, assistantRef.id);
  } finally {
    $("#btnStop").classList.add("hidden");
    aborter = null;
  }
}

$("#btnStop").onclick = () => {
  if (aborter) {
    aborter.abort();
    toast("Durduruldu.");
  }
};

// ========= Auth state =========
onAuthStateChanged(auth, async (u) => {
  currentUser = u;

  if (!u) {
    showAuth();
    verifyBox.classList.add("hidden");
    return;
  }

  $("#meEmail").textContent = u.email || "—";

  // email verification gate
  if (!u.emailVerified) {
    showAuth();
    verifyBox.classList.remove("hidden");
    toast("E-postanı doğrulamalısın.");
    return;
  }

  await afterLoginReady();
});

async function afterLoginReady() {
  showMain();
  setModelLabel();

  await ensureUserDoc(currentUser);

  // list conversations
  await loadConversations();

  // otomatik ilk chat yoksa oluştur
  if (!activeConvId) {
    const snap = await getDocs(query(convColRef(currentUser.uid), orderBy("updatedAt", "desc"), limit(1)));
    if (snap.empty) {
      await createConversationAndOpen();
    } else {
      const first = snap.docs[0];
      await openConversation(first.id);
    }
  }
}
