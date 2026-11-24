
import { useMemo, useState } from "react";
import {
  Search,
  Receipt,
  IndianRupee,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  X,
  CalendarDays,
  FileText,
} from "lucide-react";

import PatientLayout from "../../layouts/PatientLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./PatientBilling.css";

const getToday = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .split("T")[0];
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function PatientBilling() {
  const { data, patients, appointments } = useHospitalData();

  const bills = data.billingRecords || [];
  const today = getToday();

  const storedUser =
    localStorage.getItem("carebridgeUser") ||
    sessionStorage.getItem("carebridgeUser");

  let currentUser = {};

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : {};
  } catch {
    currentUser = {};
  }

  const currentPatient = patients.find(
    (patient) =>
      patient.id === (currentUser.patientId || currentUser.id) ||
      patient.email?.toLowerCase() === currentUser.email?.toLowerCase()
  );

  const patientBills = currentPatient
    ? bills.filter((bill) => bill.patientId === currentPatient.id)
    : [];

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewingBill, setViewingBill] = useState(null);

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

  const getStatus = (bill) => {
    const { total, amountPaid, balance } = getTotals(bill);

    if (balance <= 0 || amountPaid >= total) return "Paid";

    if (bill.dueDate && bill.dueDate < today) return "Overdue";

    if (amountPaid > 0) return "Partially Paid";

    return "Pending";
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

  const totals = patientBills.reduce(
    (summary, bill) => {
      const billTotals = getTotals(bill);

      summary.total += billTotals.total;
      summary.paid += billTotals.amountPaid;
      summary.balance += billTotals.balance;

      if (getStatus(bill) === "Paid") summary.paidBills += 1;
      if (getStatus(bill) === "Overdue") summary.overdueBills += 1;

      return summary;
    },
    { total: 0, paid: 0, balance: 0, paidBills: 0, overdueBills: 0 }
  );

  const filteredBills = useMemo(() => {
    return patientBills.filter((bill) => {
      const searchText = [
        bill.id,
        bill.appointmentId,
        bill.paymentStatus,
        ...(bill.items || []).map((item) =>
          `${item.description} ${item.category}`
        ),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const status = getStatus(bill);

      const matchesStatus =
        statusFilter === "All" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [patientBills, search, statusFilter]);

  if (!currentPatient) {
    return (
      <PatientLayout>
        <div className="patient-billing-page">
          <div className="patient-billing-error">
            <AlertCircle size={38} />
            <h2>Patient account not linked</h2>
            <p>
              Please log in using your registered patient account to view
              your billing records.
            </p>
          </div>
        </div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout>
      <div className="patient-billing-page">
        <div className="patient-billing-header">
          <div>
            <span className="patient-billing-eyebrow">MY FINANCES</span>
            <h1>My Billing</h1>
            <p>
              View your hospital bills, payment history, and outstanding
              balances.
            </p>
          </div>
          <div className="patient-billing-header-icon">
            <Receipt size={25} />
          </div>
        </div>

        <div className="patient-billing-summary">
          <div className="patient-billing-stat">
            <div className="patient-billing-stat-icon blue">
              <Receipt size={21} />
            </div>
            <div>
              <span>Total Bills</span>
              <h2>{patientBills.length}</h2>
            </div>
          </div>

          <div className="patient-billing-stat">
            <div className="patient-billing-stat-icon green">
              <IndianRupee size={21} />
            </div>
            <div>
              <span>Total Paid</span>
              <h2>{money(totals.paid)}</h2>
            </div>
          </div>

          <div className="patient-billing-stat">
            <div className="patient-billing-stat-icon orange">
              <Wallet size={21} />
            </div>
            <div>
              <span>Balance Due</span>
              <h2>{money(totals.balance)}</h2>
            </div>
          </div>

          <div className="patient-billing-stat">
            <div className="patient-billing-stat-icon purple">
              <CheckCircle2 size={21} />
            </div>
            <div>
              <span>Paid Bills</span>
              <h2>{totals.paidBills}</h2>
            </div>
          </div>
        </div>

        {totals.overdueBills > 0 && (
          <div className="patient-billing-alert">
            <AlertCircle size={20} />
            <div>
              <strong>Overdue payment notice</strong>
              <p>
                You have {totals.overdueBills} bill
                {totals.overdueBills > 1 ? "s" : ""} past the due date.
                Please contact the hospital billing department for
                payment assistance.
              </p>
            </div>
          </div>
        )}

        <div className="patient-billing-toolbar">
          <div className="patient-billing-search">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search bill ID, appointment or charge..."
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
            <option value="Overdue">Overdue</option>
          </select>
        </div>

        <div className="patient-billing-table-card">
          <div className="patient-billing-table-heading">
            <div>
              <h2>My Bills & Invoices</h2>
              <p>Your personal hospital billing records</p>
            </div>
            <span>{filteredBills.length} records</span>
          </div>

          <div className="patient-billing-table-scroll">
            <table className="patient-billing-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Bill Date</th>
                  <th>Due Date</th>
                  <th>Total Amount</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill) => {
                    const billTotals = getTotals(bill);
                    const status = getStatus(bill);

                    return (
                      <tr key={bill.id}>
                        <td>
                          <span className="patient-billing-id">
                            {bill.id}
                          </span>
                        </td>
                        <td>{bill.billDate || "—"}</td>
                        <td>{bill.dueDate || "—"}</td>
                        <td>{money(billTotals.total)}</td>
                        <td className="patient-billing-paid">
                          {money(billTotals.amountPaid)}
                        </td>
                        <td className="patient-billing-balance">
                          {money(billTotals.balance)}
                        </td>
                        <td>
                          <span
                            className={`patient-billing-status ${status
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="patient-billing-view-btn"
                            title="View bill details"
                            onClick={() => setViewingBill(bill)}
                          >
                            <Eye size={17} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8">
                      <div className="patient-billing-empty">
                        <Receipt size={38} />
                        <h3>No bills found</h3>
                        <p>
                          {patientBills.length === 0
                            ? "Your billing records will appear here when the hospital creates a bill for you."
                            : "Try changing your search or payment status filter."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {viewingBill && (
          <div
            className="patient-billing-modal-backdrop"
            onClick={() => setViewingBill(null)}
          >
            <div
              className="patient-billing-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="patient-billing-modal-header">
                <div>
                  <span className="patient-billing-eyebrow">
                    BILL DETAILS
                  </span>
                  <h2>{viewingBill.id}</h2>
                  <p>{currentPatient.name}</p>
                </div>

                <button
                  onClick={() => setViewingBill(null)}
                  aria-label="Close bill details"
                >
                  <X size={21} />
                </button>
              </div>

              <div className="patient-billing-meta">
                <div>
                  <CalendarDays size={17} />
                  <span>Bill Date</span>
                  <strong>{viewingBill.billDate || "—"}</strong>
                </div>
                <div>
                  <Clock size={17} />
                  <span>Due Date</span>
                  <strong>{viewingBill.dueDate || "—"}</strong>
                </div>
                <div>
                  <FileText size={17} />
                  <span>Appointment</span>
                  <strong>
                    {getAppointmentLabel(viewingBill.appointmentId)}
                  </strong>
                </div>
                <div>
                  <CheckCircle2 size={17} />
                  <span>Payment Status</span>
                  <strong>{getStatus(viewingBill)}</strong>
                </div>
              </div>

              <div className="patient-billing-charges">
                <h3>Bill Charges</h3>

                {(viewingBill.items || []).map((item, index) => (
                  <div className="patient-billing-charge" key={index}>
                    <div>
                      <strong>{item.description}</strong>
                      <span>{item.category}</span>
                    </div>
                    <strong>{money(item.amount)}</strong>
                  </div>
                ))}

                {(!viewingBill.items || viewingBill.items.length === 0) && (
                  <p>No charge details available.</p>
                )}
              </div>

              <div className="patient-billing-total">
                <div>
                  <span>Subtotal</span>
                  <strong>
                    {money(getTotals(viewingBill).subtotal)}
                  </strong>
                </div>
                <div>
                  <span>Discount</span>
                  <strong>
                    - {money(getTotals(viewingBill).discount)}
                  </strong>
                </div>
                <div>
                  <span>Total Amount</span>
                  <strong>{money(getTotals(viewingBill).total)}</strong>
                </div>
                <div>
                  <span>Amount Paid</span>
                  <strong>
                    {money(getTotals(viewingBill).amountPaid)}
                  </strong>
                </div>
                <div className="patient-billing-total-balance">
                  <span>Balance Due</span>
                  <strong>{money(getTotals(viewingBill).balance)}</strong>
                </div>
              </div>

              {viewingBill.notes && (
                <div className="patient-billing-notes">
                  <strong>Additional Notes</strong>
                  <p>{viewingBill.notes}</p>
                </div>
              )}

              <div className="patient-billing-modal-footer">
                <button onClick={() => setViewingBill(null)}>
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

export default PatientBilling;
