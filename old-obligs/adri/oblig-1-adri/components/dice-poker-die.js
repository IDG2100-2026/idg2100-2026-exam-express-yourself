class DicePokerDie extends HTMLElement {
  static get observedAttributes() {
    return ["face", "held", "owner", "die-id"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) {
      return;
    }

    this.render();

    if (name === "held") {
      this.dispatchEvent(new CustomEvent("dp:die-held-changed", { 
        detail: { 
          dieId: this.getAttribute("die-id"), 
          owner: this.getAttribute("owner"), 
          held: newValue === "true" 
        }, 
        bubbles: true, 
        composed: true }));
    }
  }

  render() {
    const face = this.getAttribute("face") || "7";
    const held = this.getAttribute("held") === "true";
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }
        
        .die {
          margin: 0.5rem;
          padding: 0.5rem;
          outline: 2px solid black;
          background-color: var(--die-bg-color, ivory);
          border-radius: 5px;
          line-height: 11px;
        }

        .die:hover {
        cursor: pointer;
        }

        .die.held {
          outline: 2px solid var(--die-held-color, gold);
          transform: translateY(-10px);
        }

        .die.red {
          color: var(--die-face-color-red, #ff0000);
        }

        .die.black {
          color: var(--die-face-color-black, #000000);
        }
      </style>

      <div class="die ${held ? "held" : ""} ${this.getFaceColor(face)}">${face}</div>
    `;
    
    this.shadowRoot.querySelector("div").addEventListener("click", (event) => {
      const heldNow = this.getAttribute("held") === "true";
      this.setAttribute("held", heldNow ? "false" : "true");
    });
  }

  getFaceColor(face) {
    if (face === "A" || face === "K" || face === "8") {
      return "red";
    } else {
      return "black";
    }
  }

  roll() {
    if (this.getAttribute("held") === "true") {
      return;
    } else {
      const faces = ["7", "8", "J", "Q", "K", "A"];
      const randomFace = faces[Math.floor(Math.random() * faces.length)];
      this.setAttribute("face", randomFace);

      this.dispatchEvent(new CustomEvent("dp:die-rolled", {
        detail: {
          dieId: this.getAttribute("die-id"),
          owner: this.getAttribute("owner"),
          face: randomFace
        },
        bubbles: true,
        composed: true
      }));
    }
  }
}

customElements.define("dice-poker-die", DicePokerDie);