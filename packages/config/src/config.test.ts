/**
 * Config Store Tests
 *
 * Tests for the localStorage-based configuration store
 * that replaces build-time environment variables.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { getConfig, saveConfig, clearConfig, type AppConfig } from "./config";

describe("Config Store", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("getConfig", () => {
    it("should return null when no config is stored", () => {
      expect(getConfig()).toBeNull();
    });

    it("should return stored config", () => {
      const config: AppConfig = {
        venueId: "test-venue",
        accountId: "test-account",
        apiKey: "test-key",
        model: "gemini-2.5-flash",
        temperature: 0.7,
      };
      localStorage.setItem("wayfinder-config", JSON.stringify(config));

      const result = getConfig();
      expect(result).toEqual(config);
    });

    it("should return null for invalid JSON", () => {
      localStorage.setItem("wayfinder-config", "not-json");
      expect(getConfig()).toBeNull();
    });

    it("should return null for config missing required fields", () => {
      localStorage.setItem(
        "wayfinder-config",
        JSON.stringify({ venueId: "test" }),
      );
      expect(getConfig()).toBeNull();
    });
  });

  describe("saveConfig", () => {
    it("should save config to localStorage", () => {
      const config: AppConfig = {
        venueId: "my-venue",
        accountId: "my-account",
        apiKey: "my-key",
        model: "gemini-pro",
        temperature: 0.5,
      };
      saveConfig(config);

      const stored = JSON.parse(
        localStorage.getItem("wayfinder-config") ?? "null",
      );
      expect(stored).toEqual(config);
    });

    it("should overwrite existing config", () => {
      const config1: AppConfig = {
        venueId: "venue-1",
        accountId: "account-1",
        apiKey: "key-1",
        model: "model-1",
        temperature: 0.5,
      };
      const config2: AppConfig = {
        venueId: "venue-2",
        accountId: "account-2",
        apiKey: "key-2",
        model: "model-2",
        temperature: 0.9,
      };

      saveConfig(config1);
      saveConfig(config2);

      const result = getConfig();
      expect(result).toEqual(config2);
    });
  });

  describe("clearConfig", () => {
    it("should remove config from localStorage", () => {
      const config: AppConfig = {
        venueId: "test",
        accountId: "test",
        apiKey: "test",
        model: "test",
        temperature: 0.7,
      };
      saveConfig(config);
      expect(getConfig()).not.toBeNull();

      clearConfig();
      expect(getConfig()).toBeNull();
    });

    it("should not throw when no config exists", () => {
      expect(() => clearConfig()).not.toThrow();
    });
  });
});
