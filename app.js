import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { get, getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBuLkEI4HXOtl6RTGNRXadflBu6YGsX9F8",
  authDomain: "skylanda-211e2.firebaseapp.com",
  databaseURL: "https://skylanda-211e2-default-rtdb.firebaseio.com",
  projectId: "skylanda-211e2",
  storageBucket: "skylanda-211e2.firebasestorage.app",
  messagingSenderId: "225103922974",
  appId: "1:225103922974:web:c3761c5ce3201c8a466b0f",
  measurementId: "G-DJMF29LBWL"
};

const AUTH_COPY = {
  login: {
    badge: "Prime giris",
    title: "SkyLand hesabina giris yap",
    description: "Launcher hesabinla web paneline gir, duyurulari ve profilini tek ekrandan yonet."
  },
  register: {
    badge: "Yeni hesap",
    title: "Launcher ile ortak hesap olustur",
    description: "Burada actigin hesap launcherda da gecerli olur. Kullanici adin tek merkezden saklanir."
  },
  reset: {
    badge: "Sifre destegi",
    title: "Sifre sifirlama baglantisi gonder",
    description: "Kullanici adi ya da e-posta ile hesabini bulup sifre sifirlama maili gonderebilirsin."
  }
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const dom = {
  publicView: document.querySelector("#publicView"),
  privateView: document.querySelector("#privateView"),
  authTabs: document.querySelectorAll("[data-auth-mode]"),
  authMessage: document.querySelector("#authMessage"),
  authModeBadge: document.querySelector("#authModeBadge"),
  authModeTitle: document.querySelector("#authModeTitle"),
  authModeDescription: document.querySelector("#authModeDescription"),
  loginForm: document.querySelector("#loginForm"),
  registerForm: document.querySelector("#registerForm"),
  resetForm: document.querySelector("#resetForm"),
  resendVerificationButton: document.querySelector("#resendVerificationButton"),
  scrollAuthButton: document.querySelector("#scrollAuthButton"),
  scrollRegisterButton: document.querySelector("#scrollRegisterButton"),
  heroJoinButton: document.querySelector("#heroJoinButton"),
  publicAnnouncementTitle: document.querySelector("#publicAnnouncementTitle"),
  publicAnnouncementBody: document.querySelector("#publicAnnouncementBody"),
  publicAnnouncementPills: document.querySelector("#publicAnnouncementPills"),
  dashboardAnnouncementTitle: document.querySelector("#dashboardAnnouncementTitle"),
  dashboardAnnouncementBody: document.querySelector("#dashboardAnnouncementBody"),
  dashboardAnnouncementPills: document.querySelector("#dashboardAnnouncementPills"),
  announcementList: document.querySelector("#announcementList"),
  sessionUserLabel: document.querySelector("#sessionUserLabel"),
  sessionMetaLabel: document.querySelector("#sessionMetaLabel"),
  dashboardGreeting: document.querySelector("#dashboardGreeting"),
  dashboardSubtitle: document.querySelector("#dashboardSubtitle"),
  profileCreatedAt: document.querySelector("#profileCreatedAt"),
  profileEmail: document.querySelector("#profileEmail"),
  profileVerified: document.querySelector("#profileVerified"),
  profileUsername: document.querySelector("#profileUsername"),
  profileDisplayName: document.querySelector("#profileDisplayName"),
  profileMcNickname: document.querySelector("#profileMcNickname"),
  profileUpdatedAt: document.querySelector("#profileUpdatedAt"),
  verifyStateLabel: document.querySelector("#verifyStateLabel"),
  liveClockLabel: document.querySelector("#liveClockLabel"),
  profileSyncLabel: document.querySelector("#profileSyncLabel"),
  profileSettingsForm: document.querySelector("#profileSettingsForm"),
  passwordChangeForm: document.querySelector("#passwordChangeForm"),
  settingsMessage: document.querySelector("#settingsMessage"),
  logoutButton: document.querySelector("#logoutButton"),
  tabButtons: document.querySelectorAll("[data-tab]"),
  tabPanels: document.querySelectorAll("[data-tab-panel]"),
  toast: document.querySelector("#toast")
};

const state = {
  authMode: "login",
  currentUser: null,
  profile: null,
  announcements: [],
  activeAnnouncementIndex: 0,
  rotateTimer: null,
  clockTimer: null
};

function normalizeUsername(value) {
  return `${value ?? ""}`.trim().toLowerCase().replace(/\s+/g, "");
}

function sanitizeMcNickname(value, fallback = "SkylandTiger") {
  const cleaned = `${value ?? ""}`.replace(/[^A-Za-z0-9_]/g, "").slice(0, 16);
  return cleaned || fallback;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short"
  }).format(date);
}

function showToast(message, type = "info") {
  dom.toast.textContent = message;
  dom.toast.classList.remove("hidden", "success", "error");
  if (type === "success") {
    dom.toast.classList.add("success");
  }
  if (type === "error") {
    dom.toast.classList.add("error");
  }

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    dom.toast.classList.add("hidden");
    dom.toast.classList.remove("success", "error");
  }, 3600);
}

function showAuthMessage(message, type = "info") {
  dom.authMessage.textContent = message;
  dom.authMessage.classList.remove("hidden", "success", "error");
  if (type === "success") {
    dom.authMessage.classList.add("success");
  }
  if (type === "error") {
    dom.authMessage.classList.add("error");
  }
}

function clearAuthMessage() {
  dom.authMessage.textContent = "";
  dom.authMessage.classList.add("hidden");
  dom.authMessage.classList.remove("success", "error");
}

function showSettingsMessage(message, type = "info") {
  dom.settingsMessage.textContent = message;
  dom.settingsMessage.classList.remove("hidden", "success", "error");
  if (type === "success") {
    dom.settingsMessage.classList.add("success");
  }
  if (type === "error") {
    dom.settingsMessage.classList.add("error");
  }
}

function clearSettingsMessage() {
  dom.settingsMessage.textContent = "";
  dom.settingsMessage.classList.add("hidden");
  dom.settingsMessage.classList.remove("success", "error");
}

function firebaseErrorMessage(error) {
  const code = `${error?.code ?? error?.message ?? error ?? ""}`.toLowerCase();
  if (code.includes("invalid-login-credentials")) {
    return "Kullanici adi veya sifre hatali.";
  }
  if (code.includes("email-already-in-use")) {
    return "Bu e-posta zaten kullaniliyor.";
  }
  if (code.includes("weak-password")) {
    return "Sifre en az 6 karakter olmali.";
  }
  if (code.includes("too-many-requests")) {
    return "Cok fazla deneme yapildi. Biraz bekleyip tekrar dene.";
  }
  if (code.includes("requires-recent-login")) {
    return "Sifre degistirmek icin yeniden giris yapman gerekiyor.";
  }
  return error?.message || "Bir hata olustu.";
}

function setAuthMode(mode) {
  state.authMode = mode;
  const copy = AUTH_COPY[mode] || AUTH_COPY.login;

  dom.authModeBadge.textContent = copy.badge;
  dom.authModeTitle.textContent = copy.title;
  dom.authModeDescription.textContent = copy.description;

  dom.authTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === mode);
  });

  dom.loginForm.classList.toggle("hidden", mode !== "login");
  dom.registerForm.classList.toggle("hidden", mode !== "register");
  dom.resetForm.classList.toggle("hidden", mode !== "reset");
  clearAuthMessage();
}

function setActiveTab(tabName) {
  dom.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  dom.tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tabPanel === tabName);
  });
}

function scrollToAuth(mode = "login") {
  setAuthMode(mode);
  document.querySelector("#authPanel")?.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

async function getUsernameMapping(username) {
  const snapshot = await get(ref(db, `usernames/${normalizeUsername(username)}`));
  return snapshot.exists() ? snapshot.val() : null;
}

async function resolveEmailFromIdentifier(identifier) {
  const raw = `${identifier ?? ""}`.trim();
  if (!raw) {
    return null;
  }
  if (raw.includes("@")) {
    return raw;
  }

  const mapping = await getUsernameMapping(raw);
  return mapping?.email || null;
}

function buildAnnouncements(profile = null) {
  const nowText = formatDate(new Date());
  const name = profile?.displayName || profile?.username || "Prime oyuncu";

  return [
    {
      badge: "Canli duyuru",
      title: "Launcher bugun yapildi",
      body: `Launcher bugun ${nowText} saatinde sahneye cikti. Bu launcher bir FPS boost ve insanlara guvenilir sekilde Minecraft oynatmak icin olusturulmustur.`
    },
    {
      badge: "Hesap merkezi",
      title: "Launcher ve site ayni hesapta",
      body: "Web uzerinden actigin hesap launcherda da gecerli. Launcher hesabinla buraya girince tum profil verin ayni sekilde gelir."
    },
    {
      badge: "Profil akisi",
      title: `${name} icin panel hazir`,
      body: "Gosterilecek adin, Minecraft nickin, mail durumun ve sifre kontrolun tek panelde toplanir."
    }
  ];
}

function renderAnnouncementPills(container, activeIndex) {
  container.innerHTML = "";
  state.announcements.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `pill${index === activeIndex ? " active" : ""}`;
    button.textContent = item.badge;
    button.addEventListener("click", () => {
      state.activeAnnouncementIndex = index;
      renderAnnouncements();
      restartAnnouncementRotation();
    });
    container.appendChild(button);
  });
}

function renderAnnouncementList(activeIndex) {
  dom.announcementList.innerHTML = "";

  state.announcements.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = `announcement-card${index === activeIndex ? " active" : ""}`;
    card.innerHTML = `
      <small>${item.badge}</small>
      <h4>${item.title}</h4>
      <p>${item.body}</p>
    `;
    card.addEventListener("click", () => {
      state.activeAnnouncementIndex = index;
      renderAnnouncements();
      restartAnnouncementRotation();
    });
    dom.announcementList.appendChild(card);
  });
}

function renderAnnouncements() {
  if (!state.announcements.length) {
    return;
  }

  const current = state.announcements[state.activeAnnouncementIndex];
  dom.publicAnnouncementTitle.textContent = current.title;
  dom.publicAnnouncementBody.textContent = current.body;
  dom.dashboardAnnouncementTitle.textContent = current.title;
  dom.dashboardAnnouncementBody.textContent = current.body;

  renderAnnouncementPills(dom.publicAnnouncementPills, state.activeAnnouncementIndex);
  renderAnnouncementPills(dom.dashboardAnnouncementPills, state.activeAnnouncementIndex);
  renderAnnouncementList(state.activeAnnouncementIndex);
}

function restartAnnouncementRotation() {
  window.clearInterval(state.rotateTimer);
  state.rotateTimer = window.setInterval(() => {
    if (!state.announcements.length) {
      return;
    }
    state.activeAnnouncementIndex = (state.activeAnnouncementIndex + 1) % state.announcements.length;
    renderAnnouncements();
  }, 5200);
}

function renderClock() {
  dom.liveClockLabel.textContent = formatDate(new Date());
}

function startClock() {
  renderClock();
  window.clearInterval(state.clockTimer);
  state.clockTimer = window.setInterval(renderClock, 1000 * 30);
}

function showPublicView() {
  dom.publicView.classList.remove("hidden");
  dom.privateView.classList.add("hidden");
}

function showPrivateView() {
  dom.publicView.classList.add("hidden");
  dom.privateView.classList.remove("hidden");
}

function syncProfileForms(profile) {
  dom.profileSettingsForm.elements.username.value = profile.username || "";
  dom.profileSettingsForm.elements.displayName.value = profile.displayName || "";
  dom.profileSettingsForm.elements.mcNickname.value = profile.mcNickname || "";
}

function renderProfile() {
  const profile = state.profile;
  const user = state.currentUser;
  if (!profile || !user) {
    return;
  }

  dom.sessionUserLabel.textContent = profile.displayName || profile.username || "SkyLand";
  dom.sessionMetaLabel.textContent = `${profile.email || user.email} • ${user.emailVerified ? "Mail dogrulandi" : "Mail bekliyor"}`;
  dom.dashboardGreeting.textContent = `${profile.displayName || profile.username}, panelin hazir`;
  dom.dashboardSubtitle.textContent = `SkyLand hesabin ${profile.username} kullanici adi ile launcher ve web arasinda ortak durumda.`;
  dom.profileCreatedAt.textContent = formatDate(profile.createdAt || user.metadata?.creationTime);
  dom.profileEmail.textContent = profile.email || user.email || "-";
  dom.profileVerified.textContent = user.emailVerified ? "Dogrulandi" : "Bekliyor";
  dom.profileUsername.textContent = profile.username || "-";
  dom.profileDisplayName.textContent = profile.displayName || "-";
  dom.profileMcNickname.textContent = profile.mcNickname || "-";
  dom.profileUpdatedAt.textContent = formatDate(profile.updatedAt || profile.createdAt || user.metadata?.creationTime);
  dom.verifyStateLabel.textContent = user.emailVerified ? "Hazir" : "Dogrulanmadi";
  dom.profileSyncLabel.textContent = "Launcher ile senkron";

  syncProfileForms(profile);
  state.announcements = buildAnnouncements(profile);
  renderAnnouncements();
}

async function loadRemoteProfile(user) {
  const snapshot = await get(ref(db, `launcherUsers/${user.uid}`));
  const remote = snapshot.exists() ? snapshot.val() : {};

  state.profile = {
    username: remote.username || user.email?.split("@")[0] || "",
    displayName: remote.displayName || remote.username || user.email?.split("@")[0] || "",
    mcNickname: remote.mcNickname || remote.username || "SkylandTiger",
    email: remote.email || user.email || "",
    createdAt: remote.createdAt || user.metadata?.creationTime || "",
    updatedAt: remote.updatedAt || remote.createdAt || user.metadata?.creationTime || ""
  };

  renderProfile();
}

async function handleRegisterSubmit(event) {
  event.preventDefault();
  clearAuthMessage();

  const formData = new FormData(dom.registerForm);
  const username = `${formData.get("username") ?? ""}`.trim();
  const displayName = `${formData.get("displayName") ?? ""}`.trim();
  const email = `${formData.get("email") ?? ""}`.trim();
  const password = `${formData.get("password") ?? ""}`;
  const passwordConfirm = `${formData.get("passwordConfirm") ?? ""}`;

  if (!username || !displayName || !email || !password) {
    showAuthMessage("Tum alanlari doldurman gerekiyor.", "error");
    return;
  }

  if (!/^[A-Za-z0-9_]{3,24}$/.test(username)) {
    showAuthMessage("Kullanici adi 3-24 karakter olmali ve sadece harf, rakam, alt cizgi icermeli.", "error");
    return;
  }

  if (password !== passwordConfirm) {
    showAuthMessage("Sifreler ayni degil.", "error");
    return;
  }

  let userCredential = null;
  let remoteSaved = false;

  try {
    const existing = await getUsernameMapping(username);
    if (existing) {
      showAuthMessage("Bu kullanici adi zaten alinmis.", "error");
      return;
    }

    userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const mcNickname = sanitizeMcNickname(displayName.replace(/\s+/g, ""), sanitizeMcNickname(username));
    const now = new Date().toISOString();

    await update(ref(db), {
      [`usernames/${normalizeUsername(username)}`]: {
        uid: userCredential.user.uid,
        email,
        username,
        createdAt: now
      },
      [`launcherUsers/${userCredential.user.uid}`]: {
        username,
        usernameLower: normalizeUsername(username),
        displayName,
        email,
        mcNickname,
        createdAt: now,
        updatedAt: now
      }
    });
    remoteSaved = true;

    await sendEmailVerification(userCredential.user);
    await signOut(auth);

    dom.registerForm.reset();
    dom.loginForm.elements.identifier.value = username;
    setAuthMode("login");
    showAuthMessage("Kayit tamamlandi. E-postana dogrulama baglantisi gonderildi.", "success");
    showToast("SkyLand hesabin acildi. Mailini dogrulayip giris yap.", "success");
  } catch (error) {
    if (userCredential?.user && !remoteSaved) {
      await deleteUser(userCredential.user).catch(() => {});
    }
    showAuthMessage(`Kayit olusturulamadi: ${firebaseErrorMessage(error)}`, "error");
  }
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  clearAuthMessage();

  const identifier = `${new FormData(dom.loginForm).get("identifier") ?? ""}`.trim();
  const password = `${new FormData(dom.loginForm).get("password") ?? ""}`;

  if (!identifier || !password) {
    showAuthMessage("Kullanici adi ve sifre zorunlu.", "error");
    return;
  }

  try {
    const email = await resolveEmailFromIdentifier(identifier);
    if (!email) {
      throw new Error("Bu kullanici adi veya e-posta bulunamadi.");
    }

    const credential = await signInWithEmailAndPassword(auth, email, password);

    if (!credential.user.emailVerified) {
      await sendEmailVerification(credential.user);
      await signOut(auth);
      showAuthMessage("Mail dogrulamasi tamamlanmamis. Yeni dogrulama maili gonderildi.", "error");
      return;
    }

    showToast("SkyLand paneline hos geldin.", "success");
  } catch (error) {
    showAuthMessage(`Giris basarisiz: ${firebaseErrorMessage(error)}`, "error");
  }
}

async function handleResetSubmit(event) {
  event.preventDefault();
  clearAuthMessage();

  const identifier = `${new FormData(dom.resetForm).get("identifier") ?? ""}`.trim();
  if (!identifier) {
    showAuthMessage("Kullanici adi veya e-posta gerekli.", "error");
    return;
  }

  try {
    const email = await resolveEmailFromIdentifier(identifier);
    if (!email) {
      throw new Error("Bu hesap bulunamadi.");
    }

    await sendPasswordResetEmail(auth, email);
    showAuthMessage("Sifre sifirlama maili gonderildi.", "success");
    showToast("Sifre sifirlama baglantisi e-postana gonderildi.", "success");
  } catch (error) {
    showAuthMessage(firebaseErrorMessage(error), "error");
  }
}

async function resendVerification() {
  clearAuthMessage();
  const identifier = `${dom.loginForm.elements.identifier.value ?? ""}`.trim();
  const password = `${dom.loginForm.elements.password.value ?? ""}`;

  if (!identifier || !password) {
    showAuthMessage("Dogrulama maili icin kullanici adi ve sifre yaz.", "error");
    return;
  }

  try {
    const email = await resolveEmailFromIdentifier(identifier);
    if (!email) {
      throw new Error("Bu hesap bulunamadi.");
    }

    const credential = await signInWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(credential.user);
    await signOut(auth);
    showAuthMessage("Dogrulama e-postasi yeniden gonderildi.", "success");
  } catch (error) {
    showAuthMessage(firebaseErrorMessage(error), "error");
  }
}

async function handleProfileSettingsSubmit(event) {
  event.preventDefault();
  clearSettingsMessage();

  if (!state.currentUser || !state.profile) {
    return;
  }

  const displayName = `${dom.profileSettingsForm.elements.displayName.value ?? ""}`.trim();
  const mcNickname = sanitizeMcNickname(dom.profileSettingsForm.elements.mcNickname.value, state.profile.username);

  if (!displayName) {
    showSettingsMessage("Gosterilecek ad bos olamaz.", "error");
    return;
  }

  try {
    const updatedAt = new Date().toISOString();
    await update(ref(db, `launcherUsers/${state.currentUser.uid}`), {
      username: state.profile.username,
      usernameLower: normalizeUsername(state.profile.username),
      displayName,
      mcNickname,
      updatedAt
    });

    state.profile = {
      ...state.profile,
      displayName,
      mcNickname,
      updatedAt
    };

    renderProfile();
    showSettingsMessage("Profil ayarlari kaydedildi.", "success");
    showToast("Profilin guncellendi.", "success");
  } catch (error) {
    showSettingsMessage(firebaseErrorMessage(error), "error");
  }
}

async function handlePasswordChangeSubmit(event) {
  event.preventDefault();
  clearSettingsMessage();

  if (!auth.currentUser?.email) {
    return;
  }

  const currentPassword = `${dom.passwordChangeForm.elements.currentPassword.value ?? ""}`;
  const nextPassword = `${dom.passwordChangeForm.elements.nextPassword.value ?? ""}`;
  const nextPasswordConfirm = `${dom.passwordChangeForm.elements.nextPasswordConfirm.value ?? ""}`;

  if (!currentPassword || !nextPassword || !nextPasswordConfirm) {
    showSettingsMessage("Tum sifre alanlarini doldur.", "error");
    return;
  }

  if (nextPassword !== nextPasswordConfirm) {
    showSettingsMessage("Yeni sifreler ayni degil.", "error");
    return;
  }

  try {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, nextPassword);
    dom.passwordChangeForm.reset();
    showSettingsMessage("Sifre basariyla degisti.", "success");
    showToast("Sifren guncellendi.", "success");
  } catch (error) {
    showSettingsMessage(firebaseErrorMessage(error), "error");
  }
}

async function handleLogout() {
  await signOut(auth);
  showToast("Cikis yapildi.", "success");
}

function bindStaticActions() {
  dom.authTabs.forEach((button) => {
    button.addEventListener("click", () => {
      setAuthMode(button.dataset.authMode);
    });
  });

  dom.tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTab(button.dataset.tab);
    });
  });

  dom.scrollAuthButton.addEventListener("click", () => scrollToAuth("login"));
  dom.scrollRegisterButton.addEventListener("click", () => scrollToAuth("register"));
  dom.heroJoinButton.addEventListener("click", () => scrollToAuth("register"));

  dom.loginForm.addEventListener("submit", handleLoginSubmit);
  dom.registerForm.addEventListener("submit", handleRegisterSubmit);
  dom.resetForm.addEventListener("submit", handleResetSubmit);
  dom.resendVerificationButton.addEventListener("click", resendVerification);
  dom.profileSettingsForm.addEventListener("submit", handleProfileSettingsSubmit);
  dom.passwordChangeForm.addEventListener("submit", handlePasswordChangeSubmit);
  dom.logoutButton.addEventListener("click", handleLogout);
}

function startAnnouncementSystem() {
  state.announcements = buildAnnouncements();
  renderAnnouncements();
  restartAnnouncementRotation();
}

async function handleSignedInUser(user) {
  state.currentUser = user;
  await loadRemoteProfile(user);
  showPrivateView();
  startClock();
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    state.currentUser = null;
    state.profile = null;
    showPublicView();
    setActiveTab("profile");
    return;
  }

  if (!user.emailVerified) {
    await signOut(auth);
    showPublicView();
    showAuthMessage("Mail dogrulamasi olmadan web panel acilamaz.", "error");
    return;
  }

  await handleSignedInUser(user);
});

bindStaticActions();
setAuthMode("login");
setActiveTab("profile");
startAnnouncementSystem();
renderClock();
