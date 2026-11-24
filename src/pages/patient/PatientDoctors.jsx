
import { useMemo, useState } from "react";
import {
  Search,
  Stethoscope,
  Phone,
  Mail,
  Building2,
  MapPin,
  GraduationCap,
  Users,
} from "lucide-react";

import PatientLayout from "../../layouts/PatientLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./PatientDoctors.css";

function PatientDoctors() {
  const { data, doctors = [] } = useHospitalData();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  // Only active departments are visible to patients.
  const departments = useMemo(
    () =>
      (data?.departments || []).filter(
        (department) => department.status === "Active"
      ),
    [data?.departments]
  );

  // Find approved, active doctors assigned to active departments.
  const hospitalDoctors = useMemo(() => {
    return doctors
      .filter((doctor) => {
        const registrationStatus =
          doctor.registrationStatus || "Approved";

        const isApproved = registrationStatus === "Approved";
        const isActive = doctor.status !== "Inactive";

        const assignedDepartments = departments.filter(
          (department) =>
            (department.doctorIds || []).some(
              (id) => String(id) === String(doctor.id)
            )
        );

        return (
          isApproved &&
          isActive &&
          assignedDepartments.length > 0
        );
      })
      .map((doctor) => {
        const assignedDepartments = departments.filter(
          (department) =>
            (department.doctorIds || []).some(
              (id) => String(id) === String(doctor.id)
            )
        );

        return {
          ...doctor,
          departmentNames: assignedDepartments.map(
            (department) => department.name
          ),
          departmentLocations: assignedDepartments
            .map((department) => department.location)
            .filter(Boolean),
        };
      });
  }, [doctors, departments]);

  // Search and department filtering.
  const filteredDoctors = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return hospitalDoctors.filter((doctor) => {
      const matchesSearch =
        !normalizedSearch ||
        doctor.name?.toLowerCase().includes(normalizedSearch) ||
        doctor.specialization?.toLowerCase().includes(normalizedSearch) ||
        doctor.qualification?.toLowerCase().includes(normalizedSearch) ||
        doctor.departmentNames.some((name) =>
          name.toLowerCase().includes(normalizedSearch)
        );

      const matchesDepartment =
        selectedDepartment === "All" ||
        doctor.departmentNames.includes(selectedDepartment);

      return matchesSearch && matchesDepartment;
    });
  }, [hospitalDoctors, searchTerm, selectedDepartment]);

  const getAvailabilityClass = (availability) => {
    switch (availability) {
      case "Available":
        return "available";
      case "Busy":
        return "busy";
      case "On Leave":
        return "on-leave";
      default:
        return "unknown";
    }
  };

  return (
    <PatientLayout>
      <div className="patient-doctors-page">
        {/* HEADER */}
        <div className="patient-doctors-header">
          <div>
            <span className="patient-doctors-eyebrow">
              YOUR HEALTHCARE TEAM
            </span>
            <h1>My Doctors</h1>
            <p>
              Explore our hospital doctors and find the right
              specialist for your healthcare needs.
            </p>
          </div>

          <div className="patient-doctors-header-icon">
            <Stethoscope size={30} />
          </div>
        </div>

        {/* STATISTICS */}
        <div className="patient-doctors-stats">
          <div className="patient-doctors-stat-card">
            <div className="patient-doctors-stat-icon teal">
              <Stethoscope size={21} />
            </div>
            <div>
              <span>Total Doctors</span>
              <strong>{hospitalDoctors.length}</strong>
            </div>
          </div>

          <div className="patient-doctors-stat-card">
            <div className="patient-doctors-stat-icon green">
              <Users size={21} />
            </div>
            <div>
              <span>Available Doctors</span>
              <strong>
                {
                  hospitalDoctors.filter(
                    (doctor) => doctor.availability === "Available"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="patient-doctors-stat-card">
            <div className="patient-doctors-stat-icon purple">
              <Building2 size={21} />
            </div>
            <div>
              <span>Departments</span>
              <strong>{departments.length}</strong>
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTER */}
        <div className="patient-doctors-toolbar">
          <div className="patient-doctors-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search doctor, specialization or department..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <div className="patient-doctors-filter">
            <Building2 size={17} />
            <select
              value={selectedDepartment}
              onChange={(event) =>
                setSelectedDepartment(event.target.value)
              }
            >
              <option value="All">All Departments</option>
              {departments.map((department) => (
                <option
                  key={department.id}
                  value={department.name}
                >
                  {department.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* RESULTS */}
        <div className="patient-doctors-results-heading">
          <div>
            <h2>Hospital Specialists</h2>
            <p>
              {filteredDoctors.length} doctor
              {filteredDoctors.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* DOCTOR CARDS */}
        {filteredDoctors.length > 0 ? (
          <div className="patient-doctors-grid">
            {filteredDoctors.map((doctor) => (
              <div
                className="patient-doctor-card"
                key={doctor.id}
              >
                <div className="patient-doctor-card-top">
                  <div className="patient-doctor-avatar">
                    <Stethoscope size={27} />
                  </div>

                  <span
                    className={`patient-doctor-status ${getAvailabilityClass(
                      doctor.availability
                    )}`}
                  >
                    {doctor.availability || "Not specified"}
                  </span>
                </div>

                <div className="patient-doctor-info">
                  <h3>{doctor.name}</h3>

                  <span className="patient-doctor-specialization">
                    {doctor.specialization || "General Physician"}
                  </span>

                  <div className="patient-doctor-detail">
                    <GraduationCap size={16} />
                    <span>
                      {doctor.qualification || "Qualification not provided"}
                    </span>
                  </div>

                  <div className="patient-doctor-detail">
                    <Building2 size={16} />
                    <span>
                      {doctor.departmentNames.join(", ")}
                    </span>
                  </div>

                  {doctor.departmentLocations.length > 0 && (
                    <div className="patient-doctor-detail">
                      <MapPin size={16} />
                      <span>
                        {[...new Set(doctor.departmentLocations)].join(", ")}
                      </span>
                    </div>
                  )}

                  {doctor.phone && (
                    <div className="patient-doctor-detail">
                      <Phone size={16} />
                      <span>{doctor.phone}</span>
                    </div>
                  )}

                  {doctor.email && (
                    <div className="patient-doctor-detail">
                      <Mail size={16} />
                      <span>{doctor.email}</span>
                    </div>
                  )}
                </div>

                <div className="patient-doctor-card-footer">
                  <span>Doctor ID</span>
                  <strong>{doctor.id}</strong>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="patient-doctors-empty">
            <div>
              <Stethoscope size={32} />
            </div>
            <h3>No Doctors Found</h3>
            <p>
              {hospitalDoctors.length === 0
                ? "There are currently no approved doctors assigned to active departments."
                : "Try changing your search or department filter."}
            </p>
          </div>
        )}
      </div>
    </PatientLayout>
  );
}

export default PatientDoctors;
