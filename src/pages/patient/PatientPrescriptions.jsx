
import { useMemo, useState } from "react";
import {
  Search,
  FileText,
  Pill,
  CalendarDays,
  UserRound,
  Eye,
  X,
  ClipboardList,
  Stethoscope,
} from "lucide-react";

import PatientLayout from "../../layouts/PatientLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./PatientPrescriptions.css";

function PatientPrescriptions() {
  const { data, patients, doctors } = useHospitalData();

  const prescriptions = data.prescriptions || [];

  // Get the currently logged-in patient
  const storedUser =
    localStorage.getItem("carebridgeUser") ||
    sessionStorage.getItem("carebridgeUser");

  let currentUser = {};

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch {
    currentUser = {};
  }

  // Match the logged-in account with the patient record
  const currentPatient = patients.find(
    (patient) =>
      patient.id === (currentUser.patientId || currentUser.id) ||
      patient.email?.trim().toLowerCase() ===
        currentUser.email?.trim().toLowerCase()
  );

  const patientId = currentPatient?.id || currentUser.patientId;

  // Show only prescriptions belonging to this patient
  const patientPrescriptions = prescriptions.filter(
    (prescription) => prescription.patientId === patientId
  );

  const [search, setSearch] = useState("");
  const [viewPrescription, setViewPrescription] = useState(null);

  const getDoctor = (doctorId) =>
    doctors.find((doctor) => doctor.id === doctorId);

  const getDoctorName = (doctorId) =>
    getDoctor(doctorId)?.name || "Doctor not found";

  const getDoctorSpecialization = (doctorId) =>
    getDoctor(doctorId)?.specialization || "Specialization not available";

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

  const filteredPrescriptions = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) return patientPrescriptions;

    return patientPrescriptions.filter((prescription) => {
      const medicineNames = (prescription.medicines || [])
        .map((medicine) => medicine.name)
        .join(" ");

      const doctor = getDoctorName(prescription.doctorId);
      const specialization = getDoctorSpecialization(
        prescription.doctorId
      );

      const searchableText = [
        prescription.id,
        prescription.diagnosis,
        prescription.issueDate,
        doctor,
        specialization,
        medicineNames,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchText);
    });
  }, [patientPrescriptions, doctors, search]);

  const totalMedicines = patientPrescriptions.reduce(
    (total, prescription) =>
      total + (prescription.medicines?.length || 0),
    0
  );

  const latestPrescription = [...patientPrescriptions].sort(
    (a, b) =>
      new Date(b.issueDate || 0) - new Date(a.issueDate || 0)
  )[0];

  const uniqueDoctors = new Set(
    patientPrescriptions.map((prescription) => prescription.doctorId)
  ).size;

  if (!patientId) {
    return (
      <PatientLayout>
        <div className="patient-prescriptions-page">
          <div className="patient-prescriptions-error">
            <UserRound size={42} />
            <h2>Patient account not linked</h2>
            <p>
              Your login account could not be matched with a patient
              record. Please check your patient registration and login
              details.
            </p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="patient-prescriptions-page">
        {/* Page Header */}
        <div className="patient-prescriptions-header">
          <div>
            <h1>My Prescriptions</h1>
            <p>
              View your prescribed medicines, dosage, and doctor's
              instructions.
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="patient-prescription-stats">
          <div className="patient-prescription-stat-card">
            <div className="patient-prescription-stat-icon purple">
              <FileText size={22} />
            </div>
            <div>
              <h3>{patientPrescriptions.length}</h3>
              <p>Total Prescriptions</p>
            </div>
          </div>

          <div className="patient-prescription-stat-card">
            <div className="patient-prescription-stat-icon blue">
              <Pill size={22} />
            </div>
            <div>
              <h3>{totalMedicines}</h3>
              <p>Prescribed Medicines</p>
            </div>
          </div>

          <div className="patient-prescription-stat-card">
            <div className="patient-prescription-stat-icon green">
              <Stethoscope size={22} />
            </div>
            <div>
              <h3>{uniqueDoctors}</h3>
              <p>Doctors</p>
            </div>
          </div>

          <div className="patient-prescription-stat-card">
            <div className="patient-prescription-stat-icon orange">
              <CalendarDays size={22} />
            </div>
            <div>
              <h3>
                {latestPrescription
                  ? formatDate(latestPrescription.issueDate)
                  : "—"}
              </h3>
              <p>Latest Prescription</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="patient-prescription-toolbar">
          <div className="patient-prescription-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search by prescription ID, doctor, diagnosis or medicine..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <span>
            {filteredPrescriptions.length} prescription
            {filteredPrescriptions.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {/* Prescription List */}
        <div className="patient-prescription-table-card">
          <div className="patient-prescription-table-heading">
            <div>
              <h2>Prescription History</h2>
              <p>Your prescriptions shared by your doctors</p>
            </div>
          </div>

          <div className="patient-prescription-table-wrapper">
            <table className="patient-prescription-table">
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Doctor</th>
                  <th>Diagnosis</th>
                  <th>Medicines</th>
                  <th>Issue Date</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPrescriptions.length > 0 ? (
                  filteredPrescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>
                        <span className="patient-prescription-id">
                          {prescription.id}
                        </span>
                      </td>

                      <td>
                        <div className="patient-prescription-doctor">
                          <strong>
                            {getDoctorName(prescription.doctorId)}
                          </strong>
                          <span>
                            {getDoctorSpecialization(
                              prescription.doctorId
                            )}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span className="patient-prescription-diagnosis">
                          {prescription.diagnosis || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="patient-prescription-medicine-count">
                          <Pill size={15} />
                          {prescription.medicines?.length || 0}
                        </span>
                      </td>

                      <td>{formatDate(prescription.issueDate)}</td>

                      <td>
                        <button
                          type="button"
                          className="patient-prescription-view-btn"
                          title="View prescription"
                          onClick={() =>
                            setViewPrescription(prescription)
                          }
                        >
                          <Eye size={16} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="patient-prescription-empty">
                        <ClipboardList size={42} />
                        <h3>
                          {search
                            ? "No matching prescriptions"
                            : "No prescriptions available"}
                        </h3>
                        <p>
                          {search
                            ? "Try another search term."
                            : "Prescriptions created by your doctors will appear here."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Prescription Details Modal */}
        {viewPrescription && (
          <div
            className="patient-prescription-modal-overlay"
            onClick={() => setViewPrescription(null)}
          >
            <div
              className="patient-prescription-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="patient-prescription-modal-header">
                <div>
                  <h2>Prescription Details</h2>
                  <p>{viewPrescription.id}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewPrescription(null)}
                  aria-label="Close prescription details"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="patient-prescription-detail-grid">
                <div>
                  <span>Patient</span>
                  <strong>{currentPatient?.name || currentUser.name}</strong>
                </div>

                <div>
                  <span>Issue Date</span>
                  <strong>
                    {formatDate(viewPrescription.issueDate)}
                  </strong>
                </div>

                <div>
                  <span>Prescribed By</span>
                  <strong>
                    {getDoctorName(viewPrescription.doctorId)}
                  </strong>
                </div>

                <div>
                  <span>Specialization</span>
                  <strong>
                    {getDoctorSpecialization(viewPrescription.doctorId)}
                  </strong>
                </div>

                <div className="patient-prescription-detail-full">
                  <span>Diagnosis</span>
                  <p>{viewPrescription.diagnosis || "Not provided"}</p>
                </div>
              </div>

              <h3 className="patient-prescription-medicines-title">
                <Pill size={19} />
                Prescribed Medicines
              </h3>

              <div className="patient-prescription-medicines">
                {(viewPrescription.medicines || []).length > 0 ? (
                  viewPrescription.medicines.map((medicine, index) => (
                    <div
                      className="patient-prescription-medicine-card"
                      key={medicine.id || index}
                    >
                      <div className="patient-prescription-medicine-heading">
                        <span>Medicine {index + 1}</span>
                        <strong>{medicine.name || "Unnamed medicine"}</strong>
                      </div>

                      <div className="patient-prescription-medicine-info">
                        <div>
                          <span>Dosage</span>
                          <strong>{medicine.dosage || "—"}</strong>
                        </div>

                        <div>
                          <span>Frequency</span>
                          <strong>{medicine.frequency || "—"}</strong>
                        </div>

                        <div>
                          <span>Duration</span>
                          <strong>{medicine.duration || "—"}</strong>
                        </div>
                      </div>

                      {medicine.instructions && (
                        <div className="patient-prescription-instructions">
                          <span>Instructions</span>
                          <p>{medicine.instructions}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="patient-prescription-no-medicines">
                    No medicine details available.
                  </p>
                )}
              </div>

              <div className="patient-prescription-additional-notes">
                <span>Additional Notes</span>
                <p>{viewPrescription.notes || "No additional notes."}</p>
              </div>

              <div className="patient-prescription-modal-actions">
                <button
                  type="button"
                  onClick={() => setViewPrescription(null)}
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

export default PatientPrescriptions;
