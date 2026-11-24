
import { useMemo } from "react";
import {
  Users,
  CalendarDays,
  FileText,
  Clock,
  Activity,
  UserRound,
} from "lucide-react";

import DoctorLayout from "../../layouts/DoctorLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./DoctorDashboard.css";

function DoctorDashboard() {
  const { data, patients, appointments, doctors } = useHospitalData();

  const medicalRecords = data.medicalRecords || [];

  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return appointments
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
  }, [appointments]);

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort(
        (a, b) =>
          new Date(`${b.date}T${b.time || "00:00"}`) -
          new Date(`${a.date}T${a.time || "00:00"}`)
      )
      .slice(0, 5);
  }, [appointments]);

  const getPatientName = (patientId) => {
    const patient = patients.find((item) => item.id === patientId);
    return patient?.name || "Unknown Patient";
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find((item) => item.id === doctorId);
    return doctor?.name || "Unassigned";
  };

  const getStatusClass = (status) => {
    if (status === "Completed") return "completed";
    if (status === "Cancelled") return "cancelled";
    if (status === "Scheduled") return "scheduled";
    return "pending";
  };

  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      icon: Users,
      color: "blue",
    },
    {
      title: "Total Appointments",
      value: appointments.length,
      icon: CalendarDays,
      color: "purple",
    },
    {
      title: "Medical Records",
      value: medicalRecords.length,
      icon: FileText,
      color: "green",
    },
    {
      title: "Upcoming Appointments",
      value: upcomingAppointments.length,
      icon: Clock,
      color: "orange",
    },
  ];

  return (
    <DoctorLayout>
      <div className="doctor-dashboard">

        <div className="doctor-dashboard-welcome">
          <div>
            <span className="doctor-dashboard-eyebrow">
              DOCTOR WORKSPACE
            </span>
            <h1>Welcome to CareBridge!</h1>
            <p>
              Manage your appointments, patients and medical records.
            </p>
          </div>

          <div className="doctor-welcome-icon">
            <Activity size={32} />
          </div>
        </div>

        <div className="doctor-dashboard-stats">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="doctor-stat-card" key={stat.title}>
                <div className={`doctor-stat-icon ${stat.color}`}>
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

        <div className="doctor-dashboard-content">

          <section className="doctor-dashboard-panel">
            <div className="doctor-panel-heading">
              <div>
                <h2>Recent Appointments</h2>
                <p>Latest appointments in CareBridge</p>
              </div>
              <CalendarDays size={21} />
            </div>

            {recentAppointments.length > 0 ? (
              <div className="doctor-appointment-list">
                {recentAppointments.map((appointment) => (
                  <div
                    className="doctor-appointment-item"
                    key={appointment.id}
                  >
                    <div className="doctor-patient-avatar">
                      <UserRound size={20} />
                    </div>

                    <div className="doctor-appointment-details">
                      <strong>
                        {getPatientName(appointment.patientId)}
                      </strong>
                      <span>
                        {getDoctorName(appointment.doctorId)}
                      </span>
                      <small>
                        {appointment.date || "Date not set"}
                        {appointment.time
                          ? ` • ${appointment.time}`
                          : ""}
                      </small>
                    </div>

                    <span
                      className={`doctor-status ${getStatusClass(
                        appointment.status
                      )}`}
                    >
                      {appointment.status || "Pending"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="doctor-empty-state">
                <CalendarDays size={32} />
                <p>No appointments available yet.</p>
              </div>
            )}
          </section>

          <section className="doctor-dashboard-panel">
            <div className="doctor-panel-heading">
              <div>
                <h2>Upcoming Appointments</h2>
                <p>Appointments scheduled from today</p>
              </div>
              <Clock size={21} />
            </div>

            {upcomingAppointments.length > 0 ? (
              <div className="doctor-upcoming-list">
                {upcomingAppointments.slice(0, 5).map((appointment) => (
                  <div
                    className="doctor-upcoming-item"
                    key={appointment.id}
                  >
                    <div className="doctor-upcoming-date">
                      <CalendarDays size={19} />
                    </div>

                    <div>
                      <strong>
                        {getPatientName(appointment.patientId)}
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
              <div className="doctor-empty-state">
                <Clock size={32} />
                <p>No upcoming appointments.</p>
              </div>
            )}
          </section>

        </div>

        <div className="doctor-dashboard-footer">
          <Activity size={18} />
          <span>
            Dashboard information is loaded from your saved CareBridge data.
          </span>
        </div>

      </div>
    </DoctorLayout>
  );
}

export default DoctorDashboard;
