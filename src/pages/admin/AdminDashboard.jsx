
import { useEffect, useState } from "react";
import {
  Users,
  Stethoscope,
  CalendarDays,
  CreditCard,
  Activity,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { getAppData } from "../../utils/localStorage";

import "./AdminDashboard.css";

function AdminDashboard() {
  const [hospitalData, setHospitalData] = useState(() => getAppData() || {
    patients: [],
    doctors: [],
    appointments: [],
    payments: [],
    activities: [],
  });

  useEffect(() => {
    const refreshData = () => {
      setHospitalData(getAppData() || {
        patients: [],
        doctors: [],
        appointments: [],
        payments: [],
        activities: [],
      });
    };

    window.addEventListener("carebridgeDataUpdated", refreshData);

    return () => {
      window.removeEventListener("carebridgeDataUpdated", refreshData);
    };
  }, []);

  const {
    patients = [],
    doctors = [],
    appointments = [],
    payments = [],
    activities = [],
  } = hospitalData;

  const totalRevenue = payments
    .filter((payment) => payment.status === "Paid")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);

  const statistics = [
    {
      title: "Total Patients",
      value: patients.length,
      icon: Users,
      color: "blue",
    },
    {
      title: "Total Doctors",
      value: doctors.length,
      icon: Stethoscope,
      color: "green",
    },
    {
      title: "Appointments",
      value: appointments.length,
      icon: CalendarDays,
      color: "orange",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: CreditCard,
      color: "purple",
    },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard">

        <div className="dashboard-welcome">
          <div>
            <h1>Welcome to CareBridge, Admin!</h1>
            <p>
              Here's your hospital overview using saved records.
            </p>
          </div>
        </div>

        <section className="admin-stats-grid">
          {statistics.map((stat) => {
            const Icon = stat.icon;

            return (
              <div className="admin-stat-card" key={stat.title}>
                <div className={`admin-stat-icon ${stat.color}`}>
                  <Icon size={24} />
                </div>

                <div>
                  <p>{stat.title}</p>
                  <h2>{stat.value}</h2>
                </div>
              </div>
            );
          })}
        </section>

        <div className="admin-dashboard-grid">

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Recent Appointments</h2>
              <span>{appointments.length} Total</span>
            </div>

            {appointments.length === 0 ? (
              <p>No appointments available.</p>
            ) : (
              <div className="admin-record-list">
                {appointments.slice(-5).reverse().map((appointment) => (
                  <div className="admin-record" key={appointment.id}>
                    <div>
                      <h4>{appointment.patientName}</h4>
                      <p>{appointment.doctorName}</p>
                      <small>
                        {appointment.date} · {appointment.time}
                      </small>
                    </div>

                    <span className="admin-status">
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Doctor Availability</h2>
              <span>{doctors.length} Doctors</span>
            </div>

            {doctors.length === 0 ? (
              <p>No doctors available.</p>
            ) : (
              <div className="admin-record-list">
                {doctors.slice(0, 5).map((doctor) => (
                  <div className="admin-record" key={doctor.id}>
                    <div>
                      <h4>{doctor.name}</h4>
                      <p>{doctor.specialization}</p>
                    </div>

                    <span className="admin-status">
                      {doctor.availability}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Recent Activities</h2>
              <Activity size={20} />
            </div>

            {activities.length === 0 ? (
              <p>No recent activities.</p>
            ) : (
              <div className="admin-record-list">
                {activities.slice(-5).reverse().map((activity) => (
                  <div className="admin-record" key={activity.id}>
                    <div>
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <h2>Recent Patients</h2>
              <span>{patients.length} Total</span>
            </div>

            {patients.length === 0 ? (
              <p>No patients registered.</p>
            ) : (
              <div className="admin-record-list">
                {patients.slice(-5).reverse().map((patient) => (
                  <div className="admin-record" key={patient.id}>
                    <div>
                      <h4>{patient.name}</h4>
                      <p>{patient.email}</p>
                    </div>

                    <span className="admin-status">
                      {patient.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
