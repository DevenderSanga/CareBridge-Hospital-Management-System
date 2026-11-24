
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FileText,
  Users,
  Stethoscope,
  CalendarDays,
  X,
  Eye,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./MedicalRecords.css";

function MedicalRecords() {
  const { data, patients, doctors, activities, updateSection } =
    useHospitalData();

  const records = data.medicalRecords || [];

  const emptyForm = {
    patientId: "",
    doctorId: "",
    visitDate: new Date().toISOString().split("T")[0],
    diagnosis: "",
    symptoms: "",
    treatment: "",
    prescription: "",
    followUpDate: "",
    notes: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const patient = patients.find(
        (item) => item.id === record.patientId
      );
      const doctor = doctors.find(
        (item) => item.id === record.doctorId
      );

      const searchText = [
        record.id,
        patient?.name,
        doctor?.name,
        record.diagnosis,
        record.symptoms,
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(search.toLowerCase());
    });
  }, [records, patients, doctors, search]);

  const getPatientName = (patientId) =>
    patients.find((patient) => patient.id === patientId)?.name ||
    "Patient not found";

  const getDoctorName = (doctorId) =>
    doctors.find((doctor) => doctor.id === doctorId)?.name ||
    "Doctor not found";

  const openAddModal = () => {
    setEditingRecord(null);
    setForm({
      ...emptyForm,
      visitDate: new Date().toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setForm({
      ...emptyForm,
      ...record,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingRecord(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const addActivity = (message) => {
    const newActivity = {
      id: `ACT${Date.now()}`,
      message,
      date: new Date().toISOString(),
    };

    updateSection("activities", [newActivity, ...(activities || [])]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.patientId || !form.doctorId || !form.diagnosis.trim()) {
      alert("Please select a patient, doctor, and enter a diagnosis.");
      return;
    }

    const updatedRecord = {
      ...form,
      diagnosis: form.diagnosis.trim(),
      id: editingRecord?.id || `MED${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };

    const updatedRecords = editingRecord
      ? records.map((record) =>
          record.id === editingRecord.id ? updatedRecord : record
        )
      : [updatedRecord, ...records];

    const saved = updateSection("medicalRecords", updatedRecords);

    if (saved) {
      addActivity(
        editingRecord
          ? `Medical record for ${getPatientName(form.patientId)} was updated`
          : `Medical record added for ${getPatientName(form.patientId)}`
      );
      closeModal();
    } else {
      alert("Unable to save medical record. Please try again.");
    }
  };

  const handleDelete = (record) => {
    const confirmed = window.confirm(
      `Delete the medical record for ${getPatientName(record.patientId)}?`
    );

    if (!confirmed) return;

    const updatedRecords = records.filter(
      (item) => item.id !== record.id
    );

    if (updateSection("medicalRecords", updatedRecords)) {
      addActivity(
        `Medical record ${record.id} was deleted`
      );
    } else {
      alert("Unable to delete medical record.");
    }
  };

  return (
    <AdminLayout>
      <div className="medical-records">
        <div className="medical-page-header">
          <div>
            <h1>Medical Records</h1>
            <p>Manage patient diagnoses, treatments, and medical history.</p>
          </div>

          <button
            className="medical-add-btn"
            onClick={openAddModal}
          >
            <Plus size={19} />
            Add Medical Record
          </button>
        </div>

        <div className="medical-summary-grid">
          <div className="medical-summary-card">
            <div className="medical-summary-icon purple">
              <FileText size={22} />
            </div>
            <div>
              <h3>{records.length}</h3>
              <p>Total Records</p>
            </div>
          </div>

          <div className="medical-summary-card">
            <div className="medical-summary-icon blue">
              <Users size={22} />
            </div>
            <div>
              <h3>
                {new Set(records.map((record) => record.patientId)).size}
              </h3>
              <p>Patients Recorded</p>
            </div>
          </div>

          <div className="medical-summary-card">
            <div className="medical-summary-icon green">
              <Stethoscope size={22} />
            </div>
            <div>
              <h3>
                {new Set(records.map((record) => record.doctorId)).size}
              </h3>
              <p>Doctors Involved</p>
            </div>
          </div>

          <div className="medical-summary-card">
            <div className="medical-summary-icon orange">
              <CalendarDays size={22} />
            </div>
            <div>
              <h3>
                {
                  records.filter(
                    (record) =>
                      record.followUpDate &&
                      record.followUpDate >=
                        new Date().toISOString().split("T")[0]
                  ).length
                }
              </h3>
              <p>Upcoming Follow-ups</p>
            </div>
          </div>
        </div>

        <div className="medical-toolbar">
          <div className="medical-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search patient, doctor, diagnosis or record ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <span>{filteredRecords.length} records found</span>
        </div>

        <div className="medical-table-card">
          <div className="medical-table-heading">
            <div>
              <h2>Patient Medical History</h2>
              <p>All saved medical records</p>
            </div>
          </div>

          <div className="medical-table-wrapper">
            <table className="medical-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
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
                        <span className="medical-record-id">
                          {record.id}
                        </span>
                      </td>

                      <td>{getPatientName(record.patientId)}</td>
                      <td>{getDoctorName(record.doctorId)}</td>

                      <td>
                        <span className="medical-diagnosis">
                          {record.diagnosis}
                        </span>
                      </td>

                      <td>{record.visitDate || "—"}</td>
                      <td>{record.followUpDate || "—"}</td>

                      <td>
                        <div className="medical-actions">
                          <button
                            className="medical-view-btn"
                            title="View record"
                            onClick={() => setViewRecord(record)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className="medical-edit-btn"
                            title="Edit record"
                            onClick={() => openEditModal(record)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="medical-delete-btn"
                            title="Delete record"
                            onClick={() => handleDelete(record)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      <div className="medical-empty">
                        <FileText size={38} />
                        <h3>No medical records found</h3>
                        <p>Add a medical record or change your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="medical-modal-overlay">
            <div className="medical-modal">
              <div className="medical-modal-header">
                <div>
                  <h2>
                    {editingRecord
                      ? "Edit Medical Record"
                      : "Add Medical Record"}
                  </h2>
                  <p>Enter the patient's medical information.</p>
                </div>

                <button type="button" onClick={closeModal}>
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="medical-form-grid">
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
                          {doctor.name}
                        </option>
                      ))}
                    </select>
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

                  <label className="medical-full-width">
                    Diagnosis *
                    <input
                      name="diagnosis"
                      value={form.diagnosis}
                      onChange={handleChange}
                      placeholder="Enter diagnosis"
                      required
                    />
                  </label>

                  <label className="medical-full-width">
                    Symptoms
                    <textarea
                      name="symptoms"
                      value={form.symptoms}
                      onChange={handleChange}
                      placeholder="Describe patient symptoms..."
                      rows="3"
                    />
                  </label>

                  <label className="medical-full-width">
                    Treatment
                    <textarea
                      name="treatment"
                      value={form.treatment}
                      onChange={handleChange}
                      placeholder="Enter treatment details..."
                      rows="3"
                    />
                  </label>

                  <label className="medical-full-width">
                    Prescription
                    <textarea
                      name="prescription"
                      value={form.prescription}
                      onChange={handleChange}
                      placeholder="Enter prescribed medicines and instructions..."
                      rows="3"
                    />
                  </label>

                  <label className="medical-full-width">
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

                <div className="medical-modal-actions">
                  <button
                    type="button"
                    className="medical-cancel-btn"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="medical-save-btn"
                    disabled={!patients.length || !doctors.length}
                  >
                    {editingRecord ? "Save Changes" : "Save Record"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewRecord && (
          <div className="medical-modal-overlay">
            <div className="medical-modal medical-view-modal">
              <div className="medical-modal-header">
                <div>
                  <h2>Medical Record Details</h2>
                  <p>{viewRecord.id}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewRecord(null)}
                >
                  <X size={21} />
                </button>
              </div>

              <div className="medical-record-details">
                <div>
                  <span>Patient</span>
                  <strong>{getPatientName(viewRecord.patientId)}</strong>
                </div>

                <div>
                  <span>Doctor</span>
                  <strong>{getDoctorName(viewRecord.doctorId)}</strong>
                </div>

                <div>
                  <span>Visit Date</span>
                  <strong>{viewRecord.visitDate || "—"}</strong>
                </div>

                <div>
                  <span>Follow-up Date</span>
                  <strong>{viewRecord.followUpDate || "—"}</strong>
                </div>

                <div className="medical-detail-full">
                  <span>Diagnosis</span>
                  <p>{viewRecord.diagnosis || "Not provided"}</p>
                </div>

                <div className="medical-detail-full">
                  <span>Symptoms</span>
                  <p>{viewRecord.symptoms || "Not provided"}</p>
                </div>

                <div className="medical-detail-full">
                  <span>Treatment</span>
                  <p>{viewRecord.treatment || "Not provided"}</p>
                </div>

                <div className="medical-detail-full">
                  <span>Prescription</span>
                  <p>{viewRecord.prescription || "Not provided"}</p>
                </div>

                <div className="medical-detail-full">
                  <span>Additional Notes</span>
                  <p>{viewRecord.notes || "Not provided"}</p>
                </div>
              </div>

              <div className="medical-modal-actions">
                <button
                  className="medical-cancel-btn"
                  onClick={() => setViewRecord(null)}
                >
                  Close
                </button>

                <button
                  className="medical-save-btn"
                  onClick={() => {
                    const record = viewRecord;
                    setViewRecord(null);
                    openEditModal(record);
                  }}
                >
                  <Pencil size={16} />
                  Edit Record
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default MedicalRecords;
