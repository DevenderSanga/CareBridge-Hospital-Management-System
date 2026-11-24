
import DashboardLayout from "./DashboardLayout";

function PatientLayout({ children }) {
  return (
    <DashboardLayout role="patient">
      {children}
    </DashboardLayout>
  );
}

export default PatientLayout;
