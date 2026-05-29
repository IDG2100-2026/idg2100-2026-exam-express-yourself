import { Outlet } from "react-router";
import Header from "../../components/header/Header.jsx";
import Footer from "../../components/footer/Footer.jsx";

function MainLayout() {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default MainLayout;
