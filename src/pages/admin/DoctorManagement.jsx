
import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Stethoscope,
  Phone,
  Mail,
  UserRound,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./DoctorManagement.css";

const emptyForm = {
  name: "",
  specialization: "",
  phone: "",
  email: "",
  availability: "Available",
  status: "Active",
};

function DoctorManagement() {
  const { doctors, updateSection, activities } = useHospitalData();

  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [registrationFilter, setRegistrationFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // Existing doctors are treated as approved.
  const getRegistrationStatus = (doctor) =>
    doctor.registrationStatus || "Approved";

  const pendingDoctors = doctors.filter(
    (doctor) => getRegistrationStatus(doctor) === "Pending"
  );

  const approvedDoctors = doctors.filter(
    (doctor) => getRegistrationStatus(doctor) === "Approved"
  );

  const rejectedDoctors = doctors.filter(
    (doctor) => getRegistrationStatus(doctor) === "Rejected"
  );

  const specializations = [
    ...new Set(
      doctors.map((doctor) => doctor.specialization).filter(Boolean)
    ),
  ];

  const filteredDoctors = useMemo(() => {
    return doctors.filter((doctor) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        doctor.name?.toLowerCase().includes(searchText) ||
        doctor.id?.toLowerCase().includes(searchText) ||
        doctor.phone?.toLowerCase().includes(searchText) ||
        doctor.email?.toLowerCase().includes(searchText);

      const matchesSpecialization =
        specializationFilter === "All" ||
        doctor.specialization === specializationFilter;

      const matchesAvailability =
        availabilityFilter === "All" ||
        doctor.availability === availabilityFilter;

      const matchesRegistration =
        registrationFilter === "All" ||
        getRegistrationStatus(doctor) === registrationFilter;

      return (
        matchesSearch &&
        matchesSpecialization &&
        matchesAvailability &&
        matchesRegistration
      );
    });
  }, [
    doctors,
    search,
    specializationFilter,
    availabilityFilter,
    registrationFilter,
  ]);

  const addActivity = (message) => {
    const newActivity = {
      id: `ACT${Date.now()}`,
      message,
      date: new Date().toLocaleString(),
    };

    updateSection("activities", [newActivity, ...activities]);
  };

  const openAddModal = () => {
    setEditingDoctor(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (doctor) => {
    setEditingDoctor(doctor);

    setForm({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      phone: doctor.phone || "",
      email: doctor.email || "",
      availability: doctor.availability || "Available",
      status: doctor.status || "Active",
    });

    setShowModal(true);
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

    if (!form.name.trim() || !form.specialization.trim()) {
      alert("Please enter doctor name and specialization.");
      return;
    }

    let updatedDoctors;

    if (editingDoctor) {
      updatedDoctors = doctors.map((doctor) =>
        doctor.id === editingDoctor.id
          ? { ...doctor, ...form }
          : doctor
      );
    } else {
      const newDoctor = {
        id: `DOC${Date.now()}`,
        ...form,
        registrationStatus: "Approved",
      };

      updatedDoctors = [...doctors, newDoctor];
    }

    const saved = updateSection("doctors", updatedDoctors);

    if (!saved) {
      alert("Unable to save doctor details. Please try again.");
      return;
    }

    addActivity(
      editingDoctor
        ? `Doctor ${form.name} details updated`
        : `New doctor ${form.name} added`
    );

    setShowModal(false);
    setEditingDoctor(null);
    setForm(emptyForm);
  };

  // Approve or reject a doctor registration.
  const handleRegistrationAction = (doctor, action) => {
    const actionText = action === "Approved" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${doctor.name}'s registration?`
    );

    if (!confirmed) return;

    const updatedDoctors = doctors.map((item) =>
      item.id === doctor.id
        ? {
            ...item,
            registrationStatus: action,
            status: action === "Approved" ? "Active" : "Inactive",
          }
        : item
    );

    const saved = updateSection("doctors", updatedDoctors);

    if (!saved) {
      alert("Unable to update doctor registration. Please try again.");
      return;
    }

    addActivity(
      `Doctor ${doctor.name} registration ${action.toLowerCase()}`
    );
  };

  const handleDelete = (doctor) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${doctor.name}?`
    );

    if (!confirmed) return;

    const updatedDoctors = doctors.filter(
      (item) => item.id !== doctor.id
    );

    const saved = updateSection("doctors", updatedDoctors);

    if (!saved) {
      alert("Unable to delete doctor. Please try again.");
      return;
    }

    addActivity(`Doctor ${doctor.name} deleted`);
  };

  const getRegistrationClass = (status) => {
    if (status === "Approved") return "approved";
    if (status === "Rejected") return "rejected";
    return "pending";
  };

  return (
    <AdminLayout>
      <div className="doctor-management">

        {/* PAGE HEADER */}
        <div className="doctor-page-header">
          <div>
            <h1>Doctor Management</h1>
            <p>Manage hospital doctors and their availability.</p>
          </div>

          <button className="doctor-add-btn" onClick={openAddModal}>
            <Plus size={19} />
            Add Doctor
          </button>
        </div>

        {/* DOCTOR SUMMARY */}
        <div className="doctor-summary-grid">
          <div className="doctor-summary-card">
            <div className="doctor-summary-icon">
              <Stethoscope size={22} />
            </div>
            <div>
              <span>Total Doctors</span>
              <h2>{doctors.length}</h2>
            </div>
          </div>

          <div className="doctor-summary-card">
            <div className="doctor-summary-icon available">
              <UserRound size={22} />
            </div>
            <div>
              <span>Available</span>
              <h2>
                {doctors.filter(
                  (doctor) => doctor.availability === "Available"
                ).length}
              </h2>
            </div>
          </div>

          <div className="doctor-summary-card">
            <div className="doctor-summary-icon busy">
              <Stethoscope size={22} />
            </div>
            <div>
              <span>Busy</span>
              <h2>
                {doctors.filter(
                  (doctor) => doctor.availability === "Busy"
                ).length}
              </h2>
            </div>
          </div>

          <div className="doctor-summary-card">
            <div className="doctor-summary-icon inactive">
              <UserRound size={22} />
            </div>
            <div>
              <span>On Leave</span>
              <h2>
                {doctors.filter(
                  (doctor) => doctor.availability === "On Leave"
                ).length}
              </h2>
            </div>
          </div>
        </div>

        {/* REGISTRATION SUMMARY */}
        <div className="doctor-approval-summary">
          <div className="doctor-approval-card pending">
            <Clock size={23} />
            <div>
              <span>Pending Registrations</span>
              <h2>{pendingDoctors.length}</h2>
            </div>
          </div>

          <div className="doctor-approval-card approved">
            <CheckCircle2 size={23} />
            <div>
              <span>Approved Registrations</span>
              <h2>{approvedDoctors.length}</h2>
            </div>
          </div>

          <div className="doctor-approval-card rejected">
            <XCircle size={23} />
            <div>
              <span>Rejected Registrations</span>
              <h2>{rejectedDoctors.length}</h2>
            </div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="doctor-toolbar">
          <div className="doctor-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search by name, ID, phone or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={specializationFilter}
            onChange={(event) =>
              setSpecializationFilter(event.target.value)
            }
          >
            <option value="All">All Specializations</option>
            {specializations.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(event.target.value)
            }
          >
            <option value="All">All Availability</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
            <option value="On Leave">On Leave</option>
          </select>

          <select
            value={registrationFilter}
            onChange={(event) =>
              setRegistrationFilter(event.target.value)
            }
          >
            <option value="All">All Registrations</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* DOCTOR TABLE */}
        <div className="doctor-table-card">
          <div className="doctor-table-heading">
            <div>
              <h2>All Doctors</h2>
              <p>{filteredDoctors.length} doctors found</p>
            </div>
          </div>

          <div className="doctor-table-wrapper">
            <table className="doctor-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Contact</th>
                  <th>Availability</th>
                  <th>Account Status</th>
                  <th>Registration</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDoctors.map((doctor) => {
                  const registrationStatus =
                    getRegistrationStatus(doctor);

                  return (
                    <tr key={doctor.id}>
                      <td>
                        <div className="doctor-name-cell">
                          <div className="doctor-avatar">
                            <Stethoscope size={19} />
                          </div>
                          <div>
                            <strong>{doctor.name}</strong>
                            <span>{doctor.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>{doctor.specialization}</td>

                      <td>
                        <div className="doctor-contact">
                          <span>
                            <Phone size={14} />
                            {doctor.phone || "Not provided"}
                          </span>
                          <span>
                            <Mail size={14} />
                            {doctor.email || "Not provided"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`doctor-status ${
                            doctor.availability === "Available"
                              ? "available"
                              : doctor.availability === "Busy"
                              ? "busy"
                              : "leave"
                          }`}
                        >
                          {doctor.availability || "Not set"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`doctor-status ${
                            doctor.status === "Active"
                              ? "available"
                              : "inactive"
                          }`}
                        >
                          {doctor.status || "Active"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`doctor-registration-badge ${getRegistrationClass(
                            registrationStatus
                          )}`}
                        >
                          {registrationStatus}
                        </span>
                      </td>

                      <td>
                        <div className="doctor-actions">

                          {registrationStatus === "Pending" && (
                            <>
                              <button
                                type="button"
                                title="Approve doctor"
                                className="approve"
                                onClick={() =>
                                  handleRegistrationAction(
                                    doctor,
                                    "Approved"
                                  )
                                }
                              >
                                <CheckCircle2 size={17} />
                              </button>

                              <button
                                type="button"
                                title="Reject doctor"
                                className="reject"
                                onClick={() =>
                                  handleRegistrationAction(
                                    doctor,
                                    "Rejected"
                                  )
                                }
                              >
                                <XCircle size={17} />
                              </button>
                            </>
                          )}

                          <button
                            type="button"
                            title="Edit doctor"
                            onClick={() => openEditModal(doctor)}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            title="Delete doctor"
                            className="delete"
                            onClick={() => handleDelete(doctor)}
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredDoctors.length === 0 && (
                  <tr>
                    <td colSpan="7" className="doctor-empty">
                      No doctors found. Try another search or filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADD / EDIT MODAL */}
        {showModal && (
          <div
            className="doctor-modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <div
              className="doctor-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="doctor-modal-header">
                <div>
                  <h2>
                    {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                  </h2>
                  <p>Enter the doctor's information below.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="doctor-form-grid">
                  <label>
                    Doctor Name *
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter doctor name"
                      required
                    />
                  </label>

                  <label>
                    Specialization *
                    <input
                      name="specialization"
                      value={form.specialization}
                      onChange={handleChange}
                      placeholder="e.g. Cardiology"
                      required
                    />
                  </label>

                  <label>
                    Phone Number
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />
                  </label>

                  <label>
                    Email Address
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                    />
                  </label>

                  <label>
                    Availability
                    <select
                      name="availability"
                      value={form.availability}
                      onChange={handleChange}
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </label>

                  <label>
                    Account Status
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>
                </div>

                <div className="doctor-modal-actions">
                  <button
                    type="button"
                    className="doctor-cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="doctor-save-btn">
                    {editingDoctor ? "Update Doctor" : "Save Doctor"}
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

export default DoctorManagement;
