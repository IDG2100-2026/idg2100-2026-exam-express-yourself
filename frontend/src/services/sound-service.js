let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function beep(freq, duration, type = "sine") {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.25, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + duration);
}

export const sounds = {
  roll:       () => beep(300, 0.12, "triangle"),
  hold:       () => beep(520, 0.08, "sine"),
  roundStart: () => { beep(523, 0.15); setTimeout(() => beep(659, 0.15), 160); },
  roundEnd:   () => beep(440, 0.35, "sine"),
  gameEnd:    () => { beep(523, 0.2); setTimeout(() => beep(659, 0.2), 220); setTimeout(() => beep(784, 0.4), 440); },
};
