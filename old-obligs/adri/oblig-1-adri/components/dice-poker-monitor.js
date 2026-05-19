class DicePokerMonitor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.roundNumber = 1;
    this.currentPlayer = "";
    this.remainingRolls = 0;
    this.player1Score = 0;
    this.player2Score = 0;
    this.roundResultText = "";
    this.matchResultText = "";
    this.player1Name = "Player 1";
    this.player2Name = "Player 2";
  }

  connectedCallback() {
    const board = document.querySelector("dice-poker-board");
    if (board) {
      this.player1Name = board.getAttribute("player1") || "Player 1";
      this.player2Name = board.getAttribute("player2") || "Player 2";
    }

    document.addEventListener("dp:round-start", (event) => {
      this.roundNumber = event.detail.round;
      this.roundResultText = "";
      this.matchResultText = "";
      if (event.detail.round === 1) {
        this.player1Score = 0;
        this.player2Score = 0;
      }
      this.render();
    });

    document.addEventListener("dp:turn-changed", (event) => {
      this.currentPlayer = event.detail.player;
      this.remainingRolls = event.detail.remainingRolls;
      this.render();
    });

    document.addEventListener("dp:roll-executed", (event) => {
      this.currentPlayer = event.detail.player;
      this.render();
    });

    document.addEventListener("dp:round-decided", (event) => {
      if (event.detail.winner === "player1") {
        this.player1Score++;
      } else if (event.detail.winner === "player2") {
        this.player2Score++;
      }

      if (event.detail.winner) {
        const winnerName = (event.detail.winner === "player1") ? this.player1Name : this.player2Name;
        const winnerHand = event.detail.hands[event.detail.winner].handType;
        this.roundResultText = "Round winner: " + winnerName + " with " + winnerHand;
      } else {
        this.roundResultText = "Round ended in a tie!";
      }
      this.render();
    });

    document.addEventListener("dp:match-decided", (event) => {
      const champName = (event.detail.champion === "player1") ? this.player1Name : this.player2Name;
      const score = event.detail.scoreline;
      this.matchResultText = champName + " wins the match! (" + score.player1 + "-" + score.player2 + ")";
      this.render();
    });

    this.render();
  }

  render() {
    let activePlayerName = "";
    if (this.currentPlayer === "player1") {
      activePlayerName = this.player1Name;
    } else if (this.currentPlayer === "player2") {
      activePlayerName = this.player2Name;
    }

    let turnInfo = "Round " + this.roundNumber;
    if (activePlayerName) {
      turnInfo += " — " + activePlayerName + "'s turn";
      turnInfo += " — " + this.remainingRolls + " roll" + (this.remainingRolls !== 1 ? "s" : "") + " remaining";
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          text-align: center;
        }
      </style>
      <div>
        <p>${turnInfo}</p>
        <p>Score: ${this.player1Name} ${this.player1Score} - ${this.player2Score} ${this.player2Name}</p>
        ${this.roundResultText ? "<p>" + this.roundResultText + "</p>" : ""}
        ${this.matchResultText ? "<p><strong>" + this.matchResultText + "</strong></p>" : ""}
      </div>
    `;
  }
}

customElements.define("dice-poker-monitor", DicePokerMonitor);