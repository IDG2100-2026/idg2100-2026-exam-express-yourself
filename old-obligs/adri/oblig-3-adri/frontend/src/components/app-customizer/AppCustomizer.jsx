import { useAppearance } from "../../hooks/useAppearance.js";
import { useAuth } from "../../hooks/useAuth.js";
import styles from "./AppCustomizer.module.css";

const boardColors = ["white", "lightgreen", "lightblue", "lightpink", "lightyellow", "lightcoral"];

export default function AppCustomizer({ onClose }) {
    const appearanceResult = useAppearance();
    const appearance = appearanceResult.appearance;
    const saveAppearance = appearanceResult.saveAppearance;

    const auth = useAuth();
    const user = auth.user; //null if anonymous, backend save skipped in that case

    function handleTheme(e) {
        saveAppearance({ ...appearance, theme: e.target.value }, user); //spread keeps all other settings, only updates theme
    }

    function handleBoardColor(color) {
        saveAppearance({ ...appearance, boardColor: color }, user); //spread keeps all other settings, only updates boardColor
    }

    function handleSound(e) {
        saveAppearance({ ...appearance, sound: e.target.checked }, user); //e.target.checked gives true or false from checkbox
    }

    function handleLobbyCount(e) {
        saveAppearance({ ...appearance, lobbyCount: Number(e.target.value) }, user); //convert string to number from range input
    }

    const colorButtons = [];
    for (let i = 0; i < boardColors.length; i++) {
        const color = boardColors[i];
        colorButtons.push(
            <button
                key={color}
                onClick={() => { handleBoardColor(color); }}
                className={appearance.boardColor === color ? styles["panel__color--active"] : null} //thicker outline on selected color
            >
                {color}
            </button>
        );
    }

    return(
        <div className={styles.backdrop} onClick={onClose}> {/*clicking backdrop closes the modal*/}
            <div className={styles.panel} onClick={(e) => { e.stopPropagation(); }}> {/*stop click from bubbling up to backdrop*/}
                <div className={styles.panel__head}>
                    <h2>Appearance</h2>
                    <button onClick={onClose}>X</button>
                </div>

                <div className={styles.panel__body}>
                    <div className={styles.panel__field}>
                        <label>Theme:</label>
                        <select value={appearance.theme} onChange={handleTheme}>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>

                    <div className={styles.panel__field}>
                        <label>Board color:</label>
                        <div className={styles.panel__colors}>
                            {colorButtons}
                        </div>
                    </div>

                    <div className={styles.panel__field}>
                        <label>Sound:</label>
                        <input
                            type="checkbox"
                            checked={appearance.sound}
                            onChange={handleSound}
                        />
                    </div>

                    <div className={styles.panel__field}>
                        <label>Games in lobby preview:</label>
                        <input
                            type="range"
                            min="1"
                            max="10"
                            value={appearance.lobbyCount}
                            onChange={handleLobbyCount}
                        />
                        <p>{appearance.lobbyCount}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
