
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "../../context/PreferencesContext";
import { useHospitalData } from "../../hooks/useHospitalData";

import {
    Menu,
    Bell,
    ChevronDown,
    LogOut,
    UserRound,
    Settings,
    HeartPulse,
    Sun,
    Moon,
    Monitor,
    Languages,
} from "lucide-react";

import "./Navbar.css";

const pageTitles = {
    admin: "Admin Dashboard",
    doctor: "Doctor Dashboard",
    patient: "Patient Dashboard",
};

const roleLabels = {
    admin: "Administrator",
    doctor: "Doctor",
    patient: "Patient",
};

function Navbar({ role, user, onMenuClick, onLogout }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const {
        theme,
        setTheme,
        direction,
        toggleDirection,
    } = usePreferences();

    const { data } = useHospitalData();

    const hospitalName =
        data.settings?.hospital?.name?.trim() || "CareBridge";

    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const adminName = data.settings?.admin?.name?.trim();

    const displayName =
        role === "admin"
            ? adminName || user?.name || "Demo User"
            : user?.name || "Demo User";

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setProfileOpen(false);
                setNotificationsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const closeDropdowns = () => {
        setProfileOpen(false);
        setNotificationsOpen(false);
    };

    return (
        <header className="dashboard-navbar">

            <div className="navbar-left">

                <button
                    className="navbar-menu-button"
                    onClick={onMenuClick}
                    aria-label="Toggle navigation"
                >
                    <Menu size={23} />
                </button>

                <div className="navbar-heading">
                    <span className="navbar-hospital-name">{hospitalName}</span>
                    <p>Welcome back, {displayName}</p>
                </div>

            </div>

            <div className="navbar-right" ref={dropdownRef}>

                {/* THEME SELECTOR */}

                <div className="navbar-theme-control">

                    <button
                        className="navbar-icon-button"
                        onClick={() => {
                            const nextTheme =
                                theme === "light"
                                    ? "dark"
                                    : theme === "dark"
                                        ? "system"
                                        : "light";

                            setTheme(nextTheme);
                        }}
                        title={`Current theme: ${theme}. Click to change`}
                        aria-label={`Change theme. Current theme: ${theme}`}
                    >
                        {theme === "light" && <Sun size={19} />}
                        {theme === "dark" && <Moon size={19} />}
                        {theme === "system" && <Monitor size={19} />}
                    </button>

                </div>

                {/* TEXT DIRECTION */}

                <button
                    className="navbar-icon-button direction-button"
                    onClick={toggleDirection}
                    title={`Switch to ${direction === "ltr" ? "RTL" : "LTR"}`}
                    aria-label="Toggle text direction"
                >
                    <Languages size={19} />
                    <span className="direction-label">
                        {direction.toUpperCase()}
                    </span>
                </button>

                {/* NOTIFICATIONS */}

                <div className="navbar-dropdown-wrapper">

                    <button
                        className={`navbar-icon-button ${notificationsOpen ? "selected" : ""
                            }`}
                        onClick={() => {
                            setNotificationsOpen(!notificationsOpen);
                            setProfileOpen(false);
                        }}
                        aria-label="Notifications"
                        aria-expanded={notificationsOpen}
                    >
                        <Bell size={20} />
                        <span className="notification-dot" />
                    </button>

                    {notificationsOpen && (
                        <div className="navbar-dropdown notification-dropdown">

                            <h3>Notifications</h3>

                            <div className="notification-item">
                                <span className="notification-icon">
                                    <HeartPulse size={18} />
                                </span>

                                <div>
                                    <strong>Welcome to {hospitalName}</strong>
                                    <p>Your dashboard is ready.</p>
                                    <small>Just now</small>
                                </div>
                            </div>

                            <div className="notification-empty">
                                Demo notification center
                            </div>

                        </div>
                    )}

                </div>

                {/* PROFILE */}

                <div className="navbar-dropdown-wrapper">

                    <button
                        className="navbar-profile"
                        onClick={() => {
                            setProfileOpen(!profileOpen);
                            setNotificationsOpen(false);
                        }}
                        aria-expanded={profileOpen}
                    >

                        <div className="navbar-avatar">
                            {displayName.charAt(0).toUpperCase()}
                        </div>

                        <div className="navbar-user-info">
                            <strong>{displayName}</strong>
                            <span>{roleLabels[role] || "User"}</span>
                        </div>

                        <ChevronDown size={16} />

                    </button>

                    {profileOpen && (
                        <div className="navbar-dropdown profile-dropdown">

                            <div className="profile-dropdown-header">
                                <strong>{displayName}</strong>
                                <span>{user?.email || "demo@carebridge.com"}</span>
                            </div>

                            <button
                                className="dropdown-action"
                                onClick={() => {
                                    closeDropdowns();
                                    navigate(
                                        role === "admin"
                                            ? "/admin/settings"
                                            : `/${role}/profile`
                                    );
                                }}
                            >
                                <UserRound size={17} />
                                My Profile
                            </button>

                            <button
                                className="dropdown-action"
                                onClick={() => {
                                    closeDropdowns();
                                    navigate(`/${role}/settings`);
                                }}
                            >
                                <Settings size={17} />
                                Settings
                            </button>

                            <div className="dropdown-divider" />

                            <button
                                className="dropdown-action logout-action"
                                onClick={onLogout}
                            >
                                <LogOut size={17} />
                                Logout
                            </button>

                        </div>
                    )}

                </div>

            </div>

        </header>
    );
}

export default Navbar;
