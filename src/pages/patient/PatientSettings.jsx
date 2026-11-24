
import { useEffect, useMemo, useState } from "react";
import {
  UserRound,
  Palette,
  Languages,
  Bell,
  LockKeyhole,
  Save,
  RotateCcw,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import PatientLayout from "../../layouts/PatientLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import { usePreferences } from "../../context/PreferencesContext";
import "./PatientSettings.css";

const defaultNotifications = {
  appointments: true,
  prescriptions: true,
  billing: true,
  reminders: true,
};

function PatientSettings() {
  const { data, updateSection } = useHospitalData();
  const {
    theme,
    setTheme,
    direction,
    setDirection,
  } = usePreferences();

  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("carebridgeUser") ||
        sessionStorage.getItem("carebridgeUser") ||
        "null"
      );
    } catch {
      return null;
    }
  }, []);

  const currentPatient = useMemo(() => {
    const patients = data.patients || [];

    return (
      patients.find(
        (patient) =>
          patient.id ===
            (loggedInUser?.patientId || loggedInUser?.id)
      ) ||
      patients.find(
        (patient) =>
          patient.email?.toLowerCase() ===
          loggedInUser?.email?.toLowerCase()
      ) ||
      null
    );
  }, [data.patients, loggedInUser]);

  const patientSettings = useMemo(() => {
    const settings = data.patientSettings || [];

    return settings.find(
      (item) => item.patientId === currentPatient?.id
    );
  }, [data.patientSettings, currentPatient]);

  const [notifications, setNotifications] = useState({
    ...defaultNotifications,
    ...(patientSettings?.notifications || {}),
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    setNotifications({
      ...defaultNotifications,
      ...(patientSettings?.notifications || {}),
    });
  }, [patientSettings]);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  const updateNotification = (field, value) => {
    setNotifications((current) => ({
      ...current,
      [field]: value,
    }));

    setMessage("");
  };

  const handleSave = () => {
    if (!currentPatient) {
      showMessage(
        "Unable to identify your patient account.",
        "error"
      );
      return;
    }

    const existingSettings = data.patientSettings || [];

    const updatedSettings = {
      patientId: currentPatient.id,
      notifications,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [
      ...existingSettings.filter(
        (item) => item.patientId !== currentPatient.id
      ),
      updatedSettings,
    ];

    const saved = updateSection("patientSettings", updatedList);

    if (saved) {
      showMessage("Your settings have been saved successfully.");
    } else {
      showMessage("Unable to save settings. Please try again.", "error");
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset your notification preferences to their default values?"
    );

    if (!confirmed) return;

    const resetNotifications = { ...defaultNotifications };
    const existingSettings = data.patientSettings || [];

    const updatedList = [
      ...existingSettings.filter(
        (item) => item.patientId !== currentPatient?.id
      ),
      {
        patientId: currentPatient?.id,
        notifications: resetNotifications,
        updatedAt: new Date().toISOString(),
      },
    ];

    const saved = updateSection("patientSettings", updatedList);

    if (saved) {
      setNotifications(resetNotifications);
      showMessage("Notification preferences have been reset.");
    } else {
      showMessage("Unable to reset your settings.", "error");
    }
  };

  const updatePasswordField = (field, value) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }));

    setPasswordMessage("");
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();

    if (!currentPatient) {
      setPasswordMessage("Patient account not found.");
      return;
    }

    if (passwordForm.currentPassword !== currentPatient.password) {
      setPasswordMessage("Your current password is incorrect.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage(
        "New password must contain at least 6 characters."
      );
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }

    const updatedPatients = (data.patients || []).map((patient) =>
      patient.id === currentPatient.id
        ? {
            ...patient,
            password: passwordForm.newPassword,
            updatedAt: new Date().toISOString(),
          }
        : patient
    );

    const saved = updateSection("patients", updatedPatients);

    if (saved) {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordMessage("Password updated successfully.");
    } else {
      setPasswordMessage("Unable to update password. Please try again.");
    }
  };

  return (
    <PatientLayout>
      <div className="patient-settings-page">
        <div className="patient-settings-header">
          <div>
            <span className="patient-settings-eyebrow">
              ACCOUNT PREFERENCES
            </span>
            <h1>Settings</h1>
            <p>Manage your account, appearance, and notification preferences.</p>
          </div>

          <div className="patient-settings-header-icon">
            <ShieldCheck size={26} />
          </div>
        </div>

        {message && (
          <div
            className={`patient-settings-message ${messageType}`}
            role="status"
          >
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {!currentPatient && (
          <div className="patient-settings-message error">
            Unable to find your patient account. Please sign in again.
          </div>
        )}

        {/* Account Information */}
        <section className="patient-settings-card">
          <div className="patient-settings-card-heading">
            <div className="patient-settings-section-icon">
              <UserRound size={21} />
            </div>
            <div>
              <h2>Account Information</h2>
              <p>Your registered patient account details.</p>
            </div>
          </div>

          <div className="patient-settings-account-grid">
            <div>
              <span>Full Name</span>
              <strong>{currentPatient?.name || "Not available"}</strong>
            </div>
            <div>
              <span>Email Address</span>
              <strong>{currentPatient?.email || "Not available"}</strong>
            </div>
            <div>
              <span>Phone Number</span>
              <strong>{currentPatient?.phone || "Not available"}</strong>
            </div>
            <div>
              <span>Patient ID</span>
              <strong>{currentPatient?.id || "Not available"}</strong>
            </div>
          </div>

          <p className="patient-settings-note">
            To update your personal information, visit My Profile.
          </p>
        </section>

        {/* Appearance */}
        <section className="patient-settings-card">
          <div className="patient-settings-card-heading">
            <div className="patient-settings-section-icon">
              <Palette size={21} />
            </div>
            <div>
              <h2>Appearance</h2>
              <p>Choose how CareBridge looks on your device.</p>
            </div>
          </div>

          <div className="patient-settings-options">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
              { value: "system", label: "System", icon: Monitor },
            ].map((option) => {
              const Icon = option.icon;

              return (
                <button
                  type="button"
                  key={option.value}
                  className={`patient-settings-option ${
                    theme === option.value ? "active" : ""
                  }`}
                  onClick={() => setTheme(option.value)}
                >
                  <Icon size={21} />
                  <span>{option.label}</span>
                  {theme === option.value && (
                    <CheckCircle2 size={17} />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Text Direction */}
        <section className="patient-settings-card">
          <div className="patient-settings-card-heading">
            <div className="patient-settings-section-icon">
              <Languages size={21} />
            </div>
            <div>
              <h2>Text Direction</h2>
              <p>Choose your preferred reading direction.</p>
            </div>
          </div>

          <div className="patient-settings-options">
            <button
              type="button"
              className={`patient-settings-option ${
                direction === "ltr" ? "active" : ""
              }`}
              onClick={() => setDirection("ltr")}
            >
              <Languages size={21} />
              <span>Left to Right (LTR)</span>
              {direction === "ltr" && <CheckCircle2 size={17} />}
            </button>

            <button
              type="button"
              className={`patient-settings-option ${
                direction === "rtl" ? "active" : ""
              }`}
              onClick={() => setDirection("rtl")}
            >
              <Languages size={21} />
              <span>Right to Left (RTL)</span>
              {direction === "rtl" && <CheckCircle2 size={17} />}
            </button>
          </div>
        </section>

        {/* Notifications */}
        <section className="patient-settings-card">
          <div className="patient-settings-card-heading">
            <div className="patient-settings-section-icon">
              <Bell size={21} />
            </div>
            <div>
              <h2>Notification Preferences</h2>
              <p>Choose which updates you want to receive.</p>
            </div>
          </div>

          <div className="patient-settings-notifications">
            {[
              {
                key: "appointments",
                title: "Appointment Updates",
                description: "Receive appointment booking and status updates.",
              },
              {
                key: "prescriptions",
                title: "Prescription Updates",
                description: "Receive updates when prescriptions are added.",
              },
              {
                key: "billing",
                title: "Billing Notifications",
                description: "Receive billing and payment-related updates.",
              },
              {
                key: "reminders",
                title: "Appointment Reminders",
                description: "Receive reminders about upcoming appointments.",
              },
            ].map((item) => (
              <label
                className="patient-settings-notification-row"
                key={item.key}
              >
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>

                <input
                  type="checkbox"
                  checked={Boolean(notifications[item.key])}
                  onChange={(event) =>
                    updateNotification(item.key, event.target.checked)
                  }
                />
              </label>
            ))}
          </div>
        </section>

        {/* Password */}
        <section className="patient-settings-card">
          <div className="patient-settings-card-heading">
            <div className="patient-settings-section-icon">
              <LockKeyhole size={21} />
            </div>
            <div>
              <h2>Change Password</h2>
              <p>Update your patient account password.</p>
            </div>
          </div>

          <form
            className="patient-settings-password-form"
            onSubmit={handlePasswordChange}
          >
            <label>
              Current Password
              <input
                type="password"
                required
                autoComplete="current-password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  updatePasswordField("currentPassword", event.target.value)
                }
                placeholder="Enter current password"
              />
            </label>

            <label>
              New Password
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={passwordForm.newPassword}
                onChange={(event) =>
                  updatePasswordField("newPassword", event.target.value)
                }
                placeholder="Enter new password"
              />
            </label>

            <label>
              Confirm New Password
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  updatePasswordField("confirmPassword", event.target.value)
                }
                placeholder="Confirm new password"
              />
            </label>

            {passwordMessage && (
              <div
                className={`patient-settings-password-message ${
                  passwordMessage.includes("successfully") ? "success" : "error"
                }`}
                role="status"
              >
                {passwordMessage}
              </div>
            )}

            <button
              type="submit"
              className="patient-settings-password-button"
              disabled={!currentPatient}
            >
              <LockKeyhole size={17} />
              Update Password
            </button>
          </form>

          <p className="patient-settings-note">
            Demo application: passwords are stored in localStorage and are
            not protected like passwords in a production hospital system.
          </p>
        </section>

        {/* Actions */}
        <div className="patient-settings-actions">
          <button
            type="button"
            className="patient-settings-reset-button"
            onClick={handleReset}
            disabled={!currentPatient}
          >
            <RotateCcw size={17} />
            Reset Notifications
          </button>

          <button
            type="button"
            className="patient-settings-save-button"
            onClick={handleSave}
            disabled={!currentPatient}
          >
            <Save size={17} />
            Save Preferences
          </button>
        </div>
      </div>
    </PatientLayout>
  );
}

export default PatientSettings;
