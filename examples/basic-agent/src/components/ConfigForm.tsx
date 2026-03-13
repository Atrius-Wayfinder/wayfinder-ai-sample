import { useState, useCallback } from "react";
import type { FormEvent } from "react";
import type { AppConfig } from "../config";
import styles from "./ConfigForm.module.css";

interface ConfigFormProps {
  /** Pre-fill form with existing config (for editing) */
  initialConfig: AppConfig | null;
  /** Called when user submits valid config */
  onSave: (config: AppConfig) => void;
  /** Called when user cancels (only shown when editing, not on first setup) */
  onCancel?: () => void;
}

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_TEMPERATURE = 0.7;

export function ConfigForm({
  initialConfig,
  onSave,
  onCancel,
}: ConfigFormProps) {
  const [venueId, setVenueId] = useState(initialConfig?.venueId ?? "");
  const [accountId, setAccountId] = useState(initialConfig?.accountId ?? "");
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey ?? "");
  const [model, setModel] = useState(initialConfig?.model ?? DEFAULT_MODEL);
  const [temperature, setTemperature] = useState(
    initialConfig?.temperature ?? DEFAULT_TEMPERATURE,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!venueId.trim()) newErrors.venueId = "Venue ID is required";
    if (!accountId.trim()) newErrors.accountId = "Account ID is required";
    if (!apiKey.trim()) newErrors.apiKey = "API Key is required";
    if (temperature < 0 || temperature > 1) {
      newErrors.temperature = "Temperature must be between 0 and 1";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [venueId, accountId, apiKey, temperature]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      onSave({
        venueId: venueId.trim(),
        accountId: accountId.trim(),
        apiKey: apiKey.trim(),
        model: model.trim() || DEFAULT_MODEL,
        temperature,
      });
    },
    [venueId, accountId, apiKey, model, temperature, validate, onSave],
  );

  const isEditing = initialConfig !== null;

  return (
    <div className={styles.overlay}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h2>{isEditing ? "Settings" : "Welcome to Venue Assistant"}</h2>
          <p>
            {isEditing
              ? "Update your configuration below."
              : "Enter your configuration to get started."}
          </p>
        </div>

        <div className={styles.section}>
          <h3>Venue Configuration</h3>

          <label className={styles.field}>
            <span className={styles.label}>
              Venue ID <span className={styles.required}>*</span>
            </span>
            <input
              type="text"
              value={venueId}
              onChange={(e) => setVenueId(e.target.value)}
              placeholder="e.g. dfw"
              className={errors.venueId ? styles.inputError : ""}
            />
            {errors.venueId && (
              <span className={styles.error}>{errors.venueId}</span>
            )}
          </label>

          <label className={styles.field}>
            <span className={styles.label}>
              Account ID <span className={styles.required}>*</span>
            </span>
            <input
              type="text"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              placeholder="e.g. A73K92RMPWFN4J"
              className={errors.accountId ? styles.inputError : ""}
            />
            {errors.accountId && (
              <span className={styles.error}>{errors.accountId}</span>
            )}
          </label>
        </div>

        <div className={styles.section}>
          <h3>AI Configuration</h3>

          <label className={styles.field}>
            <span className={styles.label}>
              Gemini API Key <span className={styles.required}>*</span>
            </span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your Gemini API key"
              autoComplete="off"
              className={errors.apiKey ? styles.inputError : ""}
            />
            {errors.apiKey && (
              <span className={styles.error}>{errors.apiKey}</span>
            )}
            <span className={styles.hint}>
              Get one at{" "}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
              >
                aistudio.google.com/apikey
              </a>
            </span>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Model</span>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gemini-2.5-flash"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Temperature</span>
            <div className={styles.temperatureRow}>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className={styles.slider}
              />
              <span className={styles.temperatureValue}>
                {temperature.toFixed(1)}
              </span>
            </div>
            {errors.temperature && (
              <span className={styles.error}>{errors.temperature}</span>
            )}
            <span className={styles.hint}>
              0.0 = deterministic, 1.0 = creative. Recommended: 0.5-0.7
            </span>
          </label>
        </div>

        <div className={styles.actions}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          )}
          <button type="submit" className={styles.submitButton}>
            {isEditing ? "Save & Reload" : "Get Started"}
          </button>
        </div>
      </form>
    </div>
  );
}
