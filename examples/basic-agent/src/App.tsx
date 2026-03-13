import { useState, useCallback, useEffect, useRef } from "react";
import "./App.css";
import getMapInstance from "@core/wayfinder";
import { getConfig, saveConfig, type AppConfig } from "./config";
import { ConfigForm } from "./components/ConfigForm";
import { ChatDrawer } from "./components/ChatDrawer";

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
