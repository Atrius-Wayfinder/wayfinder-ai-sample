import { useState, useCallback, useEffect, useRef } from "react";
import "./App.css";
import getMapInstance, { getPinnedLocation } from "@core/wayfinder";
import { getConfig, saveConfig, ConfigForm, type AppConfig } from "@core/config";
import { ChatDrawer } from "./components/ChatDrawer";

// location-aware-agent requires a pinned location — crash at startup if not configured
const pinnedLocation = getPinnedLocation();
if (!pinnedLocation) {
  throw new Error(
    "Location Aware mode requires a pinned location. Set VITE_PINNED_LATITUDE, VITE_PINNED_LONGITUDE, and VITE_PINNED_FLOOR_ID environment variables.",
  );
}

function App() {
  const [config, setConfig] = useState<AppConfig | null>(getConfig);
  const [showSettings, setShowSettings] = useState(false);
  const mapInitialized = useRef(false);

  // Initialize the map once when config is available
  useEffect(() => {
    if (config && !mapInitialized.current) {
      mapInitialized.current = true;
      getMapInstance({
        venueId: config.venueId,
        accountId: config.accountId,
      });
    }
  }, [config]);

  const handleSaveInitial = useCallback((newConfig: AppConfig) => {
    saveConfig(newConfig);
    setConfig(newConfig);
  }, []);

  const handleSaveSettings = useCallback((newConfig: AppConfig) => {
    saveConfig(newConfig);
    // Reload so the map SDK and agent fully reinitialize
    window.location.reload();
  }, []);

  const handleOpenSettings = useCallback(() => {
    setShowSettings(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  // No config yet -- show the initial setup form
  if (!config) {
    return <ConfigForm initialConfig={null} onSave={handleSaveInitial} />;
  }

  return (
    <div className="app-container">
      <div className="map-container">
        <div id="map"></div>
      </div>
      <ChatDrawer config={config} onOpenSettings={handleOpenSettings} />
      {showSettings && (
        <ConfigForm
          initialConfig={config}
          onSave={handleSaveSettings}
          onCancel={handleCloseSettings}
        />
      )}
    </div>
  );
}

export default App;
