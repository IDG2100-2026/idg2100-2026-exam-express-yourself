class DicePokerBoard extends HTMLElement {
  static get observedAttributes() {
    return ["player1", "player2", "bestof", "include-straight"];
  }

  constructor() {
    super();
    this.attachShadow( { mode: "open" });

    this.faceValues = { "7": 1, "8": 2, "J": 3, "Q": 4, "K": 5, "A": 6 };

    this.handNames = [
      "High Card", "One Pair", "Two Pairs", "Three of a Kind",
      "Straight", "Full House", "Four of a Kind", "Five of a Kind"
    ];
  }

  createDie(owner, id) {
    const die = document.createElement("dice-poker-die");
    die.setAttribute("owner", owner);
    die.setAttribute("die-id", id);
    die.setAttribute("face", "7");
    die.setAttribute("held", "false");
    return die;
  }

  attributeChangedCallback() {}

  connectedCallback() {
    this.player1Name = this.getAttribute("player1") || "Player 1";
    this.player2Name = this.getAttribute("player2") || "Player 2";
    this.bestOf = parseInt(this.getAttribute("bestof") || "3");
    this.includeStraight = this.getAttribute("include-straight") !== "false";

    this.currentPlayer = "player1";
    this.rollCount = 0;
    this.maxRolls = 3;
    this.player1Score = 0;
    this.player2Score = 0;
    this.roundNumber = 1;
    this.roundOver = false;
    this.matchOver = false;

    this.player1Dice = [];
    this.player2Dice = [];
    for (let i = 0; i < 5; i++) {
      this.player1Dice.push(this.createDie("player1", "p1-" + i));
      this.player2Dice.push(this.createDie("player2", "p2-" + i));
    }

    this.addEventListener("dp:die-held-changed", (event) => {
      this.updateHandDisplay(event.detail.owner);
    });

    this.render();
    this.attachDice();
    this.attachButtons();

    setTimeout(() => {
      this.emitRoundStart();
      this.doAutoRoll();
    }, 0);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          background-color: var(--board-bg-color, darkslategray);
          color: white;
          text-align: center;
        }
        .player1-name {
          color: var(--player1-color, tomato); 
        }
        .player2-name {
          color: var(--player2-color, tomato);
        }
        button {
          margin-block: 1rem;
          padding: 0.5rem;
        }
      </style>
      <section id="p1-section">
        <h2 class="player1-name">${this.player1Name}</h2>
        <div id="p1-dice"></div>
        <p id="player1-hand">Hand: —</p>
      </section>

      <section id="p2-section">
        <h2 class="player2-name">${this.player2Name}</h2>
        <div id="p2-dice"></div>
        <p id="player2-hand">Hand: —</p>
      </section>

      <p id="round-result"></p>

      <div>
        <button id="roll-btn">Roll</button>
        <button id="end-turn-btn">End Turn</button>
        <button id="next-round-btn" style="display:none;">Start Next Round</button>
        <button id="restart-btn" style="display:none;">Restart Match</button>
      </div>
    `;
  }

 attachDice() {
    this.player1Dice.forEach((die) => {
      this.shadowRoot.querySelector("#p1-dice").appendChild(die);
    });
    this.player2Dice.forEach((die) => {
      this.shadowRoot.querySelector("#p2-dice").appendChild(die);
    });
  }

  attachButtons() {
    this.shadowRoot.querySelector("#roll-btn").addEventListener("click", () => {
      this.handleRollClick();
    });
    this.shadowRoot.querySelector("#end-turn-btn").addEventListener("click", () => {
      this.endTurn();
    });
    this.shadowRoot.querySelector("#next-round-btn").addEventListener("click", () => {
      this.startNextRound();
    });
    this.shadowRoot.querySelector("#restart-btn").addEventListener("click", () => {
      this.restartMatch();
    });
  }

 getCurrentDice() {
    if (this.currentPlayer === "player1") {
      return this.player1Dice;
    } else {
      return this.player2Dice;
    }
  }

  doAutoRoll() {
    const dice = this.getCurrentDice();

    dice.forEach((die) => {
      die.setAttribute("held", "false");
    });
    dice.forEach((die) => {
      die.roll();
    });

    this.rollCount = 1;
    this.updateHandDisplay(this.currentPlayer);
    this.emitRollExecuted();
    this.emitTurnChanged();
    this.updateButtons();
  }

  handleRollClick() {
    if (this.roundOver || this.matchOver || this.rollCount >= this.maxRolls) {
      return;
    }

    this.getCurrentDice().forEach((die) => {
      die.roll();
    });

    this.rollCount++;
    this.updateHandDisplay(this.currentPlayer);
    this.emitRollExecuted();
    this.emitTurnChanged();
    this.updateButtons();

    if (this.rollCount >= this.maxRolls) {
      setTimeout(() => {
        this.endTurn();
      }, 500);
    }
  }

  endTurn() {
    if (this.roundOver || this.matchOver) {
      return;
    }

    if (this.currentPlayer === "player1") {
      this.currentPlayer = "player2";
      this.rollCount = 0;
      this.emitTurnChanged();
      this.doAutoRoll();
    } else {
      this.evaluateRound();
    }
  }

  toSorted(faces) {
    return faces.map((f) => { return this.faceValues[f]; }).sort((a, b) => { return a - b; });
  }

  getHandRank(sorted) {
    if (sorted[0] === sorted[4]) {
      return { rank: 8, high: sorted[4] };
    }
    if (sorted[0] === sorted[3] || sorted[1] === sorted[4]) {
      return { rank: 7, high: sorted[2] };
    }
    if ((sorted[0] === sorted[2] && sorted[3] === sorted[4]) ||
        (sorted[0] === sorted[1] && sorted[2] === sorted[4])) {
      return { rank: 6, high: sorted[2] };
    }
    if (this.includeStraight) {
      const str = sorted.join("");
      if (str === "12345" || str === "23456") {
        return { rank: 5, high: sorted[4] };
      }
    }
    if (sorted[0] === sorted[2] || sorted[1] === sorted[3] || sorted[2] === sorted[4]) {
      return { rank: 4, high: sorted[2] };
    }
    if ((sorted[0] === sorted[1] && sorted[2] === sorted[3]) ||
        (sorted[0] === sorted[1] && sorted[3] === sorted[4]) ||
        (sorted[1] === sorted[2] && sorted[3] === sorted[4])) {
      return { rank: 3, high: sorted[4] };
    }
    if (sorted[0] === sorted[1] || sorted[1] === sorted[2] ||
        sorted[2] === sorted[3] || sorted[3] === sorted[4]) {
      return { rank: 2, high: sorted[4] };
    }
    return { rank: 1, high: sorted[4] };
  }

  evaluateRound() {
    const p1Faces = this.player1Dice.map((d) => { return d.getAttribute("face"); });
    const p2Faces = this.player2Dice.map((d) => { return d.getAttribute("face"); });

    const p1Hand = this.getHandRank(this.toSorted(p1Faces));
    const p2Hand = this.getHandRank(this.toSorted(p2Faces));

    let winner = null;
    if (p1Hand.rank > p2Hand.rank) {
      winner = "player1";
    } else if (p2Hand.rank > p1Hand.rank) {
      winner = "player2";
    } else if (p1Hand.high > p2Hand.high) {
      winner = "player1";
    } else if (p2Hand.high > p1Hand.high) {
      winner = "player2";
    }

    if (winner === "player1") {
      this.player1Score++;
    } else if (winner === "player2") {
      this.player2Score++;
    }

    this.roundOver = true;

    const p1HandType = this.handNames[p1Hand.rank - 1];
    const p2HandType = this.handNames[p2Hand.rank - 1];
    const resultEl = this.shadowRoot.querySelector("#round-result");

    if (winner) {
      const winnerName = (winner === "player1") ? this.player1Name : this.player2Name;
      const winnerHand = (winner === "player1") ? p1HandType : p2HandType;
      resultEl.textContent = winnerName + " wins the round with " + winnerHand + "!";
    } else {
      resultEl.textContent = "Round is a tie!";
    }

    this.dispatchEvent(new CustomEvent("dp:round-decided", {
      detail: {
        winner: winner,
        hands: {
          player1: { faces: p1Faces, handType: p1HandType },
          player2: { faces: p2Faces, handType: p2HandType }
        }
      },
      bubbles: true,
      composed: true
    }));

    const winsNeeded = Math.ceil(this.bestOf / 2);
    if (this.player1Score >= winsNeeded || this.player2Score >= winsNeeded) {
      this.matchOver = true;
      const champ = (this.player1Score >= winsNeeded) ? "player1" : "player2";
      const champName = (champ === "player1") ? this.player1Name : this.player2Name;
      resultEl.textContent = champName + " wins the match! (" + this.player1Score + "-" + this.player2Score + ")";

      this.dispatchEvent(new CustomEvent("dp:match-decided", {
        detail: {
          champion: champ,
          scoreline: { player1: this.player1Score, player2: this.player2Score }
        },
        bubbles: true,
        composed: true
      }));
    }

    this.updateButtons();
  }

  updateHandDisplay(player) {
    const dice = (player === "player1") ? this.player1Dice : this.player2Dice;
    const faces = dice.map((d) => { return d.getAttribute("face"); });
    const hand = this.getHandRank(this.toSorted(faces));
    const el = this.shadowRoot.querySelector("#" + player + "-hand");
    if (el) {
      el.textContent = "Hand: " + this.handNames[hand.rank - 1];
    }
  }

  updateButtons() {
    const rollBtn = this.shadowRoot.querySelector("#roll-btn");
    const endBtn = this.shadowRoot.querySelector("#end-turn-btn");
    const nextBtn = this.shadowRoot.querySelector("#next-round-btn");
    const restartBtn = this.shadowRoot.querySelector("#restart-btn");

    if (this.matchOver) {
      rollBtn.style.display = "none";
      endBtn.style.display = "none";
      nextBtn.style.display = "none";
      restartBtn.style.display = "inline";
    } else if (this.roundOver) {
      rollBtn.style.display = "none";
      endBtn.style.display = "none";
      nextBtn.style.display = "inline";
      restartBtn.style.display = "none";
    } else {
      rollBtn.style.display = "inline";
      rollBtn.disabled = (this.rollCount >= this.maxRolls);
      endBtn.style.display = "inline";
      nextBtn.style.display = "none";
      restartBtn.style.display = "none";
    }
  }

  startNextRound() {
    this.roundOver = false;
    this.currentPlayer = "player1";
    this.rollCount = 0;
    this.roundNumber++;
    this.shadowRoot.querySelector("#round-result").textContent = "";

    this.player1Dice.forEach((d) => { d.setAttribute("held", "false"); });
    this.player2Dice.forEach((d) => { d.setAttribute("held", "false"); });

    this.updateButtons();
    this.emitRoundStart();
    this.doAutoRoll();
    this.updateHandDisplay("player1");
    this.updateHandDisplay("player2");
  }

  restartMatch() {
    this.player1Score = 0;
    this.player2Score = 0;
    this.roundNumber = 1;
    this.roundOver = false;
    this.matchOver = false;
    this.currentPlayer = "player1";
    this.rollCount = 0;
    this.shadowRoot.querySelector("#round-result").textContent = "";

    this.player1Dice.forEach((d) => { d.setAttribute("held", "false"); });
    this.player2Dice.forEach((d) => { d.setAttribute("held", "false"); });

    this.updateButtons();
    this.emitRoundStart();
    this.doAutoRoll();
    this.updateHandDisplay("player1");
    this.updateHandDisplay("player2");
  }

  emitRoundStart() {
    this.dispatchEvent(new CustomEvent("dp:round-start", {
      detail: { round: this.roundNumber },
      bubbles: true, composed: true
    }));
  }

  emitTurnChanged() {
    this.dispatchEvent(new CustomEvent("dp:turn-changed", {
      detail: { player: this.currentPlayer, remainingRolls: this.maxRolls - this.rollCount },
      bubbles: true, composed: true
    }));
  }

  emitRollExecuted() {
    const dice = this.getCurrentDice();
    this.dispatchEvent(new CustomEvent("dp:roll-executed", {
      detail: {
        player: this.currentPlayer,
        faces: dice.map((d) => { return d.getAttribute("face"); }),
        held: dice.map((d) => { return d.getAttribute("held") === "true"; })
      },
      bubbles: true, composed: true
    }));
  }
}

customElements.define("dice-poker-board", DicePokerBoard);