class DicePokerBoard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._player1 = this.getAttribute("player1") || "Player 1";
    this._player2 = this.getAttribute("player2") || "Player 2";
    this._bestOf = this.getAttribute("bestof") || "3";
    this._includeStraight = this.getAttribute("include-straight") || "true";
    this._diceP1 = [];
    this._diceP2 = [];
    this._round = 1;
    this._activePlayer = "player1";
    this._remainingRolls = 3;
    this._FACE_ORDER = ["7", "8", "J", "Q", "K", "A"];
    this._wins = { player1: 0, player2: 0 };
    this._matchOver = false;
    this._matchWinner = null;
  }

  connectedCallback() {
    this._render();
    this._setupDice();
    this._updateTurnUI();
    this._updateButtonsUI();
    this._emitTurnChanged();
    this._emitRoundStart();
  }

  _setupDice() {
    const p1DiceWrap = this.shadowRoot.querySelector("[data-dice='p1']");
    const p2DiceWrap = this.shadowRoot.querySelector("[data-dice='p2']");
    if (!p1DiceWrap || !p2DiceWrap) return;

    this._diceP1 = [];
    this._diceP2 = [];

    for (let i = 0; i < 5; i++) {
      const die1 = document.createElement("dice-poker-die");
      die1.setAttribute("face", "A");
      die1.setAttribute("held", "false");
      die1.setAttribute("owner", "player1");
      die1.setAttribute("die-id", `p1-${i}`);
      p1DiceWrap.appendChild(die1);
      this._diceP1.push(die1);

      const die2 = document.createElement("dice-poker-die");
      die2.setAttribute("face", "A");
      die2.setAttribute("held", "false");
      die2.setAttribute("owner", "player2");
      die2.setAttribute("die-id", `p2-${i}`);
      p2DiceWrap.appendChild(die2);
      this._diceP2.push(die2);
    }

    this.shadowRoot.getElementById("rollP1").addEventListener("click", () => {
      this._tryRoll("player1");
    });

    this.shadowRoot.getElementById("rollP2").addEventListener("click", () => {
      this._tryRoll("player2");
    });

    this.shadowRoot.getElementById("resetHolds").addEventListener("click", () => {
      if (this._matchOver) return;
      [...this._diceP1, ...this._diceP2].forEach((die) => {
        die.setAttribute("held", "false");
      });
    });

    this.shadowRoot.getElementById("endTurn").addEventListener("click", () => {
      this._endTurn();
    });

    this.shadowRoot.getElementById("nextRound")?.addEventListener("click", () => {
      this._startNewMatch();
    });
  }

  _tryRoll(player) {
    if (this._matchOver) return;
    if (player !== this._activePlayer) return;
    if (this._remainingRolls <= 0) return;

    const dice = player === "player1" ? this._diceP1 : this._diceP2;
    dice.forEach((die) => die.roll());
    this._remainingRolls -= 1;
    this._updateTurnUI();
    this._updateButtonsUI();
    this._emitTurnChanged();
    this._emitRollExecuted(player);

    if (this._remainingRolls === 0) {
      this._endTurn();
    }
  }

  _endTurn() {
    if (this._matchOver) return;

    if (this._activePlayer === "player1") {
      this._activePlayer = "player2";
      this._remainingRolls = 3;
      this._updateTurnUI();
      this._updateButtonsUI();
      this._emitTurnChanged();
      return;
    }

    const faces1 = this._getFacesFor("player1");
    const faces2 = this._getFacesFor("player2");
    const comparison = this._compareHands(faces1, faces2);

    this._emitRoundDecided({
      winner: comparison.winner,
      hands: {
        player1: { handType: comparison.hand1.name, faces: faces1 },
        player2: { handType: comparison.hand2.name, faces: faces2 },
      },
    });

    if (comparison.winner === "player1" || comparison.winner === "player2") {
      this._wins[comparison.winner] += 1;
    }

    const neededWins = Math.ceil(Number(this._bestOf) / 2);

    if (this._wins.player1 >= neededWins || this._wins.player2 >= neededWins) {
      this._matchOver = true;
      this._matchWinner =
        this._wins.player1 > this._wins.player2 ? "player1" : "player2";
      this._emitMatchDecided();
      this._render();
      this._setupDice();
      this._updateTurnUI();
      this._updateButtonsUI();
      return;
    }

    this._round += 1;
    this._activePlayer = "player1";
    this._remainingRolls = 3;
    this._resetAllDice();
    this._updateTurnUI();
    this._updateButtonsUI();
    this._emitTurnChanged();
    this._emitRoundStart();
  }

  _resetAllDice() {
    for (const die of this._diceP1) {
      die.reset();
    }
    for (const die of this._diceP2) {
      die.reset();
    }
  }

  _startNewMatch() {
    this._wins.player1 = 0;
    this._wins.player2 = 0;
    this._matchOver = false;
    this._matchWinner = null;
    this._activePlayer = "player1";
    this._remainingRolls = 3;
    this._render();
    this._setupDice();
    [...this._diceP1, ...this._diceP2].forEach((die) => {
      die.reset();
    });
    this._updateTurnUI();
    this._updateButtonsUI();
    this._emitTurnChanged();
    this._emitRoundStart();
  }

  _updateTurnUI() {
    const status = this.shadowRoot.getElementById("turnStatus");
    if (!status) return;
    const name = this._activePlayer === "player1" ? this._player1 : this._player2;
    status.textContent =
      `Turn: ${name} | Rolls left: ${this._remainingRolls} | ` +
      `Score: ${this._wins.player1}-${this._wins.player2}`;
  }

  _updateButtonsUI() {
    const rollP1Btn = this.shadowRoot.getElementById("rollP1");
    const rollP2Btn = this.shadowRoot.getElementById("rollP2");
    const endTurnBtn = this.shadowRoot.getElementById("endTurn");
    if (!rollP1Btn || !rollP2Btn || !endTurnBtn) return;

    if (this._matchOver) {
      rollP1Btn.disabled = true;
      rollP2Btn.disabled = true;
      endTurnBtn.disabled = true;
      return;
    }

    const p1Active = this._activePlayer === "player1";
    rollP1Btn.disabled = !p1Active;
    rollP2Btn.disabled = p1Active;
    endTurnBtn.disabled = false;
  }

  _emitRoundStart() {
    this.dispatchEvent(
      new CustomEvent("dp:round-start", {
        bubbles: true,
        composed: true,
        detail: { round: this._round },
      })
    );
  }

  _emitTurnChanged() {
    this.dispatchEvent(
      new CustomEvent("dp:turn-changed", {
        bubbles: true,
        composed: true,
        detail: {
          player: this._activePlayer,
          remainingRolls: this._remainingRolls,
        },
      })
    );
  }

  _emitRollExecuted(player) {
    const dice = player === "player1" ? this._diceP1 : this._diceP2;
    const faces = dice.map((die) => die.getAttribute("face"));
    const held = dice.map((die) => die.getAttribute("held") === "true");
    this.dispatchEvent(
      new CustomEvent("dp:roll-executed", {
        bubbles: true,
        composed: true,
        detail: { player: player, faces: faces, held: held },
      })
    );
  }

  _emitRoundDecided(result) {
    this.dispatchEvent(
      new CustomEvent("dp:round-decided", {
        bubbles: true,
        composed: true,
        detail: result,
      })
    );
  }

  _emitMatchDecided() {
    this.dispatchEvent(
      new CustomEvent("dp:match-decided", {
        bubbles: true,
        composed: true,
        detail: {
          champion: this._matchWinner,
          scoreline: {
            player1: this._wins.player1,
            player2: this._wins.player2,
          },
        },
      })
    );
  }

  _faceValue(face) {
    return this._FACE_ORDER.indexOf(face);
  }

  _countFaces(faces) {
    const counts = new Map();
    faces.forEach((f) => counts.set(f, (counts.get(f) || 0) + 1));
    return counts;
  }

  _isStraight(faces) {
    if (this._includeStraight !== "true") return false;
    const unique = Array.from(new Set(faces));
    if (unique.length !== 5) return false;
    const sorted = unique
      .slice()
      .sort((a, b) => this._faceValue(a) - this._faceValue(b))
      .join("");
    return sorted === "78JQK" || sorted === "8JQKA";
  }

  _evaluateHand(faces) {
    const counts = this._countFaces(faces);
    const pattern = Array.from(counts.values()).sort((a, b) => b - a);
    if (pattern[0] === 5) return { rank: 1, name: "Repóker (Five of a Kind)" };
    if (pattern[0] === 4) return { rank: 2, name: "Póker (Four of a Kind)" };
    if (pattern[0] === 3 && pattern[1] === 2) return { rank: 3, name: "Full (Full House)" };
    if (pattern[0] === 1) {
      if (this._isStraight(faces)) return { rank: 4, name: "Escalera (Straight)" };
      return { rank: 8, name: "Carta Alta (High Card)" };
    }
    if (pattern[0] === 3) return { rank: 5, name: "Trío (Three of a Kind)" };
    if (pattern[0] === 2 && pattern[1] === 2) return { rank: 6, name: "Doble Pareja (Two Pairs)" };
    if (pattern[0] === 2) return { rank: 7, name: "Pareja (One Pair)" };
    return { rank: 8, name: "Carta Alta (High Card)" };
  }

  _buildTieKey(faces) {
    if (this._isStraight(faces)) {
      const unique = Array.from(new Set(faces));
      const sorted = unique
        .slice()
        .sort((a, b) => this._faceValue(a) - this._faceValue(b));
      return [this._faceValue(sorted[sorted.length - 1])];
    }
    const counts = this._countFaces(faces);
    const groups = Array.from(counts.entries()).map(([face, count]) => ({
      face,
      count,
      value: this._faceValue(face),
    }));
    groups.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.value - a.value;
    });
    return groups.map((g) => g.value);
  }

  _compareTieKeys(keyA, keyB) {
    const len = Math.max(keyA.length, keyB.length);
    for (let i = 0; i < len; i++) {
      const a = keyA[i] ?? -1;
      const b = keyB[i] ?? -1;
      if (a > b) return 1;
      if (a < b) return -1;
    }
    return 0;
  }

  _compareHands(faces1, faces2) {
    const h1 = this._evaluateHand(faces1);
    const h2 = this._evaluateHand(faces2);
    if (h1.rank < h2.rank) return { winner: "player1", hand1: h1, hand2: h2 };
    if (h2.rank < h1.rank) return { winner: "player2", hand1: h1, hand2: h2 };
    const key1 = this._buildTieKey(faces1);
    const key2 = this._buildTieKey(faces2);
    const cmp = this._compareTieKeys(key1, key2);
    if (cmp > 0) return { winner: "player1", hand1: h1, hand2: h2 };
    if (cmp < 0) return { winner: "player2", hand1: h1, hand2: h2 };
    return { winner: "tie", hand1: h1, hand2: h2 };
  }

  _getFacesFor(player) {
    const dice = player === "player1" ? this._diceP1 : this._diceP2;
    return dice.map((die) => die.getAttribute("face"));
  }

  _render() {
    const winnerName =
      this._matchWinner === "player1"
        ? this._player1
        : this._matchWinner === "player2"
        ? this._player2
        : "";

    this.shadowRoot.innerHTML = `
    <style>
      :host { display: block; }

      .board {
        position: relative;
        padding: 1rem;
        border-radius: 12px;
        background: var(--board-bg-color, #0b5f0b);
        color: var(--board-text-color, #ffffff);
      }

      .top {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .panel {
        background: rgba(255,255,255,0.10);
        padding: 1rem;
        border-radius: 12px;
      }

      .dice-row {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
        margin: 0.75rem 0;
      }

      button {
        padding: 0.6rem 0.9rem;
        border-radius: 10px;
        border: 0;
        cursor: pointer;
        font: 600 14px system-ui;
      }

      button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .controls {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
      }

      .small { font-size: 0.9rem; opacity: 0.9; }

      .player-name.p1 { color: var(--player1-color, #3b82f6); }
      .player-name.p2 { color: var(--player2-color, #ef4444); }

      .overlay {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.65);
        display: grid;
        place-items: center;
        animation: fadeIn 300ms ease-out;
      }

      .overlay-content {
        background: rgba(0,0,0,0.88);
        border: 1px solid rgba(255,255,255,0.15);
        padding: 2rem;
        border-radius: 14px;
        text-align: center;
        max-width: 460px;
      }

      .win-subtitle {
        margin: 0 0 1rem;
        opacity: 0.95;
        font-weight: 700;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>

    <div class="board">
      <div class="top">
        <div>
          <div><strong>Spanish Dice Poker</strong></div>
          <div class="small">Round: ${this._round}</div>
          <div class="small">Best of ${this._bestOf} | Straights: ${this._includeStraight === "true" ? "On" : "Off"}</div>
          <div class="small" id="turnStatus"></div>
        </div>
        <div class="controls">
          <button id="resetHolds">Reset holds</button>
          <button id="endTurn">End turn</button>
        </div>
      </div>

      <div class="panel">
        <div class="player-name p1"><strong>${this._player1}</strong></div>
        <div class="dice-row" data-dice="p1"></div>
        <div class="controls">
          <button id="rollP1">Roll P1</button>
        </div>
      </div>

      <div style="height: 0.75rem;"></div>

      <div class="panel">
        <div class="player-name p2"><strong>${this._player2}</strong></div>
        <div class="dice-row" data-dice="p2"></div>
        <div class="controls">
          <button id="rollP2">Roll P2</button>
        </div>
      </div>

      ${this._matchOver ? `
        <div class="overlay">
          <div class="overlay-content">
            <div class="win-subtitle">${winnerName} wins the match!</div>
            <p class="small">Final score: ${this._wins.player1}-${this._wins.player2}</p>
            <button id="nextRound">Next Round</button>
          </div>
        </div>
      ` : ""}
    </div>
  `;
}
}

customElements.define("dice-poker-board", DicePokerBoard);