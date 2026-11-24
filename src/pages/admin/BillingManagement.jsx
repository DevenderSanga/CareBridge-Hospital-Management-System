
import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Receipt,
  IndianRupee,
  Wallet,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  Eye,
  X,
  PlusCircle,
  MinusCircle,
} from "lucide-react";

import AdminLayout from "../../layouts/AdminLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./BillingManagement.css";

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

const emptyForm = () => ({
  patientId: "",
  appointmentId: "",
  billDate: today(),
  dueDate: "",
  items: [{ description: "", category: "Consultation", amount: "" }],
  discount: "0",
  amountPaid: "0",
  notes: "",
});

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function BillingManagement() {
  const {
    data,
    patients,
    appointments,
    activities,
    updateSection,
  } = useHospitalData();

  const bills = data.billingRecords || [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [viewingBill, setViewingBill] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState("");

  const getPatientName = (patientId) => {
    const patient = patients.find((item) => item.id === patientId);
    return patient?.name || "Patient not found";
  };

  const getAppointmentLabel = (appointmentId) => {
    if (!appointmentId) return "Not linked";
    const appointment = appointments.find(
      (item) => item.id === appointmentId
    );
    return appointment
      ? `${appointment.id} - ${appointment.date || ""}`
      : "Appointment not found";
  };

  const getTotals = (bill) => {
    const subtotal = (bill.items || []).reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
    const discount = Number(bill.discount) || 0;
    const total = Math.max(0, subtotal - discount);
    const amountPaid = Number(bill.amountPaid) || 0;
    const balance = Math.max(0, total - amountPaid);

    return { subtotal, discount, total, amountPaid, balance };
  };

  const getPaymentStatus = (total, amountPaid) => {
    if (amountPaid >= total) return "Paid";
    if (amountPaid > 0) return "Partially Paid";
    return "Pending";
  };

  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const patientName = getPatientName(bill.patientId).toLowerCase();
      const searchText = search.toLowerCase();

      const matchesSearch =
        bill.id?.toLowerCase().includes(searchText) ||
        patientName.includes(searchText);

      const matchesStatus =
        statusFilter === "All" || bill.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bills, patients, search, statusFilter]);

  const totals = bills.reduce(
    (summary, bill) => {
      const billTotals = getTotals(bill);
      summary.collected += billTotals.amountPaid;
      summary.pending += billTotals.balance;
      if (bill.paymentStatus === "Paid") summary.paidBills += 1;
      return summary;
    },
    { collected: 0, pending: 0, paidBills: 0 }
  );

  const addActivity = (message) => {
    const newActivity = {
      id: `ACT${Date.now()}`,
      message,
      date: new Date().toISOString(),
    };
    updateSection("activities", [newActivity, ...activities]);
  };

  const openAddForm = () => {
    setEditingBill(null);
    setForm(emptyForm());
    setError("");
    setShowForm(true);
  };

  const openEditForm = (bill) => {
    setEditingBill(bill);
    setForm({
      patientId: bill.patientId || "",
      appointmentId: bill.appointmentId || "",
      billDate: bill.billDate || today(),
      dueDate: bill.dueDate || "",
      items:
        bill.items?.length > 0
          ? bill.items.map((item) => ({ ...item }))
          : [{ description: "", category: "Consultation", amount: "" }],
      discount: String(bill.discount ?? 0),
      amountPaid: String(bill.amountPaid ?? 0),
      notes: bill.notes || "",
    });
    setError("");
    setShowForm(true);
  };

  const updateForm = (field, value) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const updateItem = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setForm((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        { description: "", category: "Other", amount: "" },
      ],
    }));
  };

  const removeItem = (index) => {
    setForm((previous) => ({
      ...previous,
      items: previous.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const formSubtotal = form.items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );
  const formTotal = Math.max(0, formSubtotal - (Number(form.discount) || 0));
  const formBalance = Math.max(0, formTotal - (Number(form.amountPaid) || 0));

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!form.patientId) {
      setError("Please select a patient.");
      return;
    }

    if (
      form.items.length === 0 ||
      form.items.some(
        (item) =>
          !item.description.trim() ||
          !item.amount ||
          Number(item.amount) <= 0
      )
    ) {
      setError("Add at least one valid charge with a description and amount.");
      return;
    }

    const subtotal = formSubtotal;
    const discount = Number(form.discount) || 0;
    const total = Math.max(0, subtotal - discount);
    const amountPaid = Number(form.amountPaid) || 0;

    if (discount < 0 || discount > subtotal) {
      setError("Discount must be between zero and the subtotal.");
      return;
    }

    if (amountPaid < 0 || amountPaid > total) {
      setError("Amount paid cannot be negative or greater than the bill total.");
      return;
    }

    const paymentStatus = getPaymentStatus(total, amountPaid);

    const billData = {
      id: editingBill?.id || `BILL${Date.now()}`,
      patientId: form.patientId,
      appointmentId: form.appointmentId,
      billDate: form.billDate,
      dueDate: form.dueDate,
      items: form.items.map((item) => ({
        description: item.description.trim(),
        category: item.category,
        amount: Number(item.amount),
      })),
      discount,
      subtotal,
      total,
      amountPaid,
      balanceDue: Math.max(0, total - amountPaid),
      paymentStatus,
      notes: form.notes.trim(),
      updatedAt: new Date().toISOString(),
    };

    const updatedBills = editingBill
      ? bills.map((bill) => (bill.id === editingBill.id ? billData : bill))
      : [billData, ...bills];

    const saved = updateSection("billingRecords", updatedBills);

    if (saved) {
      addActivity(
        editingBill
          ? `Bill ${billData.id} was updated`
          : `New bill ${billData.id} was created`
      );
      setShowForm(false);
      setEditingBill(null);
      setForm(emptyForm());
    } else {
      setError("Unable to save the bill. Please try again.");
    }
  };

  const deleteBill = (bill) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete bill ${bill.id}?`
    );
    if (!confirmed) return;

    const updatedBills = bills.filter((item) => item.id !== bill.id);
    if (updateSection("billingRecords", updatedBills)) {
      addActivity(`Bill ${bill.id} was deleted`);
      if (viewingBill?.id === bill.id) setViewingBill(null);
    }
  };

  return (
    <AdminLayout>
      <div className="billing-management">
        <div className="billing-page-header">
          <div>
            <span className="billing-eyebrow">FINANCE MANAGEMENT</span>
            <h1>Billing Management</h1>
            <p>Create bills, track payments, and monitor outstanding balances.</p>
          </div>

          <button className="billing-primary-btn" onClick={openAddForm}>
            <Plus size={18} />
            Create New Bill
          </button>
        </div>

        <div className="billing-summary-grid">
          <div className="billing-summary-card">
            <div className="billing-summary-icon blue">
              <Receipt size={21} />
            </div>
            <div>
              <span>Total Bills</span>
              <h2>{bills.length}</h2>
            </div>
          </div>

          <div className="billing-summary-card">
            <div className="billing-summary-icon green">
              <IndianRupee size={21} />
            </div>
            <div>
              <span>Amount Collected</span>
              <h2>{money(totals.collected)}</h2>
            </div>
          </div>

          <div className="billing-summary-card">
            <div className="billing-summary-icon orange">
              <Wallet size={21} />
            </div>
            <div>
              <span>Pending Balance</span>
              <h2>{money(totals.pending)}</h2>
            </div>
          </div>

          <div className="billing-summary-card">
            <div className="billing-summary-icon purple">
              <CheckCircle2 size={21} />
            </div>
            <div>
              <span>Paid Bills</span>
              <h2>{totals.paidBills}</h2>
            </div>
          </div>
        </div>

        <div className="billing-toolbar">
          <div className="billing-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search bill ID or patient name..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="All">All payment statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
          </select>
        </div>

        <div className="billing-table-card">
          <div className="billing-table-heading">
            <div>
              <h3>All Bills</h3>
              <p>Manage and review patient billing records</p>
            </div>
            <span>{filteredBills.length} records</span>
          </div>

          <div className="billing-table-scroll">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Patient</th>
                  <th>Bill Date</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => {
                  const billTotals = getTotals(bill);
                  return (
                    <tr key={bill.id}>
                      <td className="billing-id">{bill.id}</td>
                      <td>{getPatientName(bill.patientId)}</td>
                      <td>{bill.billDate || "—"}</td>
                      <td>{money(billTotals.total)}</td>
                      <td>{money(billTotals.amountPaid)}</td>
                      <td>{money(billTotals.balance)}</td>
                      <td>
                        <span
                          className={`billing-status ${bill.paymentStatus
                            ?.toLowerCase()
                            .replaceAll(" ", "-")}`}
                        >
                          {bill.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <div className="billing-actions">
                          <button
                            title="View bill"
                            onClick={() => setViewingBill(bill)}
                          >
                            <Eye size={17} />
                          </button>
                          <button
                            title="Edit bill"
                            onClick={() => openEditForm(bill)}
                          >
                            <Pencil size={17} />
                          </button>
                          <button
                            title="Delete bill"
                            className="delete"
                            onClick={() => deleteBill(bill)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredBills.length === 0 && (
                  <tr>
                    <td colSpan="8" className="billing-empty">
                      <Receipt size={30} />
                      <strong>No bills found</strong>
                      <span>Create a bill or change your search filters.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showForm && (
          <div className="billing-modal-backdrop">
            <div className="billing-modal billing-form-modal">
              <div className="billing-modal-header">
                <div>
                  <h2>{editingBill ? "Edit Bill" : "Create New Bill"}</h2>
                  <p>Enter patient and billing details below.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  aria-label="Close"
                >
                  <X size={21} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="billing-form-grid">
                  <label>
                    Patient *
                    <select
                      value={form.patientId}
                      onChange={(event) =>
                        updateForm("patientId", event.target.value)
                      }
                      required
                    >
                      <option value="">Select patient</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name} ({patient.id})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Related Appointment
                    <select
                      value={form.appointmentId}
                      onChange={(event) =>
                        updateForm("appointmentId", event.target.value)
                      }
                    >
                      <option value="">No appointment linked</option>
                      {appointments
                        .filter(
                          (appointment) =>
                            !form.patientId ||
                            appointment.patientId === form.patientId
                        )
                        .map((appointment) => (
                          <option key={appointment.id} value={appointment.id}>
                            {appointment.id} - {appointment.date || "No date"}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label>
                    Bill Date *
                    <input
                      type="date"
                      value={form.billDate}
                      onChange={(event) =>
                        updateForm("billDate", event.target.value)
                      }
                      required
                    />
                  </label>

                  <label>
                    Due Date
                    <input
                      type="date"
                      value={form.dueDate}
                      onChange={(event) =>
                        updateForm("dueDate", event.target.value)
                      }
                      min={form.billDate}
                    />
                  </label>
                </div>

                <div className="billing-charge-heading">
                  <div>
                    <h3>Bill Charges</h3>
                    <p>Add each service or item separately.</p>
                  </div>
                  <button type="button" onClick={addItem}>
                    <PlusCircle size={16} />
                    Add Charge
                  </button>
                </div>

                <div className="billing-charge-list">
                  {form.items.map((item, index) => (
                    <div className="billing-charge-row" key={index}>
                      <label>
                        Description
                        <input
                          value={item.description}
                          onChange={(event) =>
                            updateItem(index, "description", event.target.value)
                          }
                          placeholder="e.g. Doctor consultation"
                          required
                        />
                      </label>

                      <label>
                        Category
                        <select
                          value={item.category}
                          onChange={(event) =>
                            updateItem(index, "category", event.target.value)
                          }
                        >
                          <option>Consultation</option>
                          <option>Medicine</option>
                          <option>Room</option>
                          <option>Lab/Test</option>
                          <option>Other</option>
                        </select>
                      </label>

                      <label>
                        Amount (₹)
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.amount}
                          onChange={(event) =>
                            updateItem(index, "amount", event.target.value)
                          }
                          placeholder="0.00"
                          required
                        />
                      </label>

                      <button
                        type="button"
                        className="billing-remove-charge"
                        onClick={() => removeItem(index)}
                        disabled={form.items.length === 1}
                        title="Remove charge"
                      >
                        <MinusCircle size={19} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="billing-form-grid billing-payment-fields">
                  <label>
                    Discount (₹)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.discount}
                      onChange={(event) =>
                        updateForm("discount", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Amount Paid (₹)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.amountPaid}
                      onChange={(event) =>
                        updateForm("amountPaid", event.target.value)
                      }
                    />
                  </label>
                </div>

                <div className="billing-calculation">
                  <div>
                    <span>Subtotal</span>
                    <strong>{money(formSubtotal)}</strong>
                  </div>
                  <div>
                    <span>Discount</span>
                    <strong>- {money(form.discount)}</strong>
                  </div>
                  <div>
                    <span>Total Amount</span>
                    <strong>{money(formTotal)}</strong>
                  </div>
                  <div>
                    <span>Balance Due</span>
                    <strong>{money(formBalance)}</strong>
                  </div>
                  <div className="billing-calculation-status">
                    <span>Payment Status</span>
                    <strong>
                      {getPaymentStatus(
                        formTotal,
                        Number(form.amountPaid) || 0
                      )}
                    </strong>
                  </div>
                </div>

                <label className="billing-notes-field">
                  Notes
                  <textarea
                    rows="3"
                    value={form.notes}
                    onChange={(event) =>
                      updateForm("notes", event.target.value)
                    }
                    placeholder="Additional billing notes..."
                  />
                </label>

                {error && <p className="billing-form-error">{error}</p>}

                <div className="billing-modal-footer">
                  <button
                    type="button"
                    className="billing-secondary-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="billing-primary-btn">
                    {editingBill ? "Save Changes" : "Create Bill"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {viewingBill && (
          <div className="billing-modal-backdrop">
            <div className="billing-modal billing-view-modal">
              <div className="billing-modal-header">
                <div>
                  <span className="billing-eyebrow">BILL DETAILS</span>
                  <h2>{viewingBill.id}</h2>
                  <p>{getPatientName(viewingBill.patientId)}</p>
                </div>
                <button
                  onClick={() => setViewingBill(null)}
                  aria-label="Close"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="billing-view-meta">
                <div>
                  <span>Bill Date</span>
                  <strong>{viewingBill.billDate || "—"}</strong>
                </div>
                <div>
                  <span>Due Date</span>
                  <strong>{viewingBill.dueDate || "—"}</strong>
                </div>
                <div>
                  <span>Appointment</span>
                  <strong>
                    {getAppointmentLabel(viewingBill.appointmentId)}
                  </strong>
                </div>
                <div>
                  <span>Payment Status</span>
                  <strong>{viewingBill.paymentStatus}</strong>
                </div>
              </div>

              <div className="billing-view-items">
                <h3>Charges</h3>
                {(viewingBill.items || []).map((item, index) => (
                  <div className="billing-view-item" key={index}>
                    <div>
                      <strong>{item.description}</strong>
                      <span>{item.category}</span>
                    </div>
                    <strong>{money(item.amount)}</strong>
                  </div>
                ))}
              </div>

              <div className="billing-view-total">
                <div>
                  <span>Subtotal</span>
                  <strong>{money(getTotals(viewingBill).subtotal)}</strong>
                </div>
                <div>
                  <span>Discount</span>
                  <strong>{money(getTotals(viewingBill).discount)}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{money(getTotals(viewingBill).total)}</strong>
                </div>
                <div>
                  <span>Amount Paid</span>
                  <strong>{money(getTotals(viewingBill).amountPaid)}</strong>
                </div>
                <div className="billing-balance-line">
                  <span>Balance Due</span>
                  <strong>{money(getTotals(viewingBill).balance)}</strong>
                </div>
              </div>

              {viewingBill.notes && (
                <p className="billing-view-notes">
                  <strong>Notes:</strong> {viewingBill.notes}
                </p>
              )}

              <div className="billing-modal-footer">
                <button
                  className="billing-secondary-btn"
                  onClick={() => setViewingBill(null)}
                >
                  Close
                </button>
                <button
                  className="billing-primary-btn"
                  onClick={() => {
                    setViewingBill(null);
                    openEditForm(viewingBill);
                  }}
                >
                  <Pencil size={16} />
                  Edit Bill
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default BillingManagement;
