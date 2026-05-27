import { useState } from "react";
import { useAppearance } from "../../hooks/useAppearance.js";

const BOARD_COLORS = [
  { label: "Navy", value: "#1c2130" },
  { label: "Green", value: "#1a3a2a" },
  { label: "Red", value: "#3a1a1a" },
  { label: "Purple", value: "#2a1a3a" },
  { label: "Grey", value: "#2a2a2a" },
];

function AppearanceMenu() {
  const [open, setOpen] = useState(false);
  const { appearance, saveAppearance } = useAppearance();
  const [sliderValue, setSliderValue] = useState(null);

  const lobbySize = sliderValue ?? appearance.lobbySize;

  function update(key, value) {
    saveAppearance({ ...appearance, [key]: value });
  }

  return (
    <div className="appearance">
      <button className="appearance__toggle" onClick={() => setOpen(!open)}>
        ⚙ Appearance
      </button>

      {open && (
        <div className="appearance__menu">
          <div className="appearance__row">
            <span className="appearance__label">Theme</span>
            <div className="appearance__options">
              <button className={`appearance__btn ${appearance.theme === "dark" ? "appearance__btn--active" : ""}`} onClick={() => update("theme", "dark")}>Dark</button>
              <button className={`appearance__btn ${appearance.theme === "light" ? "appearance__btn--active" : ""}`} onClick={() => update("theme", "light")}>Light</button>
            </div>
          </div>

          <div className="appearance__row">
            <span className="appearance__label">Board colour</span>
            <div className="appearance__colors">
              {BOARD_COLORS.map((c) => (
                <button key={c.value} title={c.label} className={`appearance__color ${appearance.boardColor === c.value ? "appearance__color--active" : ""}`} style={{ backgroundColor: c.value }} onClick={() => update("boardColor", c.value)} />
              ))}
            </div>
          </div>

          <div className="appearance__row">
            <span className="appearance__label">Sound</span>
            <button className={`appearance__btn ${appearance.sound ? "appearance__btn--active" : ""}`} onClick={() => update("sound", !appearance.sound)}>
              {appearance.sound ? "On" : "Off"}
            </button>
          </div>

          <div className="appearance__row">
            <span className="appearance__label">Lobby preview ({lobbySize})</span>
            <input
              type="range" min="1" max="10"
              value={lobbySize}
              onChange={(e) => setSliderValue(parseInt(e.target.value))}
              onMouseUp={(e) => update("lobbySize", parseInt(e.target.value))}
              onTouchEnd={(e) => update("lobbySize", parseInt(e.target.value))}
              className="appearance__slider"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AppearanceMenu;
