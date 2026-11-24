
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Users,
  X,
  UserRound,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { useHospitalData } from "../../hooks/useHospitalData";

import "./PatientManagement.css";

const emptyForm = {
  name: "",
  age: "",
  gender: "Male",
  phone: "",
  email: "",
  bloodGroup: "O+",
  address: "",
  status: "Active",
};

function PatientManagement() {
  const { patients, updateSection, activities, updateSection: saveSection } =
    useHospitalData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        patient.name?.toLowerCase().includes(searchValue) ||
        patient.id?.toLowerCase().includes(searchValue) ||
        patient.phone?.includes(search);

      const matchesStatus =
        statusFilter === "All" || patient.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [patients, search, statusFilter]);

  const addActivity = (title, description) => {
    const newActivity = {
      id: `ACT${Date.now()}`,
      title,
      description,
      date: new Date().toISOString(),
    };

    saveSection("activities", [...activities, newActivity]);
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (patient) => {
    setEditingId(patient.id);

    setForm({
      name: patient.name || "",
      age: patient.age || "",
      gender: patient.gender || "Male",
      phone: patient.phone || "",
      email: patient.email || "",
      bloodGroup: patient.bloodGroup || "O+",
      address: patient.address || "",
      status: patient.status || "Active",
    });

    setShowForm(true);
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

    const patientData = {
      ...form,
      age: Number(form.age),
    };

    if (editingId) {
      const updatedPatients = patients.map((patient) =>
        patient.id === editingId
          ? { ...patient, ...patientData }
          : patient
      );

      updateSection("patients", updatedPatients);

      addActivity(
        "Patient updated",
        `${form.name}'s information was updated.`
      );
    } else {
      const newPatient = {
        ...patientData,
        id: `PAT${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      updateSection("patients", [...patients, newPatient]);

      addActivity(
        "Patient registered",
        `${form.name} was added to the hospital.`
      );
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (patient) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${patient.name}?`
    );

    if (!confirmed) return;

    updateSection(
      "patients",
      patients.filter((item) => item.id !== patient.id)
    );

    addActivity(
      "Patient deleted",
      `${patient.name}'s record was deleted.`
    );
  };

  return (
    <AdminLayout>
      <div className="patient-management">

        <div className="patient-page-header">
          <div>
            <h1>Patient Management</h1>
            <p>Manage and monitor all registered hospital patients.</p>
          </div>

          <button className="patient-add-btn" onClick={openAddForm}>
            <Plus size={19} />
            Add Patient
          </button>
        </div>

        <div className="patient-summary-card">
          <div className="patient-summary-icon">
            <Users size={25} />
          </div>

          <div>
            <p>Total Registered Patients</p>
            <h2>{patients.length}</h2>
          </div>
        </div>

        <section className="patient-table-panel">

          <div className="patient-toolbar">
            <div className="patient-search">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search by name, patient ID or phone..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="patient-table-wrapper">
            <table className="patient-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>Age / Gender</th>
                  <th>Phone</th>
                  <th>Blood Group</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td>
                        <div className="patient-name-cell">
                          <div className="patient-avatar">
                            <UserRound size={19} />
                          </div>

                          <div>
                            <strong>{patient.name}</strong>
                            <span>{patient.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>{patient.id}</td>

                      <td>
                        {patient.age} / {patient.gender}
                      </td>

                      <td>{patient.phone}</td>

                      <td>{patient.bloodGroup}</td>

                      <td>
                        <span
                          className={`patient-status ${
                            patient.status === "Active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {patient.status}
                        </span>
                      </td>

                      <td>
                        <div className="patient-actions">
                          <button
                            type="button"
                            className="patient-edit-btn"
                            title="Edit patient"
                            onClick={() => openEditForm(patient)}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="patient-delete-btn"
                            title="Delete patient"
                            onClick={() => handleDelete(patient)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="patient-empty">
                      No patients found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="patient-table-footer">
            Showing {filteredPatients.length} of {patients.length} patients
          </div>
        </section>

        {showForm && (
          <div
            className="patient-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowForm(false);
              }
            }}
          >
            <div
              className="patient-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="patient-form-title"
            >
              <div className="patient-modal-header">
                <div>
                  <h2 id="patient-form-title">
                    {editingId ? "Edit Patient" : "Add New Patient"}
                  </h2>
                  <p>Enter the patient's information below.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  aria-label="Close form"
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="patient-form-grid">

                  <label>
                    Full Name *
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter patient name"
                      required
                    />
                  </label>

                  <label>
                    Age *
                    <input
                      name="age"
                      type="number"
                      min="0"
                      max="120"
                      value={form.age}
                      onChange={handleChange}
                      placeholder="Enter age"
                      required
                    />
                  </label>

                  <label>
                    Gender
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </label>

                  <label>
                    Phone Number *
                    <input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      required
                    />
                  </label>

                  <label>
                    Email Address
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                    />
                  </label>

                  <label>
                    Blood Group
                    <select
                      name="bloodGroup"
                      value={form.bloodGroup}
                      onChange={handleChange}
                    >
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                        (group) => (
                          <option key={group}>{group}</option>
                        )
                      )}
                    </select>
                  </label>

                  <label className="patient-full-width">
                    Address
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter patient address"
                      rows="3"
                    />
                  </label>

                  <label>
                    Status
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </label>

                </div>

                <div className="patient-form-actions">
                  <button
                    type="button"
                    className="patient-cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="patient-save-btn">
                    {editingId ? "Save Changes" : "Add Patient"}
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

export default PatientManagement;
