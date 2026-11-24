
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";

import AdminDashboard from "../pages/admin/AdminDashboard";
// import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import PatientDashboard from "../pages/patient/PatientDashboard";
import PatientManagement from "../pages/admin/PatientManagement";
import DoctorManagement from "../pages/admin/DoctorManagement";
import AppointmentManagement from "../pages/admin/AppointmentManagement";
import DepartmentManagement from "../pages/admin/DepartmentManagement";
import MedicalRecords from "../pages/admin/MedicalRecords";
import BillingManagement from "../pages/admin/BillingManagement";
import ReportsManagement from "../pages/admin/ReportsManagement";
import SettingsManagement from "../pages/admin/SettingsManagement";
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import MyAppointments from "../pages/doctor/MyAppointments";
import MyPatients from "../pages/doctor/MyPatients";
import DoctorMedicalRecords from "../pages/doctor/DoctorMedicalRecords";
import DoctorPrescriptions from "../pages/doctor/DoctorPrescriptions";
import MySchedule from "../pages/doctor/MySchedule";
import DoctorProfile from "../pages/doctor/DoctorProfile";
import DoctorSettings from "../pages/doctor/DoctorSettings";
import PatientProfile from "../pages/patient/PatientProfile";
import PatientAppointments from "../pages/patient/PatientAppointments";
import PatientBookAppointment from "../pages/patient/PatientBookAppointment";
import PatientDoctors from "../pages/patient/PatientDoctors";
import PatientMedicalRecords from "../pages/patient/PatientMedicalRecords";
import PatientPrescriptions from "../pages/patient/PatientPrescriptions";
import PatientBilling from "../pages/patient/PatientBilling";
import PatientSettings from "../pages/patient/PatientSettings";
function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<Login />} />

            <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
            />
            <Route
                path="/admin/patients"
                element={<PatientManagement />}
            />

            <Route
                path="/admin/doctors"
                element={<DoctorManagement />}
            />
            <Route
                path="/admin/appointments"
                element={<AppointmentManagement />}
            />
            <Route
                path="/admin/departments"
                element={<DepartmentManagement />}
            />
            <Route
                path="/admin/medical-records"
                element={<MedicalRecords />}
            />
            <Route
                path="/admin/billing"
                element={<BillingManagement />}
            />
            <Route
                path="/admin/reports"
                element={<ReportsManagement />}
            />
            <Route
                path="/admin/settings"
                element={<SettingsManagement />}
            />
            <Route
                path="/doctor/dashboard"
                element={<DoctorDashboard />}
            />
            <Route
                path="/doctor/appointments"
                element={<MyAppointments />}
            />
            <Route path="/doctor/patients" element={<MyPatients />} />
            <Route
                path="/doctor/medical-records"
                element={<DoctorMedicalRecords />}
            />
            <Route
                path="/doctor/prescriptions"
                element={<DoctorPrescriptions />}
            />
            <Route path="/doctor/schedule" element={<MySchedule />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
            <Route path="/doctor/settings" element={<DoctorSettings />} />
            <Route
                path="/patient/dashboard"
                element={<PatientDashboard />}
            />
            <Route
                path="/patient/profile"
                element={<PatientProfile />}
            />
            <Route
                path="/patient/appointments"
                element={<PatientAppointments />}
            />
            <Route
                path="/patient/book-appointment"
                element={<PatientBookAppointment />}
            />
            <Route
                path="/patient/doctors"
                element={<PatientDoctors />}
            />
            <Route
                path="/patient/medical-records"
                element={<PatientMedicalRecords />}
            />
            <Route
                path="/patient/prescriptions"
                element={<PatientPrescriptions />}
            />
            <Route
                path="/patient/billing"
                element={<PatientBilling />}
            />
            <Route
                path="/patient/settings"
                element={<PatientSettings />}
            />

            <Route
                path="*"
                element={<Navigate to="/login" replace />}
            />
        </Routes>
    );
}

export default AppRoutes;
