import { useTheme } from '../../hooks/useTheme';
import styles from './SoundMuter.module.css';
import { useState, useRef } from "react";
import noSoundDarkMode from '../../assets/icons/noSoundDarkMode.svg'
import soundDarkMode from '../../assets/icons/soundDarkMode.svg'
import soundLightMode from '../../assets/icons/soundLightMode.svg'
import noSoundLightMode from '../../assets/icons/noSoundLightMode.svg'

// useRef references to a value that does not need rendering. 
// Changing a ref does not trigger an re-render
export const ToggleSoundMute = () => {
    const [ mute, setMute ] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const audioRef = useRef(null);

    const toggleSound = () => {
        const nextMuteState = !mute;
        setMute(nextMuteState);
        if(audioRef.current){
            audioRef.current.muted = nextMuteState;
        }
        console.log("Muted:", mute)
    };

    return(
        <>
        <audio ref={audioRef} src="#"/> {/*# is where to path to audio file goes! */}
        <button className={styles.themeBtn} onClick={toggleSound}>
            {theme === 'light'
                ? <img src={mute ? soundDarkMode : noSoundDarkMode} alt={mute ? 'Unmute' : 'Mute'}/>
                : <img src={mute ? soundLightMode : noSoundLightMode} alt={mute ? 'Unmute' : 'Mute'}/>
            }
        </button>
        </>
    );
};