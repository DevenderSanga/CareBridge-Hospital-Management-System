
import DashboardLayout from "./DashboardLayout";

function AdminLayout({ children }) {
  return (
    <DashboardLayout role="admin">
      {children}
    </DashboardLayout>
  );
}

export default AdminLayout;
