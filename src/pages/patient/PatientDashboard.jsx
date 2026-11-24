
import { useMemo } from "react";
import {
  CalendarDays,
  FileText,
  Clock,
  Activity,
  UserRound,
  HeartPulse,
  CreditCard,
  Pill,
} from "lucide-react";

import PatientLayout from "../../layouts/PatientLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./PatientDashboard.css";

function PatientDashboard() {
  const { data, patients, appointments, doctors } = useHospitalData();

  // Find the currently logged-in patient
  const loggedInUser = JSON.parse(
    localStorage.getItem("carebridgeUser") || "null"
  );

  const patientId =
    loggedInUser?.patientId ||
    loggedInUser?.id;

  const currentPatient = patients.find(
    (patient) => patient.id === patientId
  );

  // Show only this patient's appointments
  const myAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) => appointment.patientId === patientId
    );
  }, [appointments, patientId]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return myAppointments
      .filter((appointment) => {
        const appointmentDate = new Date(
          `${appointment.date}T${appointment.time || "00:00"}`
        );

        return (
          appointmentDate >= today &&
          appointment.status !== "Cancelled" &&
          appointment.status !== "Completed"
        );
      })
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time || "00:00"}`) -
          new Date(`${b.date}T${b.time || "00:00"}`)
      );
  }, [myAppointments]);

  const medicalRecords = (data.medicalRecords || []).filter(
    (record) => record.patientId === patientId
  );

  const prescriptions = (data.prescriptions || []).filter(
    (prescription) => prescription.patientId === patientId
  );

  const payments = (data.payments || []).filter(
    (payment) => payment.patientId === patientId
  );

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((item) => item.id === doctorId);
    return doctor?.name || "Doctor not assigned";
  };

  const getStatusClass = (status) => {
    if (status === "Completed") return "completed";
    if (status === "Cancelled") return "cancelled";
    if (status === "Scheduled") return "scheduled";
    return "pending";
  };

  const stats = [
    {
      title: "My Appointments",
      value: myAppointments.length,
      icon: CalendarDays,
      color: "blue",
    },
    {
      title: "Medical Records",
      value: medicalRecords.length,
      icon: FileText,
      color: "green",
    },
    {
      title: "Prescriptions",
      value: prescriptions.length,
      icon: Pill,
      color: "purple",
    },
    {
      title: "Upcoming Appointments",
      value: upcomingAppointments.length,
      icon: Clock,
      color: "orange",
    },
  ];

  return (
    <PatientLayout>
      <div className="patient-dashboard">

        <div className="patient-dashboard-welcome">
          <div>
            <span className="patient-dashboard-eyebrow">
              PATIENT WORKSPACE
            </span>

            <h1>
              Welcome, {currentPatient?.name || loggedInUser?.name || "Patient"}!
            </h1>

            <p>
              Manage your appointments, medical records and health information.
            </p>
          </div>

          <div className="patient-welcome-icon">
            <HeartPulse size={32} />
          </div>
        </div>

        {!currentPatient && (
          <div className="patient-dashboard-notice">
            <Activity size={20} />
            <span>
              Your patient profile could not be found. Please check your
              patient account registration.
            </span>
          </div>
        )}

        <div className="patient-dashboard-stats">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="patient-stat-card" key={stat.title}>
                <div className={`patient-stat-icon ${stat.color}`}>
                  <Icon size={23} />
                </div>

                <div>
                  <p>{stat.title}</p>
                  <h2>{stat.value}</h2>
                </div>
              </div>
            );
          })}
        </div>

        <div className="patient-dashboard-content">

          <section className="patient-dashboard-panel">
            <div className="patient-panel-heading">
              <div>
                <h2>My Recent Appointments</h2>
                <p>Your latest appointment details</p>
              </div>

              <CalendarDays size={21} />
            </div>

            {myAppointments.length > 0 ? (
              <div className="patient-appointment-list">
                {[...myAppointments]
                  .sort(
                    (a, b) =>
                      new Date(`${b.date}T${b.time || "00:00"}`) -
                      new Date(`${a.date}T${a.time || "00:00"}`)
                  )
                  .slice(0, 5)
                  .map((appointment) => (
                    <div
                      className="patient-appointment-item"
                      key={appointment.id}
                    >
                      <div className="patient-appointment-avatar">
                        <UserRound size={20} />
                      </div>

                      <div className="patient-appointment-details">
                        <strong>
                          {getDoctorName(appointment.doctorId)}
                        </strong>

                        <span>
                          {appointment.date || "Date not set"}
                          {appointment.time
                            ? ` • ${appointment.time}`
                            : ""}
                        </span>
                      </div>

                      <span
                        className={`patient-status ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {appointment.status || "Pending"}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="patient-empty-state">
                <CalendarDays size={32} />
                <p>No appointments available yet.</p>
              </div>
            )}
          </section>

          <section className="patient-dashboard-panel">
            <div className="patient-panel-heading">
              <div>
                <h2>Upcoming Appointments</h2>
                <p>Your scheduled visits</p>
              </div>

              <Clock size={21} />
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="patient-upcoming-list">
                {upcomingAppointments.slice(0, 5).map((appointment) => (
                  <div
                    className="patient-upcoming-item"
                    key={appointment.id}
                  >
                    <div className="patient-upcoming-date">
                      <CalendarDays size={19} />
                    </div>

                    <div>
                      <strong>
                        {getDoctorName(appointment.doctorId)}
                      </strong>

                      <span>
                        {appointment.date || "Date not set"}
                        {appointment.time
                          ? ` • ${appointment.time}`
                          : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="patient-empty-state">
                <Clock size={32} />
                <p>No upcoming appointments.</p>
              </div>
            )}
          </section>

        </div>

        <div className="patient-dashboard-footer">
          <Activity size={18} />
          <span>
            Dashboard information is loaded from your saved CareBridge data.
          </span>
        </div>

      </div>
    </PatientLayout>
  );
}

export default PatientDashboard;
