class DicePokerBoard extends HTMLElement {
  #players; // array of player data e.g, dice, stack ....
  #currentPlayerIndex; // this players turn
  #phase; // rolling, betting or reveal
  #currentRound; // which round we are on
  #totalRounds; // how many rounds the creator set
  #pot; // total points bet by all players
  #highestBet; // current bet everyone needs to match
  #myPlayerIndex; // which player index i
  #straightsAllowed; // game setting, true or false

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.#players = []; // empty until server sends player data
    this.#currentPlayerIndex = 0; // first player starts by default
    this.#phase = "rolling"; // start on rolling when game start
    this.#currentRound = 1; // round always starts on 1
    this.#totalRounds = 3; // default is 3
    this.#pot = 0; // not points in the pot yet
    this.#highestBet = 0; // has not been a bet yet
    this.#myPlayerIndex = -1; // we don't know which player we are yet
    this.#straightsAllowed = true; // default is true,
  }

  updateState(state) {
    if (state.players !== undefined) this.#players = state.players; // update player data
    if (state.currentPlayerIndex !== undefined)
      this.#currentPlayerIndex = state.currentPlayerIndex; // whose turn it is
    if (state.phase !== undefined) this.#phase = state.phase; // rolling betting or reveal phase
    if (state.currentRound !== undefined)
      this.#currentRound = state.currentRound; // which round it is
    if (state.totalRounds !== undefined) this.#totalRounds = state.totalRounds; // total rounds set e.g, 3, 5 or 7
    if (state.pot !== undefined) this.#pot = state.pot; // total points in pot
    if (state.highestBet !== undefined) this.#highestBet = state.highestBet; // current bet to match
    if (state.myPlayerIndex !== undefined)
      this.#myPlayerIndex = state.myPlayerIndex; // which player is me
    if (state.straightsAllowed !== undefined)
      this.#straightsAllowed = state.straightsAllowed; // game setting

    this.#render(); // re-redner the board with updated data
  }
  connectedCallback() {
    this.#render();
  }

  #render() {
    const isMyTurn = this.#currentPlayerIndex === this.#myPlayerIndex;
    const isRolling = this.#phase === "rolling";
    const isBetting = this.#phase === "betting";
    const playerBoards = this.#players.map((player, index) => {
      const isActive = index === this.#currentPlayerIndex;
      const myTurn = index === this.#myPlayerIndex;

      return `
        <div class="panelBoard ${isActive ? "active" : ""}"}>
          <div class="player-name">
            ${player.userId?.username}
            ${myTurn ? "(your panel)" : ""}
            ${player.hasFolded ? "(folded)" : ""}
          </div>
          <div>Stack: ${player.stack}</div>
          <div class="dice-row" data-dice="player-${index}"></div>
        </div>
      `;
    }).join(""); // combines all player panels into one string and removes the commas between them

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
          <p>Spanish Dice Poker</p>
          <p class="small">Round: ${this.#currentRound} / ${this.#totalRounds}</p>
          <p class="small">Straights: ${this.#straightsAllowed ? "On" : "Off"}</p>
          <p class="small">Pot: ${this.#pot} | Highest bet: ${this.#highestBet}</p>
          <p class="small">Phase: ${this.#phase}</p>
        </div>


        ${playerBoards}

        ${
          isMyTurn && isRolling
            ? `
            <div class="controls">
              <button id="rollBtn">Roll</button>
              <button id="endTurnBtn">End Turn</button>
            </div>
          `
            : ""
        }

          ${
            isMyTurn && isBetting
              ? `
              <div class="controls">
                <button id="betBtn">Bet</button>
                <button id="raiseBtn">Raise</button>
                <button id="matchBtn">Match</button>
                <button id="foldBtn">Fold</button>
              </div>
            `
              : ""
          }
      </div>
  `;
    this.#players.forEach((player, playerIndex) => {
      // loops trough every player in the game
      const diceRow = this.shadowRoot.querySelector(
        `[data-dice="player-${playerIndex}"]`,
      );
      if (!diceRow) return;

      player.dice.forEach((dieValue, dieIndex) => {
        // loops trough the players 5 dices
        const die = document.createElement("dice-poker-die"); // cerates dice-poker-die element
        die.setAttribute("face", String(dieValue)); // face of our die! if it is roller 12, if shows "A"
        die.setAttribute("held", String(player.held[dieIndex])); // sets that dieIndex as held if we press it
        die.setAttribute(
          "disabled",
          String(playerIndex !== this.#myPlayerIndex || !isRolling),
        ); // not able to hold the die if it is not ours or we are not in rolling phase
        die.setAttribute("die-id", String(dieIndex)); // gives every die a index number to know which die was clicked on
        diceRow.append(die);
      });
    });

    const rollBtn = this.shadowRoot.querySelector("#rollBtn");
    if (rollBtn) {
      rollBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("board:roll", {
            bubbles: true,
            composed: true,
          }),
        );
      });
    }
    const endTurnBtn = this.shadowRoot.querySelector("#endTurnBtn");
    if (endTurnBtn) {
      endTurnBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("board:endTurn", {
            bubbles: true,
            composed: true,
          }),
        );
      });
    }

    const betBtn = this.shadowRoot.querySelector("#betBtn");
    if (betBtn) {
      betBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("board:bet", {
            bubbles: true,
            composed: true,
          }),
        );
      });
    }
    const raiseBtn = this.shadowRoot.querySelector("#raiseBtn");
    if (raiseBtn) {
      raiseBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("board:raise", {
            bubbles: true,
            composed: true,
          }),
        );
      });
    }
    const matchBtn = this.shadowRoot.querySelector("#matchBtn");
    if (matchBtn) {
      matchBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("board:match", {
            bubbles: true,
            composed: true,
          }),
        );
      });
    }

    const foldBtn = this.shadowRoot.querySelector("#foldBtn");
    if (foldBtn) {
      foldBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("board:fold", {
            bubbles: true,
            composed: true,
          }),
        );
      });
    }
  }
}

customElements.define("dice-poker-board", DicePokerBoard);
