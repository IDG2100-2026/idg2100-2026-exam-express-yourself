import { useTheme } from '../../hooks/useTheme';
import styles from './ThemeOption.module.css';
import darkIcon from '../../assets/icons/darkMode.svg'
import lightIcon from '../../assets/icons/lightMode.svg'
export const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();
    console.log("Theme:", theme)
    return(
        <button onClick={toggleTheme} className={styles.themeBtn}>
            {theme === 'light' ? <img className={styles.darkIcon} src={darkIcon} alt="Switch to dark mode"/> : <img className={styles.lightIcon} src={lightIcon} alt="Switch to light mode"/>}
        </button>
    );
};

