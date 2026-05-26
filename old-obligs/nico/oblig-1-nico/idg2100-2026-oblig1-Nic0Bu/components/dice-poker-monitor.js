class DicePokerMonitor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._round = 1;
    this._activePlayer = "player1";
    this._remainingRolls = 3;
    this._roundResultText = "";
    this._onTurnChanged = this._onTurnChanged.bind(this);
    this._onRoundStart = this._onRoundStart.bind(this);
    this._onRoundDecided = this._onRoundDecided.bind(this);
  }

  connectedCallback() {
    this._render();
    this._eventTarget = this.getRootNode();
    this._eventTarget.addEventListener("dp:turn-changed", this._onTurnChanged);
    this._eventTarget.addEventListener("dp:round-start", this._onRoundStart);
    this._eventTarget.addEventListener("dp:round-decided", this._onRoundDecided);
  }

  disconnectedCallback() {
    if (!this._eventTarget) return;
    this._eventTarget.removeEventListener("dp:turn-changed", this._onTurnChanged);
    this._eventTarget.removeEventListener("dp:round-start", this._onRoundStart);
    this._eventTarget.removeEventListener("dp:round-decided", this._onRoundDecided);
    this._eventTarget = null;
  }

  _onTurnChanged(event) {
    this._activePlayer = event.detail.player;
    this._remainingRolls = event.detail.remainingRolls;
    this._render();
  }

  _onRoundStart(event) {
    this._round = event.detail.round;
    this._render();
  }

  _onRoundDecided(event) {
    const { winner, hands } = event.detail;
    const winnerText =
      winner === "player1"
        ? "Winner: Player 1"
        : winner === "player2"
        ? "Winner: Player 2"
        : "Winner: Tie";
    const p1Hand = hands.player1.handType;
    const p2Hand = hands.player2.handType;
    this._roundResultText = `${winnerText} | P1: ${p1Hand} | P2: ${p2Hand}`;
    this._render();
  }

  _render() {
    const playerLabel = this._activePlayer === "player1" ? "Player 1" : "Player 2";
     this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: block;
        margin: 1rem 0;
      }

      .monitor {
        padding: 1rem;
        border-radius: 12px;
        background: var(--monitor-bg-color, rgba(0,0,0,0.75));
        color: var(--monitor-text-color, white);
        font: 600 14px system-ui;
      }

      .row {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .label {
        opacity: 0.85;
      }

      .active-player {
        color: ${playerColor};
      }
    </style>

    <div class="monitor">
      <div class="row">
        <div><span class="label">Round:</span> ${this._round}</div>
        <div><span class="label">Turn:</span> <span class="active-player">${playerLabel}</span></div>
        <div><span class="label">Rolls left:</span> ${this._remainingRolls}</div>
        <div><span class="label">Last result:</span> ${this._roundResultText || "-"}</div>
      </div>
    </div>
  `;
}
}

customElements.define("dice-poker-monitor", DicePokerMonitor);