
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  FileText,
  CalendarDays,
  Users,
  Eye,
  Pencil,
  X,
  ClipboardList,
} from "lucide-react";

import DoctorLayout from "../../layouts/DoctorLayout";
import { useHospitalData } from "../../hooks/useHospitalData";

import "./DoctorMedicalRecords.css";

const createEmptyForm = () => ({
  patientId: "",
  visitDate: new Date().toISOString().split("T")[0],
  diagnosis: "",
  symptoms: "",
  treatment: "",
  prescription: "",
  followUpDate: "",
  notes: "",
});

function DoctorMedicalRecords() {
  const {
    data,
    patients,
    doctors,
    appointments,
    activities,
    updateSection,
  } = useHospitalData();

  const records = data.medicalRecords || [];

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [form, setForm] = useState(createEmptyForm);

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

  const assignedPatientIds = useMemo(() => {
    return new Set(
      appointments
        .filter((appointment) => appointment.doctorId === doctorId)
        .map((appointment) => appointment.patientId)
    );
  }, [appointments, doctorId]);

  const assignedPatients = useMemo(
    () => patients.filter((patient) => assignedPatientIds.has(patient.id)),
    [patients, assignedPatientIds]
  );

  const myRecords = useMemo(
    () => records.filter((record) => record.doctorId === doctorId),
    [records, doctorId]
  );

  const filteredRecords = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return myRecords;

    return myRecords.filter((record) => {
      const patient = patients.find(
        (item) => item.id === record.patientId
      );

      return [
        record.id,
        patient?.name,
        patient?.id,
        record.diagnosis,
        record.symptoms,
        record.treatment,
      ]
        .join(" ")
        .toLowerCase()
        .includes(value);
    });
  }, [myRecords, patients, search]);

  const getPatientName = (patientId) =>
    patients.find((patient) => patient.id === patientId)?.name ||
    "Patient not found";

  const upcomingFollowUps = myRecords.filter(
    (record) =>
      record.followUpDate &&
      record.followUpDate >= new Date().toISOString().split("T")[0]
  ).length;

  const openAddModal = () => {
    setEditingRecord(null);
    setForm({
      ...createEmptyForm(),
      patientId: assignedPatients[0]?.id || "",
    });
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setForm({
      ...createEmptyForm(),
      ...record,
    });
    setShowModal(true);
    setViewRecord(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setForm(createEmptyForm());
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addActivity = (message) => {
    const activity = {
      id: `ACT${Date.now()}`,
      message,
      date: new Date().toISOString(),
    };

    updateSection("activities", [
      activity,
      ...(activities || []),
    ]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!doctorId) {
      alert("Doctor account is not linked to a doctor record.");
      return;
    }

    if (!assignedPatientIds.has(form.patientId)) {
      alert("Please select one of your assigned patients.");
      return;
    }

    if (!form.diagnosis.trim()) {
      alert("Please enter a diagnosis.");
      return;
    }

    const updatedRecord = {
      ...form,
      diagnosis: form.diagnosis.trim(),
      doctorId,
      id: editingRecord?.id || `MED${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    const updatedRecords = editingRecord
      ? records.map((record) =>
          record.id === editingRecord.id &&
          record.doctorId === doctorId
            ? updatedRecord
            : record
        )
      : [updatedRecord, ...records];

    const saved = updateSection("medicalRecords", updatedRecords);

    if (saved) {
      addActivity(
        editingRecord
          ? `Medical record ${updatedRecord.id} was updated by ${currentDoctor?.name || "doctor"}`
          : `Medical record added for ${getPatientName(form.patientId)}`
      );

      closeModal();
    } else {
      alert("Unable to save the medical record. Please try again.");
    }
  };

  if (!doctorId) {
    return (
      <DoctorLayout>
        <div className="doctor-medical-page">
          <div className="doctor-medical-message">
            <Users size={34} />
            <h2>Doctor account not linked</h2>
            <p>
              Please sign in again using the demo doctor account and
              check that your doctor record exists in Admin → Doctors.
            </p>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="doctor-medical-page">
        <div className="doctor-medical-header">
          <div>
            <h1>Medical Records</h1>
            <p>
              Manage diagnoses, treatments, prescriptions, and patient history.
            </p>
          </div>

          <button
            type="button"
            className="doctor-medical-add-btn"
            onClick={openAddModal}
            disabled={assignedPatients.length === 0}
          >
            <Plus size={19} />
            Add Medical Record
          </button>
        </div>

        <div className="doctor-medical-stats">
          <div className="doctor-medical-stat-card">
            <div className="doctor-medical-stat-icon purple">
              <FileText size={22} />
            </div>
            <div>
              <span>My Medical Records</span>
              <h2>{myRecords.length}</h2>
            </div>
          </div>

          <div className="doctor-medical-stat-card">
            <div className="doctor-medical-stat-icon blue">
              <Users size={22} />
            </div>
            <div>
              <span>Patients Recorded</span>
              <h2>
                {new Set(myRecords.map((record) => record.patientId)).size}
              </h2>
            </div>
          </div>

          <div className="doctor-medical-stat-card">
            <div className="doctor-medical-stat-icon orange">
              <CalendarDays size={22} />
            </div>
            <div>
              <span>Upcoming Follow-ups</span>
              <h2>{upcomingFollowUps}</h2>
            </div>
          </div>
        </div>

        <section className="doctor-medical-panel">
          <div className="doctor-medical-toolbar">
            <div>
              <h2>Patient Medical History</h2>
              <p>Records created under your doctor account</p>
            </div>

            <div className="doctor-medical-search">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search patient, diagnosis or record ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="doctor-medical-table-wrap">
            <table className="doctor-medical-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Visit Date</th>
                  <th>Follow-up</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span className="doctor-medical-record-id">
                          {record.id}
                        </span>
                      </td>
                      <td>{getPatientName(record.patientId)}</td>
                      <td>{record.diagnosis}</td>
                      <td>{record.visitDate || "—"}</td>
                      <td>{record.followUpDate || "—"}</td>
                      <td>
                        <div className="doctor-medical-actions">
                          <button
                            type="button"
                            className="view"
                            title="View record"
                            onClick={() => setViewRecord(record)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            className="edit"
                            title="Edit record"
                            onClick={() => openEditModal(record)}
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="doctor-medical-empty">
                        <ClipboardList size={38} />
                        <h3>No medical records found</h3>
                        <p>
                          {myRecords.length === 0
                            ? "You have not created any medical records yet."
                            : "Try another search term."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="doctor-medical-footer">
            Showing {filteredRecords.length} of {myRecords.length} records
          </div>
        </section>

        {showModal && (
          <div className="doctor-medical-overlay">
            <div className="doctor-medical-modal">
              <div className="doctor-medical-modal-header">
                <div>
                  <h2>
                    {editingRecord ? "Edit Medical Record" : "Add Medical Record"}
                  </h2>
                  <p>Enter the patient's medical information.</p>
                </div>

                <button type="button" onClick={closeModal} aria-label="Close">
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="doctor-medical-form-grid">
                  <label>
                    Select Patient *
                    <select
                      name="patientId"
                      value={form.patientId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose assigned patient</option>
                      {assignedPatients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} ({patient.id})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Doctor
                    <input
                      value={currentDoctor?.name || ""}
                      disabled
                    />
                  </label>

                  <label>
                    Visit Date *
                    <input
                      type="date"
                      name="visitDate"
                      value={form.visitDate}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Follow-up Date
                    <input
                      type="date"
                      name="followUpDate"
                      value={form.followUpDate}
                      min={form.visitDate || undefined}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="full">
                    Diagnosis *
                    <input
                      name="diagnosis"
                      value={form.diagnosis}
                      onChange={handleChange}
                      placeholder="Enter diagnosis"
                      required
                    />
                  </label>

                  <label className="full">
                    Symptoms
                    <textarea
                      name="symptoms"
                      value={form.symptoms}
                      onChange={handleChange}
                      placeholder="Describe patient symptoms..."
                      rows="3"
                    />
                  </label>

                  <label className="full">
                    Treatment
                    <textarea
                      name="treatment"
                      value={form.treatment}
                      onChange={handleChange}
                      placeholder="Enter treatment details..."
                      rows="3"
                    />
                  </label>

                  <label className="full">
                    Prescription
                    <textarea
                      name="prescription"
                      value={form.prescription}
                      onChange={handleChange}
                      placeholder="Enter prescribed medicines and instructions..."
                      rows="3"
                    />
                  </label>

                  <label className="full">
                    Additional Notes
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      placeholder="Additional medical notes..."
                      rows="2"
                    />
                  </label>
                </div>

                <div className="doctor-medical-modal-actions">
                  <button
                    type="button"
                    className="cancel"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="save">
                    {editingRecord ? "Save Changes" : "Save Record"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewRecord && (
          <div className="doctor-medical-overlay">
            <div className="doctor-medical-modal doctor-medical-view-modal">
              <div className="doctor-medical-modal-header">
                <div>
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

              <div className="doctor-medical-details">
                <div>
                  <span>Patient</span>
                  <strong>{getPatientName(viewRecord.patientId)}</strong>
                </div>

                <div>
                  <span>Doctor</span>
                  <strong>{currentDoctor?.name || "—"}</strong>
                </div>

                <div>
                  <span>Visit Date</span>
                  <strong>{viewRecord.visitDate || "—"}</strong>
                </div>

                <div>
                  <span>Follow-up Date</span>
                  <strong>{viewRecord.followUpDate || "—"}</strong>
                </div>

                <div className="full">
                  <span>Diagnosis</span>
                  <p>{viewRecord.diagnosis || "Not provided"}</p>
                </div>

                <div className="full">
                  <span>Symptoms</span>
                  <p>{viewRecord.symptoms || "Not provided"}</p>
                </div>

                <div className="full">
                  <span>Treatment</span>
                  <p>{viewRecord.treatment || "Not provided"}</p>
                </div>

                <div className="full">
                  <span>Prescription</span>
                  <p>{viewRecord.prescription || "Not provided"}</p>
                </div>

                <div className="full">
                  <span>Additional Notes</span>
                  <p>{viewRecord.notes || "Not provided"}</p>
                </div>
              </div>

              <div className="doctor-medical-modal-actions">
                <button
                  type="button"
                  className="cancel"
                  onClick={() => setViewRecord(null)}
                >
                  Close
                </button>

                <button
                  type="button"
                  className="save"
                  onClick={() => openEditModal(viewRecord)}
                >
                  <Pencil size={16} />
                  Edit Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}

export default DoctorMedicalRecords;
