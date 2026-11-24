
import { useMemo, useState } from "react";
import {
  Search,
  Users,
  UserRound,
  Phone,
  Mail,
  CalendarDays,
  X,
  Droplet,
  MapPin,
  ClipboardList,
} from "lucide-react";

import DoctorLayout from "../../layouts/DoctorLayout";
import { useHospitalData } from "../../hooks/useHospitalData";

import "./MyPatients.css";

function MyPatients() {
  const { patients, appointments, doctors } = useHospitalData();

  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  let loggedInUser = null;

  try {
    loggedInUser = JSON.parse(
      localStorage.getItem("carebridgeUser") ||
      sessionStorage.getItem("carebridgeUser") ||
      "null"
    );
  } catch {
    loggedInUser = null;
  }

  const currentDoctor = doctors.find(
    (doctor) =>
      doctor.id === loggedInUser?.doctorId ||
      doctor.name?.trim().toLowerCase() ===
        loggedInUser?.name?.trim().toLowerCase()
  );

  const doctorId = currentDoctor?.id;

  // Get appointments assigned to this doctor.
  const doctorAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) => appointment.doctorId === doctorId
      ),
    [appointments, doctorId]
  );

  // Get unique patients who have appointments with this doctor.
  const myPatients = useMemo(() => {
    const patientIds = new Set(
      doctorAppointments.map((appointment) => appointment.patientId)
    );

    return patients.filter((patient) => patientIds.has(patient.id));
  }, [patients, doctorAppointments]);

  const filteredPatients = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) return myPatients;

    return myPatients.filter(
      (patient) =>
        patient.name?.toLowerCase().includes(searchValue) ||
        patient.id?.toLowerCase().includes(searchValue) ||
        patient.phone?.toLowerCase().includes(searchValue)
    );
  }, [myPatients, search]);

  const getPatientAppointments = (patientId) => {
    return doctorAppointments
      .filter((appointment) => appointment.patientId === patientId)
      .sort((a, b) => {
        const dateA = new Date(`${a.date || ""} ${a.time || ""}`);
        const dateB = new Date(`${b.date || ""} ${b.time || ""}`);
        return dateB - dateA;
      });
  };

  const scheduledCount = doctorAppointments.filter(
    (appointment) => appointment.status === "Scheduled"
  ).length;

  const completedCount = doctorAppointments.filter(
    (appointment) => appointment.status === "Completed"
  ).length;

  return (
    <DoctorLayout>
      <div className="doctor-patients-page">
        <div className="doctor-patients-header">
          <div>
            <h1>My Patients</h1>
            <p>
              View patients assigned to you through your appointments.
            </p>
          </div>
        </div>

        {!doctorId ? (
          <div className="doctor-patients-message">
            <Users size={30} />
            <h3>Doctor account not linked</h3>
            <p>
              Please log out and sign in again using the demo doctor account.
              Make sure your doctor record exists in Admin → Doctors.
            </p>
          </div>
        ) : (
          <>
            <div className="doctor-patients-stats">
              <div className="doctor-patient-stat-card">
                <div className="doctor-patient-stat-icon">
                  <Users size={23} />
                </div>
                <div>
                  <span>Total My Patients</span>
                  <h2>{myPatients.length}</h2>
                </div>
              </div>

              <div className="doctor-patient-stat-card">
                <div className="doctor-patient-stat-icon scheduled">
                  <CalendarDays size={23} />
                </div>
                <div>
                  <span>Scheduled Appointments</span>
                  <h2>{scheduledCount}</h2>
                </div>
              </div>

              <div className="doctor-patient-stat-card">
                <div className="doctor-patient-stat-icon completed">
                  <ClipboardList size={23} />
                </div>
                <div>
                  <span>Completed Appointments</span>
                  <h2>{completedCount}</h2>
                </div>
              </div>
            </div>

            <section className="doctor-patients-panel">
              <div className="doctor-patients-toolbar">
                <div>
                  <h2>Patient List</h2>
                  <p>Your patients based on assigned appointments</p>
                </div>

                <div className="doctor-patients-search">
                  <Search size={19} />
                  <input
                    type="text"
                    placeholder="Search name, patient ID or phone..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              </div>

              <div className="doctor-patients-table-wrapper">
                <table className="doctor-patients-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Patient ID</th>
                      <th>Age / Gender</th>
                      <th>Phone</th>
                      <th>Blood Group</th>
                      <th>Appointments</th>
                      <th>Status</th>
                      <th>Details</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => {
                        const patientAppointments =
                          getPatientAppointments(patient.id);

                        return (
                          <tr key={patient.id}>
                            <td>
                              <div className="doctor-patient-name-cell">
                                <div className="doctor-patient-avatar">
                                  <UserRound size={19} />
                                </div>
                                <div>
                                  <strong>{patient.name}</strong>
                                  <span>{patient.email || "No email"}</span>
                                </div>
                              </div>
                            </td>

                            <td>{patient.id}</td>
                            <td>
                              {patient.age} / {patient.gender}
                            </td>
                            <td>{patient.phone}</td>
                            <td>{patient.bloodGroup}</td>
                            <td>{patientAppointments.length}</td>

                            <td>
                              <span
                                className={`doctor-patient-status ${
                                  patient.status === "Active"
                                    ? "active"
                                    : "inactive"
                                }`}
                              >
                                {patient.status}
                              </span>
                            </td>

                            <td>
                              <button
                                type="button"
                                className="doctor-patient-view-btn"
                                onClick={() => setSelectedPatient(patient)}
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="doctor-patients-empty">
                          {myPatients.length === 0
                            ? "No patients are currently assigned to you through appointments."
                            : "No patients match your search."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="doctor-patients-footer">
                Showing {filteredPatients.length} of {myPatients.length} patients
              </div>
            </section>
          </>
        )}

        {selectedPatient && (
          <div
            className="doctor-patient-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedPatient(null);
              }
            }}
          >
            <div
              className="doctor-patient-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="doctor-patient-modal-title"
            >
              <div className="doctor-patient-modal-header">
                <div>
                  <h2 id="doctor-patient-modal-title">Patient Details</h2>
                  <p>{selectedPatient.id}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
                  aria-label="Close patient details"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="doctor-patient-profile">
                <div className="doctor-patient-large-avatar">
                  <UserRound size={30} />
                </div>
                <div>
                  <h3>{selectedPatient.name}</h3>
                  <span
                    className={`doctor-patient-status ${
                      selectedPatient.status === "Active"
                        ? "active"
                        : "inactive"
                    }`}
                  >
                    {selectedPatient.status}
                  </span>
                </div>
              </div>

              <div className="doctor-patient-details-grid">
                <div>
                  <span>Age / Gender</span>
                  <strong>
                    {selectedPatient.age} / {selectedPatient.gender}
                  </strong>
                </div>

                <div>
                  <span>Blood Group</span>
                  <strong>
                    <Droplet size={15} />
                    {selectedPatient.bloodGroup || "Not provided"}
                  </strong>
                </div>

                <div>
                  <span>Phone</span>
                  <strong>
                    <Phone size={15} />
                    {selectedPatient.phone || "Not provided"}
                  </strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>
                    <Mail size={15} />
                    {selectedPatient.email || "Not provided"}
                  </strong>
                </div>

                <div className="doctor-patient-address">
                  <span>Address</span>
                  <strong>
                    <MapPin size={15} />
                    {selectedPatient.address || "Not provided"}
                  </strong>
                </div>
              </div>

              <div className="doctor-patient-history">
                <h3>Appointment History</h3>

                {getPatientAppointments(selectedPatient.id).length > 0 ? (
                  getPatientAppointments(selectedPatient.id).map(
                    (appointment) => (
                      <div
                        className="doctor-patient-history-item"
                        key={appointment.id}
                      >
                        <div>
                          <strong>{appointment.id}</strong>
                          <span>
                            {appointment.date || "Date not provided"}
                            {appointment.time ? ` · ${appointment.time}` : ""}
                          </span>
                          <p>{appointment.reason || "No reason provided"}</p>
                        </div>

                        <span
                          className={`doctor-patient-appointment-status ${(
                            appointment.status || "Scheduled"
                          ).toLowerCase()}`}
                        >
                          {appointment.status || "Scheduled"}
                        </span>
                      </div>
                    )
                  )
                ) : (
                  <p className="doctor-patient-no-history">
                    No appointment history found.
                  </p>
                )}
              </div>

              <div className="doctor-patient-modal-actions">
                <button
                  type="button"
                  onClick={() => setSelectedPatient(null)}
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

export default MyPatients;
