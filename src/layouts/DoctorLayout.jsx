
import DashboardLayout from "./DashboardLayout";

function DoctorLayout({ children }) {
  return (
    <DashboardLayout role="doctor">
      {children}
    </DashboardLayout>
  );
}

export default DoctorLayout;
