
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Clock,
  UserRound,
  Stethoscope,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./AppointmentManagement.css";

const emptyForm = {
  patientId: "",
  doctorId: "",
  date: "",
  time: "",
  reason: "",
  status: "Scheduled",
};

function AppointmentManagement() {
  const {
    patients,
    doctors,
    appointments,
    activities,
    updateSection,
  } = useHospitalData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const getPatient = (id) =>
    patients.find((patient) => patient.id === id);

  const getDoctor = (id) =>
    doctors.find((doctor) => doctor.id === id);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const patient = patients.find(
        (item) => item.id === appointment.patientId
      );

      const doctor = doctors.find(
        (item) => item.id === appointment.doctorId
      );

      const searchText = search.toLowerCase();

      const matchesSearch =
        appointment.id?.toLowerCase().includes(searchText) ||
        patient?.name?.toLowerCase().includes(searchText) ||
        doctor?.name?.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, patients, doctors, search, statusFilter]);

  const addActivity = (message) => {
    const newActivity = {
      id: `ACT${Date.now()}`,
      message,
      date: new Date().toLocaleString(),
    };

    updateSection("activities", [newActivity, ...activities]);
  };

  const openAddModal = () => {
    setEditingAppointment(null);
    setForm({
      ...emptyForm,
      patientId: patients[0]?.id || "",
      doctorId: doctors[0]?.id || "",
    });
    setShowModal(true);
  };

  const openEditModal = (appointment) => {
    setEditingAppointment(appointment);
    setForm({
      patientId: appointment.patientId || "",
      doctorId: appointment.doctorId || "",
      date: appointment.date || "",
      time: appointment.time || "",
      reason: appointment.reason || "",
      status: appointment.status || "Scheduled",
    });
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.patientId || !form.doctorId) {
      alert("Please select both a patient and a doctor.");
      return;
    }

    if (!getPatient(form.patientId) || !getDoctor(form.doctorId)) {
      alert("The selected patient or doctor could not be found.");
      return;
    }

    if (!form.date || !form.time) {
      alert("Please select an appointment date and time.");
      return;
    }

    const selectedPatient = getPatient(form.patientId);
    const selectedDoctor = getDoctor(form.doctorId);

    let updatedAppointments;

    if (editingAppointment) {
      updatedAppointments = appointments.map((appointment) =>
        appointment.id === editingAppointment.id
          ? { ...appointment, ...form }
          : appointment
      );
    } else {
      const newAppointment = {
        id: `APT${Date.now()}`,
        ...form,
      };

      updatedAppointments = [...appointments, newAppointment];
    }

    const saved = updateSection(
      "appointments",
      updatedAppointments
    );

    if (!saved) {
      alert("Unable to save appointment. Please try again.");
      return;
    }

    addActivity(
      editingAppointment
        ? `Appointment for ${selectedPatient.name} updated`
        : `Appointment booked for ${selectedPatient.name} with ${selectedDoctor.name}`
    );

    setShowModal(false);
    setEditingAppointment(null);
    setForm(emptyForm);
  };

  const handleDelete = (appointment) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel and remove this appointment?"
    );

    if (!confirmed) return;

    const updatedAppointments = appointments.filter(
      (item) => item.id !== appointment.id
    );

    const saved = updateSection(
      "appointments",
      updatedAppointments
    );

    if (!saved) {
      alert("Unable to remove appointment. Please try again.");
      return;
    }

    addActivity(`Appointment ${appointment.id} removed`);
  };

  const handleStatusChange = (appointment, status) => {
    const updatedAppointments = appointments.map((item) =>
      item.id === appointment.id
        ? { ...item, status }
        : item
    );

    const saved = updateSection(
      "appointments",
      updatedAppointments
    );

    if (saved) {
      addActivity(
        `Appointment ${appointment.id} marked ${status}`
      );
    } else {
      alert("Unable to update appointment status.");
    }
  };

  const scheduledCount = appointments.filter(
    (item) => item.status === "Scheduled"
  ).length;

  const completedCount = appointments.filter(
    (item) => item.status === "Completed"
  ).length;

  const cancelledCount = appointments.filter(
    (item) => item.status === "Cancelled"
  ).length;

  return (
    <AdminLayout>
      <div className="appointment-management">
        <div className="appointment-page-header">
          <div>
            <h1>Appointment Management</h1>
            <p>
              Schedule and manage hospital patient appointments.
            </p>
          </div>

          <button
            className="appointment-add-btn"
            onClick={openAddModal}
            disabled={patients.length === 0 || doctors.length === 0}
            title={
              patients.length === 0 || doctors.length === 0
                ? "Add patients and doctors first"
                : "Add appointment"
            }
          >
            <Plus size={19} />
            Add Appointment
          </button>
        </div>

        {(patients.length === 0 || doctors.length === 0) && (
          <div className="appointment-notice">
            Please add at least one patient and one doctor before
            creating an appointment.
          </div>
        )}

        <div className="appointment-summary-grid">
          <div className="appointment-summary-card">
            <div className="appointment-summary-icon total">
              <CalendarDays size={22} />
            </div>
            <div>
              <span>Total Appointments</span>
              <h2>{appointments.length}</h2>
            </div>
          </div>

          <div className="appointment-summary-card">
            <div className="appointment-summary-icon scheduled">
              <Clock size={22} />
            </div>
            <div>
              <span>Scheduled</span>
              <h2>{scheduledCount}</h2>
            </div>
          </div>

          <div className="appointment-summary-card">
            <div className="appointment-summary-icon completed">
              <CalendarDays size={22} />
            </div>
            <div>
              <span>Completed</span>
              <h2>{completedCount}</h2>
            </div>
          </div>

          <div className="appointment-summary-card">
            <div className="appointment-summary-icon cancelled">
              <X size={22} />
            </div>
            <div>
              <span>Cancelled</span>
              <h2>{cancelledCount}</h2>
            </div>
          </div>
        </div>

        <div className="appointment-toolbar">
          <div className="appointment-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search patient, doctor or appointment ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="appointment-table-card">
          <div className="appointment-table-heading">
            <div>
              <h2>All Appointments</h2>
              <p>
                {filteredAppointments.length} appointments found
              </p>
            </div>
          </div>

          <div className="appointment-table-wrapper">
            <table className="appointment-table">
              <thead>
                <tr>
                  <th>Appointment ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAppointments.map((appointment) => {
                  const patient = getPatient(appointment.patientId);
                  const doctor = getDoctor(appointment.doctorId);

                  return (
                    <tr key={appointment.id}>
                      <td>
                        <strong>{appointment.id}</strong>
                      </td>

                      <td>
                        <div className="appointment-person">
                          <div className="appointment-person-icon patient">
                            <UserRound size={17} />
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
                        <div className="appointment-person">
                          <div className="appointment-person-icon doctor">
                            <Stethoscope size={17} />
                          </div>
                          <div>
                            <strong>
                              {doctor?.name || "Doctor not found"}
                            </strong>
                            <span>
                              {doctor?.specialization || appointment.doctorId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="appointment-date-time">
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
                          className={`appointment-status-select ${
                            appointment.status?.toLowerCase()
                          }`}
                          value={appointment.status || "Scheduled"}
                          onChange={(event) =>
                            handleStatusChange(
                              appointment,
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
                        <div className="appointment-actions">
                          <button
                            type="button"
                            title="Edit appointment"
                            onClick={() => openEditModal(appointment)}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            title="Delete appointment"
                            className="delete"
                            onClick={() => handleDelete(appointment)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan="7" className="appointment-empty">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div
            className="appointment-modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <div
              className="appointment-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="appointment-modal-header">
                <div>
                  <h2>
                    {editingAppointment
                      ? "Edit Appointment"
                      : "Book New Appointment"}
                  </h2>
                  <p>
                    Select a patient, doctor, date and time.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="appointment-form-grid">
                  <label>
                    Select Patient *
                    <select
                      name="patientId"
                      value={form.patientId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose patient</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} ({patient.id})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Select Doctor *
                    <select
                      name="doctorId"
                      value={form.doctorId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Appointment Date *
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Appointment Time *
                    <input
                      type="time"
                      name="time"
                      value={form.time}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label className="appointment-full-width">
                    Reason for Appointment
                    <textarea
                      name="reason"
                      value={form.reason}
                      onChange={handleChange}
                      placeholder="Enter reason for appointment"
                      rows="3"
                    />
                  </label>

                  <label>
                    Appointment Status
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </label>
                </div>

                <div className="appointment-modal-actions">
                  <button
                    type="button"
                    className="appointment-cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>

                  <button
                    type="submit"
                    className="appointment-save-btn"
                  >
                    {editingAppointment
                      ? "Update Appointment"
                      : "Book Appointment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AppointmentManagement;
