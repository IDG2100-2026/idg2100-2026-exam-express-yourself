import { Outlet } from "react-router";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import styles from "./MainLayout.module.css";
export default function MainLayout() {
  return (
    <>
      <Header /> {/*Header Component */}
      <main className={styles.main}>
        {" "}
        {/* style to get height right! */}
        <Outlet />{" "}
        {/* Placeholder where matched child route components will be rendered. e.g, every child in the element MainLayout Route in App.jsx*/}
      </main>
      <Footer />
    </>
  );
}
