
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  HeartPulse,
  Eye,
  EyeOff,
  ShieldCheck,
  Stethoscope,
  UserRound,
  ArrowRight,
  CheckCircle2,
  UserPlus,
  ArrowLeft,
} from "lucide-react";

import { getAppData, saveAppData } from "../../utils/localStorage";
import "./Login.css";

const demoUsers = {
  admin: {
    email: "admin@carebridge.com",
    password: "admin123",
    name: "Admin User",
    role: "admin",
    path: "/admin/dashboard",
  },
  doctor: {
    email: "doctor@carebridge.com",
    password: "doctor123",
    name: "Dr. Ananya Rao",
    role: "doctor",
    path: "/doctor/dashboard",
  },
  patient: {
    email: "patient@carebridge.com",
    password: "patient123",
    name: "Patient User",
    role: "patient",
    path: "/patient/dashboard",
  },
};

const roles = [
  {
    id: "admin",
    title: "Administrator",
    description: "Manage hospital operations",
    icon: ShieldCheck,
  },
  {
    id: "doctor",
    title: "Doctor",
    description: "Manage patients and treatments",
    icon: Stethoscope,
  },
  {
    id: "patient",
    title: "Patient",
    description: "Access your healthcare",
    icon: UserRound,
  },
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  specialization: "",
  qualification: "",
};

const createId = (prefix) => {
  const uniquePart =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replaceAll("-", "").slice(0, 10)
      : `${Date.now()}${Math.floor(Math.random() * 10000)}`;

  return `${prefix}${uniquePart}`;
};

function Login() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("admin");
  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState(demoUsers.admin.email);
  const [password, setPassword] = useState(demoUsers.admin.password);

  const [form, setForm] = useState(emptyForm);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setEmail(demoUsers[role].email);
    setPassword(demoUsers[role].password);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  const switchMode = (signup) => {
    setIsSignup(signup);
    setError("");
    setSuccess("");
    setForm(emptyForm);

    if (!signup) {
      setEmail(demoUsers[selectedRole].email);
      setPassword(demoUsers[selectedRole].password);
    } else {
      setEmail("");
      setPassword("");
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // SAVE LOGGED-IN USER
  const saveLoggedInUser = (user, role) => {
    const loggedInUser = {
      name: user.name,
      email: user.email,
      role,
      ...(role === "doctor" && user.id
        ? { doctorId: user.id }
        : {}),
      ...(role === "patient" && user.id
        ? { patientId: user.id }
        : {}),
      ...(role === "admin" && user.id
        ? { adminId: user.id }
        : {}),
    };

    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    otherStorage.removeItem("carebridgeUser");

    storage.setItem("carebridgeUser", JSON.stringify(loggedInUser));

    navigate(demoUsers[role].path);
  };

  // LOGIN
  const handleLogin = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();
    const typedPassword = password;

    const data = getAppData() || {};

    // ADMIN DEMO LOGIN
    if (
      selectedRole === "admin" &&
      normalizedEmail === demoUsers.admin.email &&
      typedPassword === demoUsers.admin.password
    ) {
      saveLoggedInUser(demoUsers.admin, "admin");
      return;
    }

    // DOCTOR DEMO LOGIN
    if (
      selectedRole === "doctor" &&
      normalizedEmail === demoUsers.doctor.email &&
      typedPassword === demoUsers.doctor.password
    ) {
      const doctors = data.doctors || [];

      let savedDoctorId = localStorage.getItem(
        "carebridgeDemoDoctorId"
      );

      if (!savedDoctorId) {
        const originalDoctor = doctors.find(
          (doctor) => String(doctor.id) === "DOC001"
        );

        if (originalDoctor) {
          savedDoctorId = originalDoctor.id;

          localStorage.setItem(
            "carebridgeDemoDoctorId",
            String(savedDoctorId)
          );
        }
      }

      const doctorRecord = doctors.find(
        (doctor) => String(doctor.id) === String(savedDoctorId)
      );

      if (!doctorRecord) {
        setError(
          "Linked demo doctor not found. Please check Admin → Doctors."
        );
        return;
      }

      saveLoggedInUser(doctorRecord, "doctor");
      return;
    }

    // PATIENT DEMO LOGIN
    if (
      selectedRole === "patient" &&
      normalizedEmail === demoUsers.patient.email &&
      typedPassword === demoUsers.patient.password
    ) {
      const patientRecord = (data.patients || []).find(
        (patient) => String(patient.id) === "PAT001"
      );

      saveLoggedInUser(
        patientRecord || demoUsers.patient,
        "patient"
      );
      return;
    }

    // REGISTERED ACCOUNT LOGIN
    let registeredUser = null;

    // ADMIN LOGIN
    if (selectedRole === "admin") {
      registeredUser = (data.admins || []).find(
        (item) =>
          item.email?.toLowerCase() === normalizedEmail &&
          item.password === typedPassword &&
          item.status === "Active"
      );
    }

    // DOCTOR LOGIN WITH APPROVAL CHECK
    if (selectedRole === "doctor") {
      registeredUser = (data.doctors || []).find(
        (item) =>
          item.email?.toLowerCase() === normalizedEmail &&
          item.password === typedPassword
      );

      if (registeredUser) {
        // Existing seeded doctors are treated as approved.
        const registrationStatus =
          registeredUser.registrationStatus || "Approved";

        if (registrationStatus === "Rejected") {
          setError(
            "Your doctor registration was rejected. Please contact the administrator."
          );
          return;
        }

        if (registrationStatus === "Pending") {
          setError(
            "Your registration is waiting for Admin approval."
          );
          return;
        }

        if (registeredUser.status === "Inactive") {
          setError(
            "Your doctor account is inactive. Contact Admin."
          );
          return;
        }
      }
    }

    // PATIENT LOGIN
    if (selectedRole === "patient") {
      registeredUser = (data.patients || []).find(
        (item) =>
          item.email?.toLowerCase() === normalizedEmail &&
          item.password === typedPassword
      );
    }

    if (!registeredUser) {
      setError("Invalid email or password for the selected role.");
      return;
    }

    saveLoggedInUser(registeredUser, selectedRole);
  };

  // SIGNUP
  const handleSignup = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const normalizedEmail = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!name || !normalizedEmail || !form.password) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (selectedRole === "doctor") {
      if (
        !form.specialization.trim() ||
        !form.qualification.trim()
      ) {
        setError(
          "Please enter specialization and qualification."
        );
        return;
      }
    }

    const data = getAppData() || {};

    const doctors = data.doctors || [];
    const patients = data.patients || [];
    const admins = data.admins || [];

    // Check whether this email belongs to a rejected doctor.
    const rejectedDoctor = doctors.find(
      (doctor) =>
        doctor.email?.toLowerCase() === normalizedEmail &&
        doctor.registrationStatus === "Rejected"
    );

    // Existing non-rejected doctor accounts cannot reuse their email.
    const otherDoctorExists = doctors.some(
      (doctor) =>
        doctor.email?.toLowerCase() === normalizedEmail &&
        doctor.registrationStatus !== "Rejected"
    );

    // Check other roles and demo accounts.
    const otherRoleExists = [
      ...patients,
      ...admins,
      demoUsers.admin,
      demoUsers.doctor,
      demoUsers.patient,
    ].some(
      (item) => item.email?.toLowerCase() === normalizedEmail
    );

    const emailExists = otherDoctorExists || otherRoleExists;

    if (emailExists) {
      setError(
        "This email is already registered. Please use another email or sign in."
      );
      return;
    }

    let updatedData = { ...data };
    let newUser;

    // DOCTOR SIGNUP
    if (selectedRole === "doctor") {
      newUser = {
        id: createId("DOC"),
        name,
        email: normalizedEmail,
        phone,
        specialization: form.specialization.trim(),
        qualification: form.qualification.trim(),
        password: form.password,
        availability: "Available",
        status: "Active",
        registrationStatus: "Pending",
        createdAt: new Date().toISOString(),
      };

      // Replace a previous rejected registration, if present.
      const remainingDoctors = doctors.filter(
        (doctor) =>
          !(
            doctor.email?.toLowerCase() === normalizedEmail &&
            doctor.registrationStatus === "Rejected"
          )
      );

      updatedData.doctors = [...remainingDoctors, newUser];
    }

    // PATIENT SIGNUP
    if (selectedRole === "patient") {
      newUser = {
        id: createId("PAT"),
        name,
        email: normalizedEmail,
        phone,
        age: "",
        gender: "",
        bloodGroup: "",
        address: "",
        password: form.password,
        status: "Active",
        createdAt: new Date().toISOString(),
      };

      updatedData.patients = [...patients, newUser];
    }

    // ADMIN SIGNUP
    if (selectedRole === "admin") {
      newUser = {
        id: createId("ADM"),
        name,
        email: normalizedEmail,
        phone,
        password: form.password,
        status: "Active",
        createdAt: new Date().toISOString(),
      };

      updatedData.admins = [...admins, newUser];
    }

    const saved = saveAppData(updatedData);

    if (!saved) {
      setError("Unable to save registration. Please try again.");
      return;
    }

    if (selectedRole === "doctor") {
      setSuccess(
        `Registration submitted successfully! Your Doctor ID is ${newUser.id}. Please wait for Admin approval before logging in.`
      );
    } else {
      setSuccess(
        `Registration successful! Your ${
          selectedRole === "admin" ? "Admin" : "Patient"
        } ID is ${newUser.id}. You can now sign in.`
      );
    }

    setForm(emptyForm);
    setIsSignup(false);
    setEmail(normalizedEmail);
    setPassword("");
  };

  return (
    <div className="login-page">
      {/* LEFT BRANDING SECTION */}
      <div className="login-brand-section">
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <HeartPulse size={34} />
            <span>CareBridge</span>
          </div>

          <div className="login-brand-message">
            <span className="brand-tag">
              HEALTHCARE MANAGEMENT SYSTEM
            </span>

            <h1>
              Connecting Care,
              <br />
              Improving Lives.
            </h1>

            <p>
              A smarter way to manage healthcare, connect doctors
              and patients, and simplify hospital operations.
            </p>
          </div>

          <div className="login-features">
            <div>
              <CheckCircle2 size={19} />
              <span>Connected Healthcare</span>
            </div>

            <div>
              <CheckCircle2 size={19} />
              <span>Patient-Centered Care</span>
            </div>

            <div>
              <CheckCircle2 size={19} />
              <span>Smart Hospital Management</span>
            </div>
          </div>
        </div>

        <div className="login-brand-footer">
          © 2026 CareBridge. All rights reserved.
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="mobile-brand">
            <HeartPulse size={30} />
            <span>CareBridge</span>
          </div>

          <div className="login-heading">
            <span>
              {isSignup ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}
            </span>

            <h2>
              {isSignup
                ? "Join CareBridge"
                : "Sign in to your account"}
            </h2>

            <p>
              {isSignup
                ? "Select your account type and complete registration."
                : "Select your account type and enter your credentials."}
            </p>
          </div>

          {/* ROLE SELECTION */}
          <div className="role-selection">
            <label className="section-label">
              Select your role
            </label>

            <div className="role-cards">
              {roles.map((role) => {
                const Icon = role.icon;

                return (
                  <button
                    type="button"
                    key={role.id}
                    className={`role-card ${
                      selectedRole === role.id ? "active" : ""
                    }`}
                    onClick={() => handleRoleChange(role.id)}
                  >
                    <Icon size={23} />
                    <span>{role.title}</span>
                  </button>
                );
              })}
            </div>

            <p className="role-description">
              {
                roles.find((role) => role.id === selectedRole)
                  ?.description
              }
            </p>
          </div>

          {/* SIGNUP FORM */}
          {isSignup ? (
            <form onSubmit={handleSignup}>
              <div className="login-input-group">
                <label>Full Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="login-input-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="login-input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="Enter your phone number"
                />
              </div>

              {selectedRole === "doctor" && (
                <>
                  <div className="login-input-group">
                    <label>Specialization *</label>
                    <input
                      name="specialization"
                      value={form.specialization}
                      onChange={handleFormChange}
                      placeholder="e.g. Cardiology"
                      required
                    />
                  </div>

                  <div className="login-input-group">
                    <label>Qualification *</label>
                    <input
                      name="qualification"
                      value={form.qualification}
                      onChange={handleFormChange}
                      placeholder="e.g. MBBS, MD"
                      required
                    />
                  </div>
                </>
              )}

              <div className="login-input-group">
                <label>Password *</label>

                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleFormChange}
                    placeholder="Create a password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div className="login-input-group">
                <label>Confirm Password *</label>

                <div className="password-wrapper">
                  <input
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleFormChange}
                    placeholder="Confirm your password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {selectedRole === "doctor" && (
                <div className="signup-notice">
                  Your registration will remain pending until an
                  administrator approves it.
                </div>
              )}

              {selectedRole === "admin" && (
                <div className="signup-notice">
                  Demo Admin registration is activated immediately.
                  Public Admin signup must be restricted in production.
                </div>
              )}

              {selectedRole === "patient" && (
                <div className="signup-notice">
                  You can sign in immediately after registration.
                </div>
              )}

              {error && (
                <div className="login-error">{error}</div>
              )}

              {success && (
                <div className="login-success">{success}</div>
              )}

              <button type="submit" className="login-submit">
                Create Account
                <UserPlus size={19} />
              </button>

              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => switchMode(false)}
              >
                <ArrowLeft size={16} />
                Already have an account? Sign In
              </button>
            </form>
          ) : (
            /* LOGIN FORM */
            <form onSubmit={handleLogin}>
              <div className="login-input-group">
                <label>Email Address</label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  required
                />
              </div>

              <div className="login-input-group">
                <label>Password</label>

                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                  />
                  <span>Remember me</span>
                </label>

                <span className="demo-label">Demo Access</span>
              </div>

              {error && (
                <div className="login-error">{error}</div>
              )}

              {success && (
                <div className="login-success">{success}</div>
              )}

              <button type="submit" className="login-submit">
                Sign In
                <ArrowRight size={19} />
              </button>

              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => switchMode(true)}
              >
                <UserPlus size={16} />
                Create a new {selectedRole} account
              </button>
            </form>
          )}

          {!isSignup && (
            <div className="demo-info">
              <p>
                <ShieldCheck size={17} />
                Demo Login Credentials
              </p>

              <span>
                Select a role above to automatically fill its demo
                account details. Registered accounts can use their
                own email and password.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
