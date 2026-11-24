
import { useEffect, useMemo, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  Stethoscope,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  BriefcaseMedical,
  CalendarDays,
} from "lucide-react";

import DoctorLayout from "../../layouts/DoctorLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./DoctorProfile.css";

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

function DoctorProfile() {
  const { data, doctors, updateSection } = useHospitalData();

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

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    availability: "Available",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!doctor) return;

    setForm({
      name: doctor.name || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      specialization: doctor.specialization || "",
      availability: doctor.availability || "Available",
    });
  }, [doctor]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const handleReset = () => {
    if (!doctor) return;

    setForm({
      name: doctor.name || "",
      email: doctor.email || "",
      phone: doctor.phone || "",
      specialization: doctor.specialization || "",
      availability: doctor.availability || "Available",
    });

    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!doctor) {
      setMessage("Doctor record not found. Please contact the administrator.");
      setMessageType("error");
      return;
    }

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.specialization.trim()
    ) {
      setMessage("Please fill in all required fields.");
      setMessageType("error");
      return;
    }

    setSaving(true);

    const updatedDoctors = doctors.map((item) =>
      String(item.id) === String(doctor.id)
        ? {
            ...item,
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            specialization: form.specialization.trim(),
            availability: form.availability,
            updatedAt: new Date().toISOString(),
          }
        : item
    );

    const updated = updateSection("doctors", updatedDoctors);

    if (!updated) {
      setMessage("Unable to save your profile. Please try again.");
      setMessageType("error");
      setSaving(false);
      return;
    }

    // Keep the active demo login identity synchronized.
    const storage = localStorage.getItem("carebridgeUser")
      ? localStorage
      : sessionStorage;

    const currentUser = getLoggedInUser();

    if (currentUser) {
      storage.setItem(
        "carebridgeUser",
        JSON.stringify({
          ...currentUser,
          name: form.name.trim(),
          email: form.email.trim(),
          doctorId: doctor.id,
        })
      );
    }

    // Save an activity entry without replacing other hospital data.
    const currentData = JSON.parse(
      localStorage.getItem("carebridgeData") || "{}"
    );

    const activity = {
      id: `ACT${Date.now()}`,
      action: "Doctor profile updated",
      details: `${form.name.trim()} updated their profile`,
      date: new Date().toISOString(),
      role: "doctor",
    };

    updateSection("activities", [
      activity,
      ...(currentData.activities || []),
    ]);

    setMessage("Your profile has been updated successfully.");
    setMessageType("success");
    setSaving(false);
  };

  if (!loggedInUser || !doctor) {
    return (
      <DoctorLayout>
        <div className="doctor-profile-page">
          <div className="doctor-profile-message error">
            <AlertCircle size={20} />
            Doctor record not found. Please check your demo login and Admin
            Doctor Management record.
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="doctor-profile-page">
        <div className="doctor-profile-heading">
          <div>
            <span className="doctor-profile-eyebrow">ACCOUNT</span>
            <h1>My Profile</h1>
            <p>View and manage your professional information.</p>
          </div>

          <div className="doctor-profile-id">
            <ShieldCheck size={17} />
            <span>{doctor.id}</span>
          </div>
        </div>

        <div className="doctor-profile-layout">
          <section className="doctor-profile-card">
            <div className="doctor-profile-cover">
              <div className="doctor-profile-avatar">
                <UserRound size={42} />
              </div>
            </div>

            <div className="doctor-profile-summary">
              <h2>{form.name || "Doctor Name"}</h2>
              <p>{form.specialization || "Specialization"}</p>

              <span
                className={`doctor-profile-status ${
                  form.availability === "Available"
                    ? "available"
                    : form.availability === "Busy"
                    ? "busy"
                    : "leave"
                }`}
              >
                <span className="status-dot" />
                {form.availability}
              </span>

              <div className="doctor-profile-summary-details">
                <div>
                  <Mail size={17} />
                  <span>{form.email || "No email added"}</span>
                </div>
                <div>
                  <Phone size={17} />
                  <span>{form.phone || "No phone added"}</span>
                </div>
                <div>
                  <BriefcaseMedical size={17} />
                  <span>{doctor.status || "Active"} Doctor</span>
                </div>
                <div>
                  <CalendarDays size={17} />
                  <span>
                    Member ID: {doctor.id}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="doctor-profile-card doctor-profile-form-card">
            <div className="doctor-profile-form-heading">
              <div>
                <h2>Personal Information</h2>
                <p>Update your professional and contact details.</p>
              </div>
              <UserRound size={22} />
            </div>

            {message && (
              <div className={`doctor-profile-message ${messageType}`}>
                {messageType === "success" ? (
                  <CheckCircle2 size={19} />
                ) : (
                  <AlertCircle size={19} />
                )}
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="doctor-profile-form-grid">
                <div className="doctor-profile-field">
                  <label htmlFor="doctor-name">Full Name *</label>
                  <div className="doctor-profile-input-wrap">
                    <UserRound size={18} />
                    <input
                      id="doctor-name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                <div className="doctor-profile-field">
                  <label htmlFor="doctor-email">Email Address *</label>
                  <div className="doctor-profile-input-wrap">
                    <Mail size={18} />
                    <input
                      id="doctor-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="doctor-profile-field">
                  <label htmlFor="doctor-phone">Phone Number *</label>
                  <div className="doctor-profile-input-wrap">
                    <Phone size={18} />
                    <input
                      id="doctor-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div className="doctor-profile-field">
                  <label htmlFor="doctor-specialization">
                    Specialization *
                  </label>
                  <div className="doctor-profile-input-wrap">
                    <Stethoscope size={18} />
                    <input
                      id="doctor-specialization"
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      placeholder="Enter specialization"
                      required
                    />
                  </div>
                </div>

                <div className="doctor-profile-field full-width">
                  <label htmlFor="doctor-availability">
                    Availability Status
                  </label>
                  <select
                    id="doctor-availability"
                    name="availability"
                    value={form.availability}
                    onChange={handleChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="doctor-profile-form-actions">
                <button
                  type="button"
                  className="doctor-profile-reset-btn"
                  onClick={handleReset}
                >
                  <RotateCcw size={17} />
                  Reset
                </button>

                <button
                  type="submit"
                  className="doctor-profile-save-btn"
                  disabled={saving}
                >
                  <Save size={17} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </DoctorLayout>
  );
}

export default DoctorProfile;
