
import { useCallback, useEffect, useState } from "react";
import {
  getAppData,
  saveAppData,
} from "../utils/localStorage";

const emptyData = {
  patients: [],
  doctors: [],
  appointments: [],
  payments: [],
  activities: [],
};

export function useHospitalData() {
  const [data, setData] = useState(
    () => getAppData() || emptyData
  );

  const refreshData = useCallback(() => {
    setData(getAppData() || emptyData);
  }, []);

  useEffect(() => {
    window.addEventListener(
      "carebridgeDataUpdated",
      refreshData
    );

    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener(
        "carebridgeDataUpdated",
        refreshData
      );

      window.removeEventListener("storage", refreshData);
    };
  }, [refreshData]);

  const updateSection = useCallback((section, records) => {
    const currentData = getAppData() || emptyData;

    const updatedData = {
      ...currentData,
      [section]: records,
    };

    const saved = saveAppData(updatedData);

    if (saved) {
      setData(updatedData);
    }

    return saved;
  }, []);

  return {
    data,
    patients: data.patients || [],
    doctors: data.doctors || [],
    appointments: data.appointments || [],
    payments: data.payments || [],
    activities: data.activities || [],
    updateSection,
    refreshData,
  };
}
