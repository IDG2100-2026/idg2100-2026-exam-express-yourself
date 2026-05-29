import { Outlet } from "react-router-dom";
import HeaderAdmin from "../../components/header/HeaderAdmin.jsx";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <HeaderAdmin />
      <main className="admin-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
