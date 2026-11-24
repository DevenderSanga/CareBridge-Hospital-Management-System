
import { useMemo, useState } from "react";

import {
  Search,
  FileText,
  CalendarDays,
  ClipboardList,
  Eye,
  X,
  Stethoscope,
  HeartPulse,
  Clock,
} from "lucide-react";

import PatientLayout from "../../layouts/PatientLayout";
import { useHospitalData } from "../../hooks/useHospitalData";

import "./PatientMedicalRecords.css";

function PatientMedicalRecords() {
  const {
    data,
    patients,
    doctors,
  } = useHospitalData();

  const records = data?.medicalRecords || [];

  const [search, setSearch] = useState("");
  const [viewRecord, setViewRecord] = useState(null);

  // Get logged-in patient
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

  // Match current patient
  const currentPatient = patients.find(
    (patient) =>
      patient.id === loggedInUser?.patientId ||
      patient.id === loggedInUser?.id ||
      patient.email?.toLowerCase() ===
        loggedInUser?.email?.toLowerCase()
  );

  const patientId = currentPatient?.id;

  // Only show records belonging to logged-in patient
  const myRecords = useMemo(() => {
    if (!patientId) return [];

    return records
      .filter((record) => record.patientId === patientId)
      .sort((a, b) =>
        (b.visitDate || "").localeCompare(a.visitDate || "")
      );
  }, [records, patientId]);

  // Search medical records
  const filteredRecords = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return myRecords;

    return myRecords.filter((record) => {
      const doctor = doctors.find(
        (item) => item.id === record.doctorId
      );

      return [
        record.id,
        doctor?.name,
        doctor?.specialization,
        record.diagnosis,
        record.symptoms,
        record.treatment,
        record.prescription,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value);
    });
  }, [myRecords, doctors, search]);

  const getDoctorName = (doctorId) =>
    doctors.find((doctor) => doctor.id === doctorId)?.name ||
    "Doctor not found";

  const upcomingFollowUps = myRecords.filter(
    (record) =>
      record.followUpDate &&
      record.followUpDate >=
        new Date().toISOString().split("T")[0]
  ).length;

  const latestRecord = myRecords[0];

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (!currentPatient) {
    return (
      <PatientLayout>
        <div className="patient-medical-page">
          <div className="patient-medical-message">
            <HeartPulse size={40} />
            <h2>Patient account not linked</h2>
            <p>
              Please sign in again using your registered patient
              account to view your medical records.
            </p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="patient-medical-page">

        {/* Page Header */}
        <div className="patient-medical-header">
          <div>
            <span className="patient-medical-eyebrow">
              MY HEALTH
            </span>

            <h1>Medical Records</h1>

            <p>
              View your medical history, diagnoses, treatments,
              and prescriptions in one place.
            </p>
          </div>

          <div className="patient-medical-header-icon">
            <FileText size={30} />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="patient-medical-stats">

          <div className="patient-medical-stat-card">
            <div className="patient-medical-stat-icon purple">
              <FileText size={23} />
            </div>

            <div>
              <span>Total Records</span>
              <h2>{myRecords.length}</h2>
              <small>Your saved medical history</small>
            </div>
          </div>

          <div className="patient-medical-stat-card">
            <div className="patient-medical-stat-icon orange">
              <CalendarDays size={23} />
            </div>

            <div>
              <span>Upcoming Follow-ups</span>
              <h2>{upcomingFollowUps}</h2>
              <small>Scheduled follow-up dates</small>
            </div>
          </div>

          <div className="patient-medical-stat-card">
            <div className="patient-medical-stat-icon blue">
              <Stethoscope size={23} />
            </div>

            <div>
              <span>Doctors Involved</span>
              <h2>
                {new Set(
                  myRecords.map((record) => record.doctorId)
                ).size}
              </h2>
              <small>Doctors who treated you</small>
            </div>
          </div>

          <div className="patient-medical-stat-card">
            <div className="patient-medical-stat-icon green">
              <Clock size={23} />
            </div>

            <div>
              <span>Latest Visit</span>
              <h2 className="patient-medical-latest-date">
                {latestRecord
                  ? formatDate(latestRecord.visitDate)
                  : "—"}
              </h2>
              <small>Most recent medical record</small>
            </div>
          </div>

        </div>

        {/* Search */}
        <section className="patient-medical-panel">

          <div className="patient-medical-panel-header">
            <div>
              <h2>My Medical History</h2>
              <p>
                Your diagnoses, treatments, and medical information.
              </p>
            </div>

            <span className="patient-medical-count">
              {filteredRecords.length} Records
            </span>
          </div>

          <div className="patient-medical-toolbar">
            <div className="patient-medical-search">
              <Search size={19} />

              <input
                type="text"
                placeholder="Search diagnosis, doctor or record ID..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>
          </div>

          {/* Records */}
          <div className="patient-medical-table-wrapper">
            <table className="patient-medical-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Doctor</th>
                  <th>Diagnosis</th>
                  <th>Visit Date</th>
                  <th>Follow-up</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span className="patient-medical-record-id">
                          {record.id}
                        </span>
                      </td>

                      <td>
                        <div className="patient-medical-doctor">
                          <div className="patient-medical-doctor-icon">
                            <Stethoscope size={16} />
                          </div>

                          <span>
                            {getDoctorName(record.doctorId)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="patient-medical-diagnosis">
                          {record.diagnosis || "—"}
                        </span>
                      </td>

                      <td>{formatDate(record.visitDate)}</td>

                      <td>
                        {record.followUpDate ? (
                          <span className="patient-medical-followup">
                            {formatDate(record.followUpDate)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className="patient-medical-view-btn"
                          onClick={() => setViewRecord(record)}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="patient-medical-empty">
                        <ClipboardList size={42} />

                        <h3>
                          {myRecords.length === 0
                            ? "No medical records yet"
                            : "No matching records found"}
                        </h3>

                        <p>
                          {myRecords.length === 0
                            ? "Your medical records will appear here when your doctor or hospital administrator adds them."
                            : "Try searching with another diagnosis, doctor name, or record ID."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="patient-medical-table-footer">
            Showing {filteredRecords.length} of {myRecords.length} records
          </div>

        </section>

        {/* Medical Record Details Modal */}
        {viewRecord && (
          <div
            className="patient-medical-overlay"
            onClick={() => setViewRecord(null)}
          >
            <div
              className="patient-medical-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="patient-medical-modal-header">
                <div>
                  <span>MEDICAL HISTORY</span>
                  <h2>Medical Record Details</h2>
                  <p>{viewRecord.id}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewRecord(null)}
                  aria-label="Close"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="patient-medical-details">

                <div className="patient-medical-detail-card">
                  <span>Patient</span>
                  <strong>{currentPatient.name}</strong>
                </div>

                <div className="patient-medical-detail-card">
                  <span>Doctor</span>
                  <strong>
                    {getDoctorName(viewRecord.doctorId)}
                  </strong>
                </div>

                <div className="patient-medical-detail-card">
                  <span>Visit Date</span>
                  <strong>
                    {formatDate(viewRecord.visitDate)}
                  </strong>
                </div>

                <div className="patient-medical-detail-card">
                  <span>Follow-up Date</span>
                  <strong>
                    {formatDate(viewRecord.followUpDate)}
                  </strong>
                </div>

                <div className="patient-medical-detail-full">
                  <span>Diagnosis</span>
                  <p>{viewRecord.diagnosis || "Not provided"}</p>
                </div>

                <div className="patient-medical-detail-full">
                  <span>Symptoms</span>
                  <p>{viewRecord.symptoms || "Not provided"}</p>
                </div>

                <div className="patient-medical-detail-full">
                  <span>Treatment</span>
                  <p>{viewRecord.treatment || "Not provided"}</p>
                </div>

                <div className="patient-medical-detail-full">
                  <span>Prescription</span>
                  <p>{viewRecord.prescription || "Not provided"}</p>
                </div>

                <div className="patient-medical-detail-full">
                  <span>Additional Notes</span>
                  <p>{viewRecord.notes || "Not provided"}</p>
                </div>

              </div>

              <div className="patient-medical-modal-footer">
                <span>
                  <HeartPulse size={17} />
                  Your medical information is read-only.
                </span>

                <button
                  type="button"
                  onClick={() => setViewRecord(null)}
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </PatientLayout>
  );
}

export default PatientMedicalRecords;
