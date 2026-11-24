
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Droplets,
  CalendarDays,
  Pencil,
  Save,
  X,
  ShieldCheck,
} from "lucide-react";

import PatientLayout from "../../layouts/PatientLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./PatientProfile.css";

function PatientProfile() {
  const { patients, updateSection } = useHospitalData();

  const storedUser =
    localStorage.getItem("carebridgeUser") ||
    sessionStorage.getItem("carebridgeUser");

  const loggedInUser = storedUser
    ? JSON.parse(storedUser)
    : null;

  const patientId =
    loggedInUser?.patientId || loggedInUser?.id;

  const currentPatient =
    patients.find((patient) => patient.id === patientId) ||
    patients.find(
      (patient) =>
        patient.email?.toLowerCase() ===
        loggedInUser?.email?.toLowerCase()
    );

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    bloodGroup: "",
    address: "",
  });

  useEffect(() => {
    if (currentPatient) {
      setFormData({
        name: currentPatient.name || "",
        email: currentPatient.email || "",
        phone: currentPatient.phone || "",
        age: currentPatient.age || "",
        gender: currentPatient.gender || "",
        bloodGroup: currentPatient.bloodGroup || "",
        address: currentPatient.address || "",
      });
    }
  }, [currentPatient]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!currentPatient) return;

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      setSuccessMessage("");
      return;
    }

    const emailAlreadyExists = patients.some(
      (patient) =>
        patient.id !== currentPatient.id &&
        patient.email?.toLowerCase() ===
          formData.email.trim().toLowerCase()
    );

    if (emailAlreadyExists) {
      setSuccessMessage("This email is already used by another patient.");
      return;
    }

    const updatedPatients = patients.map((patient) =>
      patient.id === currentPatient.id
        ? {
            ...patient,
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            age: Number(formData.age) || "",
            gender: formData.gender,
            bloodGroup: formData.bloodGroup,
            address: formData.address.trim(),
          }
        : patient
    );

    updateSection("patients", updatedPatients);

    // Keep the displayed logged-in user's details in sync
    const updatedUser = {
      ...loggedInUser,
      name: formData.name.trim(),
      email: formData.email.trim(),
    };

    if (localStorage.getItem("carebridgeUser")) {
      localStorage.setItem(
        "carebridgeUser",
        JSON.stringify(updatedUser)
      );
    } else {
      sessionStorage.setItem(
        "carebridgeUser",
        JSON.stringify(updatedUser)
      );
    }

    setIsEditing(false);
    setSuccessMessage("Your profile has been updated successfully.");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleCancel = () => {
    if (currentPatient) {
      setFormData({
        name: currentPatient.name || "",
        email: currentPatient.email || "",
        phone: currentPatient.phone || "",
        age: currentPatient.age || "",
        gender: currentPatient.gender || "",
        bloodGroup: currentPatient.bloodGroup || "",
        address: currentPatient.address || "",
      });
    }

    setIsEditing(false);
    setSuccessMessage("");
  };

  if (!currentPatient) {
    return (
      <PatientLayout>
        <div className="patient-profile-page">
          <div className="patient-profile-empty">
            <UserRound size={45} />
            <h2>Patient Profile Not Found</h2>
            <p>
              We couldn't find your patient record. Please contact
              the administrator.
            </p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="patient-profile-page">

        <div className="patient-profile-header">
          <div>
            <span className="patient-profile-eyebrow">
              PATIENT ACCOUNT
            </span>
            <h1>My Profile</h1>
            <p>View and manage your personal information.</p>
          </div>

          {!isEditing && (
            <button
              className="patient-profile-edit-btn"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          )}
        </div>

        {successMessage && (
          <div
            className={`patient-profile-message ${
              successMessage.includes("successfully")
                ? "success"
                : "error"
            }`}
          >
            {successMessage}
          </div>
        )}

        <div className="patient-profile-layout">

          <section className="patient-profile-card">

            <div className="patient-profile-card-heading">
              <h2>Personal Information</h2>
              <UserRound size={21} />
            </div>

            <div className="patient-profile-avatar-section">
              <div className="patient-profile-avatar">
                <UserRound size={38} />
              </div>

              <div>
                <h2>{currentPatient.name}</h2>
                <span>Patient ID: {currentPatient.id}</span>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="patient-profile-form-grid">

                <div className="patient-profile-field">
                  <label>Full Name</label>
                  <div className="patient-profile-input">
                    <UserRound size={18} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>

                <div className="patient-profile-field">
                  <label>Email Address</label>
                  <div className="patient-profile-input">
                    <Mail size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>

                <div className="patient-profile-field">
                  <label>Phone Number</label>
                  <div className="patient-profile-input">
                    <Phone size={18} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>

                <div className="patient-profile-field">
                  <label>Age</label>
                  <div className="patient-profile-input">
                    <CalendarDays size={18} />
                    <input
                      type="number"
                      name="age"
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="patient-profile-field">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="patient-profile-field">
                  <label>Blood Group</label>
                  <div className="patient-profile-input">
                    <Droplets size={18} />
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      disabled={!isEditing}
                    >
                      <option value="">Select Blood Group</option>
                      {[
                        "A+",
                        "A-",
                        "B+",
                        "B-",
                        "AB+",
                        "AB-",
                        "O+",
                        "O-",
                      ].map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="patient-profile-field full-width">
                  <label>Address</label>
                  <div className="patient-profile-input address">
                    <MapPin size={18} />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={3}
                    />
                  </div>
                </div>

              </div>

              {isEditing && (
                <div className="patient-profile-actions">
                  <button
                    type="button"
                    className="patient-profile-cancel-btn"
                    onClick={handleCancel}
                  >
                    <X size={17} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="patient-profile-save-btn"
                  >
                    <Save size={17} />
                    Save Changes
                  </button>
                </div>
              )}
            </form>

          </section>

          <aside className="patient-profile-side">

            <div className="patient-profile-info-card">
              <div className="patient-profile-side-icon">
                <ShieldCheck size={25} />
              </div>

              <h3>Account Information</h3>

              <div className="patient-profile-info-row">
                <span>Patient ID</span>
                <strong>{currentPatient.id}</strong>
              </div>

              <div className="patient-profile-info-row">
                <span>Account Status</span>
                <strong className="patient-profile-active">
                  {currentPatient.status || "Active"}
                </strong>
              </div>

              <div className="patient-profile-info-row">
                <span>Blood Group</span>
                <strong>{currentPatient.bloodGroup || "Not added"}</strong>
              </div>
            </div>

            <div className="patient-profile-help-card">
              <Phone size={23} />
              <h3>Need Help?</h3>
              <p>
                Contact the hospital administrator if you need help
                with your account information.
              </p>
            </div>

          </aside>

        </div>

      </div>
    </PatientLayout>
  );
}

export default PatientProfile;
