"use client";

const LOCAL_AUTH_STORAGE_KEY = "wedding-album-local-auth-email";
const LOCAL_AUTH_CHANGE_EVENT = "wedding-album-local-auth-change";

const LOCAL_FALLBACK_EMAIL = "wedding@album.com";
const LOCAL_FALLBACK_PASSWORD = "Album123";

export type LocalAuthUser = {
  email: string;
};

export function hasFirebaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

export function getLocalAuthUser(): LocalAuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const email = window.localStorage.getItem(LOCAL_AUTH_STORAGE_KEY);
    return email ? { email } : null;
  } catch {
    return null;
  }
}

export function signInWithLocalCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (
    normalizedEmail !== LOCAL_FALLBACK_EMAIL ||
    password !== LOCAL_FALLBACK_PASSWORD
  ) {
    return false;
  }

  try {
    window.localStorage.setItem(LOCAL_AUTH_STORAGE_KEY, normalizedEmail);
    window.dispatchEvent(new Event(LOCAL_AUTH_CHANGE_EVENT));
  } catch {
    return false;
  }

  return true;
}

export function signOutLocalAuth() {
  try {
    window.localStorage.removeItem(LOCAL_AUTH_STORAGE_KEY);
    window.dispatchEvent(new Event(LOCAL_AUTH_CHANGE_EVENT));
  } catch {
    // Ignore storage failures; callers still force navigation away.
  }
}

export function onLocalAuthStateChanged(
  callback: (user: LocalAuthUser | null) => void
) {
  callback(getLocalAuthUser());

  function handleChange() {
    callback(getLocalAuthUser());
  }

  window.addEventListener("storage", handleChange);
  window.addEventListener(LOCAL_AUTH_CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(LOCAL_AUTH_CHANGE_EVENT, handleChange);
  };
}
