
const STORAGE_KEY = "carebridgeData";

// Get all saved CareBridge data
export const getAppData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : null;
  } catch (error) {
    console.error("Unable to read CareBridge data:", error);
    return null;
  }
};

// Save all CareBridge data
export const saveAppData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event("carebridgeDataUpdated"));
    return true;
  } catch (error) {
    console.error("Unable to save CareBridge data:", error);
    return false;
  }
};

// Save or update one section
export const updateAppData = (section, value) => {
  const currentData = getAppData() || {};
  currentData[section] = value;
  return saveAppData(currentData);
};

// Get one section
export const getAppSection = (section) => {
  const data = getAppData();
  return data?.[section] ?? [];
};

// Remove all CareBridge demo data
export const clearAppData = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("carebridgeDataUpdated"));
};
