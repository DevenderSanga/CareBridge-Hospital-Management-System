
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  Trash2,
  Save,
  CalendarCheck,
  Users,
  X,
} from "lucide-react";

import DoctorLayout from "../../layouts/DoctorLayout";
import { useHospitalData } from "../../hooks/useHospitalData";
import "./MySchedule.css";

const today = new Date().toISOString().split("T")[0];

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const createSlot = () => ({
  id: `SLOT${Date.now()}${Math.random().toString(16).slice(2, 7)}`,
  start: "09:00",
  end: "17:00",
});

const createDefaultSchedule = (doctorId) => ({
  doctorId,
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  slotsByDay: {
    Monday: [{ ...createSlot(), start: "09:00", end: "17:00" }],
    Tuesday: [{ ...createSlot(), start: "09:00", end: "17:00" }],
    Wednesday: [{ ...createSlot(), start: "09:00", end: "17:00" }],
    Thursday: [{ ...createSlot(), start: "09:00", end: "17:00" }],
    Friday: [{ ...createSlot(), start: "09:00", end: "17:00" }],
    Saturday: [],
    Sunday: [],
  },
});

function MySchedule() {
  const {
    data,
    appointments,
    patients,
    updateSection,
  } = useHospitalData();

  const doctorSchedules = data.doctorSchedules || [];
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

  const savedSchedule = doctorSchedules.find(
    (schedule) => schedule.doctorId === doctorId
  );

  const [schedule, setSchedule] = useState(() =>
    savedSchedule
      ? {
          ...createDefaultSchedule(doctorId),
          ...savedSchedule,
          slotsByDay: {
            ...createDefaultSchedule(doctorId).slotsByDay,
            ...(savedSchedule.slotsByDay || {}),
          },
        }
      : createDefaultSchedule(doctorId)
  );

  const [selectedDay, setSelectedDay] = useState("Monday");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (!doctorId) return;

    const existingSchedule = (data.doctorSchedules || []).find(
      (item) => item.doctorId === doctorId
    );

    const defaultSchedule = createDefaultSchedule(doctorId);

    setSchedule(
      existingSchedule
        ? {
            ...defaultSchedule,
            ...existingSchedule,
            slotsByDay: {
              ...defaultSchedule.slotsByDay,
              ...(existingSchedule.slotsByDay || {}),
            },
          }
        : defaultSchedule
    );

    setSelectedDay(
      existingSchedule?.workingDays?.[0] || "Monday"
    );
  }, [doctorId, data.doctorSchedules]);

  const doctorAppointments = useMemo(() => {
    return appointments
      .filter(
        (appointment) =>
          appointment.doctorId === doctorId &&
          appointment.date >= today &&
          appointment.status !== "Cancelled" &&
          appointment.status !== "Completed"
      )
      .sort((a, b) => {
        const first = `${a.date} ${a.time || ""}`;
        const second = `${b.date} ${b.time || ""}`;
        return first.localeCompare(second);
      });
  }, [appointments, doctorId]);

  const getPatientName = (patientId) =>
    patients.find((patient) => patient.id === patientId)?.name ||
    "Patient not found";

  const getDayFromDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(`${dateString}T00:00:00`);
    return weekdays[(date.getDay() + 6) % 7];
  };

  const dayAppointments = doctorAppointments.filter(
    (appointment) => getDayFromDate(appointment.date) === selectedDay
  );

  const updateWorkingDay = (day) => {
    setSchedule((previous) => {
      const isWorking = previous.workingDays.includes(day);

      return {
        ...previous,
        workingDays: isWorking
          ? previous.workingDays.filter((item) => item !== day)
          : [...previous.workingDays, day],
      };
    });
  };

  const addTimeSlot = (day) => {
    setSchedule((previous) => ({
      ...previous,
      slotsByDay: {
        ...previous.slotsByDay,
        [day]: [
          ...(previous.slotsByDay?.[day] || []),
          createSlot(),
        ],
      },
    }));
  };

  const updateTimeSlot = (day, slotId, field, value) => {
    setSchedule((previous) => ({
      ...previous,
      slotsByDay: {
        ...previous.slotsByDay,
        [day]: (previous.slotsByDay?.[day] || []).map((slot) =>
          slot.id === slotId
            ? { ...slot, [field]: value }
            : slot
        ),
      },
    }));
  };

  const removeTimeSlot = (day, slotId) => {
    setSchedule((previous) => ({
      ...previous,
      slotsByDay: {
        ...previous.slotsByDay,
        [day]: (previous.slotsByDay?.[day] || []).filter(
          (slot) => slot.id !== slotId
        ),
      },
    }));
  };

  const handleSave = () => {
    if (!doctorId) {
      alert("Your doctor account is not linked to a doctor record.");
      return;
    }

    if (schedule.workingDays.length === 0) {
      alert("Please select at least one working day.");
      return;
    }

    for (const day of schedule.workingDays) {
      const slots = schedule.slotsByDay?.[day] || [];

      if (slots.length === 0) {
        alert(`Please add at least one time slot for ${day}.`);
        return;
      }

      for (const slot of slots) {
        if (!slot.start || !slot.end || slot.start >= slot.end) {
          alert(`Please enter a valid time range for ${day}.`);
          return;
        }
      }
    }

    const updatedSchedule = {
      ...schedule,
      doctorId,
      updatedAt: new Date().toISOString(),
    };

    const updatedSchedules = [
      ...doctorSchedules.filter(
        (item) => item.doctorId !== doctorId
      ),
      updatedSchedule,
    ];

    const saved = updateSection("doctorSchedules", updatedSchedules);

    if (saved) {
      const newActivity = {
        id: `ACT${Date.now()}`,
        message: `Doctor schedule updated for ${currentDoctor?.name || currentUser.name || "Doctor"}`,
        date: new Date().toISOString(),
      };

      updateSection("activities", [newActivity, ...activities]);

      setSaveMessage("Your schedule has been saved successfully.");

      window.setTimeout(() => {
        setSaveMessage("");
      }, 3000);
    } else {
      alert("Unable to save your schedule. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    return new Date(`${dateString}T00:00:00`).toLocaleDateString(
      undefined,
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  if (!doctorId) {
    return (
      <DoctorLayout>
        <div className="doctor-schedule-page">
          <div className="schedule-error">
            <CalendarDays size={38} />
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
      <div className="doctor-schedule-page">
        <div className="schedule-page-header">
          <div>
            <h1>My Schedule</h1>
            <p>Manage your weekly availability and view upcoming appointments.</p>
          </div>

          <button className="schedule-save-btn" onClick={handleSave}>
            <Save size={18} />
            Save Schedule
          </button>
        </div>

        {saveMessage && (
          <div className="schedule-success-message">
            <CalendarCheck size={18} />
            {saveMessage}
            <button
              type="button"
              onClick={() => setSaveMessage("")}
              aria-label="Close message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="schedule-summary-grid">
          <div className="schedule-summary-card">
            <div className="schedule-summary-icon purple">
              <CalendarDays size={22} />
            </div>
            <div>
              <h3>{schedule.workingDays.length}</h3>
              <p>Working Days</p>
            </div>
          </div>

          <div className="schedule-summary-card">
            <div className="schedule-summary-icon blue">
              <Clock size={22} />
            </div>
            <div>
              <h3>
                {schedule.workingDays.reduce(
                  (total, day) =>
                    total + (schedule.slotsByDay?.[day]?.length || 0),
                  0
                )}
              </h3>
              <p>Available Time Slots</p>
            </div>
          </div>

          <div className="schedule-summary-card">
            <div className="schedule-summary-icon green">
              <CalendarCheck size={22} />
            </div>
            <div>
              <h3>{doctorAppointments.length}</h3>
              <p>Upcoming Appointments</p>
            </div>
          </div>

          <div className="schedule-summary-card">
            <div className="schedule-summary-icon orange">
              <Users size={22} />
            </div>
            <div>
              <h3>
                {
                  new Set(
                    doctorAppointments.map(
                      (appointment) => appointment.patientId
                    )
                  ).size
                }
              </h3>
              <p>Upcoming Patients</p>
            </div>
          </div>
        </div>

        <div className="schedule-content-grid">
          <section className="schedule-main-card">
            <div className="schedule-section-heading">
              <div>
                <h2>Weekly Availability</h2>
                <p>Select your working days and set available hours.</p>
              </div>
            </div>

            <div className="schedule-weekdays">
              {weekdays.map((day) => {
                const isWorking = schedule.workingDays.includes(day);

                return (
                  <button
                    type="button"
                    key={day}
                    className={`schedule-day-button ${
                      isWorking ? "active" : ""
                    }`}
                    onClick={() => {
                      updateWorkingDay(day);
                      setSelectedDay(day);
                    }}
                  >
                    <span>{day.slice(0, 3)}</span>
                    <small>{isWorking ? "Working" : "Off"}</small>
                  </button>
                );
              })}
            </div>

            <div className="schedule-day-editor">
              <div className="schedule-day-editor-header">
                <div>
                  <h3>{selectedDay}</h3>
                  <p>
                    {schedule.workingDays.includes(selectedDay)
                      ? "Set your available time slots"
                      : "This day is currently marked as off"}
                  </p>
                </div>

                {schedule.workingDays.includes(selectedDay) && (
                  <button
                    type="button"
                    className="schedule-add-slot-btn"
                    onClick={() => addTimeSlot(selectedDay)}
                  >
                    <Plus size={16} />
                    Add Time Slot
                  </button>
                )}
              </div>

              {!schedule.workingDays.includes(selectedDay) ? (
                <div className="schedule-day-off">
                  <CalendarDays size={32} />
                  <strong>Day Off</strong>
                  <p>
                    Select this day in the weekly availability above to
                    enable working hours.
                  </p>
                </div>
              ) : (
                <div className="schedule-slot-list">
                  {(schedule.slotsByDay?.[selectedDay] || []).length > 0 ? (
                    schedule.slotsByDay[selectedDay].map((slot, index) => (
                      <div className="schedule-slot-row" key={slot.id}>
                        <div className="schedule-slot-number">
                          {index + 1}
                        </div>

                        <label>
                          Start Time
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(event) =>
                              updateTimeSlot(
                                selectedDay,
                                slot.id,
                                "start",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <label>
                          End Time
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(event) =>
                              updateTimeSlot(
                                selectedDay,
                                slot.id,
                                "end",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <button
                          type="button"
                          className="schedule-remove-slot-btn"
                          title="Remove time slot"
                          onClick={() =>
                            removeTimeSlot(selectedDay, slot.id)
                          }
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="schedule-no-slots">
                      <Clock size={28} />
                      <p>No time slots added for this day.</p>
                      <button
                        type="button"
                        onClick={() => addTimeSlot(selectedDay)}
                      >
                        Add your first time slot
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="schedule-side-card">
            <div className="schedule-section-heading">
              <div>
                <h2>Weekly Overview</h2>
                <p>Your saved availability by day.</p>
              </div>
            </div>

            <div className="schedule-overview-list">
              {weekdays.map((day) => {
                const isWorking = schedule.workingDays.includes(day);
                const slots = schedule.slotsByDay?.[day] || [];

                return (
                  <button
                    type="button"
                    className={`schedule-overview-item ${
                      selectedDay === day ? "selected" : ""
                    }`}
                    key={day}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span className="schedule-overview-day">{day}</span>

                    <span className="schedule-overview-time">
                      {isWorking
                        ? `${slots.length} time slot${slots.length === 1 ? "" : "s"}`
                        : "Day off"}
                    </span>

                    <span
                      className={`schedule-status-dot ${
                        isWorking ? "working" : "off"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section className="schedule-appointments-card">
          <div className="schedule-section-heading">
            <div>
              <h2>Upcoming Appointments</h2>
              <p>Scheduled appointments linked to your doctor account.</p>
            </div>
            <span className="schedule-appointment-count">
              {doctorAppointments.length} upcoming
            </span>
          </div>

          {doctorAppointments.length > 0 ? (
            <div className="schedule-appointments-list">
              {doctorAppointments.slice(0, 8).map((appointment) => (
                <div
                  className="schedule-appointment-item"
                  key={appointment.id}
                >
                  <div className="schedule-appointment-icon">
                    <CalendarDays size={19} />
                  </div>

                  <div className="schedule-appointment-info">
                    <strong>{getPatientName(appointment.patientId)}</strong>
                    <span>
                      {appointment.reason || "General consultation"}
                    </span>
                    <small>{appointment.id}</small>
                  </div>

                  <div className="schedule-appointment-date">
                    <strong>{formatDate(appointment.date)}</strong>
                    <span>{appointment.time || "Time not set"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="schedule-no-appointments">
              <CalendarDays size={32} />
              <h3>No upcoming appointments</h3>
              <p>Your future scheduled appointments will appear here.</p>
            </div>
          )}
        </section>
      </div>
    </DoctorLayout>
  );
}

export default MySchedule;
