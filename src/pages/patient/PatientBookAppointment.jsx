
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Stethoscope,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
} from "lucide-react";

import PatientLayout from "../../layouts/PatientLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./PatientBookAppointment.css";

function getLoggedInUser() {
  try {
    return JSON.parse(
      localStorage.getItem("carebridgeUser") ||
        sessionStorage.getItem("carebridgeUser") ||
        "null"
    );
  } catch {
    return null;
  }
}

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function PatientBookAppointment() {
  const {
    data,
    patients = [],
    doctors = [],
    appointments = [],
    activities = [],
    updateSection,
  } = useHospitalData();

  const loggedInUser = getLoggedInUser();

  // Find the patient linked to the current login.
  const currentPatient = useMemo(() => {
    if (!loggedInUser || loggedInUser.role !== "patient") {
      return null;
    }

    return (
      patients.find(
        (patient) =>
          String(patient.id) === String(loggedInUser.patientId)
      ) ||
      patients.find(
        (patient) =>
          patient.email?.toLowerCase() ===
          loggedInUser.email?.toLowerCase()
      ) ||
      null
    );
  }, [loggedInUser?.patientId, loggedInUser?.email, loggedInUser?.role, patients]);

  const departments = useMemo(
    () =>
      (data?.departments || []).filter(
        (department) => department.status === "Active"
      ),
    [data?.departments]
  );

  const [form, setForm] = useState({
    departmentId: "",
    doctorId: "",
    date: "",
    time: "",
    reason: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedDepartment = departments.find(
    (department) => String(department.id) === String(form.departmentId)
  );

  const availableDoctors = useMemo(() => {
    if (!selectedDepartment) return [];

    const assignedDoctorIds = selectedDepartment.doctorIds || [];

    return doctors.filter((doctor) => {
      const registrationStatus =
        doctor.registrationStatus || "Approved";

      return (
        assignedDoctorIds.some(
          (id) => String(id) === String(doctor.id)
        ) &&
        registrationStatus === "Approved" &&
        doctor.status !== "Inactive" &&
        doctor.availability === "Available"
      );
    });
  }, [doctors, selectedDepartment]);

  const selectedDoctor = availableDoctors.find(
    (doctor) => String(doctor.id) === String(form.doctorId)
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
      ...(name === "departmentId" ? { doctorId: "" } : {}),
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!currentPatient) {
      setError(
        "Your patient account could not be linked to a patient record. Please sign in again or contact the administrator."
      );
      return;
    }

    if (
      !form.departmentId ||
      !form.doctorId ||
      !form.date ||
      !form.time ||
      !form.reason.trim()
    ) {
      setError("Please complete all appointment fields.");
      return;
    }

    const departmentStillActive = departments.some(
      (department) =>
        String(department.id) === String(form.departmentId)
    );

    const doctorStillAvailable = availableDoctors.some(
      (doctor) => String(doctor.id) === String(form.doctorId)
    );

    if (!departmentStillActive || !doctorStillAvailable) {
      setError(
        "The selected department or doctor is no longer available. Please select again."
      );
      return;
    }

    const appointmentDateTime = new Date(
      `${form.date}T${form.time}`
    );

    if (
      Number.isNaN(appointmentDateTime.getTime()) ||
      appointmentDateTime <= new Date()
    ) {
      setError("Please select a future appointment date and time.");
      return;
    }

    const newAppointment = {
      id: `APT${Date.now()}`,
      patientId: currentPatient.id,
      doctorId: selectedDoctor.id,
      date: form.date,
      time: form.time,
      reason: form.reason.trim(),
      status: "Scheduled",
    };

    const updatedAppointments = [
      ...appointments,
      newAppointment,
    ];

    const saved = updateSection(
      "appointments",
      updatedAppointments
    );

    if (saved === false) {
      setError("Unable to save your appointment. Please try again.");
      return;
    }

    const newActivity = {
      id: `ACT${Date.now()}`,
      message: `${currentPatient.name} booked an appointment with ${selectedDoctor.name}.`,
      date: new Date().toLocaleString(),
    };

    updateSection("activities", [
      newActivity,
      ...activities,
    ]);

    setSuccess(
      `Appointment booked successfully! Your Appointment ID is ${newAppointment.id}.`
    );

    setForm({
      departmentId: "",
      doctorId: "",
      date: "",
      time: "",
      reason: "",
    });
  };

  return (
    <PatientLayout>
      <div className="patient-book-page">
        <div className="patient-book-header">
          <div>
            <span className="patient-book-eyebrow">
              PATIENT SERVICES
            </span>
            <h1>Book an Appointment</h1>
            <p>
              Choose a department, select an available doctor,
              and schedule your visit.
            </p>
          </div>

          <div className="patient-book-header-icon">
            <CalendarDays size={30} />
          </div>
        </div>

        <div className="patient-book-content">
          <div className="patient-book-card">
            <div className="patient-book-card-heading">
              <div className="patient-book-heading-icon">
                <CalendarDays size={21} />
              </div>
              <div>
                <h2>Appointment Details</h2>
                <p>Complete the form to schedule your visit.</p>
              </div>
            </div>

            {!currentPatient && (
              <div className="patient-book-alert error">
                <AlertCircle size={19} />
                <span>
                  Your patient profile could not be found. Please
                  sign in with your registered patient account.
                </span>
              </div>
            )}

            {error && (
              <div className="patient-book-alert error">
                <AlertCircle size={19} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="patient-book-alert success">
                <CheckCircle2 size={19} />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="patient-book-patient-info">
                <div>
                  <span>Booking for</span>
                  <strong>
                    {currentPatient?.name || "Patient"}
                  </strong>
                </div>
                <div>
                  <span>Patient ID</span>
                  <strong>{currentPatient?.id || "Not linked"}</strong>
                </div>
              </div>

              <div className="patient-book-form-grid">
                <div className="patient-book-field">
                  <label htmlFor="departmentId">
                    <Building2 size={16} />
                    Department
                  </label>
                  <select
                    id="departmentId"
                    name="departmentId"
                    value={form.departmentId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="patient-book-field">
                  <label htmlFor="doctorId">
                    <Stethoscope size={16} />
                    Available Doctor
                  </label>
                  <select
                    id="doctorId"
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    disabled={!form.departmentId}
                    required
                  >
                    <option value="">
                      {!form.departmentId
                        ? "Select department first"
                        : availableDoctors.length
                          ? "Select doctor"
                          : "No available doctors"}
                    </option>
                    {availableDoctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} — {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="patient-book-field">
                  <label htmlFor="date">
                    <CalendarDays size={16} />
                    Appointment Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    name="date"
                    min={getToday()}
                    value={form.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="patient-book-field">
                  <label htmlFor="time">
                    <Clock size={16} />
                    Appointment Time
                  </label>
                  <input
                    id="time"
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="patient-book-field full-width">
                  <label htmlFor="reason">
                    <FileText size={16} />
                    Reason for Appointment
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    rows="4"
                    value={form.reason}
                    onChange={handleChange}
                    placeholder="Briefly describe your symptoms or reason for visiting..."
                    required
                  />
                </div>
              </div>

              {selectedDoctor && (
                <div className="patient-book-doctor-preview">
                  <div className="patient-book-doctor-avatar">
                    <Stethoscope size={22} />
                  </div>
                  <div>
                    <strong>{selectedDoctor.name}</strong>
                    <span>
                      {selectedDoctor.specialization}
                    </span>
                  </div>
                  <span className="patient-book-available">
                    Available
                  </span>
                </div>
              )}

              <div className="patient-book-form-actions">
                <button
                  type="submit"
                  disabled={!currentPatient}
                  className="patient-book-submit"
                >
                  <CalendarDays size={18} />
                  Book Appointment
                </button>
              </div>
            </form>
          </div>

          <aside className="patient-book-side-card">
            <div className="patient-book-side-icon">
              <HeartPulse size={25} />
            </div>
            <h3>Before You Book</h3>
            <ul>
              <li>Select the department related to your needs.</li>
              <li>Choose a doctor who is currently available.</li>
              <li>Select a future date and appointment time.</li>
              <li>Enter a short reason for your visit.</li>
            </ul>
            <div className="patient-book-side-note">
              <CheckCircle2 size={18} />
              <span>
                Your appointment will be saved to your patient
                account and shared with the hospital team.
              </span>
            </div>
          </aside>
        </div>
      </div>
    </PatientLayout>
  );
}

export default PatientBookAppointment;
