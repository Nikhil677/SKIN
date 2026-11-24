import { Profile, ProfileSchema, DEFAULT_PROFILE } from "@skin/shared";

const STORAGE_KEY = "skin_user_profile";

export async function loadUserProfile(): Promise<Profile> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      const data = await chrome.storage.local.get(STORAGE_KEY);
      if (data && data[STORAGE_KEY]) {
        const parsed = ProfileSchema.safeParse(data[STORAGE_KEY]);
        if (parsed.success) return parsed.data;
      }
    } else if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = ProfileSchema.safeParse(JSON.parse(raw));
        if (parsed.success) return parsed.data;
      }
    }
  } catch {}

  return { ...DEFAULT_PROFILE };
}

export async function saveUserProfile(profile: Profile): Promise<void> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.set({ [STORAGE_KEY]: profile });
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  } catch {}
}
