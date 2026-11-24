
import { useMemo, useState } from "react";
import {
  BarChart3,
  Users,
  Stethoscope,
  CalendarDays,
  Building2,
  FileText,
  Receipt,
  Search,
  Download,
  Printer,
  Filter,
  RotateCcw,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./ReportsManagement.css";

const reportOptions = [
  { id: "patients", label: "Patients", icon: Users },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "departments", label: "Departments", icon: Building2 },
  { id: "medicalRecords", label: "Medical Records", icon: FileText },
  { id: "billingRecords", label: "Billing", icon: Receipt },
];

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const getDate = (record, type) => {
  if (type === "appointments") return record.date || "";
  if (type === "medicalRecords") return record.visitDate || "";
  if (type === "billingRecords") return record.billDate || "";
  return (
    record.createdAt?.slice(0, 10) ||
    record.updatedAt?.slice(0, 10) ||
    ""
  );
};

function ReportsManagement() {
  const { data } = useHospitalData();

  const [reportType, setReportType] = useState("patients");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const patients = data.patients || [];
  const doctors = data.doctors || [];
  const appointments = data.appointments || [];
  const departments = data.departments || [];
  const medicalRecords = data.medicalRecords || [];
  const billingRecords = data.billingRecords || [];

  const patientName = (id) =>
    patients.find((patient) => patient.id === id)?.name || "Unknown patient";

  const doctorName = (id) =>
    doctors.find((doctor) => doctor.id === id)?.name || "Unknown doctor";

  const reportData = {
    patients,
    doctors,
    appointments,
    departments,
    medicalRecords,
    billingRecords,
  };

  const columns = {
    patients: [
      { key: "id", label: "Patient ID" },
      { key: "name", label: "Patient Name" },
      { key: "age", label: "Age" },
      { key: "gender", label: "Gender" },
      { key: "phone", label: "Phone" },
      { key: "bloodGroup", label: "Blood Group" },
      { key: "status", label: "Status" },
    ],
    doctors: [
      { key: "id", label: "Doctor ID" },
      { key: "name", label: "Doctor Name" },
      { key: "specialization", label: "Specialization" },
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "availability", label: "Availability" },
      { key: "status", label: "Status" },
    ],
    appointments: [
      { key: "id", label: "Appointment ID" },
      { key: "patient", label: "Patient" },
      { key: "doctor", label: "Doctor" },
      { key: "date", label: "Date" },
      { key: "time", label: "Time" },
      { key: "reason", label: "Reason" },
      { key: "status", label: "Status" },
    ],
    departments: [
      { key: "id", label: "Department ID" },
      { key: "name", label: "Department" },
      { key: "location", label: "Location" },
      { key: "contact", label: "Contact" },
      { key: "doctorCount", label: "Assigned Doctors" },
      { key: "status", label: "Status" },
    ],
    medicalRecords: [
      { key: "id", label: "Record ID" },
      { key: "patient", label: "Patient" },
      { key: "doctor", label: "Doctor" },
      { key: "visitDate", label: "Visit Date" },
      { key: "diagnosis", label: "Diagnosis" },
      { key: "treatment", label: "Treatment" },
      { key: "followUpDate", label: "Follow-up" },
    ],
    billingRecords: [
      { key: "id", label: "Bill ID" },
      { key: "patient", label: "Patient" },
      { key: "billDate", label: "Bill Date" },
      { key: "total", label: "Total Amount" },
      { key: "amountPaid", label: "Amount Paid" },
      { key: "balanceDue", label: "Balance Due" },
      { key: "paymentStatus", label: "Payment Status" },
    ],
  };

  const normalizedRows = useMemo(() => {
    const source = reportData[reportType] || [];

    return source.map((record) => {
      if (reportType === "appointments") {
        return {
          ...record,
          patient: patientName(record.patientId),
          doctor: doctorName(record.doctorId),
        };
      }

      if (reportType === "departments") {
        return {
          ...record,
          doctorCount: (record.doctorIds || []).length,
        };
      }

      if (reportType === "medicalRecords") {
        return {
          ...record,
          patient: patientName(record.patientId),
          doctor: doctorName(record.doctorId),
        };
      }

      if (reportType === "billingRecords") {
        const subtotal = (record.items || []).reduce(
          (sum, item) => sum + (Number(item.amount) || 0),
          0
        );
        const total = Math.max(
          0,
          subtotal - (Number(record.discount) || 0)
        );
        const amountPaid = Number(record.amountPaid) || 0;

        return {
          ...record,
          patient: patientName(record.patientId),
          total,
          amountPaid,
          balanceDue: Math.max(0, total - amountPaid),
        };
      }

      return record;
    });
  }, [reportType, data]);

  const filteredRows = useMemo(() => {
    return normalizedRows.filter((record) => {
      const values = Object.values(record)
        .map((value) =>
          Array.isArray(value) ? value.join(" ") : String(value ?? "")
        )
        .join(" ")
        .toLowerCase();

      const matchesSearch = values.includes(search.toLowerCase());

      const status =
        record.status || record.paymentStatus || "Not specified";
      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      const recordDate = getDate(record, reportType);
      const matchesFromDate = !fromDate || (
        recordDate && recordDate >= fromDate
      );
      const matchesToDate = !toDate || (
        recordDate && recordDate <= toDate
      );

      return (
        matchesSearch &&
        matchesStatus &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [normalizedRows, search, statusFilter, fromDate, toDate, reportType]);

  const totalCollected = billingRecords.reduce(
    (sum, bill) => sum + (Number(bill.amountPaid) || 0),
    0
  );

  const totalOutstanding = billingRecords.reduce((sum, bill) => {
    const subtotal = (bill.items || []).reduce(
      (itemSum, item) => itemSum + (Number(item.amount) || 0),
      0
    );
    const total = Math.max(0, subtotal - (Number(bill.discount) || 0));
    return sum + Math.max(0, total - (Number(bill.amountPaid) || 0));
  }, 0);

  const paidBills = billingRecords.filter(
    (bill) => bill.paymentStatus === "Paid"
  ).length;

  const getStatusOptions = () => {
    if (reportType === "billingRecords") {
      return ["Paid", "Pending", "Partially Paid"];
    }
    if (reportType === "appointments") {
      return ["Scheduled", "Completed", "Cancelled"];
    }
    if (reportType === "patients" || reportType === "doctors" || reportType === "departments") {
      return ["Active", "Inactive"];
    }
    return [];
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
  };

  const exportCSV = () => {
    const currentColumns = columns[reportType];

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replaceAll('"', '""')}"`;
    };

    const csvRows = [
      currentColumns.map((column) => escapeCSV(column.label)).join(","),
      ...filteredRows.map((record) =>
        currentColumns
          .map((column) => {
            let value = record[column.key];

            if (
              reportType === "billingRecords" &&
              ["total", "amountPaid", "balanceDue"].includes(column.key)
            ) {
              value = Number(value || 0).toFixed(2);
            }

            return escapeCSV(value);
          })
          .join(",")
      ),
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `carebridge-${reportType}-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const currentOption = reportOptions.find(
    (option) => option.id === reportType
  );
  const CurrentIcon = currentOption.icon;
  const currentColumns = columns[reportType];
  const statusOptions = getStatusOptions();

  return (
    <AdminLayout>
      <div className="reports-management">
        <div className="reports-page-header">
          <div>
            <span className="reports-eyebrow">HOSPITAL ANALYTICS</span>
            <h1>Reports Management</h1>
            <p>Review hospital records, monitor performance, and export reports.</p>
          </div>
          <div className="reports-header-actions">
            <button className="reports-secondary-btn" onClick={resetFilters}>
              <RotateCcw size={17} />
              Reset Filters
            </button>
            <button className="reports-primary-btn" onClick={() => window.print()}>
              <Printer size={17} />
              Print Report
            </button>
          </div>
        </div>

        <div className="reports-overview-grid">
          <div className="reports-overview-card">
            <div className="reports-overview-icon blue">
              <Users size={21} />
            </div>
            <div>
              <span>Total Patients</span>
              <h2>{patients.length}</h2>
            </div>
          </div>

          <div className="reports-overview-card">
            <div className="reports-overview-icon purple">
              <Stethoscope size={21} />
            </div>
            <div>
              <span>Total Doctors</span>
              <h2>{doctors.length}</h2>
            </div>
          </div>

          <div className="reports-overview-card">
            <div className="reports-overview-icon orange">
              <CalendarDays size={21} />
            </div>
            <div>
              <span>Total Appointments</span>
              <h2>{appointments.length}</h2>
            </div>
          </div>

          <div className="reports-overview-card">
            <div className="reports-overview-icon green">
              <Receipt size={21} />
            </div>
            <div>
              <span>Amount Collected</span>
              <h2>{formatMoney(totalCollected)}</h2>
            </div>
          </div>
        </div>

        <div className="reports-finance-strip">
          <div>
            <span>Outstanding Balance</span>
            <strong>{formatMoney(totalOutstanding)}</strong>
          </div>
          <div>
            <span>Paid Bills</span>
            <strong>{paidBills}</strong>
          </div>
          <div>
            <span>Medical Records</span>
            <strong>{medicalRecords.length}</strong>
          </div>
          <div>
            <span>Departments</span>
            <strong>{departments.length}</strong>
          </div>
        </div>

        <section className="reports-section">
          <div className="reports-section-heading">
            <div>
              <h2>Choose Report</h2>
              <p>Select the type of hospital data you want to review.</p>
            </div>
          </div>

          <div className="reports-type-grid">
            {reportOptions.map((option) => {
              const Icon = option.icon;
              const count = (reportData[option.id] || []).length;

              return (
                <button
                  key={option.id}
                  className={`reports-type-card ${
                    reportType === option.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setReportType(option.id);
                    setStatusFilter("All");
                    setSearch("");
                  }}
                >
                  <span className="reports-type-icon">
                    <Icon size={20} />
                  </span>
                  <span className="reports-type-content">
                    <strong>{option.label}</strong>
                    <small>{count} records</small>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="reports-section reports-results-section">
          <div className="reports-results-heading">
            <div>
              <div className="reports-current-title">
                <span className="reports-current-icon">
                  <CurrentIcon size={20} />
                </span>
                <h2>{currentOption.label} Report</h2>
              </div>
              <p>Showing {filteredRows.length} of {normalizedRows.length} records</p>
            </div>

            <button
              className="reports-export-btn"
              onClick={exportCSV}
              disabled={filteredRows.length === 0}
            >
              <Download size={17} />
              Export CSV
            </button>
          </div>

          <div className="reports-filters">
            <div className="reports-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search report records..."
              />
            </div>

            {statusOptions.length > 0 && (
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            )}

            <label>
              <span>From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </label>

            <label>
              <span>To</span>
              <input
                type="date"
                min={fromDate || undefined}
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </label>

            <span className="reports-filter-icon">
              <Filter size={17} />
            </span>
          </div>

          <div className="reports-table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  {currentColumns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((record, index) => (
                  <tr key={record.id || index}>
                    {currentColumns.map((column) => {
                      const value = record[column.key];
                      const isMoney =
                        reportType === "billingRecords" &&
                        ["total", "amountPaid", "balanceDue"].includes(
                          column.key
                        );

                      return (
                        <td key={column.key}>
                          {isMoney
                            ? formatMoney(value)
                            : value === undefined || value === null || value === ""
                              ? "—"
                              : String(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={currentColumns.length}
                      className="reports-empty"
                    >
                      <BarChart3 size={30} />
                      <strong>No report records found</strong>
                      <span>Try changing your search or filters.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="reports-table-footer">
            <span>
              Report: <strong>{currentOption.label}</strong>
            </span>
            <span>
              Generated: <strong>{new Date().toLocaleDateString("en-IN")}</strong>
            </span>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

export default ReportsManagement;
