
import { useMemo, useState } from "react";
import {
  Search,
  CalendarDays,
  Clock,
  UserRound,
  Stethoscope,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  ClipboardList,
} from "lucide-react";

import DoctorLayout from "../../layouts/DoctorLayout";
import { useHospitalData } from "../../hooks/useHospitalData";

import "./MyAppointments.css";

function getLoggedInUser() {
  try {
    const storedUser =
      localStorage.getItem("carebridgeUser") ||
      sessionStorage.getItem("carebridgeUser");

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function MyAppointments() {
  const {
    patients,
    doctors,
    appointments,
    updateSection,
  } = useHospitalData();

  const user = getLoggedInUser();

  const doctorId = user?.doctorId;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const myAppointments = useMemo(() => {
    if (!doctorId) return [];

    return appointments.filter(
      (appointment) => appointment.doctorId === doctorId
    );
  }, [appointments, doctorId]);

  const getPatient = (patientId) =>
    patients.find((patient) => patient.id === patientId);

  const getDoctor = (id) =>
    doctors.find((doctor) => doctor.id === id);

  const filteredAppointments = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return myAppointments.filter((appointment) => {
      const patient = patients.find(
        (item) => item.id === appointment.patientId
      );

      const matchesSearch =
        appointment.id?.toLowerCase().includes(searchText) ||
        patient?.name?.toLowerCase().includes(searchText) ||
        appointment.reason?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [myAppointments, patients, search, statusFilter]);

  const scheduledCount = myAppointments.filter(
    (item) => item.status === "Scheduled"
  ).length;

  const completedCount = myAppointments.filter(
    (item) => item.status === "Completed"
  ).length;

  const cancelledCount = myAppointments.filter(
    (item) => item.status === "Cancelled"
  ).length;

  const handleStatusChange = (appointmentId, newStatus) => {
    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === appointmentId
        ? { ...appointment, status: newStatus }
        : appointment
    );

    const saved = updateSection(
      "appointments",
      updatedAppointments
    );

    if (!saved) {
      alert("Unable to update appointment. Please try again.");
    }

    if (selectedAppointment?.id === appointmentId) {
      setSelectedAppointment((previous) => ({
        ...previous,
        status: newStatus,
      }));
    }
  };

  if (!user || user.role !== "doctor") {
    return (
      <DoctorLayout>
        <div className="doctor-appointments">
          <div className="doctor-appointment-notice">
            Please sign in with the Doctor demo account to view appointments.
          </div>
        </div>
      </DoctorLayout>
    );
  }

  if (!doctorId) {
    return (
      <DoctorLayout>
        <div className="doctor-appointments">
          <div className="doctor-appointment-notice">
            Your demo login is not connected to a doctor record.
            Please log out and sign in again after checking Admin → Doctors.
          </div>
        </div>
      </DoctorLayout>
    );
  }

  const currentDoctor = getDoctor(doctorId);

  return (
    <DoctorLayout>
      <div className="doctor-appointments">

        {/* PAGE HEADER */}

        <div className="doctor-appointments-header">
          <div>
            <span className="doctor-appointments-eyebrow">
              DOCTOR WORKSPACE
            </span>

            <h1>My Appointments</h1>

            <p>
              View and manage appointments assigned to you.
            </p>
          </div>

          <div className="doctor-appointments-profile">
            <div className="doctor-appointments-avatar">
              <Stethoscope size={22} />
            </div>

            <div>
              <strong>{currentDoctor?.name || user.name}</strong>
              <span>
                {currentDoctor?.specialization || "Doctor"}
              </span>
            </div>
          </div>
        </div>

        {/* SUMMARY CARDS */}

        <div className="doctor-appointment-stats">

          <div className="doctor-appointment-stat-card">
            <div className="doctor-appointment-stat-icon total">
              <CalendarDays size={22} />
            </div>

            <div>
              <span>Total Appointments</span>
              <h2>{myAppointments.length}</h2>
            </div>
          </div>

          <div className="doctor-appointment-stat-card">
            <div className="doctor-appointment-stat-icon scheduled">
              <Clock size={22} />
            </div>

            <div>
              <span>Scheduled</span>
              <h2>{scheduledCount}</h2>
            </div>
          </div>

          <div className="doctor-appointment-stat-card">
            <div className="doctor-appointment-stat-icon completed">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Completed</span>
              <h2>{completedCount}</h2>
            </div>
          </div>

          <div className="doctor-appointment-stat-card">
            <div className="doctor-appointment-stat-icon cancelled">
              <XCircle size={22} />
            </div>

            <div>
              <span>Cancelled</span>
              <h2>{cancelledCount}</h2>
            </div>
          </div>

        </div>

        {/* TOOLBAR */}

        <div className="doctor-appointment-toolbar">

          <div className="doctor-appointment-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search patient or appointment ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            className="doctor-appointment-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

        </div>

        {/* APPOINTMENT TABLE */}

        <div className="doctor-appointment-table-card">

          <div className="doctor-appointment-table-heading">
            <div>
              <h2>Appointment List</h2>
              <p>
                {filteredAppointments.length} appointments found
              </p>
            </div>
          </div>

          <div className="doctor-appointment-table-wrapper">
            <table className="doctor-appointment-table">

              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map((appointment) => {
                  const patient = getPatient(appointment.patientId);

                  return (
                    <tr key={appointment.id}>

                      <td>
                        <strong>{appointment.id}</strong>
                      </td>

                      <td>
                        <div className="doctor-appointment-patient">
                          <div className="doctor-appointment-patient-icon">
                            <UserRound size={18} />
                          </div>

                          <div>
                            <strong>
                              {patient?.name || "Patient not found"}
                            </strong>

                            <span>{appointment.patientId}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="doctor-appointment-date">
                          <span>
                            <CalendarDays size={15} />
                            {appointment.date || "Not set"}
                          </span>

                          <span>
                            <Clock size={15} />
                            {appointment.time || "Not set"}
                          </span>
                        </div>
                      </td>

                      <td>
                        {appointment.reason || "General consultation"}
                      </td>

                      <td>
                        <select
                          className={`doctor-appointment-status ${appointment.status?.toLowerCase()}`}
                          value={appointment.status || "Scheduled"}
                          onChange={(event) =>
                            handleStatusChange(
                              appointment.id,
                              event.target.value
                            )
                          }
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="doctor-appointment-view-btn"
                          title="View appointment details"
                          onClick={() =>
                            setSelectedAppointment(appointment)
                          }
                        >
                          <Eye size={17} />
                          <span>View</span>
                        </button>
                      </td>

                    </tr>
                  );
                })}

                {filteredAppointments.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="doctor-appointment-empty"
                    >
                      <ClipboardList size={32} />
                      <strong>No appointments found</strong>
                      <span>
                        Appointments assigned to you will appear here.
                      </span>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </div>

        {/* APPOINTMENT DETAILS MODAL */}

        {selectedAppointment && (
          <div
            className="doctor-appointment-modal-overlay"
            onClick={() => setSelectedAppointment(null)}
          >
            <div
              className="doctor-appointment-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="doctor-appointment-modal-header">
                <div>
                  <span>APPOINTMENT DETAILS</span>
                  <h2>{selectedAppointment.id}</h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  aria-label="Close details"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="doctor-appointment-modal-body">

                <div className="doctor-appointment-detail">
                  <span>Patient Name</span>
                  <strong>
                    {getPatient(selectedAppointment.patientId)?.name ||
                      "Patient not found"}
                  </strong>
                </div>

                <div className="doctor-appointment-detail">
                  <span>Patient ID</span>
                  <strong>{selectedAppointment.patientId}</strong>
                </div>

                <div className="doctor-appointment-detail">
                  <span>Doctor</span>
                  <strong>
                    {getDoctor(selectedAppointment.doctorId)?.name ||
                      user.name}
                  </strong>
                </div>

                <div className="doctor-appointment-detail">
                  <span>Date</span>
                  <strong>{selectedAppointment.date || "Not set"}</strong>
                </div>

                <div className="doctor-appointment-detail">
                  <span>Time</span>
                  <strong>{selectedAppointment.time || "Not set"}</strong>
                </div>

                <div className="doctor-appointment-detail">
                  <span>Status</span>
                  <strong>{selectedAppointment.status || "Scheduled"}</strong>
                </div>

                <div className="doctor-appointment-detail full">
                  <span>Reason for Appointment</span>
                  <strong>
                    {selectedAppointment.reason || "General consultation"}
                  </strong>
                </div>

              </div>

              <div className="doctor-appointment-modal-footer">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </DoctorLayout>
  );
}

export default MyAppointments;
