
import { NavLink } from "react-router-dom";
import { useHospitalData } from "../../hooks/useHospitalData";

import {
    HeartPulse,
    LayoutDashboard,
    Users,
    Stethoscope,
    CalendarDays,
    Building2,
    FileText,
    CreditCard,
    BarChart3,
    Pill,
    ClipboardList,
    UserRound,
    Clock,
    Settings,
    X,
} from "lucide-react";

import "./Sidebar.css";

const menuItems = {
    admin: [
        {
            title: "MAIN MENU",
            items: [
                { label: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
                { label: "Patients", path: "/admin/patients", icon: Users },
                { label: "Doctors", path: "/admin/doctors", icon: Stethoscope },
                { label: "Appointments", path: "/admin/appointments", icon: CalendarDays },
            ],
        },
        {
            title: "HOSPITAL",
            items: [
                { label: "Departments", path: "/admin/departments", icon: Building2 },
                { label: "Medical Records", path: "/admin/medical-records", icon: FileText },
                { label: "Billing", path: "/admin/billing", icon: CreditCard },
                { label: "Reports", path: "/admin/reports", icon: BarChart3 },
            ],
        },
        {
            title: "PREFERENCES",
            items: [
                { label: "Settings", path: "/admin/settings", icon: Settings },
            ],
        },
    ],

    doctor: [
        {
            title: "WORKSPACE",
            items: [
                { label: "Overview", path: "/doctor/dashboard", icon: LayoutDashboard },
                { label: "My Appointments", path: "/doctor/appointments", icon: CalendarDays },
                { label: "My Patients", path: "/doctor/patients", icon: Users },
                { label: "Medical Records", path: "/doctor/medical-records", icon: FileText },
                { label: "Prescriptions", path: "/doctor/prescriptions", icon: Pill },
                { label: "My Schedule", path: "/doctor/schedule", icon: Clock },
            ],
        },
        {
            title: "ACCOUNT",
            items: [
                { label: "My Profile", path: "/doctor/profile", icon: UserRound },
                { label: "Settings", path: "/doctor/settings", icon: Settings },
            ],
        },
    ],

    patient: [
        {
            title: "MY HEALTH",
            items: [
                { label: "Overview", path: "/patient/dashboard", icon: LayoutDashboard },
                { label: "Book Appointment", path: "/patient/book-appointment", icon: CalendarDays },
                { label: "My Appointments", path: "/patient/appointments", icon: ClipboardList },
                { label: "My Doctors", path: "/patient/doctors", icon: Stethoscope },
                { label: "Medical Records", path: "/patient/medical-records", icon: FileText },
                { label: "Prescriptions", path: "/patient/prescriptions", icon: Pill },
                { label: "Billing", path: "/patient/billing", icon: CreditCard },
            ],
        },
        {
            title: "ACCOUNT",
            items: [
                { label: "My Profile", path: "/patient/profile", icon: UserRound },
                { label: "Settings", path: "/patient/settings", icon: Settings },
            ],
        },
    ],
};

const roleTitles = {
    admin: "Administrator",
    doctor: "Doctor ",
    patient: "Patient ",
};

function Sidebar({ role, isOpen, onClose }) {
    const sections = menuItems[role] || [];
    const { data } = useHospitalData();

    const hospitalName =
        data.settings?.hospital?.name?.trim() || "CareBridge";

    const adminName = data.settings?.admin?.name?.trim();

    return (
        <aside className={`dashboard-sidebar ${isOpen ? "sidebar-open" : ""}`}>

            <div className="sidebar-brand">
                <div className="sidebar-logo">
                    <HeartPulse size={25} />
                </div>

                <div className="sidebar-brand-text">
                    <h2>{hospitalName}</h2>
                    <span>Hospital Management</span>
                </div>

                <button
                    className="sidebar-close"
                    onClick={onClose}
                    aria-label="Close sidebar"
                >
                    <X size={21} />
                </button>
            </div>

            <div className="sidebar-role">
                <span className="role-indicator" />
                {roleTitles[role] } {"Dashboard"}
            </div>

            <nav className="sidebar-navigation">

                {sections.map((section) => (
                    <div className="sidebar-section" key={section.title}>
                        <h4 className="sidebar-section-title">
                            {section.title}
                        </h4>

                        {section.items.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `sidebar-link ${isActive ? "active" : ""}`
                                    }
                                >
                                    <Icon size={19} />
                                    <span>{item.label}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-footer-icon">
                    <HeartPulse size={20} />
                </div>

                <div className="sidebar-footer-text">
                    <strong>{hospitalName}</strong>
                    <span>Connecting Care</span>
                </div>
            </div>

        </aside>
    );
}

export default Sidebar;
