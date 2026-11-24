
import { useEffect, useMemo, useState } from "react";
import {
  Settings,
  Bell,
  Mail,
  CalendarDays,
  MessageSquare,
  Moon,
  Sun,
  Monitor,
  Languages,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

import DoctorLayout from "../../layouts/DoctorLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import { usePreferences } from "../../context/PreferencesContext";
import "./DoctorSettings.css";

const getLoggedInUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("carebridgeUser") ||
        sessionStorage.getItem("carebridgeUser") ||
        "null"
    );
  } catch {
    return null;
  }
};

const defaultNotifications = {
  appointmentReminders: true,
  appointmentUpdates: true,
  patientMessages: true,
  emailNotifications: false,
};

function DoctorSettings() {
  const { data, doctors, updateSection } = useHospitalData();
  const {
    theme,
    setTheme,
    direction,
    toggleDirection,
  } = usePreferences();

  const loggedInUser = useMemo(() => getLoggedInUser(), []);

  const doctor = useMemo(() => {
    if (!loggedInUser) return null;

    return doctors.find(
      (item) =>
        (loggedInUser.doctorId &&
          String(item.id) === String(loggedInUser.doctorId)) ||
        item.name?.trim().toLowerCase() ===
          loggedInUser.name?.trim().toLowerCase()
    );
  }, [doctors, loggedInUser]);

  const doctorId = doctor?.id;

  const [notifications, setNotifications] = useState(
    defaultNotifications
  );
  const [savedMessage, setSavedMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    if (!doctorId) return;

    const savedPreferences = (data.doctorPreferences || []).find(
      (item) => String(item.doctorId) === String(doctorId)
    );

    setNotifications({
      ...defaultNotifications,
      ...(savedPreferences?.notifications || {}),
    });
  }, [data.doctorPreferences, doctorId]);

  const handleNotificationChange = (name, checked) => {
    setNotifications((previous) => ({
      ...previous,
      [name]: checked,
    }));

    setSavedMessage("");
  };

  const handleSave = () => {
    if (!doctor) {
      setSavedMessage("Doctor record not found.");
      setMessageType("error");
      return;
    }

    const existingPreferences = data.doctorPreferences || [];

    const updatedPreferences = existingPreferences.filter(
      (item) => String(item.doctorId) !== String(doctorId)
    );

    updatedPreferences.push({
      doctorId,
      notifications,
      updatedAt: new Date().toISOString(),
    });

    const saved = updateSection(
      "doctorPreferences",
      updatedPreferences
    );

    if (!saved) {
      setSavedMessage("Unable to save settings. Please try again.");
      setMessageType("error");
      return;
    }

    setSavedMessage("Your notification preferences have been saved.");
    setMessageType("success");
  };

  const handleReset = () => {
    setNotifications(defaultNotifications);
    setSavedMessage("");
  };

  if (!loggedInUser || !doctor) {
    return (
      <DoctorLayout>
        <div className="doctor-settings-page">
          <div className="doctor-settings-message error">
            <AlertCircle size={19} />
            Doctor record not found. Please check your demo login.
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="doctor-settings-page">
        <div className="doctor-settings-heading">
          <div>
            <span className="doctor-settings-eyebrow">ACCOUNT</span>
            <h1>Settings</h1>
            <p>Manage your preferences and notification settings.</p>
          </div>

          <div className="doctor-settings-account">
            <ShieldCheck size={17} />
            <span>{doctor.name}</span>
          </div>
        </div>

        <div className="doctor-settings-content">
          <section className="doctor-settings-card">
            <div className="doctor-settings-card-heading">
              <div className="doctor-settings-icon">
                <Settings size={21} />
              </div>
              <div>
                <h2>Appearance</h2>
                <p>Customize how CareBridge looks on your device.</p>
              </div>
            </div>

            <div className="doctor-settings-option">
              <div className="doctor-settings-option-info">
                <div className="doctor-settings-option-title">
                  <Sun size={18} />
                  <span>Theme preference</span>
                </div>
                <p>Choose light, dark, or follow your device setting.</p>
              </div>

              <select
                className="doctor-settings-select"
                value={theme}
                onChange={(event) => setTheme(event.target.value)}
                aria-label="Theme preference"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="doctor-settings-option">
              <div className="doctor-settings-option-info">
                <div className="doctor-settings-option-title">
                  <Languages size={18} />
                  <span>Text direction</span>
                </div>
                <p>Switch the dashboard between LTR and RTL layout.</p>
              </div>

              <button
                type="button"
                className="doctor-settings-direction-btn"
                onClick={toggleDirection}
              >
                {direction === "rtl" ? "RTL" : "LTR"}
                <span>Switch</span>
              </button>
            </div>

            <div className="doctor-settings-current-theme">
              {theme === "dark" ? (
                <Moon size={17} />
              ) : theme === "system" ? (
                <Monitor size={17} />
              ) : (
                <Sun size={17} />
              )}
              <span>
                Current theme:{" "}
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </span>
            </div>
          </section>

          <section className="doctor-settings-card">
            <div className="doctor-settings-card-heading">
              <div className="doctor-settings-icon">
                <Bell size={21} />
              </div>
              <div>
                <h2>Notifications</h2>
                <p>Choose which updates you want to receive.</p>
              </div>
            </div>

            <div className="doctor-settings-notification-list">
              <label className="doctor-settings-notification">
                <div className="doctor-settings-option-info">
                  <div className="doctor-settings-option-title">
                    <CalendarDays size={18} />
                    <span>Appointment reminders</span>
                  </div>
                  <p>Receive reminders about upcoming appointments.</p>
                </div>

                <input
                  type="checkbox"
                  checked={notifications.appointmentReminders}
                  onChange={(event) =>
                    handleNotificationChange(
                      "appointmentReminders",
                      event.target.checked
                    )
                  }
                />
                <span className="doctor-settings-switch" />
              </label>

              <label className="doctor-settings-notification">
                <div className="doctor-settings-option-info">
                  <div className="doctor-settings-option-title">
                    <Bell size={18} />
                    <span>Appointment updates</span>
                  </div>
                  <p>Receive updates when appointment details change.</p>
                </div>

                <input
                  type="checkbox"
                  checked={notifications.appointmentUpdates}
                  onChange={(event) =>
                    handleNotificationChange(
                      "appointmentUpdates",
                      event.target.checked
                    )
                  }
                />
                <span className="doctor-settings-switch" />
              </label>

              <label className="doctor-settings-notification">
                <div className="doctor-settings-option-info">
                  <div className="doctor-settings-option-title">
                    <MessageSquare size={18} />
                    <span>Patient messages</span>
                  </div>
                  <p>Receive notifications about patient messages.</p>
                </div>

                <input
                  type="checkbox"
                  checked={notifications.patientMessages}
                  onChange={(event) =>
                    handleNotificationChange(
                      "patientMessages",
                      event.target.checked
                    )
                  }
                />
                <span className="doctor-settings-switch" />
              </label>

              <label className="doctor-settings-notification">
                <div className="doctor-settings-option-info">
                  <div className="doctor-settings-option-title">
                    <Mail size={18} />
                    <span>Email notifications</span>
                  </div>
                  <p>Enable email notification preference.</p>
                </div>

                <input
                  type="checkbox"
                  checked={notifications.emailNotifications}
                  onChange={(event) =>
                    handleNotificationChange(
                      "emailNotifications",
                      event.target.checked
                    )
                  }
                />
                <span className="doctor-settings-switch" />
              </label>
            </div>

            {savedMessage && (
              <div
                className={`doctor-settings-message ${messageType}`}
              >
                {messageType === "success" ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <AlertCircle size={18} />
                )}
                <span>{savedMessage}</span>
              </div>
            )}

            <div className="doctor-settings-actions">
              <button
                type="button"
                className="doctor-settings-reset-btn"
                onClick={handleReset}
              >
                <RotateCcw size={17} />
                Reset
              </button>

              <button
                type="button"
                className="doctor-settings-save-btn"
                onClick={handleSave}
              >
                <Save size={17} />
                Save Preferences
              </button>
            </div>
          </section>
        </div>
      </div>
    </DoctorLayout>
  );
}

export default DoctorSettings;
