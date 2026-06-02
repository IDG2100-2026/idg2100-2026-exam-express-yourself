import { useState } from "react";
import { useAppearance } from "../../hooks/useAppearance.js";
import GearIcon from "../../assets/icons/GearIcon.jsx";

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

  let darkBtnClass = "appearance__btn btn btn--secondary";
  if (appearance.theme === "dark") {
    darkBtnClass = "appearance__btn appearance__btn--active btn btn--secondary";
  }

  let lightBtnClass = "appearance__btn btn btn--secondary";
  if (appearance.theme === "light") {
    lightBtnClass = "appearance__btn appearance__btn--active btn btn--secondary";
  }

  let soundOnClass = "appearance__btn btn btn--secondary";
  if (appearance.sound) {
    soundOnClass = "appearance__btn appearance__btn--active btn btn--secondary";
  }

  let soundOffClass = "appearance__btn btn btn--secondary";
  if (!appearance.sound) {
    soundOffClass = "appearance__btn appearance__btn--active btn btn--secondary";
  }

  return (
    <div className="appearance">
      <button className="appearance__toggle btn btn--secondary" onClick={() => { setOpen(!open); }}>
        <GearIcon size={24} />
      </button>

      {open && (
        <div className="appearance__menu stack-m">
          <div className="appearance__row stack-s">
            <span className="appearance__label">Theme</span>
            <div className="appearance__options">
              <button className={darkBtnClass} onClick={() => { update("theme", "dark"); }}>
                Dark
              </button>
              <button className={lightBtnClass} onClick={() => { update("theme", "light"); }}>
                Light
              </button>
            </div>
          </div>

          <div className="appearance__row stack-s">
            <span className="appearance__label">Board colour</span>
            <div className="appearance__colors">
              {BOARD_COLORS.map((colorOption) => {
                let colorClass = "appearance__color";
                if (appearance.boardColor === colorOption.value) {
                  colorClass = "appearance__color appearance__color--active";
                }
                return (
                  <button
                    key={colorOption.value}
                    title={colorOption.label}
                    className={colorClass}
                    style={{ backgroundColor: colorOption.value }}
                    onClick={() => { update("boardColor", colorOption.value); }}
                  />
                );
              })}
            </div>
          </div>

          <div className="appearance__row stack-s">
            <span className="appearance__label">Sound</span>
            <div className="appearance__options">
              <button className={soundOnClass} onClick={() => { update("sound", true); }}>
                On
              </button>
              <button className={soundOffClass} onClick={() => { update("sound", false); }}>
                Off
              </button>
            </div>
          </div>

          <div className="appearance__row stack-s">
            <span className="appearance__label">Lobby preview (<span className="appearance__count">{lobbySize}</span>)</span>
            <input
              type="range"
              min="1"
              max="10"
              value={lobbySize}
              className="appearance__slider"
              onChange={(e) => { setSliderValue(parseInt(e.target.value)); }}
              onMouseUp={(e) => { update("lobbySize", parseInt(e.target.value)); }}
              onTouchEnd={(e) => { update("lobbySize", parseInt(e.target.value)); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default AppearanceMenu;
