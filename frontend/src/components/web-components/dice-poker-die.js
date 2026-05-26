class DicePokerDie extends HTMLElement {
  #face;
  #held;
  #disabled;
  #rolling; // for animation shake
  #faceMap = { 7: "7", 8: "8", 9: "J", 10: "Q", 11: "K", 12: "A" }
  constructor() {
    super(); // calls the parent HTTPElement
    this.attachShadow({ mode: "open" }); // creates a shadow DOM
    this.#face = this.getAttribute("face") || "?"; // get face from attribute. ? on game start
    this.#held = this.getAttribute("held") === "true"; // check if held attribute is set to true
    this.#disabled = this.getAttribute("disabled") === "true"; // prevent clicking when it is not that players turn.
    this.#rolling = false;
  }

  static get observedAttributes() {
    return ["face", "held", "disabled"]; // re-render when any of these attributes change
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return; // SKip if nothing has changed
    if (name === "face") this.#face = this.#faceMap[newValue] || newValue // converts number to display labels connected to that number
    if (name === "held") this.#held = newValue === "true"; // update held state
    if (name === "disabled") this.#disabled = newValue === "true";
    if (this.isConnected) this.#render();
  }

  connectedCallback() {
    this.#render(); // inital render when component is added to page
    this.shadowRoot.addEventListener("click", () => {
      // listens for click events on the die
      if (this.#disabled) return; // can't hold dices when it is not your turn
      this.#held = !this.#held; // toggle hold and un-hold
      this.setAttribute("held", this.#held ? "true" : "false"); // updates the hold attribute
      this.#render(); // re-render with new hold state
      this.#emitHeldChanged(); // tells the parent component that the hold changed! e.g, fires the dp:die-held-changed event
    });
  }

  animateRoll() {
    this.#rolling = true; // starts the shake animation
    this.#render(); // re-render to show the animation
    setTimeout(() => {
      // after 250ms, stop the animation
      this.#rolling = false;
      this.#render(); // re-render without animation
    }, 250);
  }

  #emitHeldChanged() {
    this.dispatchEvent(
      new CustomEvent("dp:die-held-changed", {
        bubbles: true, // event bubbles up trough the DOM
        composed: true, // event crosses shadow dom boudary
        detail: {
          dieId: this.getAttribute("die-id"), // which die was toggled
          held: this.#held, // is held or not
        },
      }),
    );
  }

  #render() {
    const colorClass =
      this.#face === "A" || this.#face === "K" || this.#face === "8"
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
        
      .die.disabled {
        cursor: not-allowed;
        opacity: 0.6;
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

    <div class="die ${this.#held ? "held" : ""} ${this.#disabled ? "disabled" : ""} ${this.#rolling ? "rolling" : ""}">
      <span class="face ${colorClass}">${this.#face}</span>
    </div>
  `;
  }
}

customElements.define("dice-poker-die", DicePokerDie);
