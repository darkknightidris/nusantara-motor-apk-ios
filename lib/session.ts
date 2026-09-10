"use client";

// Session store berbasis useSyncExternalStore: token + user disimpan di
// localStorage dan dibaca sebagai snapshot eksternal. Tidak ada setState di
// dalam effect, sehingga aman untuk hidrasi SSR dan bebas dari cascading
// renders. Token JWT backend (HS256, exp 24 jam) hanya nilai sesi — secret
// JWT tidak pernah masuk ke bundle client.
import { useCallback, useSyncExternalStore } from "react";
import type { AuthUser, LoginResponse } from "@/lib/types";

const STORAGE_KEY = "***";
const CHANGE_EVENT = "nm-session-changed";

export interface SessionState {
  token: string | null;
  user: AuthUser | null;
}

const EMPTY: SessionState = { token: null, user: null };

function parse(raw: string | null): SessionState {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw);
    return { token: parsed.token ?? null, user: parsed.user ?? null };
  } catch {
    return EMPTY;
  }
}

// Cache snapshot agar getSnapshot() stabil antar render (syarat
// useSyncExternalStore).
let cache: { raw: string | null; state: SessionState } = {
  raw: null,
  state: EMPTY,
};

function getSnapshot(): SessionState {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cache.raw) {
    cache = { raw, state: parse(raw) };
  }
  return cache.state;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function persist(next: SessionState) {
  if (next.token && next.user) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useSession() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  const login = useCallback(async (username: string, password: string) => {
    const { api } = await import("@/lib/api");
    const res: LoginResponse = await api.login(username, password);
    persist({ token: res.token, user: { id: "", username: res.username, role: res.role } });
  }, []);

  const logout = useCallback(() => {
    persist(EMPTY);
  }, []);

  return { ...state, login, logout };
}
