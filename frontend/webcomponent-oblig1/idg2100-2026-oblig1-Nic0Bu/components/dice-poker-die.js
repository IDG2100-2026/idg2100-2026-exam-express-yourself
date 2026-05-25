class DicePokerDie extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._face = this.getAttribute("face") || "A";
    this._held = this.getAttribute("held") === "true";
    this._rolling = false;
    this._rollTimer = null;
    this._rollVersion = 0;
  }

  static get observedAttributes() {
    return ["face", "held"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === "face") this._face = newValue;
    if (name === "held") this._held = newValue === "true";
    if (this.isConnected) this._render();
  }

  connectedCallback() {
    this._render();
    this.shadowRoot.addEventListener("click", () => {
      if (this._rolling) return;
      this._held = !this._held;
      this.setAttribute("held", this._held ? "true" : "false");
      this._render();
      this._emitHeldChanged();
    });
  }

  reset() {
    this._rollVersion += 1;
    if (this._rollTimer) {
      clearTimeout(this._rollTimer);
      this._rollTimer = null;
    }
    this._rolling = false;
    this.setAttribute("held", "false");
    this.setAttribute("face", "A");
    this._render();
  }

  roll() {
    if (this._held) return;
    const faces = ["A", "K", "Q", "J", "8", "7"];
    const randomIndex = Math.floor(Math.random() * faces.length);
    const newFace = faces[randomIndex];
    this._rolling = true;
    this._render();
    if (this._rollTimer) clearTimeout(this._rollTimer);
    const myVersion = this._rollVersion;
    this._rollTimer = setTimeout(() => {
      if (myVersion !== this._rollVersion) return;
      this.setAttribute("face", newFace);
      this._rolling = false;
      this._rollTimer = null;
      this._render();
      this._emitDieRolled();
    }, 250);
  }

  _emitDieRolled() {
    this.dispatchEvent(
      new CustomEvent("dp:die-rolled", {
        bubbles: true,
        composed: true,
        detail: {
          dieId: this.getAttribute("die-id"),
          face: this._face,
          owner: this.getAttribute("owner"),
        },
      })
    );
  }

  _emitHeldChanged() {
    this.dispatchEvent(
      new CustomEvent("dp:die-held-changed", {
        bubbles: true,
        composed: true,
        detail: {
          dieId: this.getAttribute("die-id"),
          held: this._held,
          owner: this.getAttribute("owner"),
        },
      })
    );
  }

  _render() {
    const colorClass =
      this._face === "A" || this._face === "K" || this._face === "8"
        ? "red"
        : "black";

     this.shadowRoot.innerHTML = `
    <style>
      :host { display: inline-block; }

      .die {
        width: 64px;
        height: 64px;
        border-radius: 12px;
        border: 2px solid rgba(0,0,0,0.2);
        display: grid;
        place-items: center;
        font: 700 22px system-ui;
        background: var(--die-bg-color, #f5f5f5);
        cursor: pointer;
        user-select: none;
        transition: transform 120ms ease;
      }

      .die.held {
        outline: 4px solid var(--die-held-color, #fbbf24);
        outline-offset: 2px;
      }

      .die.rolling {
        cursor: not-allowed;
        animation: shake 250ms ease-in-out;
      }

      @keyframes shake {
        0%   { transform: rotate(0deg) translateX(0); }
        25%  { transform: rotate(-6deg) translateX(-2px); }
        50%  { transform: rotate(6deg) translateX(2px); }
        75%  { transform: rotate(-4deg) translateX(-1px); }
        100% { transform: rotate(0deg) translateX(0); }
      }

      .face.red   { color: var(--die-face-color-red, #cc0000); }
      .face.black { color: var(--die-face-color-black, #000000); }
    </style>

    <div class="die ${this._held ? "held" : ""} ${this._rolling ? "rolling" : ""}">
      <span class="face ${colorClass}">${this._face}</span>
    </div>
  `;
}
}

customElements.define("dice-poker-die", DicePokerDie);