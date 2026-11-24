
import { getAppData, saveAppData } from "../utils/localStorage";

const initialData = {
  patients: [
    {
      id: "PAT001",
      name: "Rahul Sharma",
      age: 32,
      gender: "Male",
      phone: "9876543210",
      email: "rahul@example.com",
      bloodGroup: "O+",
      address: "Warangal",
      status: "Active",
      createdAt: new Date().toISOString(),
    },
    {
      id: "PAT002",
      name: "Priya Reddy",
      age: 27,
      gender: "Female",
      phone: "9876543211",
      email: "priya@example.com",
      bloodGroup: "B+",
      address: "Hanamkonda",
      status: "Active",
      createdAt: new Date().toISOString(),
    },
    {
      id: "PAT003",
      name: "Arjun Patel",
      age: 45,
      gender: "Male",
      phone: "9876543212",
      email: "arjun@example.com",
      bloodGroup: "A+",
      address: "Warangal",
      status: "Active",
      createdAt: new Date().toISOString(),
    },
  ],

  doctors: [
    {
      id: "DOC001",
      name: "Dr. Ananya Rao",
      specialization: "Cardiology",
      phone: "9876500001",
      email: "ananya@carebridge.com",
      availability: "Available",
      status: "Active",
    },
    {
      id: "DOC002",
      name: "Dr. Kiran Kumar",
      specialization: "Neurology",
      phone: "9876500002",
      email: "kiran@carebridge.com",
      availability: "Busy",
      status: "Active",
    },
    {
      id: "DOC003",
      name: "Dr. Sneha Gupta",
      specialization: "Orthopedics",
      phone: "9876500003",
      email: "sneha@carebridge.com",
      availability: "Available",
      status: "Active",
    },
  ],

  appointments: [
    {
      id: "APT001",
      patientId: "PAT001",
      patientName: "Rahul Sharma",
      doctorId: "DOC001",
      doctorName: "Dr. Ananya Rao",
      date: new Date().toISOString().slice(0, 10),
      time: "09:30",
      department: "Cardiology",
      reason: "Regular checkup",
      status: "Confirmed",
    },
    {
      id: "APT002",
      patientId: "PAT002",
      patientName: "Priya Reddy",
      doctorId: "DOC002",
      doctorName: "Dr. Kiran Kumar",
      date: new Date().toISOString().slice(0, 10),
      time: "10:30",
      department: "Neurology",
      reason: "Consultation",
      status: "Pending",
    },
  ],

  payments: [
    {
      id: "PAY001",
      patientId: "PAT001",
      patientName: "Rahul Sharma",
      amount: 1500,
      method: "UPI",
      status: "Paid",
      date: new Date().toISOString(),
    },
    {
      id: "PAY002",
      patientId: "PAT002",
      patientName: "Priya Reddy",
      amount: 2000,
      method: "Card",
      status: "Paid",
      date: new Date().toISOString(),
    },
  ],

  activities: [
    {
      id: "ACT001",
      title: "Patient registered",
      description: "Rahul Sharma was registered.",
      date: new Date().toISOString(),
    },
    {
      id: "ACT002",
      title: "Appointment booked",
      description: "Priya Reddy booked a consultation.",
      date: new Date().toISOString(),
    },
  ],
};

// Initialize only when no saved CareBridge data exists
export const initializeAppData = () => {
  const existingData = getAppData();

  if (!existingData) {
    saveAppData(initialData);
    return initialData;
  }

  return existingData;
};
