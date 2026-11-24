
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  Users,
  X,
  MapPin,
  Phone,
  Stethoscope,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./DepartmentManagement.css";

function DepartmentManagement() {
  const { data, doctors, activities, updateSection } = useHospitalData();

  const departments = data.departments || [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const emptyForm = {
    name: "",
    description: "",
    location: "",
    contact: "",
    doctorIds: [],
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  const filteredDepartments = useMemo(() => {
    return departments.filter((department) => {
      const matchesSearch =
        department.name?.toLowerCase().includes(search.toLowerCase()) ||
        department.description?.toLowerCase().includes(search.toLowerCase()) ||
        department.location?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || department.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);

  const activeCount = departments.filter(
    (department) => department.status === "Active"
  ).length;

  const assignedDoctorCount = new Set(
    departments.flatMap((department) => department.doctorIds || [])
  ).size;

  const getDoctorNames = (doctorIds = []) => {
    return doctorIds
      .map((id) => doctors.find((doctor) => doctor.id === id)?.name)
      .filter(Boolean);
  };

  const openAddModal = () => {
    setEditingDepartment(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);
    setForm({
      name: department.name || "",
      description: department.description || "",
      location: department.location || "",
      contact: department.contact || "",
      doctorIds: department.doctorIds || [],
      status: department.status || "Active",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setForm(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const toggleDoctor = (doctorId) => {
    setForm((previous) => ({
      ...previous,
      doctorIds: previous.doctorIds.includes(doctorId)
        ? previous.doctorIds.filter((id) => id !== doctorId)
        : [...previous.doctorIds, doctorId],
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

    if (!form.name.trim()) {
      alert("Please enter a department name.");
      return;
    }

    const updatedDepartment = {
      ...form,
      name: form.name.trim(),
      id: editingDepartment?.id || `DEPT${Date.now()}`,
    };

    let updatedDepartments;

    if (editingDepartment) {
      updatedDepartments = departments.map((department) =>
        department.id === editingDepartment.id
          ? updatedDepartment
          : department
      );
    } else {
      updatedDepartments = [updatedDepartment, ...departments];
    }

    const saved = updateSection("departments", updatedDepartments);

    if (saved) {
      addActivity(
        editingDepartment
          ? `Department ${form.name} was updated`
          : `New department ${form.name} was added`
      );
      closeModal();
    } else {
      alert("Unable to save department. Please try again.");
    }
  };

  const handleDelete = (department) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${department.name}?`
    );

    if (!confirmed) return;

    const updatedDepartments = departments.filter(
      (item) => item.id !== department.id
    );

    if (updateSection("departments", updatedDepartments)) {
      addActivity(`Department ${department.name} was deleted`);
    } else {
      alert("Unable to delete department. Please try again.");
    }
  };

  return (
    <AdminLayout>
      <div className="department-management">
        <div className="department-page-header">
          <div>
            <h1>Department Management</h1>
            <p>Manage hospital departments and their assigned doctors.</p>
          </div>

          <button className="department-add-btn" onClick={openAddModal}>
            <Plus size={19} />
            Add Department
          </button>
        </div>

        <div className="department-summary-grid">
          <div className="department-summary-card">
            <div className="department-summary-icon purple">
              <Building2 size={22} />
            </div>
            <div>
              <h3>{departments.length}</h3>
              <p>Total Departments</p>
            </div>
          </div>

          <div className="department-summary-card">
            <div className="department-summary-icon green">
              <Building2 size={22} />
            </div>
            <div>
              <h3>{activeCount}</h3>
              <p>Active Departments</p>
            </div>
          </div>

          <div className="department-summary-card">
            <div className="department-summary-icon blue">
              <Users size={22} />
            </div>
            <div>
              <h3>{assignedDoctorCount}</h3>
              <p>Assigned Doctors</p>
            </div>
          </div>

          <div className="department-summary-card">
            <div className="department-summary-icon orange">
              <Stethoscope size={22} />
            </div>
            <div>
              <h3>{doctors.length}</h3>
              <p>Total Doctors</p>
            </div>
          </div>
        </div>

        <div className="department-toolbar">
          <div className="department-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search departments..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All Departments</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="department-grid">
          {filteredDepartments.length > 0 ? (
            filteredDepartments.map((department) => {
              const doctorNames = getDoctorNames(department.doctorIds);

              return (
                <div className="department-card" key={department.id}>
                  <div className="department-card-header">
                    <div className="department-card-icon">
                      <Building2 size={23} />
                    </div>

                    <span
                      className={`department-status ${
                        department.status === "Active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {department.status}
                    </span>
                  </div>

                  <h3>{department.name}</h3>
                  <p className="department-description">
                    {department.description || "No description provided."}
                  </p>

                  <div className="department-details">
                    <div>
                      <MapPin size={16} />
                      <span>{department.location || "Location not specified"}</span>
                    </div>

                    <div>
                      <Phone size={16} />
                      <span>{department.contact || "No contact number"}</span>
                    </div>

                    <div>
                      <Users size={16} />
                      <span>
                        {doctorNames.length} assigned doctor
                        {doctorNames.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="department-doctors">
                    <h4>Assigned Doctors</h4>

                    {doctorNames.length > 0 ? (
                      <div className="department-doctor-list">
                        {doctorNames.map((name, index) => (
                          <span key={`${name}-${index}`}>{name}</span>
                        ))}
                      </div>
                    ) : (
                      <p>No doctors assigned yet.</p>
                    )}
                  </div>

                  <div className="department-card-actions">
                    <button
                      className="department-edit-btn"
                      onClick={() => openEditModal(department)}
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      className="department-delete-btn"
                      onClick={() => handleDelete(department)}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="department-empty">
              <Building2 size={38} />
              <h3>No departments found</h3>
              <p>Add a department or change your search filters.</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="department-modal-overlay">
            <div className="department-modal">
              <div className="department-modal-header">
                <div>
                  <h2>
                    {editingDepartment ? "Edit Department" : "Add Department"}
                  </h2>
                  <p>Enter department details and assign doctors.</p>
                </div>

                <button type="button" onClick={closeModal}>
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="department-form-grid">
                  <label>
                    Department Name *
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="e.g. Cardiology"
                      required
                    />
                  </label>

                  <label>
                    Contact Number
                    <input
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      placeholder="Enter contact number"
                    />
                  </label>

                  <label>
                    Location
                    <input
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="e.g. Block A, Floor 2"
                    />
                  </label>

                  <label>
                    Status
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>

                  <label className="department-full-width">
                    Description
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe this department..."
                      rows="3"
                    />
                  </label>

                  <div className="department-doctor-selector department-full-width">
                    <h4>Assign Doctors</h4>

                    {doctors.length > 0 ? (
                      <div className="department-doctor-options">
                        {doctors.map((doctor) => (
                          <label key={doctor.id}>
                            <input
                              type="checkbox"
                              checked={form.doctorIds.includes(doctor.id)}
                              onChange={() => toggleDoctor(doctor.id)}
                            />
                            <span>
                              {doctor.name}
                              <small>{doctor.specialization || "Doctor"}</small>
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p>No doctors available. Add doctors first.</p>
                    )}
                  </div>
                </div>

                <div className="department-modal-actions">
                  <button
                    type="button"
                    className="department-cancel-btn"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="department-save-btn">
                    {editingDepartment ? "Save Changes" : "Add Department"}
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

export default DepartmentManagement;
