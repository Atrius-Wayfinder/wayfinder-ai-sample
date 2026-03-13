/**
 * Runtime Configuration Store
 *
 * Manages app configuration via localStorage, replacing build-time
 * environment variables. This enables the app to be deployed as a
 * static site and configured by end users at runtime.
 */

const STORAGE_KEY = "wayfinder-config";

/**
 * Application configuration that was previously sourced from environment variables.
 */
export interface AppConfig {
  /** Atrius Wayfinder Venue ID (was VITE_ATRIUS_VENUE_ID) */
  venueId: string;
  /** Atrius Wayfinder Account ID (was VITE_ATRIUS_ACCOUNT_ID) */
  accountId: string;
  /** Gemini API Key (was VITE_AI_CLIENT_API_KEY) */
  apiKey: string;
  /** Gemini model name (was VITE_AI_CLIENT_MODEL) */
  model: string;
  /** AI temperature 0.0-1.0 (was VITE_AI_CLIENT_TEMPERATURE) */
  temperature: number;
}

/**
 * Retrieve config from localStorage.
 * Returns null if no config exists or if it's invalid/incomplete.
 */
export function getConfig(): AppConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidConfig(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Save config to localStorage.
 */
export function saveConfig(config: AppConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Remove config from localStorage.
 */
export function clearConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Type guard that validates a parsed object has all required AppConfig fields.
 */
function isValidConfig(value: unknown): value is AppConfig {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.venueId === "string" &&
    typeof obj.accountId === "string" &&
    typeof obj.apiKey === "string" &&
    typeof obj.model === "string" &&
    typeof obj.temperature === "number"
  );
}
