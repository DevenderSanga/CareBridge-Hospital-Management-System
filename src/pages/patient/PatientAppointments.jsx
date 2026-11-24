
import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Stethoscope,
  ClipboardList,
  XCircle,
    Search,
    RefreshCw,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  HeartPulse,
} from "lucide-react";


import PatientLayout from "../../layouts/PatientLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./PatientAppointments.css";

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

function formatDate(date) {
  if (!date) return "Not scheduled";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PatientAppointments() {
  const {
    patients,
    doctors,
    appointments,
    activities,
    updateSection,
  } = useHospitalData();

  const loggedInUser = getLoggedInUser();

  const patientId =
    loggedInUser?.patientId || loggedInUser?.id;

  const currentPatient =
    patients.find((patient) => patient.id === patientId) ||
    patients.find(
      (patient) =>
        patient.email?.toLowerCase() ===
        loggedInUser?.email?.toLowerCase()
    );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [message, setMessage] = useState("");

  const patientAppointments = useMemo(() => {
    if (!currentPatient) return [];

    return appointments
      .filter(
        (appointment) =>
          appointment.patientId === currentPatient.id
      )
      .sort((a, b) => {
        const first = new Date(
          `${a.date || "1970-01-01"}T${a.time || "00:00"}`
        );

        const second = new Date(
          `${b.date || "1970-01-01"}T${b.time || "00:00"}`
        );

        return first - second;
      });
  }, [appointments, currentPatient]);

  const filteredAppointments = useMemo(() => {
    return patientAppointments.filter((appointment) => {
      const doctor = doctors.find(
        (item) => item.id === appointment.doctorId
      );

      const searchText = search.toLowerCase();

      const matchesSearch =
        appointment.id?.toLowerCase().includes(searchText) ||
        doctor?.name?.toLowerCase().includes(searchText) ||
        appointment.reason?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [
    patientAppointments,
    doctors,
    search,
    statusFilter,
  ]);

  const scheduledCount = patientAppointments.filter(
    (item) => item.status === "Scheduled"
  ).length;

  const completedCount = patientAppointments.filter(
    (item) => item.status === "Completed"
  ).length;

  const cancelledCount = patientAppointments.filter(
    (item) => item.status === "Cancelled"
  ).length;

  const handleCancel = (appointment) => {
    const appointmentDate = new Date(
      `${appointment.date}T${appointment.time || "00:00"}`
    );

    const isUpcoming =
      !Number.isNaN(appointmentDate.getTime()) &&
      appointmentDate >= new Date();

    if (appointment.status !== "Scheduled" || !isUpcoming) {
      setMessage("This appointment cannot be cancelled.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel appointment ${appointment.id}?`
    );

    if (!confirmed) return;

    const updatedAppointments = appointments.map((item) =>
      item.id === appointment.id
        ? { ...item, status: "Cancelled" }
        : item
    );

    const saved = updateSection(
      "appointments",
      updatedAppointments
    );

    if (!saved) {
      setMessage("Unable to cancel appointment. Please try again.");
      return;
    }

    const newActivity = {
      id: `ACT${Date.now()}`,
      message: `Patient ${currentPatient.name} cancelled appointment ${appointment.id}`,
      date: new Date().toLocaleString(),
    };

    updateSection("activities", [
      newActivity,
      ...activities,
    ]);

    setMessage("Appointment cancelled successfully.");
  };

  const getDoctor = (doctorId) =>
    doctors.find((doctor) => doctor.id === doctorId);

  const canCancel = (appointment) => {
    if (appointment.status !== "Scheduled") return false;

    const appointmentDate = new Date(
      `${appointment.date}T${appointment.time || "00:00"}`
    );

    return (
      !Number.isNaN(appointmentDate.getTime()) &&
      appointmentDate >= new Date()
    );
  };

  const getStatusClass = (status) => {
    return (status || "Scheduled")
      .toLowerCase()
      .replace(/\s+/g, "-");
  };

  return (
    <PatientLayout>
      <div className="patient-appointments">

        <div className="patient-appointments-header">
          <div>
            <h1>My Appointments</h1>
            <p>
              View and manage your hospital appointments.
            </p>
          </div>

          <div className="patient-appointment-header-icon">
            <CalendarDays size={25} />
          </div>
        </div>

        {!currentPatient ? (
          <div className="patient-appointment-empty">
            <UserRound size={42} />
            <h2>Patient Profile Not Found</h2>
            <p>
              We could not find your patient account.
              Please contact the hospital administrator.
            </p>
          </div>
        ) : (
          <>
            {message && (
              <div className="patient-appointment-message">
                <span>{message}</span>
                <button
                  type="button"
                  onClick={() => setMessage("")}
                  aria-label="Close message"
                >
                  <XCircle size={18} />
                </button>
              </div>
            )}

            <div className="patient-appointment-stats">
              <div className="patient-appointment-stat">
                <div className="stat-icon total">
                  <ClipboardList size={22} />
                </div>
                <div>
                  <span>Total Appointments</span>
                  <h2>{patientAppointments.length}</h2>
                </div>
              </div>

              <div className="patient-appointment-stat">
                <div className="stat-icon scheduled">
                  <Clock size={22} />
                </div>
                <div>
                  <span>Scheduled</span>
                  <h2>{scheduledCount}</h2>
                </div>
              </div>

              <div className="patient-appointment-stat">
                <div className="stat-icon completed">
                  <CalendarDays size={22} />
                </div>
                <div>
                  <span>Completed</span>
                  <h2>{completedCount}</h2>
                </div>
              </div>

              <div className="patient-appointment-stat">
                <div className="stat-icon cancelled">
                  <XCircle size={22} />
                </div>
                <div>
                  <span>Cancelled</span>
                  <h2>{cancelledCount}</h2>
                </div>
              </div>
            </div>

            <div className="patient-appointment-toolbar">
              <div className="patient-appointment-search">
                <Search size={19} />
                <input
                  type="text"
                  placeholder="Search doctor, appointment ID or reason..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="All">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="patient-appointment-list-header">
              <div>
                <h2>Appointment History</h2>
                <p>
                  {filteredAppointments.length} appointments found
                </p>
              </div>

              <button
                type="button"
                className="patient-appointment-refresh"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All");
                  setMessage("");
                }}
              >
                <RefreshCw size={16} />
                Reset Filters
              </button>
            </div>

            <div className="patient-appointment-list">
              {filteredAppointments.map((appointment) => {
                const doctor = getDoctor(appointment.doctorId);

                return (
                  <div
                    className="patient-appointment-card"
                    key={appointment.id}
                  >
                    <div className="patient-appointment-card-top">
                      <div className="patient-appointment-doctor">
                        <div className="patient-doctor-icon">
                          <Stethoscope size={23} />
                        </div>

                        <div>
                          <h3>
                            {doctor?.name || "Doctor not found"}
                          </h3>
                          <p>
                            {doctor?.department ||
                              doctor?.specialization ||
                              appointment.doctorId}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`patient-appointment-status ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {appointment.status || "Scheduled"}
                      </span>
                    </div>

                    <div className="patient-appointment-details">
                      <div>
                        <CalendarDays size={17} />
                        <span>
                          {formatDate(appointment.date)}
                        </span>
                      </div>

                      <div>
                        <Clock size={17} />
                        <span>{appointment.time || "Not set"}</span>
                      </div>

                      <div>
                        <ClipboardList size={17} />
                        <span>{appointment.id}</span>
                      </div>
                    </div>

                    <div className="patient-appointment-reason">
                      <strong>Reason for Appointment</strong>
                      <p>
                        {appointment.reason ||
                          "General consultation"}
                      </p>
                    </div>

                    {canCancel(appointment) && (
                      <div className="patient-appointment-card-actions">
                        <button
                          type="button"
                          className="patient-appointment-cancel"
                          onClick={() => handleCancel(appointment)}
                        >
                          <XCircle size={17} />
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredAppointments.length === 0 && (
                <div className="patient-appointment-empty">
                  <CalendarDays size={42} />
                  <h2>No Appointments Found</h2>
                  <p>
                    You don't have any appointments matching
                    the selected filters.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </PatientLayout>
  );
}

export default PatientAppointments;
