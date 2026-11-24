
import { useEffect, useState } from "react";
import {
  Building2,
  UserRound,
  Clock,
  Upload,
  Save,
  RotateCcw,
  Settings,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./SettingsManagement.css";

const defaultSettings = {
  hospital: {
    name: "CareBridge Hospital",
    type: "Multi-Specialty Hospital",
    phone: "",
    email: "",
    website: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    registrationNumber: "",
    logoDataUrl: "",
  },
  admin: {
    name: "",
    email: "",
    phone: "",
  },
  businessHours: {
    weekdays: "09:00 AM - 06:00 PM",
    weekends: "Closed",
  },
};

function SettingsManagement() {
  const { data, updateSection } = useHospitalData();

  const [form, setForm] = useState(() => ({
    ...defaultSettings,
    ...(data.settings || {}),
    hospital: {
      ...defaultSettings.hospital,
      ...(data.settings?.hospital || {}),
    },
    admin: {
      ...defaultSettings.admin,
      ...(data.settings?.admin || {}),
    },
    businessHours: {
      ...defaultSettings.businessHours,
      ...(data.settings?.businessHours || {}),
    },
  }));

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!data.settings) return;

    setForm((current) => ({
      ...current,
      ...data.settings,
      hospital: {
        ...current.hospital,
        ...(data.settings.hospital || {}),
      },
      admin: {
        ...current.admin,
        ...(data.settings.admin || {}),
      },
      businessHours: {
        ...current.businessHours,
        ...(data.settings.businessHours || {}),
      },
    }));
  }, [data.settings]);

  const updateField = (section, field, value) => {
    setForm((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));

    setMessage("");
  };

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 1024 * 1024) {
      setMessage("Logo size must be less than 1 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateField("hospital", "logoDataUrl", reader.result);
    };

    reader.onerror = () => {
      setMessage("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  const handleSave = (event) => {
    event.preventDefault();

    const saved = updateSection("settings", form);

    if (saved) {
      setMessage("Settings saved successfully!");
    } else {
      setMessage("Unable to save settings. Please try again.");
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset all hospital settings to their default values?"
    );

    if (!confirmed) return;

    const resetSettings = {
      ...defaultSettings,
      hospital: { ...defaultSettings.hospital },
      admin: { ...defaultSettings.admin },
      businessHours: { ...defaultSettings.businessHours },
    };

    const saved = updateSection("settings", resetSettings);

    if (saved) {
      setForm(resetSettings);
      setMessage("Settings have been reset.");
    } else {
      setMessage("Unable to reset settings.");
    }
  };

  return (
    <AdminLayout>
      <div className="settings-page">
        <div className="settings-page-header">
          <div>
            <span className="settings-eyebrow">SYSTEM CONFIGURATION</span>
            <h1>Settings Management</h1>
            <p>Manage your hospital information and administrator details.</p>
          </div>

          <div className="settings-header-icon">
            <Settings size={25} />
          </div>
        </div>

        {message && (
          <div className="settings-message" role="status">
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>
          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-section-icon">
                <Building2 size={21} />
              </div>
              <div>
                <h2>Hospital Information</h2>
                <p>Update your hospital's basic information.</p>
              </div>
            </div>

            <div className="settings-logo-area">
              <div className="settings-logo-preview">
                {form.hospital.logoDataUrl ? (
                  <img src={form.hospital.logoDataUrl} alt="Hospital logo" />
                ) : (
                  <Building2 size={35} />
                )}
              </div>

              <div className="settings-logo-upload">
                <strong>Hospital Logo</strong>
                <p>Upload an image. Maximum file size: 1 MB.</p>
                <label className="settings-upload-button">
                  <Upload size={16} />
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </label>
              </div>
            </div>

            <div className="settings-form-grid">
              <label>
                Hospital Name *
                <input
                  required
                  value={form.hospital.name}
                  onChange={(e) =>
                    updateField("hospital", "name", e.target.value)
                  }
                  placeholder="Enter hospital name"
                />
              </label>

              <label>
                Hospital Type
                <input
                  value={form.hospital.type}
                  onChange={(e) =>
                    updateField("hospital", "type", e.target.value)
                  }
                  placeholder="e.g. Multi-Specialty Hospital"
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  value={form.hospital.phone}
                  onChange={(e) =>
                    updateField("hospital", "phone", e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                Hospital Email
                <input
                  type="email"
                  value={form.hospital.email}
                  onChange={(e) =>
                    updateField("hospital", "email", e.target.value)
                  }
                  placeholder="hospital@example.com"
                />
              </label>

              <label>
                Website
                <input
                  type="url"
                  value={form.hospital.website}
                  onChange={(e) =>
                    updateField("hospital", "website", e.target.value)
                  }
                  placeholder="https://example.com"
                />
              </label>

              <label>
                Registration Number
                <input
                  value={form.hospital.registrationNumber}
                  onChange={(e) =>
                    updateField(
                      "hospital",
                      "registrationNumber",
                      e.target.value
                    )
                  }
                  placeholder="Enter registration number"
                />
              </label>

              <label className="settings-full-width">
                Address
                <textarea
                  rows="3"
                  value={form.hospital.address}
                  onChange={(e) =>
                    updateField("hospital", "address", e.target.value)
                  }
                  placeholder="Enter hospital address"
                />
              </label>

              <label>
                City
                <input
                  value={form.hospital.city}
                  onChange={(e) =>
                    updateField("hospital", "city", e.target.value)
                  }
                  placeholder="Enter city"
                />
              </label>

              <label>
                State
                <input
                  value={form.hospital.state}
                  onChange={(e) =>
                    updateField("hospital", "state", e.target.value)
                  }
                  placeholder="Enter state"
                />
              </label>

              <label>
                Postal Code
                <input
                  value={form.hospital.postalCode}
                  onChange={(e) =>
                    updateField("hospital", "postalCode", e.target.value)
                  }
                  placeholder="Enter postal code"
                />
              </label>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-section-icon">
                <UserRound size={21} />
              </div>
              <div>
                <h2>Administrator Profile</h2>
                <p>Manage the hospital administrator's contact details.</p>
              </div>
            </div>

            <div className="settings-form-grid">
              <label>
                Administrator Name
                <input
                  value={form.admin.name}
                  onChange={(e) =>
                    updateField("admin", "name", e.target.value)
                  }
                  placeholder="Enter administrator name"
                />
              </label>

              <label>
                Administrator Email
                <input
                  type="email"
                  value={form.admin.email}
                  onChange={(e) =>
                    updateField("admin", "email", e.target.value)
                  }
                  placeholder="admin@example.com"
                />
              </label>

              <label>
                Administrator Phone
                <input
                  type="tel"
                  value={form.admin.phone}
                  onChange={(e) =>
                    updateField("admin", "phone", e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </label>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-heading">
              <div className="settings-section-icon">
                <Clock size={21} />
              </div>
              <div>
                <h2>Business Hours</h2>
                <p>Set your hospital's regular working hours.</p>
              </div>
            </div>

            <div className="settings-form-grid">
              <label>
                Weekday Hours
                <input
                  value={form.businessHours.weekdays}
                  onChange={(e) =>
                    updateField("businessHours", "weekdays", e.target.value)
                  }
                  placeholder="09:00 AM - 06:00 PM"
                />
              </label>

              <label>
                Weekend Hours
                <input
                  value={form.businessHours.weekends}
                  onChange={(e) =>
                    updateField("businessHours", "weekends", e.target.value)
                  }
                  placeholder="Closed"
                />
              </label>
            </div>
          </section>

          <div className="settings-actions">
            <button
              type="button"
              className="settings-reset-button"
              onClick={handleReset}
            >
              <RotateCcw size={17} />
              Reset Settings
            </button>

            <button type="submit" className="settings-save-button">
              <Save size={17} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default SettingsManagement;
