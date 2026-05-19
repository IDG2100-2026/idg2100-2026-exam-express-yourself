import { Outlet } from "react-router";
import Header from "../../components/header/Header.jsx";
import Footer from "../../components/footer/Footer.jsx";
import styles from "./MainLayout.module.css";

export default function MainLayout() {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <Outlet /> {/*page content*/}
            </main>
            <Footer />
        </>
    );
}

//approach from course material (repo: aliaksem/idg2100-26-lib.app.frontend)