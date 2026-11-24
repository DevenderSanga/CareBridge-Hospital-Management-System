
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  FileText,
  Users,
  Pill,
  CalendarDays,
  X,
  Eye,
  Trash2,
} from "lucide-react";

import DoctorLayout from "../../layouts/DoctorLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./DoctorPrescriptions.css";

const today = new Date().toISOString().split("T")[0];

const createMedicine = () => ({
  id: `MEDICINE${Date.now()}${Math.random().toString(16).slice(2, 7)}`,
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
});

const emptyForm = {
  patientId: "",
  issueDate: today,
  diagnosis: "",
  medicines: [createMedicine()],
  notes: "",
};

function DoctorPrescriptions() {
  const {
    data,
    patients,
    appointments,
    updateSection,
  } = useHospitalData();

  const prescriptions = data.prescriptions || [];
  const activities = data.activities || [];

  const storedUser =
    localStorage.getItem("carebridgeUser") ||
    sessionStorage.getItem("carebridgeUser");

  let currentUser = {};

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch {
    currentUser = {};
  }

  const currentDoctor = (data.doctors || []).find(
    (doctor) =>
      doctor.id === currentUser.doctorId ||
      doctor.name?.trim().toLowerCase() ===
        currentUser.name?.trim().toLowerCase()
  );

  const doctorId = currentDoctor?.id || currentUser.doctorId;

  const assignedPatientIds = [
    ...new Set(
      appointments
        .filter((appointment) => appointment.doctorId === doctorId)
        .map((appointment) => appointment.patientId)
    ),
  ];

  const assignedPatients = patients.filter((patient) =>
    assignedPatientIds.includes(patient.id)
  );

  const doctorPrescriptions = prescriptions.filter(
    (prescription) => prescription.doctorId === doctorId
  );

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [viewPrescription, setViewPrescription] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const getPatientName = (patientId) =>
    patients.find((patient) => patient.id === patientId)?.name ||
    "Patient not found";

  const filteredPrescriptions = useMemo(() => {
    return doctorPrescriptions.filter((prescription) => {
      const patientName = getPatientName(prescription.patientId);

      const medicineNames = (prescription.medicines || [])
        .map((medicine) => medicine.name)
        .join(" ");

      const searchText = [
        prescription.id,
        patientName,
        prescription.diagnosis,
        medicineNames,
      ]
        .join(" ")
        .toLowerCase();

      return searchText.includes(search.toLowerCase());
    });
  }, [doctorPrescriptions, patients, search]);

  const openAddModal = () => {
    setEditingPrescription(null);
    setForm({
      ...emptyForm,
      issueDate: today,
      medicines: [createMedicine()],
    });
    setShowModal(true);
  };

  const openEditModal = (prescription) => {
    setEditingPrescription(prescription);

    setForm({
      patientId: prescription.patientId || "",
      issueDate: prescription.issueDate || today,
      diagnosis: prescription.diagnosis || "",
      medicines:
        prescription.medicines?.length > 0
          ? prescription.medicines.map((medicine) => ({
              ...medicine,
              id: medicine.id || createMedicine().id,
            }))
          : [createMedicine()],
      notes: prescription.notes || "",
    });

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPrescription(null);
    setForm({
      ...emptyForm,
      medicines: [createMedicine()],
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleMedicineChange = (medicineId, field, value) => {
    setForm((previous) => ({
      ...previous,
      medicines: previous.medicines.map((medicine) =>
        medicine.id === medicineId
          ? { ...medicine, [field]: value }
          : medicine
      ),
    }));
  };

  const addMedicine = () => {
    setForm((previous) => ({
      ...previous,
      medicines: [...previous.medicines, createMedicine()],
    }));
  };

  const removeMedicine = (medicineId) => {
    if (form.medicines.length === 1) {
      alert("A prescription must contain at least one medicine.");
      return;
    }

    setForm((previous) => ({
      ...previous,
      medicines: previous.medicines.filter(
        (medicine) => medicine.id !== medicineId
      ),
    }));
  };

  const addActivity = (message) => {
    const activity = {
      id: `ACT${Date.now()}`,
      message,
      date: new Date().toISOString(),
    };

    updateSection("activities", [activity, ...activities]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!doctorId) {
      alert("Your doctor account is not linked to a doctor record.");
      return;
    }

    if (!form.patientId || !assignedPatientIds.includes(form.patientId)) {
      alert("Please select one of your assigned patients.");
      return;
    }

    if (!form.diagnosis.trim()) {
      alert("Please enter the diagnosis.");
      return;
    }

    const validMedicines = form.medicines.filter(
      (medicine) =>
        medicine.name.trim() &&
        medicine.dosage.trim() &&
        medicine.frequency.trim() &&
        medicine.duration.trim()
    );

    if (validMedicines.length === 0) {
      alert(
        "Please enter at least one medicine with its dosage, frequency, and duration."
      );
      return;
    }

    if (validMedicines.length !== form.medicines.length) {
      alert("Please complete all required medicine fields or remove empty rows.");
      return;
    }

    const updatedPrescription = {
      ...form,
      id: editingPrescription?.id || `PRE${Date.now()}`,
      doctorId,
      patientId: form.patientId,
      diagnosis: form.diagnosis.trim(),
      medicines: validMedicines.map((medicine) => ({
        ...medicine,
        name: medicine.name.trim(),
        dosage: medicine.dosage.trim(),
        frequency: medicine.frequency.trim(),
        duration: medicine.duration.trim(),
        instructions: medicine.instructions.trim(),
      })),
      notes: form.notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPrescriptions = editingPrescription
      ? prescriptions.map((prescription) =>
          prescription.id === editingPrescription.id
            ? updatedPrescription
            : prescription
        )
      : [updatedPrescription, ...prescriptions];

    const saved = updateSection("prescriptions", updatedPrescriptions);

    if (saved) {
      addActivity(
        editingPrescription
          ? `Prescription ${updatedPrescription.id} was updated`
          : `Prescription created for ${getPatientName(form.patientId)}`
      );

      closeModal();
    } else {
      alert("Unable to save prescription. Please try again.");
    }
  };

  const handleDelete = (prescription) => {
    const confirmed = window.confirm(
      `Delete prescription ${prescription.id}? This action cannot be undone.`
    );

    if (!confirmed) return;

    const updatedPrescriptions = prescriptions.filter(
      (item) => item.id !== prescription.id
    );

    if (updateSection("prescriptions", updatedPrescriptions)) {
      addActivity(`Prescription ${prescription.id} was deleted`);
    } else {
      alert("Unable to delete prescription.");
    }
  };

  const uniquePatients = new Set(
    doctorPrescriptions.map((item) => item.patientId)
  ).size;

  if (!doctorId) {
    return (
      <DoctorLayout>
        <div className="prescriptions-page">
          <div className="prescriptions-error">
            <StethoscopeFallback />
            <h2>Doctor account not linked</h2>
            <p>
              Please make sure your demo login is connected to an existing
              doctor record in Admin → Doctors.
            </p>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <div className="prescriptions-page">
        <div className="prescriptions-header">
          <div>
            <h1>Prescriptions</h1>
            <p>Create and manage prescriptions for your assigned patients.</p>
          </div>

          <button
            className="prescription-add-btn"
            onClick={openAddModal}
          >
            <Plus size={19} />
            Create Prescription
          </button>
        </div>

        <div className="prescription-stats">
          <div className="prescription-stat-card">
            <div className="prescription-stat-icon purple">
              <FileText size={22} />
            </div>
            <div>
              <h3>{doctorPrescriptions.length}</h3>
              <p>Total Prescriptions</p>
            </div>
          </div>

          <div className="prescription-stat-card">
            <div className="prescription-stat-icon blue">
              <Users size={22} />
            </div>
            <div>
              <h3>{uniquePatients}</h3>
              <p>Patients Prescribed</p>
            </div>
          </div>

          <div className="prescription-stat-card">
            <div className="prescription-stat-icon green">
              <Pill size={22} />
            </div>
            <div>
              <h3>
                {doctorPrescriptions.reduce(
                  (total, item) => total + (item.medicines?.length || 0),
                  0
                )}
              </h3>
              <p>Total Medicines</p>
            </div>
          </div>

          <div className="prescription-stat-card">
            <div className="prescription-stat-icon orange">
              <CalendarDays size={22} />
            </div>
            <div>
              <h3>
                {
                  doctorPrescriptions.filter(
                    (item) => item.issueDate === today
                  ).length
                }
              </h3>
              <p>Today's Prescriptions</p>
            </div>
          </div>
        </div>

        <div className="prescription-toolbar">
          <div className="prescription-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search prescription ID, patient, diagnosis or medicine..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <span>{filteredPrescriptions.length} prescriptions found</span>
        </div>

        <div className="prescription-table-card">
          <div className="prescription-table-heading">
            <div>
              <h2>My Prescriptions</h2>
              <p>Prescriptions created under your doctor account</p>
            </div>
          </div>

          <div className="prescription-table-wrapper">
            <table className="prescription-table">
              <thead>
                <tr>
                  <th>Prescription ID</th>
                  <th>Patient</th>
                  <th>Diagnosis</th>
                  <th>Medicines</th>
                  <th>Issue Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPrescriptions.length > 0 ? (
                  filteredPrescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>
                        <span className="prescription-id">
                          {prescription.id}
                        </span>
                      </td>

                      <td>{getPatientName(prescription.patientId)}</td>

                      <td>
                        <span className="prescription-diagnosis">
                          {prescription.diagnosis}
                        </span>
                      </td>

                      <td>
                        <span className="prescription-medicine-count">
                          <Pill size={15} />
                          {prescription.medicines?.length || 0}
                        </span>
                      </td>

                      <td>{prescription.issueDate || "—"}</td>

                      <td>
                        <div className="prescription-actions">
                          <button
                            className="prescription-view-btn"
                            title="View prescription"
                            onClick={() => setViewPrescription(prescription)}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className="prescription-edit-btn"
                            title="Edit prescription"
                            onClick={() => openEditModal(prescription)}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            className="prescription-delete-btn"
                            title="Delete prescription"
                            onClick={() => handleDelete(prescription)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="prescription-empty">
                        <FileText size={38} />
                        <h3>No prescriptions found</h3>
                        <p>
                          Create a prescription or change your search.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="prescription-modal-overlay">
            <div className="prescription-modal">
              <div className="prescription-modal-header">
                <div>
                  <h2>
                    {editingPrescription
                      ? "Edit Prescription"
                      : "Create Prescription"}
                  </h2>
                  <p>Enter patient details and prescribed medicines.</p>
                </div>

                <button type="button" onClick={closeModal}>
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="prescription-form-grid">
                  <label>
                    Select Patient *
                    <select
                      name="patientId"
                      value={form.patientId}
                      onChange={handleFormChange}
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
                    Issue Date *
                    <input
                      type="date"
                      name="issueDate"
                      value={form.issueDate}
                      onChange={handleFormChange}
                      required
                    />
                  </label>

                  <label className="prescription-full-width">
                    Diagnosis *
                    <input
                      type="text"
                      name="diagnosis"
                      value={form.diagnosis}
                      onChange={handleFormChange}
                      placeholder="Enter diagnosis"
                      required
                    />
                  </label>
                </div>

                <div className="prescription-medicines-heading">
                  <div>
                    <h3>Prescribed Medicines</h3>
                    <p>Add one or more medicines to this prescription.</p>
                  </div>

                  <button
                    type="button"
                    className="prescription-add-medicine-btn"
                    onClick={addMedicine}
                  >
                    <Plus size={16} />
                    Add Medicine
                  </button>
                </div>

                <div className="prescription-medicine-list">
                  {form.medicines.map((medicine, index) => (
                    <div className="prescription-medicine-card" key={medicine.id}>
                      <div className="prescription-medicine-card-header">
                        <strong>Medicine {index + 1}</strong>

                        <button
                          type="button"
                          className="prescription-remove-medicine"
                          onClick={() => removeMedicine(medicine.id)}
                          title="Remove medicine"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>

                      <div className="prescription-medicine-grid">
                        <label>
                          Medicine Name *
                          <input
                            value={medicine.name}
                            onChange={(event) =>
                              handleMedicineChange(
                                medicine.id,
                                "name",
                                event.target.value
                              )
                            }
                            placeholder="e.g. Medicine name"
                            required
                          />
                        </label>

                        <label>
                          Dosage *
                          <input
                            value={medicine.dosage}
                            onChange={(event) =>
                              handleMedicineChange(
                                medicine.id,
                                "dosage",
                                event.target.value
                              )
                            }
                            placeholder="e.g. 500 mg"
                            required
                          />
                        </label>

                        <label>
                          Frequency *
                          <input
                            value={medicine.frequency}
                            onChange={(event) =>
                              handleMedicineChange(
                                medicine.id,
                                "frequency",
                                event.target.value
                              )
                            }
                            placeholder="e.g. Twice daily"
                            required
                          />
                        </label>

                        <label>
                          Duration *
                          <input
                            value={medicine.duration}
                            onChange={(event) =>
                              handleMedicineChange(
                                medicine.id,
                                "duration",
                                event.target.value
                              )
                            }
                            placeholder="e.g. 5 days"
                            required
                          />
                        </label>

                        <label className="prescription-full-width">
                          Instructions
                          <textarea
                            value={medicine.instructions}
                            onChange={(event) =>
                              handleMedicineChange(
                                medicine.id,
                                "instructions",
                                event.target.value
                              )
                            }
                            placeholder="e.g. Take after meals"
                            rows="2"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <label className="prescription-notes-field">
                  Additional Notes
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    placeholder="Additional instructions or notes..."
                    rows="3"
                  />
                </label>

                <div className="prescription-modal-actions">
                  <button
                    type="button"
                    className="prescription-cancel-btn"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="prescription-save-btn"
                    disabled={!assignedPatients.length}
                  >
                    {editingPrescription
                      ? "Save Changes"
                      : "Save Prescription"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewPrescription && (
          <div className="prescription-modal-overlay">
            <div className="prescription-modal prescription-view-modal">
              <div className="prescription-modal-header">
                <div>
                  <h2>Prescription Details</h2>
                  <p>{viewPrescription.id}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewPrescription(null)}
                >
                  <X size={21} />
                </button>
              </div>

              <div className="prescription-detail-grid">
                <div>
                  <span>Patient</span>
                  <strong>
                    {getPatientName(viewPrescription.patientId)}
                  </strong>
                </div>

                <div>
                  <span>Issue Date</span>
                  <strong>{viewPrescription.issueDate || "—"}</strong>
                </div>

                <div className="prescription-detail-full">
                  <span>Diagnosis</span>
                  <p>{viewPrescription.diagnosis || "Not provided"}</p>
                </div>
              </div>

              <h3 className="prescription-view-medicines-title">
                Prescribed Medicines
              </h3>

              <div className="prescription-view-medicines">
                {(viewPrescription.medicines || []).map((medicine, index) => (
                  <div key={medicine.id || index}>
                    <strong>
                      {index + 1}. {medicine.name}
                    </strong>
                    <p>
                      <b>Dosage:</b> {medicine.dosage || "—"}{" "}
                      <b>Frequency:</b> {medicine.frequency || "—"}
                    </p>
                    <p>
                      <b>Duration:</b> {medicine.duration || "—"}
                    </p>
                    {medicine.instructions && (
                      <p>
                        <b>Instructions:</b> {medicine.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="prescription-detail-full prescription-view-notes">
                <span>Additional Notes</span>
                <p>{viewPrescription.notes || "Not provided"}</p>
              </div>

              <div className="prescription-modal-actions">
                <button
                  className="prescription-cancel-btn"
                  onClick={() => setViewPrescription(null)}
                >
                  Close
                </button>

                <button
                  className="prescription-save-btn"
                  onClick={() => {
                    const selectedPrescription = viewPrescription;
                    setViewPrescription(null);
                    openEditModal(selectedPrescription);
                  }}
                >
                  <Pencil size={16} />
                  Edit Prescription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}

function StethoscopeFallback() {
  return <FileText size={38} />;
}

export default DoctorPrescriptions;
