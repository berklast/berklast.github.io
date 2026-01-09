// ========================
// AI Chat v2 (Firebase + GitHub Pages + Worker Gateway)
// - Email/Pass Auth + Email verification
// - Firestore: sohbet listesi + mesajlar
// - OpenAI çağrısı: Cloudflare Worker (CORS ve key gizleme)
// ========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  reload
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// ✅ Senin Firebase config (değişirse burayı güncelle)
const firebaseConfig = {
  apiKey: "AIzaSyBuLkEI4HXOtl6RTGNRXadflBu6YGsX9F8",
  authDomain: "skylanda-211e2.firebaseapp.com",
  projectId: "skylanda-211e2",
  storageBucket: "skylanda-211e2.firebasestorage.app",
  messagingSenderId: "225103922974",
  appId: "1:225103922974:web:c3761c5ce3201c8a466b0f",
  measurementId: "G-DJMF29LBWL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ========================
// SADECE SEN + 1 ARKADAŞ (isteğe bağlı kilit)
// (E-posta adreslerini buraya yaz)
// ========================
const ALLOWED_EMAILS = [
  "SENIN_MAILIN@gmail.com",
  "ARKADASIN_MAILI@gmail.com"
];

// ========================
// Settings (localStorage)
// ========================
const DEFAULTS = {
  gatewayUrl: "",      // Worker URL
  gatewayToken: "",    // Worker APP_TOKEN
  model: "gpt-4o-mini",
  temperature: 0.7,
  systemPrompt: "Türkçe cevap ver. Kısa ve net ol."
};

function loadSettings(){
  try{
    const raw = localStorage.getItem("ai_settings_v2");
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
  }catch{
    return { ...DEFAULTS };
  }
}
function saveSettings(s){
  localStorage.setItem("ai_settings_v2", JSON.stringify(s));
}

let settings = loadSettings();

// ========================
// UI refs
// ========================
const $ = (id) => document.getElementById(id);

const tabLogin = $("tabLogin");
const tabRegister = $("tabRegister");
const loginForm = $("loginForm");
const registerForm = $("registerForm");
const loginHint = $("loginHint");
const regHint = $("regHint");

const loginEmail = $("loginEmail");
const loginPass = $("loginPass");
const regEmail = $("regEmail");
const regPass = $("regPass");
const regPass2 = $("regPass2");
const forgotBtn = $("forgotBtn");

const authBox = $("authBox");
const verifyBox = $("verifyBox");
const verifyHint = $("verifyHint");
const resendBtn = $("resendBtn");
const checkedBtn = $("checkedBtn");

const appPanel = $("appPanel");
const userChip = $("userChip");
const logoutBtn = $("logoutBtn");
const newChatBtn = $("newChatBtn");
const chatList = $("chatList");

const messagesEl = $("messages");
const emptyState = $("emptyState");

const promptEl = $("prompt");
const sendBtn = $("sendBtn");
const tinyHint = $("tinyHint");
const chatTitle = $("chatTitle");
const chatSub = $("chatSub");
const modelPill = $("modelPill");

// modal
const modal = $("modal");
const settingsBtn = $("settingsBtn");
const closeModal = $("closeModal");
const gatewayUrlEl = $("gatewayUrl");
const gatewayTokenEl = $("gatewayToken");
const modelEl = $("model");
const tempEl = $("temp");
const systemPromptEl = $("systemPrompt");
const resetSettingsBtn = $("resetSettings");
const saveSettingsBtn = $("saveSettings");
const settingsHint = $("settingsHint");

// ========================
// Helpers
// ========================
function setHint(el, msg, isError=false){
  el.textContent = msg || "";
  el.style.color = isError ? "#ffb4b4" : "var(--muted)";
}

function allowedEmail(email){
  if (!email) return false;
  // allowlist boşsa herkes girer (istersen bunu kaldır)
  const list = ALLOWED_EMAILS.filter(x => x.includes("@"));
  if (list.length === 0) return true;
  return list.includes(email.toLowerCase());
}

function formatTime(ts){
  try{
    const d = ts?.toDate ? ts.toDate() : new Date();
    return d.toLocaleString("tr-TR", { hour:"2-digit", minute:"2-digit" });
  }catch{
    return "";
  }
}

function autosizeTextarea(){
  promptEl.style.height = "auto";
  promptEl.style.height = Math.min(promptEl.scrollHeight, 180) + "px";
}
promptEl.addEventListener("input", autosizeTextarea);

// ========================
// Tabs
// ========================
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
});

tabRegister.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

// ========================
// Auth actions
// ========================
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setHint(loginHint, "");
  const email = loginEmail.value.trim().toLowerCase();
  const pass = loginPass.value;

  if (!allowedEmail(email)){
    setHint(loginHint, "Bu site özel. Bu e-posta izinli değil.", true);
    return;
  }

  try{
    await signInWithEmailAndPassword(auth, email, pass);
  }catch(err){
    setHint(loginHint, err?.message || "Giriş hatası", true);
  }
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setHint(regHint, "");
  const email = regEmail.value.trim().toLowerCase();
  const pass = regPass.value;
  const pass2 = regPass2.value;

  if (!allowedEmail(email)){
    setHint(regHint, "Bu site özel. Bu e-posta izinli değil.", true);
    return;
  }
  if (pass !== pass2){
    setHint(regHint, "Şifreler aynı değil.", true);
    return;
  }

  try{
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await sendEmailVerification(cred.user, { url: window.location.origin });
    setHint(regHint, "Kayıt tamam. Doğrulama maili gönderildi.");
  }catch(err){
    setHint(regHint, err?.message || "Kayıt hatası", true);
  }
});

forgotBtn.addEventListener("click", async () => {
  setHint(loginHint, "");
  const email = loginEmail.value.trim().toLowerCase();
  if (!email) return setHint(loginHint, "E-posta yaz.", true);
  try{
    await sendPasswordResetEmail(auth, email);
    setHint(loginHint, "Şifre sıfırlama maili gönderildi.");
  }catch(err){
    setHint(loginHint, err?.message || "Hata", true);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// verify box
resendBtn.addEventListener("click", async () => {
  setHint(verifyHint, "");
  const u = auth.currentUser;
  if (!u) return;
  try{
    await sendEmailVerification(u, { url: window.location.origin });
    setHint(verifyHint, "Tekrar gönderildi.");
  }catch(err){
    setHint(verifyHint, err?.message || "Hata", true);
  }
});

checkedBtn.addEventListener("click", async () => {
  setHint(verifyHint, "");
  const u = auth.currentUser;
  if (!u) return;
  await reload(u);
  if (u.emailVerified){
    setHint(verifyHint, "Doğrulandı ✅");
    // UI refresh
    renderAuthState(u);
  }else{
    setHint(verifyHint, "Hâlâ doğrulanmamış. Maildeki linke tıkla.", true);
  }
});

// ========================
// App state (chat)
// ========================
let currentUser = null;
let unsubChatList = null;
let unsubMessages = null;

let activeConvId = null;
let activeConvTitle = "Yeni sohbet";

function convRef(uid, convId){
  return doc(db, "users", uid, "conversations", convId);
}
function msgsCol(uid, convId){
  return collection(db, "users", uid, "conversations", convId, "messages");
}

function clearMessages(){
  messagesEl.innerHTML = "";
  messagesEl.appendChild(emptyState);
}

function addMessageBubble(role, text, meta=""){
  emptyState.classList.add("hidden");

  const wrap = document.createElement("div");
  wrap.className = `msg ${role === "user" ? "user" : "assistant"}`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text || "";

  const metaEl = document.createElement("div");
  metaEl.className = "meta";
  metaEl.textContent = meta || "";

  const col = document.createElement("div");
  col.appendChild(bubble);
  if (meta) col.appendChild(metaEl);

  wrap.appendChild(col);
  messagesEl.appendChild(wrap);

  messagesEl.scrollTop = messagesEl.scrollHeight;
  return { bubble };
}

function addTypingBubble(){
  const wrap = document.createElement("div");
  wrap.className = "msg assistant";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `<span class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>`;
  wrap.appendChild(bubble);
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  return {
    setText: (t) => { bubble.textContent = t; messagesEl.scrollTop = messagesEl.scrollHeight; },
    remove: () => wrap.remove()
  };
}

function renderChatHeader(){
  chatTitle.textContent = activeConvId ? activeConvTitle : "Giriş yap";
  chatSub.textContent = activeConvId ? "Enter: gönder • Shift+Enter: alt satır" : "Sohbetlerini kaydet, eski sohbetlere dön.";
  modelPill.textContent = `Model: ${settings.model || "—"}`;
}

async function createNewChat(){
  if (!currentUser) return;
  const uid = currentUser.uid;

  const title = "Yeni sohbet";
  const conv = await addDoc(collection(db, "users", uid, "conversations"), {
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastMessage: ""
  });

  activeConvId = conv.id;
  activeConvTitle = title;
  renderChatHeader();
  await loadConversation(activeConvId);
}

newChatBtn.addEventListener("click", createNewChat);

// Chat list listener
function listenChatList(){
  if (!currentUser) return;
  const uid = currentUser.uid;

  if (unsubChatList) unsubChatList();

  const q = query(
    collection(db, "users", uid, "conversations"),
    orderBy("updatedAt", "desc"),
    limit(40)
  );

  unsubChatList = onSnapshot(q, (snap) => {
    chatList.innerHTML = "";
    snap.forEach((d) => {
      const data = d.data();
      const item = document.createElement("div");
      item.className = "chatItem" + (d.id === activeConvId ? " active" : "");
      item.innerHTML = `
        <div class="chatItemTitle">${escapeHtml(data.title || "Sohbet")}</div>
        <div class="chatItemSub">${escapeHtml(data.lastMessage || "")}</div>
      `;
      item.addEventListener("click", async () => {
        activeConvId = d.id;
        activeConvTitle = data.title || "Sohbet";
        renderChatHeader();
        await loadConversation(activeConvId);
        [...chatList.children].forEach(x => x.classList.remove("active"));
        item.classList.add("active");
      });
      chatList.appendChild(item);
    });
  });
}

function escapeHtml(s){
  return (s||"").replace(/[&<>"']/g, (c)=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

// Messages listener
async function loadConversation(convId){
  if (!currentUser || !convId) return;
  const uid = currentUser.uid;

  if (unsubMessages) unsubMessages();

  clearMessages();
  renderChatHeader();

  const q = query(msgsCol(uid, convId), orderBy("createdAt", "asc"), limit(200));
  unsubMessages = onSnapshot(q, (snap) => {
    // basit render (temiz çizmek yerine incremental istersen söylerim)
    messagesEl.innerHTML = "";
    snap.forEach((d) => {
      const m = d.data();
      addMessageBubble(m.role, m.text, formatTime(m.createdAt));
    });
    if (snap.size === 0) {
      emptyState.classList.remove("hidden");
      messagesEl.appendChild(emptyState);
    } else {
      emptyState.classList.add("hidden");
    }
  });
}

// ========================
// Sending messages
// ========================
promptEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    sendBtn.click();
  }
});

sendBtn.addEventListener("click", async () => {
  tinyHint.textContent = "";
  if (!currentUser) return;

  if (!currentUser.emailVerified){
    tinyHint.textContent = "Önce e-postanı doğrula.";
    return;
  }

  if (!activeConvId){
    await createNewChat();
  }

  const text = promptEl.value.trim();
  if (!text) return;

  if (!settings.gatewayUrl){
    tinyHint.textContent = "Ayarlar → Gateway (Worker) URL gir.";
    openModal();
    return;
  }

  promptEl.value = "";
  autosizeTextarea();

  const uid = currentUser.uid;
  const convId = activeConvId;

  // save user message
  await addDoc(msgsCol(uid, convId), {
    role: "user",
    text,
    createdAt: serverTimestamp()
  });

  // update conversation preview
  await setDoc(convRef(uid, convId), {
    updatedAt: serverTimestamp(),
    lastMessage: text.slice(0, 80),
    title: activeConvTitle || "Sohbet"
  }, { merge: true });

  // prepare context (last 30 messages)
  const history = await buildHistory(uid, convId, 30);

  // stream assistant
  const typing = addTypingBubble();
  let acc = "";

  try{
    await callGatewayStream({
      gatewayUrl: settings.gatewayUrl,
      gatewayToken: settings.gatewayToken,
      model: settings.model,
      temperature: Number(settings.temperature ?? 0.7),
      systemPrompt: settings.systemPrompt,
      history,
      onDelta: (chunk) => {
        acc += chunk;
        typing.setText(acc);
      }
    });

    typing.remove();
    await addDoc(msgsCol(uid, convId), {
      role: "assistant",
      text: acc || "(boş)",
      createdAt: serverTimestamp()
    });

    await setDoc(convRef(uid, convId), {
      updatedAt: serverTimestamp(),
      lastMessage: (acc || "").slice(0, 80)
    }, { merge: true });

  }catch(err){
    typing.remove();
    addMessageBubble("assistant", `Hata: ${err?.message || err}`, "");
  }
});

async function buildHistory(uid, convId, maxCount){
  // Firestore’dan son mesajları çekmek için snapshot yerine basit yol:
  // burada minimal tutuyoruz: realtime zaten ekranda var.
  // İstersen daha iyi sorgu yazarım.
  const q = query(msgsCol(uid, convId), orderBy("createdAt","desc"), limit(maxCount));
  return new Promise((resolve) => {
    const unsub = onSnapshot(q, (snap) => {
      unsub();
      const arr = [];
      snap.forEach(d => {
        const m = d.data();
        if (m?.role && typeof m.text === "string") arr.push({ role: m.role, content: m.text });
      });
      resolve(arr.reverse());
    });
  });
}

// ========================
// OpenAI Gateway (Worker) streaming
// Client parses Chat Completions stream chunks: choices[].delta.content :contentReference[oaicite:3]{index=3}
// ========================
async function callGatewayStream({
  gatewayUrl,
  gatewayToken,
  model,
  temperature,
  systemPrompt,
  history,
  onDelta
}){
  // messages format for chat/completions
  const messages = [];
  if (systemPrompt) messages.push({ role:"system", content: systemPrompt });
  for (const m of history) messages.push(m);

  const resp = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(gatewayToken ? { "x-app-token": gatewayToken } : {})
    },
    body: JSON.stringify({
      model,
      temperature,
      stream: true,
      messages
    })
  });

  if (!resp.ok){
    const t = await resp.text().catch(()=> "");
    throw new Error(`Gateway hata (${resp.status}): ${t.slice(0,200)}`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while(true){
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream:true });

    // SSE parse
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1){
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      const lines = rawEvent.split("\n");
      for (const line of lines){
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;

        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;

        try{
          const json = JSON.parse(data);
          const delta = json?.choices?.[0]?.delta?.content;
          if (delta) onDelta(delta);
        }catch{
          // ignore
        }
      }
    }
  }
}

// ========================
// Modal (settings)
// ========================
function openModal(){
  gatewayUrlEl.value = settings.gatewayUrl || "";
  gatewayTokenEl.value = settings.gatewayToken || "";
  modelEl.value = settings.model || "";
  tempEl.value = String(settings.temperature ?? 0.7);
  systemPromptEl.value = settings.systemPrompt || "";
  setHint(settingsHint, "");
  modal.classList.remove("hidden");
}

function closeModalFn(){
  modal.classList.add("hidden");
}

settingsBtn?.addEventListener("click", openModal);
closeModal.addEventListener("click", closeModalFn);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModalFn();
});

resetSettingsBtn.addEventListener("click", () => {
  settings = { ...DEFAULTS };
  saveSettings(settings);
  openModal();
  setHint(settingsHint, "Sıfırlandı.");
  renderChatHeader();
});

saveSettingsBtn.addEventListener("click", () => {
  settings = {
    gatewayUrl: gatewayUrlEl.value.trim(),
    gatewayToken: gatewayTokenEl.value.trim(),
    model: modelEl.value.trim() || DEFAULTS.model,
    temperature: Number(tempEl.value || DEFAULTS.temperature),
    systemPrompt: systemPromptEl.value
  };
  saveSettings(settings);
  setHint(settingsHint, "Kaydedildi ✅");
  renderChatHeader();
});

// ========================
// Auth state render
// ========================
function renderAuthState(user){
  const loggedIn = !!user;
  currentUser = user || null;

  if (!loggedIn){
    authBox.classList.remove("hidden");
    verifyBox.classList.add("hidden");
    appPanel.classList.add("hidden");
    activeConvId = null;
    activeConvTitle = "Yeni sohbet";
    clearMessages();
    renderChatHeader();
    return;
  }

  // allowlist check
  if (!allowedEmail(user.email?.toLowerCase())){
    signOut(auth);
    return;
  }

  authBox.classList.add("hidden");

  if (!user.emailVerified){
    verifyBox.classList.remove("hidden");
    appPanel.classList.add("hidden");
    userChip.textContent = user.email || "—";
    clearMessages();
    renderChatHeader();
    return;
  }

  verifyBox.classList.add("hidden");
  appPanel.classList.remove("hidden");
  userChip.textContent = user.email || "—";

  listenChatList();
  renderChatHeader();
}

onAuthStateChanged(auth, (user) => {
  renderAuthState(user);
});
